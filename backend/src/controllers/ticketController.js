import * as ticketModel from '../models/ticketModel.js';
import pool from '../config/db.js';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { uploadToCloud, deleteFromCloud } from '../utils/storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads/tickets');
const useCloudStorage = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export const createTicket = async (req, res) => {
  try {
    let { student_id, room_id, type, description, image_url } = req.body;

    if (req.student) {
      student_id = req.student.id;
      const studentRes = await pool.query('SELECT room_id FROM students WHERE id = $1', [student_id]);
      if (studentRes.rows.length > 0 && studentRes.rows[0].room_id) {
        room_id = studentRes.rows[0].room_id;
      }
    }

    if (req.student && !room_id) {
      return res.status(400).json({ error: 'You must have a room assigned before creating a ticket. Contact the director.' });
    }
    if (!student_id || !room_id || !type || !description) {
      return res.status(400).json({ error: 'Please provide student_id, room_id, type, and description' });
    }

    const studentExists = await ticketModel.checkStudentExists(student_id);
    if (!studentExists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const roomExists = await ticketModel.checkRoomExists(room_id);
    if (!roomExists) {
      return res.status(404).json({ error: 'Room not found' });
    }

    let priority = 'low';
    const t = type.toLowerCase();
    if (t === 'electricity' || t === 'electrical' || t === 'water' || t === 'plumbing') {
      priority = 'high';
    } else if (t === 'internet') {
      priority = 'medium';
    }

    const ticket = await ticketModel.createTicket(student_id, room_id, type, description, priority, image_url || null);
    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Server error while creating ticket' });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { student_id } = req.query;

    if (req.student) {
      const tickets = await ticketModel.getTicketsByStudentId(req.student.id);
      return res.status(200).json(tickets);
    }

    if (student_id) {
      const tickets = await ticketModel.getTicketsByStudentId(student_id);
      return res.status(200).json(tickets);
    }

    const tickets = await ticketModel.getAllTickets();
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Server error while fetching tickets' });
  }
};

const MAGIC_BYTES = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46],
};

function validateMagicBytes(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(12);
  fs.readSync(fd, buf, 0, 12, 0);
  fs.closeSync(fd);

  const matches = (magic) => magic.every((b, i) => buf[i] === b);
  const isJPEG   = matches(MAGIC_BYTES.jpeg);
  const isPNG    = matches(MAGIC_BYTES.png);
  const isGIF    = matches(MAGIC_BYTES.gif);
  const isWebP   = matches(MAGIC_BYTES.webp) && buf.slice(8, 12).toString() === 'WEBP';

  return isJPEG || isPNG || isGIF || isWebP;
}

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const inputPath = req.file.path;

    if (!validateMagicBytes(inputPath)) {
      fs.unlinkSync(inputPath);
      return res.status(400).json({ error: 'Invalid image file. Only JPEG, PNG, WebP, and GIF are allowed.' });
    }

    const filename = `compressed-${req.file.filename}`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(inputPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 70, mozjpeg: true })
      .toFile(outputPath);

    fs.unlinkSync(inputPath);

    let imageUrl;
    if (useCloudStorage) {
      imageUrl = await uploadToCloud(outputPath, filename);
      fs.unlinkSync(outputPath);
    }

    if (!imageUrl) {
      imageUrl = `/uploads/tickets/${filename}`;
    }

    res.status(200).json({ image_url: imageUrl });
  } catch (error) {
    console.error('Upload image error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to process image' });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'director' && req.user.role !== 'maintenance')) {
      return res.status(403).json({ error: 'Not authorized to update ticket status' });
    }

    const allowedStatuses = ['pending', 'in_progress', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Allowed values: pending, in_progress, resolved' });
    }

    const updatedTicket = await ticketModel.updateTicketStatus(id, status);
    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json({ message: 'Ticket status updated', ticket: updatedTicket });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Server error while updating ticket status' });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = existing.rows[0];

    if (req.student) {
      if (ticket.student_id !== req.student.id) {
        return res.status(403).json({ error: 'You can only delete your own tickets' });
      }
      if (ticket.status !== 'pending') {
        return res.status(403).json({ error: 'You can only delete pending tickets' });
      }
    } else if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'director' && req.user.role !== 'maintenance')) {
      return res.status(403).json({ error: 'Not authorized to delete tickets' });
    }

    if (ticket.image_url) {
      if (useCloudStorage && ticket.image_url.startsWith('http')) {
        const filename = path.basename(ticket.image_url);
        await deleteFromCloud(filename);
      } else {
        const resolved = path.resolve(uploadDir, path.basename(ticket.image_url));
        if (resolved.startsWith(uploadDir) && fs.existsSync(resolved)) {
          fs.unlinkSync(resolved);
        }
      }
    }

    const deleted = await ticketModel.deleteTicketById(id);
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Server error while deleting ticket' });
  }
};

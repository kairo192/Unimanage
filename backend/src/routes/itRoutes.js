import express from 'express';
import { protect, requireRole } from '../middlewares/authMiddleware.js';
import {
  getServices, createService, updateService, deleteService,
  getDevices, createDevice, updateDevice, deleteDevice,
  getIssues, createIssue, resolveIssue, deleteIssue,
  getTopology, updateServicePosition, updateDevicePosition
} from '../controllers/itController.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('director', 'admin'));

// Services
router.get('/services', getServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);
router.patch('/services/:id/position', updateServicePosition);

// Devices
router.get('/devices', getDevices);
router.post('/devices', createDevice);
router.put('/devices/:id', updateDevice);
router.delete('/devices/:id', deleteDevice);
router.patch('/devices/:id/position', updateDevicePosition);

// Issues
router.get('/issues', getIssues);
router.post('/issues', createIssue);
router.patch('/issues/:id/resolve', resolveIssue);
router.delete('/issues/:id', deleteIssue);

// Topology map data
router.get('/topology', getTopology);

export default router;

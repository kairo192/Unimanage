import pool from '../config/db.js';
import { logActivity } from '../utils/activityLogger.js';

// 1. Fetch all bedding, linens, plumbing and electrical items
export const getHousingInventory = async (req, res) => {
  try {
    const query = `
      SELECT *,
        (quantity <= min_alert_threshold) AS is_low_stock
      FROM housing_inventory
      ORDER BY category ASC, name ASC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch housing inventory error:', error);
    res.status(500).json({ error: 'Server error while fetching housing inventory' });
  }
};

// 2. Add new supply items (linen bedding, plumbing fittings, lightbulbs, etc.)
export const addHousingItem = async (req, res) => {
  const { name, category, quantity, unit, min_alert_threshold, supplier, location } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'Name and Category are strictly required fields' });
  }
  try {
    const query = `
      INSERT INTO housing_inventory (name, category, quantity, unit, min_alert_threshold, supplier, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      name, 
      category, 
      quantity || 0.00, 
      unit || 'pcs', 
      min_alert_threshold || 10.00, 
      supplier || 'Central DOU Warehouse', 
      location || 'Central Depot B'
    ];
    const result = await pool.query(query, values);
    
    // Log action to global security activity log
    await logActivity(req, req.user.id, 'Create Housing Stock', `Added room/repair asset: ${name} (${quantity || 0} ${unit || 'pcs'})`);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add housing item error:', error);
    res.status(500).json({ error: 'Server error while adding supply item' });
  }
};

// 3. Edit item details
export const updateHousingItem = async (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, unit, min_alert_threshold, supplier, location } = req.body;
  try {
    const checkQuery = 'SELECT * FROM housing_inventory WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Supply item not found' });
    }
    const oldItem = checkResult.rows[0];

    const updateQuery = `
      UPDATE housing_inventory
      SET name = $1, category = $2, quantity = $3, unit = $4, min_alert_threshold = $5, supplier = $6, location = $7
      WHERE id = $8
      RETURNING *
    `;
    const values = [
      name || oldItem.name, 
      category || oldItem.category, 
      quantity !== undefined ? quantity : oldItem.quantity, 
      unit || oldItem.unit, 
      min_alert_threshold !== undefined ? min_alert_threshold : oldItem.min_alert_threshold, 
      supplier || oldItem.supplier, 
      location || oldItem.location, 
      id
    ];
    const result = await pool.query(updateQuery, values);

    // Log action to activity history
    await logActivity(req, req.user.id, 'Modify Housing Stock', `Modified supply item ID ${id}: ${name || oldItem.name}`);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update housing item error:', error);
    res.status(500).json({ error: 'Server error while modifying supply item' });
  }
};

// 4. Delete item permanently
export const deleteHousingItem = async (req, res) => {
  const { id } = req.params;
  try {
    const checkQuery = 'SELECT name FROM housing_inventory WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Supply item not found' });
    }
    const itemName = checkResult.rows[0].name;

    await pool.query('DELETE FROM housing_inventory WHERE id = $1', [id]);

    // Log action to activity history
    await logActivity(req, req.user.id, 'Delete Housing Stock', `Removed supply item: ${itemName} (ID ${id}) permanently`);

    res.status(200).json({ message: 'Supply item deleted successfully' });
  } catch (error) {
    console.error('Delete housing item error:', error);
    res.status(500).json({ error: 'Server error while deleting supply item' });
  }
};

// 5. Transfer linens/bedding or consume repair parts (Technician dispatch)
export const transferHousingItem = async (req, res) => {
  const { item_id, transfer_type, quantity, destination_residence } = req.body;
  if (!item_id || !transfer_type || !quantity || quantity <= 0 || !destination_residence) {
    return res.status(400).json({ error: 'Item ID, Transfer Type, positive Quantity, and Destination are required' });
  }
  try {
    // Check current stock levels
    const checkQuery = 'SELECT * FROM housing_inventory WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [item_id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Supply item not found in stock' });
    }
    const item = checkResult.rows[0];

    if (parseFloat(item.quantity) < parseFloat(quantity)) {
      return res.status(400).json({ error: `Insufficient stock! Only ${item.quantity} ${item.unit} available of ${item.name}` });
    }

    // Subtract from inventory
    const newQty = parseFloat(item.quantity) - parseFloat(quantity);
    await pool.query('UPDATE housing_inventory SET quantity = $1 WHERE id = $2', [newQty, item_id]);

    // Insert transfer logs
    const logQuery = `
      INSERT INTO housing_transfers (item_id, transfer_type, quantity, destination_residence, transferred_by_user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const logValues = [item_id, transfer_type, quantity, destination_residence, req.user.id];
    const logResult = await pool.query(logQuery, logValues);

    // Log action to global activity history
    const actionLabel = transfer_type === 'transfer' ? 'Linen Wardrobe Transfer' : 'Maintenance Asset Dispatch';
    await logActivity(req, req.user.id, actionLabel, `Dispatched ${quantity} ${item.unit} of ${item.name} to ${destination_residence}`);

    res.status(201).json({
      message: 'Transfer logged successfully and inventory updated',
      transfer: logResult.rows[0],
      updated_stock_qty: newQty
    });
  } catch (error) {
    console.error('Transfer housing asset error:', error);
    res.status(500).json({ error: 'Server error while executing transfer' });
  }
};

// 6. Fetch all historical transfers & dispatches
export const getHousingTransfers = async (req, res) => {
  try {
    const query = `
      SELECT t.*, hi.name AS item_name, hi.category AS item_category, hi.unit AS item_unit, u.name AS user_name
      FROM housing_transfers t
      JOIN housing_inventory hi ON t.item_id = hi.id
      LEFT JOIN users u ON t.transferred_by_user_id = u.id
      ORDER BY t.transferred_at DESC
      LIMIT 300
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch transfers logs error:', error);
    res.status(500).json({ error: 'Server error while fetching transfer logs' });
  }
};

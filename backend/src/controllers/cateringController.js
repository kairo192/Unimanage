import pool from '../config/db.js';
import { logActivity } from '../utils/activityLogger.js';

// 1. Fetch entire raw food materials inventory with safety alerts
export const getCateringInventory = async (req, res) => {
  try {
    const query = `
      SELECT *,
        (expiry_date <= CURRENT_DATE) AS is_expired,
        (expiry_date - CURRENT_DATE) AS days_until_expiry,
        (quantity <= min_alert_threshold) AS is_low_stock
      FROM catering_inventory
      ORDER BY expiry_date ASC, name ASC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch catering inventory error:', error);
    res.status(500).json({ error: 'Server error while fetching food inventory' });
  }
};

// 2. Add new raw ingredients batch (dry goods, dairy, meat, etc.)
export const addCateringItem = async (req, res) => {
  const { name, category, quantity, unit, min_alert_threshold, expiry_date, supplier, location } = req.body;
  if (!name || !category || !expiry_date) {
    return res.status(400).json({ error: 'Name, Category, and Expiration Date are strictly required' });
  }
  try {
    const query = `
      INSERT INTO catering_inventory (name, category, quantity, unit, min_alert_threshold, expiry_date, supplier, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [name, category, quantity || 0.00, unit || 'kg', min_alert_threshold || 10.00, expiry_date, supplier || 'General Supplier', location || 'Central Kitchen Store'];
    const result = await pool.query(query, values);
    
    // Securely log action to activity history
    await logActivity(req, req.user.id, 'Create Catering Stock', `Added raw material: ${name} (${quantity || 0} ${unit || 'kg'}) expiring on ${expiry_date}`);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add catering item error:', error);
    res.status(500).json({ error: 'Server error while adding food item' });
  }
};

// 3. Edit batch details
export const updateCateringItem = async (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, unit, min_alert_threshold, expiry_date, supplier, location } = req.body;
  try {
    const checkQuery = 'SELECT * FROM catering_inventory WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Catering item not found' });
    }
    const oldItem = checkResult.rows[0];

    const updateQuery = `
      UPDATE catering_inventory
      SET name = $1, category = $2, quantity = $3, unit = $4, min_alert_threshold = $5, expiry_date = $6, supplier = $7, location = $8
      WHERE id = $9
      RETURNING *
    `;
    const values = [name || oldItem.name, category || oldItem.category, quantity !== undefined ? quantity : oldItem.quantity, unit || oldItem.unit, min_alert_threshold !== undefined ? min_alert_threshold : oldItem.min_alert_threshold, expiry_date || oldItem.expiry_date, supplier || oldItem.supplier, location || oldItem.location, id];
    const result = await pool.query(updateQuery, values);

    // Log action to activity history
    await logActivity(req, req.user.id, 'Modify Catering Stock', `Modified food item ID ${id}: ${name || oldItem.name}`);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update catering item error:', error);
    res.status(500).json({ error: 'Server error while modifying food item' });
  }
};

// 4. Delete item batch
export const deleteCateringItem = async (req, res) => {
  const { id } = req.params;
  try {
    const checkQuery = 'SELECT name FROM catering_inventory WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Catering item not found' });
    }
    const itemName = checkResult.rows[0].name;

    await pool.query('DELETE FROM catering_inventory WHERE id = $1', [id]);

    // Log action to activity history
    await logActivity(req, req.user.id, 'Delete Catering Stock', `Removed food item: ${itemName} (ID ${id}) permanently`);

    res.status(200).json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Delete catering item error:', error);
    res.status(500).json({ error: 'Server error while deleting food item' });
  }
};

// 5. Deduct raw ingredients consumption (Student kitchen usage)
export const consumeCateringItem = async (req, res) => {
  const { item_id, quantity_used, residence_name } = req.body;
  if (!item_id || !quantity_used || quantity_used <= 0) {
    return res.status(400).json({ error: 'Item ID and a valid positive quantity used are required' });
  }
  try {
    // Check current stock levels
    const checkQuery = 'SELECT * FROM catering_inventory WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [item_id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Raw material item not found in stock' });
    }
    const item = checkResult.rows[0];

    if (parseFloat(item.quantity) < parseFloat(quantity_used)) {
      return res.status(400).json({ error: `Insufficient stock! Only ${item.quantity} ${item.unit} available of ${item.name}` });
    }

    // Subtract from inventory
    const newQty = parseFloat(item.quantity) - parseFloat(quantity_used);
    await pool.query('UPDATE catering_inventory SET quantity = $1 WHERE id = $2', [newQty, item_id]);

    // Insert consumption history log
    const logQuery = `
      INSERT INTO catering_consumption (item_id, quantity_used, used_by_user_id, residence_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const logValues = [item_id, quantity_used, req.user.id, residence_name || 'Hassan Khira Dining Hall'];
    const logResult = await pool.query(logQuery, logValues);

    // Log action to global activity logs history
    await logActivity(req, req.user.id, 'Catering Food Consumption', `Deducted ${quantity_used} ${item.unit} of ${item.name} for ${residence_name || 'Hassan Khira Dining Hall'}`);

    res.status(201).json({
      message: 'Consumption logged successfully and stock updated',
      consumption: logResult.rows[0],
      updated_stock_qty: newQty
    });
  } catch (error) {
    console.error('Consume food items error:', error);
    res.status(500).json({ error: 'Server error while logging consumption' });
  }
};

// 6. Get food consumption logs history
export const getCateringConsumption = async (req, res) => {
  try {
    const query = `
      SELECT c.*, ci.name AS item_name, ci.category AS item_category, ci.unit AS item_unit, u.name AS user_name
      FROM catering_consumption c
      JOIN catering_inventory ci ON c.item_id = ci.id
      LEFT JOIN users u ON c.used_by_user_id = u.id
      ORDER BY c.used_at DESC
      LIMIT 300
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch consumption error:', error);
    res.status(500).json({ error: 'Server error while fetching consumption logs' });
  }
};

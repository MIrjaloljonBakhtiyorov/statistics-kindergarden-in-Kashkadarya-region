import { Router } from 'express';
import crypto from 'crypto';
import { resolveKindergartenId } from '../requestContext.js';
import { all, get, run, ensureTables, logOperation, } from './routeSupport.js';
export const inventoryRoutes = Router();
inventoryRoutes.get("/inventory/products", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const rows = await all(`
      SELECT
        p.*,
        COALESCE(ib.in_qty, 0) - COALESCE(it.out_qty, 0) as total_quantity,
        COALESCE(ib.avg_price, 0) as avg_price,
        ib.expiry_date
      FROM products p
      LEFT JOIN (
        SELECT product_id, SUM(quantity) as in_qty, AVG(price_per_unit) as avg_price, MIN(expiry_date) as expiry_date
        FROM inventory_batches
        WHERE kindergarten_id = ?
        GROUP BY product_id
      ) ib ON ib.product_id = p.id
      LEFT JOIN (
        SELECT product_id, SUM(quantity) as out_qty
        FROM inventory_transactions
        WHERE kindergarten_id = ? AND type = 'OUT'
        GROUP BY product_id
      ) it ON it.product_id = p.id
      WHERE p.kindergarten_id = ?
      ORDER BY p.name
    `, [kindergartenId, kindergartenId, kindergartenId]);
        res.json(rows.map((row) => ({
            ...row,
            total_quantity: Number(row.total_quantity || 0),
            min_stock: Number(row.min_stock || 0),
            avg_price: Number(row.avg_price || 0),
        })));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
inventoryRoutes.post("/inventory/products", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const id = crypto.randomUUID();
        await run('INSERT INTO products (id, kindergarten_id, name, category, unit, brand, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?)', [
            id,
            kindergartenId,
            req.body.name,
            req.body.category || null,
            req.body.unit || 'kg',
            req.body.brand || null,
            Number(req.body.min_stock || 0),
        ]);
        res.status(201).json({ id, ...req.body });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
inventoryRoutes.put("/inventory/products/:id", async (req, res) => {
    try {
        const kindergartenId = await resolveKindergartenId(req);
        await run('UPDATE products SET name = ?, category = ?, unit = ?, brand = ?, min_stock = ? WHERE id = ? AND kindergarten_id = ?', [
            req.body.name,
            req.body.category || null,
            req.body.unit || 'kg',
            req.body.brand || null,
            Number(req.body.min_stock || 0),
            req.params.id,
            kindergartenId,
        ]);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
inventoryRoutes.get("/inventory/transactions", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const rows = await all(`
      SELECT it.*, p.name as productName, p.unit
      FROM inventory_transactions it
      LEFT JOIN products p ON p.id = it.product_id
      WHERE it.kindergarten_id = ?
      ORDER BY it.date DESC NULLS LAST, it.created_at DESC
    `, [kindergartenId]);
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
inventoryRoutes.post("/inventory/stock-in", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const product = await get('SELECT * FROM products WHERE id = ? AND kindergarten_id = ?', [req.body.product_id, kindergartenId]);
        if (!product)
            return res.status(404).json({ error: 'Product not found' });
        const batchId = crypto.randomUUID();
        const date = req.body.received_date || new Date().toISOString().slice(0, 10);
        const quantity = Number(req.body.quantity || 0);
        if (!Number.isFinite(quantity) || quantity <= 0) {
            return res.status(400).json({ error: 'Kirim miqdori musbat bo\'lishi kerak' });
        }
        const pricePerUnit = Number(req.body.price_per_unit || 0);
        const totalPrice = Number(req.body.total_price || quantity * pricePerUnit);
        await run(`
      INSERT INTO inventory_batches
        (id, kindergarten_id, product_id, batch_number, quantity, price_per_unit, total_price, received_date, expiry_date, supplier, storage_location, storage_temp, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            batchId,
            kindergartenId,
            req.body.product_id,
            req.body.batch_number || `B-${Date.now()}`,
            quantity,
            pricePerUnit,
            totalPrice,
            date,
            req.body.expiry_date || null,
            req.body.supplier || null,
            req.body.storage_location || null,
            req.body.storage_temp ?? null,
            req.body.notes || null,
        ]);
        await run('INSERT INTO inventory_transactions (id, kindergarten_id, product_id, type, quantity, unit, date, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            crypto.randomUUID(),
            kindergartenId,
            req.body.product_id,
            'IN',
            quantity,
            product.unit,
            date,
            req.body.notes || 'Kirim',
        ]);
        await logOperation(kindergartenId, 'CREATE', 'inventory', product.name, `${quantity} ${product.unit} kirim qilindi`, 'WAREHOUSE');
        res.status(201).json({ id: batchId, success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
inventoryRoutes.post("/inventory/stock-out", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const product = await get('SELECT * FROM products WHERE id = ? AND kindergarten_id = ?', [req.body.product_id, kindergartenId]);
        if (!product)
            return res.status(404).json({ error: 'Product not found' });
        const stock = await get(`
      SELECT
        COALESCE((SELECT SUM(quantity) FROM inventory_batches WHERE product_id = ? AND kindergarten_id = ?), 0) -
        COALESCE((SELECT SUM(quantity) FROM inventory_transactions WHERE product_id = ? AND kindergarten_id = ? AND type = 'OUT'), 0) as total
    `, [req.body.product_id, kindergartenId, req.body.product_id, kindergartenId]);
        const quantity = Number(req.body.quantity || 0);
        if (!Number.isFinite(quantity) || quantity <= 0) {
            return res.status(400).json({ error: 'Chiqim miqdori musbat bo\'lishi kerak' });
        }
        if (quantity > Number(stock?.total || 0))
            return res.status(400).json({ error: 'Omborda bunday miqdor yoq' });
        const date = req.body.date || new Date().toISOString().slice(0, 10);
        await run('INSERT INTO inventory_transactions (id, kindergarten_id, product_id, type, quantity, unit, date, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            crypto.randomUUID(),
            kindergartenId,
            req.body.product_id,
            'OUT',
            quantity,
            product.unit,
            date,
            req.body.reason || 'Chiqim',
        ]);
        await logOperation(kindergartenId, 'UPDATE', 'inventory', product.name, `${quantity} ${product.unit} chiqim qilindi`, 'WAREHOUSE');
        res.status(201).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

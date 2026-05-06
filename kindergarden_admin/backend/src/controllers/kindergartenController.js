const db = require('../config/db');
const crypto = require('crypto');

const KindergartenController = {
  getAll: (req, res) => {
    db.all('SELECT * FROM kindergartens ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  },

  getById: (req, res) => {
    db.get('SELECT * FROM kindergartens WHERE id = ?', [req.params.id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ message: 'Kindergarten not found' });
      }
      res.json(row);
    });
  },

  create: (req, res) => {
    const data = req.body;
    
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      const sql = `INSERT INTO kindergartens (
        system_id, name, type, district, directorName, phone, address, email,
        position, capacity, currentChildren, groups, age13, age37, educators,
        cooks, techStaff, mealType, sanitation, water, kitchenEq, financeType,
        lat, lng, username, password, status, rating, aiMonitoring, threshold
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const params = [
        data.system_id, data.name, data.type, data.district, data.directorName, data.phone, data.address, data.email,
        data.position, data.capacity, data.currentChildren, data.groups, data.age13 ? 1 : 0, data.age37 ? 1 : 0, data.educators,
        data.cooks, data.techStaff, data.mealType, data.sanitation, data.water, data.kitchenEq, data.financeType,
        data.lat, data.lng, data.username, data.password, data.status || 'Active', data.rating || 100, data.aiMonitoring ? 1 : 0, data.threshold || 75
      ];

      db.run(sql, params, function(err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }
        
        const kindergartenId = this.lastID;

        // --- MASTER TEMPLATE INITIALIZATION ---
        // Automatically create default roles and sections for this new kindergarten
        
        // 1. Create Default Staff Roles (Templates)
        const staffRoles = [
          { pos: 'oshpaz', name: 'Bosh oshpaz (Vakansiya)' },
          { pos: 'omborchi', name: 'Ombor mudiri (Vakansiya)' },
          { pos: 'hamshira', name: 'Bosh hamshira (Vakansiya)' },
          { pos: 'tarbiyachi', name: 'Tarbiyachi (Vakansiya)' }
        ];

        staffRoles.forEach(role => {
          db.run(`INSERT INTO staff (id, kindergarten_id, full_name, position) VALUES (?, ?, ?, ?)`, 
            [crypto.randomUUID(), kindergartenId, role.name, role.pos]);
        });

        // 2. Create Sample Group
        db.run(`INSERT INTO groups (id, kindergarten_id, name, age_category, capacity) VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), kindergartenId, '1-sonli guruh', '3-7 yosh', 25]);

        db.run("COMMIT", (err) => {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ id: kindergartenId, ...data });
        });
      });
    });
  },

  update: (req, res) => {
    const data = req.body;
    const sql = `UPDATE kindergartens SET 
      name = ?, type = ?, district = ?, directorName = ?, phone = ?, status = ?
      WHERE id = ?`;
    
    db.run(sql, [data.name, data.type, data.district, data.directorName, data.phone, data.status, req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Updated successfully', id: req.params.id });
    });
  },

  delete: (req, res) => {
    db.run('DELETE FROM kindergartens WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Deleted successfully', id: req.params.id });
    });
  }
};

module.exports = KindergartenController;

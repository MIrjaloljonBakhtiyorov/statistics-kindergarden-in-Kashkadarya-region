const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    db.serialize(() => {
      // 1. Core Kindergarten Table
      db.run(`CREATE TABLE IF NOT EXISTS kindergartens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        system_id TEXT,
        name TEXT NOT NULL,
        type TEXT,
        district TEXT,
        directorName TEXT,
        phone TEXT,
        address TEXT,
        email TEXT,
        position TEXT,
        capacity INTEGER,
        currentChildren INTEGER,
        groups INTEGER,
        age13 BOOLEAN,
        age37 BOOLEAN,
        educators INTEGER,
        cooks INTEGER,
        techStaff INTEGER,
        mealType TEXT,
        sanitation TEXT,
        water TEXT,
        kitchenEq TEXT,
        financeType TEXT,
        lat REAL,
        lng REAL,
        username TEXT,
        password TEXT,
        status TEXT DEFAULT 'Active',
        rating INTEGER DEFAULT 100,
        aiMonitoring BOOLEAN DEFAULT 1,
        threshold INTEGER DEFAULT 75,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // 2. Groups
      db.run(`CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        name TEXT NOT NULL,
        age_category TEXT,
        capacity INTEGER,
        teacher_id TEXT,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      // 3. Staff
      db.run(`CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        full_name TEXT NOT NULL,
        position TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        group_id TEXT,
        user_id TEXT,
        salary REAL,
        hire_date TEXT,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      // 4. Children
      db.run(`CREATE TABLE IF NOT EXISTS children (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        birth_date TEXT,
        gender TEXT,
        group_id TEXT,
        parent_account_id TEXT,
        father_id TEXT,
        mother_id TEXT,
        address TEXT,
        photo_url TEXT,
        birth_certificate_number TEXT,
        weight REAL,
        height REAL,
        is_allergic BOOLEAN DEFAULT 0,
        allergies TEXT,
        medical_notes TEXT,
        age_category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      // 5. Inventory / Products
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        name TEXT NOT NULL,
        category TEXT,
        unit TEXT,
        brand TEXT,
        min_stock REAL,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS inventory_batches (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        product_id TEXT,
        batch_number TEXT,
        invoice_number TEXT,
        quantity REAL,
        price_per_unit REAL,
        total_price REAL,
        received_date TEXT,
        expiry_date TEXT,
        supplier TEXT,
        storage_location TEXT,
        storage_temp TEXT,
        notes TEXT,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`);

      // 6. Menus & Dishes
      db.run(`CREATE TABLE IF NOT EXISTS dishes (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        name TEXT NOT NULL,
        image TEXT,
        kcal REAL,
        iron REAL,
        carbs REAL,
        vitamins TEXT,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS menus (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        date TEXT NOT NULL,
        meal_name TEXT,
        meal_type TEXT,
        age_group TEXT,
        diet_type TEXT,
        iron REAL,
        carbohydrates REAL,
        vitamins TEXT,
        calories REAL,
        image_url TEXT,
        is_approved BOOLEAN DEFAULT 0,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      // 7. Kitchen Tasks
      db.run(`CREATE TABLE IF NOT EXISTS kitchen_tasks (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        menu_id TEXT,
        status TEXT,
        temperature REAL,
        start_time TEXT,
        end_time TEXT,
        served_time TEXT,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (menu_id) REFERENCES menus(id)
      )`);

      // 8. Health & Attendance
      db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        child_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        reason TEXT,
        arrival_time TEXT,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (child_id) REFERENCES children(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS health_checks (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        child_id TEXT,
        date TEXT,
        temperature REAL,
        is_sick BOOLEAN,
        notes TEXT,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (child_id) REFERENCES children(id)
      )`);

      // 9. Finance
      db.run(`CREATE TABLE IF NOT EXISTS finance_transactions (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        date TEXT,
        category TEXT,
        item TEXT,
        amount REAL,
        quantity REAL,
        price_per_unit REAL,
        type TEXT,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      // 10. Audit
      db.run(`CREATE TABLE IF NOT EXISTS audits (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        inspection_id TEXT,
        inspection_type TEXT,
        overall_result TEXT,
        severity TEXT,
        notes TEXT,
        created_by TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);
    });
  }
});

module.exports = db;

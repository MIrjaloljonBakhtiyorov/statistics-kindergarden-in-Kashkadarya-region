// @ts-nocheck
import db from '../modules/shared/database.js';

const initializeSchema = () => {
    db.serialize(() => {
      const addColumn = (table, column, definition) => {
        const statement = db.dialect === 'postgres'
          ? `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${definition}`
          : `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`;

        db.run(statement, (err) => {
          if (
            err &&
            !err.message.includes('duplicate column name') &&
            !err.message.includes('already exists')
          ) {
            console.error(`Migration error on ${table}.${column}:`, err.message);
          }
        });
      };

      // 1. Core Kindergarten Table
      db.run(`CREATE TABLE IF NOT EXISTS kindergartens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        system_id TEXT,
        name TEXT NOT NULL,
        type TEXT,
        workHours REAL DEFAULT 9.5,
        region TEXT,
        district TEXT,
        licenseFile TEXT,
        brokerageDocumentFile TEXT,
        commissionOrder TEXT,
        commissionApprovedDate TEXT,
        commissionValidUntil TEXT,
        directorName TEXT,
        directorBirthYear INTEGER,
        directorPhoto TEXT,
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
        nurseCount INTEGER DEFAULT 0,
        hasNurse BOOLEAN DEFAULT 0,
        mealType TEXT,
        sanitation TEXT,
        water TEXT,
        kitchenEq TEXT,
        hasKitchen BOOLEAN DEFAULT 1,
        hasAllergyMenu BOOLEAN DEFAULT 0,
        hasDietMenu BOOLEAN DEFAULT 0,
        hasWarehouse BOOLEAN DEFAULT 0,
        warehouseManager TEXT,
        avgConsumption REAL,
        financeType TEXT,
        budget REAL DEFAULT 0,
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

      // 1.5 Parents
      db.run(`CREATE TABLE IF NOT EXISTS parents (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        workplace TEXT,
        phone TEXT,
        passport_no TEXT,
        role TEXT,
        kindergarten_id INTEGER,
        password TEXT,
        child_id TEXT,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS parent_accounts (
        id TEXT PRIMARY KEY,
        login TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        kindergarten_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_parent_accounts_login_nocase
        ON parent_accounts (lower(trim(login)))
        WHERE login IS NOT NULL AND trim(login) <> ''`, (err) => {
        if (err) console.error('Migration error on parent login unique index:', err.message);
      });

      db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_kindergartens_username_nocase
        ON kindergartens (lower(trim(username)))
        WHERE username IS NOT NULL AND trim(username) <> ''`, (err) => {
        if (err) console.error('Migration error on kindergarten username unique index:', err.message);
      });
      db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_kindergartens_system_id
        ON kindergartens (system_id)
        WHERE system_id IS NOT NULL AND trim(system_id) <> ''`, (err) => {
        if (err) console.error('Migration error on kindergarten system_id unique index:', err.message);
      });
      const createIndex = (name, table, columns) => {
        db.run(`CREATE INDEX IF NOT EXISTS ${name} ON ${table} (${columns})`, (err) => {
          if (err) console.error(`Migration error on index ${name}:`, err.message);
        });
      };

      // 2. Groups
      db.run(`CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        name TEXT NOT NULL,
        teacher_name TEXT,
        age_category TEXT,
        age_limit TEXT,
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
        passport_no TEXT,
        birth_date TEXT,
        education TEXT,
        experience_years TEXT,
        group_id TEXT,
        user_id TEXT,
        salary REAL,
        hire_date TEXT,
        status TEXT DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
        passport_info TEXT,
        birth_certificate_number TEXT,
        weight REAL,
        height REAL,
        is_allergic BOOLEAN DEFAULT 0,
        allergies TEXT,
        medical_notes TEXT,
        status TEXT DEFAULT 'ACTIVE',
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
        image_2 TEXT,
        kcal REAL,
        iron REAL,
        carbs REAL,
        vitamins TEXT,
        category TEXT,
        cook_time TEXT,
        cook_temperature TEXT,
        output_1_3 TEXT,
        output_3_7 TEXT,
        kcal_1_3 TEXT,
        kcal_3_7 TEXT,
        ingredients TEXT,
        technology TEXT,
        quality_requirements TEXT,
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
        composition TEXT,
        products TEXT,
        protein REAL,
        fat REAL,
        calories REAL,
        image_url TEXT,
        is_approved BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
        ready_for_nurse_at TEXT,
        nurse_quality_status TEXT DEFAULT 'PENDING',
        nurse_quality_comment TEXT,
        nurse_quality_checked_at TEXT,
        nurse_quality_checked_by TEXT,
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

      db.run(`CREATE TABLE IF NOT EXISTS daily_meal_portions (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        group_id TEXT NOT NULL,
        date TEXT NOT NULL,
        total_children INTEGER DEFAULT 0,
        early_count INTEGER DEFAULT 0,
        late_count INTEGER DEFAULT 0,
        absent_count INTEGER DEFAULT 0,
        meal_portions INTEGER DEFAULT 0,
        entry_mode TEXT DEFAULT 'COUNT',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(kindergarten_id, group_id, date),
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (group_id) REFERENCES groups(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS health_checks (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        child_id TEXT,
        date TEXT,
        weight REAL,
        height REAL,
        temperature REAL,
        chest_circumference REAL,
        weight_status TEXT DEFAULT 'NOT_CHECKED',
        height_status TEXT DEFAULT 'NOT_CHECKED',
        temperature_status TEXT DEFAULT 'NOT_CHECKED',
        chest_circumference_status TEXT DEFAULT 'NOT_CHECKED',
        allergy TEXT,
        is_sick BOOLEAN,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (child_id) REFERENCES children(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS staff_health_checks (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        staff_id TEXT NOT NULL,
        date TEXT NOT NULL,
        weight REAL,
        height REAL,
        temperature REAL,
        chest_circumference REAL,
        weight_status TEXT DEFAULT 'NOT_CHECKED',
        height_status TEXT DEFAULT 'NOT_CHECKED',
        temperature_status TEXT DEFAULT 'NOT_CHECKED',
        chest_circumference_status TEXT DEFAULT 'NOT_CHECKED',
        blood_pressure TEXT,
        conclusion TEXT,
        is_fit BOOLEAN DEFAULT 1,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (staff_id) REFERENCES staff(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS medical_inventory_items (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        name TEXT NOT NULL,
        form TEXT,
        unit TEXT,
        required_per_100 REAL DEFAULT 0,
        required_label TEXT,
        is_default BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS medical_inventory_movements (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        item_id TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity REAL NOT NULL,
        movement_date TEXT NOT NULL,
        expiry_date TEXT,
        batch_number TEXT,
        source TEXT,
        reason TEXT,
        group_id TEXT,
        child_id TEXT,
        usage_time TEXT,
        diagnosis TEXT,
        evidence_photo_url TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (item_id) REFERENCES medical_inventory_items(id)
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

      db.run(`CREATE TABLE IF NOT EXISTS operations_log (
        id TEXT PRIMARY KEY,
        operation_type TEXT,
        entity_type TEXT,
        entity_name TEXT,
        description TEXT,
        category TEXT DEFAULT 'OTHER',
        kindergarten_id INTEGER,
        is_archived BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS role_notifications (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        target_role TEXT,
        target_user_id TEXT,
        source_role TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        entity_type TEXT,
        entity_id TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        text TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        file_url TEXT,
        file_name TEXT,
        mime_type TEXT,
        sender_role TEXT,
        status TEXT DEFAULT 'sent',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS parent_documents (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        child_id TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT,
        file_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (child_id) REFERENCES children(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS pickup_people (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        child_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        relation TEXT,
        phone TEXT,
        photo_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (child_id) REFERENCES children(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS kindergarten_settings (
        kindergarten_id INTEGER PRIMARY KEY,
        kg_name TEXT,
        kg_logo TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS inventory_transactions (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        product_id TEXT,
        type TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT,
        date TEXT,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS lab_samples (
        sample_id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        dish_id TEXT,
        dish_name TEXT,
        batch_reference TEXT,
        date TEXT,
        storage_location TEXT,
        storage_duration REAL,
        status TEXT,
        lab_result TEXT,
        risk_level TEXT,
        notes TEXT,
        created_by TEXT,
        timestamp TEXT,
        nutrition TEXT,
        test_results TEXT,
        storage_temp_history TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS daily_district_expenses (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        district TEXT NOT NULL,
        cost_per_child REAL DEFAULT 0,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, district)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS chef_sanitary_checks (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER,
        chef_id TEXT,
        date TEXT,
        passed BOOLEAN DEFAULT 0,
        period_start TEXT,
        period_end TEXT,
        status TEXT DEFAULT 'PENDING_NURSE',
        submitted_at TEXT,
        nurse_approved BOOLEAN DEFAULT 0,
        nurse_approved_at TEXT,
        nurse_id TEXT,
        nurse_notes TEXT,
        answers TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS role_accounts (
        id TEXT PRIMARY KEY,
        kindergarten_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        full_name TEXT,
        login TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(kindergarten_id, role)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS admin_alert_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL,
        title TEXT NOT NULL,
        context TEXT,
        actor TEXT,
        entity_type TEXT,
        entity_id TEXT,
        action_url TEXT,
        details_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      createIndex('idx_children_kindergarten_id', 'children', 'kindergarten_id');
      createIndex('idx_children_group_kindergarten', 'children', 'group_id, kindergarten_id');
      createIndex('idx_parents_kindergarten_id', 'parents', 'kindergarten_id');
      createIndex('idx_parent_accounts_kindergarten_id', 'parent_accounts', 'kindergarten_id');
      createIndex('idx_groups_kindergarten_id', 'groups', 'kindergarten_id');
      createIndex('idx_staff_kindergarten_id', 'staff', 'kindergarten_id');
      createIndex('idx_attendance_kindergarten_date', 'attendance', 'kindergarten_id, date');
      createIndex('idx_attendance_child_date', 'attendance', 'child_id, date');
      createIndex('idx_daily_meal_portions_kindergarten_date', 'daily_meal_portions', 'kindergarten_id, date');
      createIndex('idx_staff_health_checks_kindergarten_staff', 'staff_health_checks', 'kindergarten_id, staff_id');
      createIndex('idx_staff_health_checks_date', 'staff_health_checks', 'date');
      createIndex('idx_menus_kindergarten_date', 'menus', 'kindergarten_id, date');
      createIndex('idx_kitchen_tasks_kindergarten_menu', 'kitchen_tasks', 'kindergarten_id, menu_id');
      createIndex('idx_inventory_batches_kindergarten_product', 'inventory_batches', 'kindergarten_id, product_id');
      createIndex('idx_inventory_batches_expiry', 'inventory_batches', 'expiry_date');
      createIndex('idx_inventory_transactions_kindergarten_product', 'inventory_transactions', 'kindergarten_id, product_id');
      createIndex('idx_medical_inventory_items_kindergarten_id', 'medical_inventory_items', 'kindergarten_id');
      createIndex('idx_medical_inventory_movements_kindergarten_item', 'medical_inventory_movements', 'kindergarten_id, item_id');
      createIndex('idx_medical_inventory_movements_expiry', 'medical_inventory_movements', 'expiry_date');
      createIndex('idx_messages_kindergarten_receiver', 'messages', 'kindergarten_id, receiver_id, status');
      createIndex('idx_role_notifications_target', 'role_notifications', 'kindergarten_id, target_role, target_user_id, is_read, created_at');
      createIndex('idx_operations_kindergarten_archived', 'operations_log', 'kindergarten_id, is_archived, created_at');
      createIndex('idx_daily_district_expenses_date', 'daily_district_expenses', 'date');
      createIndex('idx_admin_alert_events_created', 'admin_alert_events', 'created_at DESC');
      createIndex('idx_admin_alert_events_entity', 'admin_alert_events', 'entity_type, entity_id, event_type');

      // Lightweight migrations for databases created with older schemas.
      addColumn('parents', 'workplace', 'TEXT');
      addColumn('parents', 'passport_no', 'TEXT');
      addColumn('parents', 'role', 'TEXT');
      addColumn('parents', 'kindergarten_id', 'INTEGER');
      addColumn('groups', 'teacher_name', 'TEXT');
      addColumn('groups', 'age_limit', 'TEXT');
      addColumn('staff', 'passport_no', 'TEXT');
      addColumn('staff', 'birth_date', 'TEXT');
      addColumn('staff', 'education', 'TEXT');
      addColumn('staff', 'experience_years', 'TEXT');
      addColumn('staff', 'status', "TEXT DEFAULT 'ACTIVE'");
      addColumn('staff', 'created_at', 'DATETIME');
      addColumn('children', 'passport_info', 'TEXT');
      addColumn('children', 'status', "TEXT DEFAULT 'ACTIVE'");
      addColumn('health_checks', 'weight', 'REAL');
      addColumn('health_checks', 'height', 'REAL');
      addColumn('health_checks', 'chest_circumference', 'REAL');
      addColumn('health_checks', 'weight_status', "TEXT DEFAULT 'NOT_CHECKED'");
      addColumn('health_checks', 'height_status', "TEXT DEFAULT 'NOT_CHECKED'");
      addColumn('health_checks', 'temperature_status', "TEXT DEFAULT 'NOT_CHECKED'");
      addColumn('health_checks', 'chest_circumference_status', "TEXT DEFAULT 'NOT_CHECKED'");
      addColumn('health_checks', 'allergy', 'TEXT');
      addColumn('health_checks', 'created_at', 'DATETIME');
      addColumn('staff_health_checks', 'weight', 'REAL');
      addColumn('staff_health_checks', 'height', 'REAL');
      addColumn('staff_health_checks', 'chest_circumference', 'REAL');
      addColumn('staff_health_checks', 'weight_status', "TEXT DEFAULT 'NOT_CHECKED'");
      addColumn('staff_health_checks', 'height_status', "TEXT DEFAULT 'NOT_CHECKED'");
      addColumn('staff_health_checks', 'temperature_status', "TEXT DEFAULT 'NOT_CHECKED'");
      addColumn('staff_health_checks', 'chest_circumference_status', "TEXT DEFAULT 'NOT_CHECKED'");
      addColumn('chef_sanitary_checks', 'period_start', 'TEXT');
      addColumn('chef_sanitary_checks', 'period_end', 'TEXT');
      addColumn('chef_sanitary_checks', 'status', "TEXT DEFAULT 'PENDING_NURSE'");
      addColumn('chef_sanitary_checks', 'submitted_at', 'TEXT');
      addColumn('chef_sanitary_checks', 'nurse_approved', 'BOOLEAN DEFAULT 0');
      addColumn('chef_sanitary_checks', 'nurse_approved_at', 'TEXT');
      addColumn('chef_sanitary_checks', 'nurse_id', 'TEXT');
      addColumn('chef_sanitary_checks', 'nurse_notes', 'TEXT');
      addColumn('kitchen_tasks', 'ready_for_nurse_at', 'TEXT');
      addColumn('kitchen_tasks', 'nurse_quality_status', "TEXT DEFAULT 'PENDING'");
      addColumn('kitchen_tasks', 'nurse_quality_comment', 'TEXT');
      addColumn('kitchen_tasks', 'nurse_quality_checked_at', 'TEXT');
      addColumn('kitchen_tasks', 'nurse_quality_checked_by', 'TEXT');
      addColumn('medical_inventory_movements', 'group_id', 'TEXT');
      addColumn('medical_inventory_movements', 'child_id', 'TEXT');
      addColumn('medical_inventory_movements', 'usage_time', 'TEXT');
      addColumn('medical_inventory_movements', 'diagnosis', 'TEXT');
      addColumn('medical_inventory_movements', 'evidence_photo_url', 'TEXT');
      addColumn('attendance', 'reason', 'TEXT');
      addColumn('attendance', 'arrival_time', 'TEXT');
      addColumn('kindergartens', 'region', 'TEXT');
      addColumn('kindergartens', 'workHours', 'REAL DEFAULT 9.5');
      addColumn('kindergartens', 'hasNurse', 'BOOLEAN DEFAULT 0');
      addColumn('kindergartens', 'nurseCount', 'INTEGER DEFAULT 0');
      addColumn('kindergartens', 'hasKitchen', 'BOOLEAN DEFAULT 1');
      addColumn('kindergartens', 'hasAllergyMenu', 'BOOLEAN DEFAULT 0');
      addColumn('kindergartens', 'hasDietMenu', 'BOOLEAN DEFAULT 0');
      addColumn('dishes', 'category', 'TEXT');
      addColumn('dishes', 'image_2', 'TEXT');
      addColumn('dishes', 'cook_time', 'TEXT');
      addColumn('dishes', 'cook_temperature', 'TEXT');
      addColumn('dishes', 'output_1_3', 'TEXT');
      addColumn('dishes', 'output_3_7', 'TEXT');
      addColumn('dishes', 'kcal_1_3', 'TEXT');
      addColumn('dishes', 'kcal_3_7', 'TEXT');
      addColumn('dishes', 'ingredients', 'TEXT');
      addColumn('dishes', 'technology', 'TEXT');
      addColumn('dishes', 'quality_requirements', 'TEXT');
      addColumn('kindergartens', 'hasWarehouse', 'BOOLEAN DEFAULT 0');
      addColumn('kindergartens', 'warehouseManager', 'TEXT');
      addColumn('kindergartens', 'avgConsumption', 'REAL');
      addColumn('kindergartens', 'budget', 'REAL DEFAULT 0');
      addColumn('kindergartens', 'directorBirthYear', 'INTEGER');
      addColumn('kindergartens', 'directorPhoto', 'TEXT');
      addColumn('kindergartens', 'licenseFile', 'TEXT');
      addColumn('kindergartens', 'brokerageDocumentFile', 'TEXT');
      addColumn('kindergartens', 'commissionOrder', 'TEXT');
      addColumn('kindergartens', 'commissionApprovedDate', 'TEXT');
      addColumn('kindergartens', 'commissionValidUntil', 'TEXT');
      addColumn('menus', 'composition', 'TEXT');
      addColumn('menus', 'products', 'TEXT');
      addColumn('menus', 'protein', 'REAL');
      addColumn('menus', 'fat', 'REAL');
      addColumn('menus', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
      addColumn('messages', 'message_type', "TEXT DEFAULT 'text'");
      addColumn('messages', 'file_url', 'TEXT');
      addColumn('messages', 'file_name', 'TEXT');
      addColumn('messages', 'mime_type', 'TEXT');
    });
};

initializeSchema();

export default db;

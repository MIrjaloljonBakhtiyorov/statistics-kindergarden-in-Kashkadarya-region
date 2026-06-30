import bcrypt from 'bcryptjs';
import db from '../src/modules/shared/database.js';

const DISTRICTS = [
  'Qarshi tumani',
  'Shahrisabz tumani',
  'Kitob tumani',
  'Koson tumani',
  'Muborak tumani',
  "G'uzor tumani",
  'Nishon tumani',
  'Dehqonobod tumani',
  'Qamashi tumani',
  'Chiroqchi tumani',
  'Kasbi tumani',
  'Mirishkor tumani',
  "Yakkabog' tumani",
  "Ko'kdala tumani",
];

const GROUPS = [
  { name: 'Kichik guruh', age: '3 yosh', birthYear: 2022 },
  { name: "O'rta guruh", age: '4 yosh', birthYear: 2021 },
  { name: 'Katta guruh', age: '5 yosh', birthYear: 2020 },
  { name: 'Tayyorlov A', age: '6 yosh', birthYear: 2019 },
  { name: 'Tayyorlov B', age: '6 yosh', birthYear: 2019 },
];

const TYPE_SEQUENCE = ['Public', 'Private', 'Home'];
const STREET_NAMES = [
  'Mustaqillik',
  "Bog'iston",
  'Navbahor',
  'Yoshlik',
  'Istiqlol',
  'Nurafshon',
  'Navoiy',
  'Beruniy',
  'Amir Temur',
  'Aqlvoy',
  "Do'stlik",
  'Obod',
];
const KINDERGARTEN_NAMES = [
  'Quyoshcha',
  'Binafsha',
  'Kamalak',
  'Navro\'z',
  'Mehribon',
  'Shodlik',
  'Gulzor',
  'Ziyo',
  'Nihol',
  'Bolajon',
  'Kelajak',
  'Yulduzcha',
  'Semurg',
  'Orzu',
  'Iqbol',
  'Chashma',
];

const BOY_NAMES = [
  'Abdulloh',
  'Abbos',
  'Akbar',
  'Alisher',
  'Azizbek',
  'Behruz',
  'Bilol',
  'Bobur',
  'Diyorbek',
  'Elbek',
  'Farruh',
  'Humoyun',
  'Ibrohim',
  'Islom',
  'Javohir',
  'Jasurbek',
  'Kamron',
  'Lazizbek',
  'Muhammadali',
  'Otabek',
  'Oybek',
  'Sardor',
  'Temurbek',
  'Umidjon',
  'Zafarbek',
];
const GIRL_NAMES = [
  'Adiba',
  'Aziza',
  'Bibixonim',
  'Dilafruz',
  'Durdona',
  'Feruza',
  'Gulbahor',
  'Gulsanam',
  'Hadicha',
  'Iroda',
  'Kamola',
  'Lobar',
  'Madina',
  'Malika',
  'Mohinur',
  'Nargiza',
  'Nilufar',
  'Nodira',
  'Rayhona',
  'Ruxshona',
  'Sevinch',
  'Shahnoza',
  'Zarina',
  'Zilola',
];
const FAMILY_ROOTS = [
  'Abdullayev',
  'Aliyev',
  'Asqarov',
  'Azimov',
  'Beknazarov',
  'Bozorov',
  'Eshonqulov',
  'Ergashev',
  'Hamroyev',
  'Hasanov',
  'Ismoilov',
  'Karimov',
  'Mamatov',
  'Murodov',
  'Norboyev',
  'Nazarov',
  'Ortiqov',
  'Qodirov',
  'Rahimov',
  'Rasulov',
  'Saidov',
  'Toshpulatov',
  'Tursunov',
  'Yuldashev',
  'Zokirov',
];
const FATHER_NAMES = [
  'Abduvali',
  'Akmal',
  'Anvar',
  'Bahodir',
  'Bekzod',
  'Davron',
  'Elyor',
  'Furqat',
  'Hasan',
  'Ikrom',
  'Jamshid',
  'Komil',
  'Murod',
  'Nodir',
  'Oybek',
  'Qahramon',
  'Ravshan',
  'Sanjar',
  'Sherzod',
  'Ulugbek',
];
const MOTHER_NAMES = [
  'Barno',
  'Dilnoza',
  'Dilorom',
  'Feruza',
  'Gavhar',
  'Gulchehra',
  'Gulnora',
  'Hilola',
  'Lola',
  'Maftuna',
  'Malohat',
  'Munisa',
  'Nigora',
  'Saodat',
  'Shahlo',
  'Umida',
  'Xurshida',
  'Zebo',
  'Zilola',
  'Zumrad',
];
const WORKPLACES = [
  'mahalla fuqarolar yigini',
  'oilaviy tadbirkorlik markazi',
  'tuman tibbiyot birlashmasi',
  'umumta\'lim maktabi',
  'dehqon bozori',
  'xizmat ko\'rsatish shoxobchasi',
  'fermer xo\'jaligi',
  'tikuvchilik sexi',
  'bank filiali',
  'savdo do\'koni',
];

let seed = 20260605;
let kindergartenSeq = 1;
let groupSeq = 1;
let childSeq = 1;
let parentSeq = 1;
let accountSeq = 1;
let staffSeq = 1;
let attendanceSeq = 1;
let mealPortionSeq = 1;

const random = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const randomInt = (min, max) => Math.floor(random() * (max - min + 1)) + min;
const pick = (items) => items[randomInt(0, items.length - 1)];
const pad = (value, length) => String(value).padStart(length, '0');
const today = new Date().toISOString().slice(0, 10);

const toFemaleLastName = (lastName) => {
  if (lastName.endsWith('ev')) return `${lastName}a`;
  if (lastName.endsWith('ov')) return `${lastName}a`;
  return lastName;
};

const normalizeLoginText = (value) => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '')
  .slice(0, 28);

const fakePhone = (index) => `+998 00 ${pad(Math.floor(index / 10000) % 100, 2)} ${pad(Math.floor(index / 100) % 100, 2)} ${pad(index % 100, 2)}`;
const fakePassport = (prefix, index) => `${prefix}${pad(index, 7)}`;
const id = (prefix, index) => `${prefix}_${pad(index, 6)}`;
const isoBirthDate = (year) => `${year}-${pad(randomInt(1, 12), 2)}-${pad(randomInt(1, 28), 2)}`;

const createInsert = (table, columns, rows) => {
  const values = [];
  const placeholders = rows.map((row) => {
    const cellPlaceholders = columns.map((column) => {
      values.push(row[column] ?? null);
      return `$${values.length}`;
    });
    return `(${cellPlaceholders.join(', ')})`;
  });

  return {
    sql: `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders.join(', ')}`,
    values,
  };
};

const insertChunked = async (client, table, columns, rows, chunkSize = 2500) => {
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const { sql, values } = createInsert(table, columns, chunk);
    await client.query(sql, values);
  }
};

const insertKindergartens = async (client, rows) => {
  const columns = [
    'system_id',
    'name',
    'type',
    'workhours',
    'region',
    'district',
    'directorname',
    'directorbirthyear',
    'phone',
    'address',
    'email',
    'position',
    'capacity',
    'currentchildren',
    'groups',
    'age13',
    'age37',
    'educators',
    'cooks',
    'techstaff',
    'nursecount',
    'hasnurse',
    'mealtype',
    'sanitation',
    'water',
    'kitcheneq',
    'haskitchen',
    'hasallergymenu',
    'hasdietmenu',
    'haswarehouse',
    'warehousemanager',
    'avgconsumption',
    'financetype',
    'budget',
    'lat',
    'lng',
    'username',
    'password',
    'status',
    'rating',
    'aimonitoring',
    'threshold',
  ];

  const inserted = [];
  for (let index = 0; index < rows.length; index += 1000) {
    const chunk = rows.slice(index, index + 1000);
    const { sql, values } = createInsert('kindergartens', columns, chunk);
    const result = await client.query(`${sql} RETURNING id, system_id`, values);
    inserted.push(...result.rows);
  }
  return new Map(inserted.map((row) => [row.system_id, row.id]));
};

const buildKindergartenName = (district, type, index) => {
  const shortDistrict = district.replace(' tumani', '');
  if (type === 'Public') return `${shortDistrict} ${index}-son davlat MTT`;
  if (type === 'Private') return `${shortDistrict} ${pick(KINDERGARTEN_NAMES)} xususiy MTT`;
  return `${shortDistrict} ${pick(KINDERGARTEN_NAMES)} oilaviy MTT`;
};

const statusForAttendance = (districtIndex) => {
  const presentTarget = 0.84 + ((districtIndex % 5) * 0.025);
  const roll = random();
  if (roll < presentTarget - 0.08) return 'PRESENT';
  if (roll < presentTarget - 0.03) return 'EARLY';
  if (roll < presentTarget) return 'LATE';
  return random() < 0.72 ? 'ABSENT' : 'KELMADI';
};

const arrivalForStatus = (status) => {
  if (status === 'EARLY') return `08:${pad(randomInt(0, 25), 2)}`;
  if (status === 'LATE') return `09:${pad(randomInt(1, 35), 2)}`;
  if (status === 'PRESENT') return `08:${pad(randomInt(26, 59), 2)}`;
  return null;
};

const reasonForStatus = (status) => {
  if (status === 'ABSENT') return pick(['Oila sababli', 'Shamollash', 'Safarda', 'Shifokor ko\'rigi', 'Sababsiz']);
  if (status === 'KELMADI') return pick(['Ota-ona xabari kutilmoqda', 'Uyda qolgan']);
  return null;
};

const buildDataset = (parentPasswordHash) => {
  const kindergartenRows = [];
  const staffRows = [];

  DISTRICTS.forEach((district, districtIndex) => {
    const count = randomInt(20, 30);
    for (let index = 1; index <= count; index += 1) {
      const type = TYPE_SEQUENCE[(index + districtIndex) % TYPE_SEQUENCE.length];
      const systemId = `QA-MTT-${pad(kindergartenSeq, 4)}`;
      const directorLastName = pick(FAMILY_ROOTS);
      const directorName = `${pick(FATHER_NAMES)} ${directorLastName}`;
      const street = `${pick(STREET_NAMES)} ko'chasi ${randomInt(1, 220)}-uy`;
      const capacity = type === 'Home' ? 110 : randomInt(115, 150);
      const lat = 38.1 + random() * 1.2;
      const lng = 64.0 + random() * 3.1;
      const username = `mtt${pad(kindergartenSeq, 4)}`;

      kindergartenRows.push({
        system_id: systemId,
        name: buildKindergartenName(district, type, index),
        type,
        workhours: type === 'Home' ? 9 : pick([9, 9.5, 10.5, 12]),
        region: 'Qashqadaryo viloyati',
        district,
        directorname: directorName,
        directorbirthyear: randomInt(1974, 1990),
        phone: fakePhone(kindergartenSeq),
        address: `${district}, ${street}`,
        email: `${username}@raqamli-mtt.test`,
        position: 'Direktor',
        capacity,
        currentchildren: 100,
        groups: 5,
        age13: 1,
        age37: 1,
        educators: 5,
        cooks: type === 'Home' ? 1 : 2,
        techstaff: type === 'Home' ? 1 : 3,
        nursecount: type === 'Home' ? 0 : 1,
        hasnurse: type === 'Home' ? 0 : 1,
        mealtype: type === 'Home' ? '3 mahal' : '4 mahal',
        sanitation: 'Yaxshi',
        water: 'Markazlashgan',
        kitcheneq: 'To\'liq jihozlangan',
        haskitchen: 1,
        hasallergymenu: type !== 'Home' ? 1 : 0,
        hasdietmenu: type !== 'Home' ? 1 : 0,
        haswarehouse: type !== 'Home' ? 1 : 0,
        warehousemanager: type !== 'Home' ? `${pick(FATHER_NAMES)} ${pick(FAMILY_ROOTS)}` : null,
        avgconsumption: randomInt(12500, 23000),
        financetype: type === 'Public' ? 'Budget' : 'Private',
        budget: type === 'Public' ? randomInt(420000000, 820000000) : randomInt(180000000, 520000000),
        lat,
        lng,
        username,
        password: '123456',
        status: 'ACTIVE',
        rating: randomInt(78, 100),
        aimonitoring: 1,
        threshold: randomInt(72, 88),
      });

      staffRows.push({
        id: id('staff', staffSeq++),
        kindergarten_id: systemId,
        full_name: directorName,
        position: 'Director',
        phone: fakePhone(100000 + staffSeq),
        email: `${username}.director@raqamli-mtt.test`,
        passport_no: fakePassport('ST', staffSeq),
        birth_date: isoBirthDate(randomInt(1974, 1990)),
        education: 'Oliy pedagogik',
        experience_years: String(randomInt(8, 24)),
        group_id: null,
        salary: randomInt(4500000, 8200000),
        hire_date: `${randomInt(2015, 2024)}-${pad(randomInt(1, 12), 2)}-${pad(randomInt(1, 28), 2)}`,
        status: 'ACTIVE',
      });

      kindergartenSeq += 1;
    }
  });

  const groupRows = [];
  const childRows = [];
  const parentRows = [];
  const accountRows = [];
  const attendanceRows = [];
  const mealPortionRows = [];

  return {
    kindergartenRows,
    staffRows,
    groupRows,
    childRows,
    parentRows,
    accountRows,
    attendanceRows,
    mealPortionRows,
    attachChildren(kindergartenIds) {
      kindergartenRows.forEach((kindergarten, kgIndex) => {
        const kgId = kindergartenIds.get(kindergarten.system_id);
        const teacherIds = [];

        GROUPS.forEach((groupConfig, groupIndex) => {
          const groupId = id('group', groupSeq++);
          const teacherLast = pick(FAMILY_ROOTS);
          const teacherName = `${pick(groupIndex % 2 === 0 ? MOTHER_NAMES : FATHER_NAMES)} ${groupIndex % 2 === 0 ? toFemaleLastName(teacherLast) : teacherLast}`;
          const teacherId = id('staff', staffSeq++);
          teacherIds.push(teacherId);

          groupRows.push({
            id: groupId,
            kindergarten_id: kgId,
            name: `${groupConfig.name} ${groupIndex + 1}`,
            teacher_name: teacherName,
            age_category: groupConfig.age,
            age_limit: groupConfig.age,
            capacity: 20,
            teacher_id: teacherId,
          });

          staffRows.push({
            id: teacherId,
            kindergarten_id: kgId,
            full_name: teacherName,
            position: 'Educator',
            phone: fakePhone(100000 + staffSeq),
            email: null,
            passport_no: fakePassport('ST', staffSeq),
            birth_date: isoBirthDate(randomInt(1980, 1998)),
            education: 'Oliy yoki o\'rta maxsus pedagogik',
            experience_years: String(randomInt(2, 18)),
            group_id: groupId,
            salary: randomInt(2800000, 5200000),
            hire_date: `${randomInt(2018, 2025)}-${pad(randomInt(1, 12), 2)}-${pad(randomInt(1, 28), 2)}`,
            status: 'ACTIVE',
          });

          const groupAttendance = { total: 20, early: 0, late: 0, absent: 0 };

          for (let childIndex = 1; childIndex <= 20; childIndex += 1) {
            const gender = random() < 0.52 ? 'M' : 'F';
            const firstName = pick(gender === 'M' ? BOY_NAMES : GIRL_NAMES);
            const familyNameBase = pick(FAMILY_ROOTS);
            const lastName = gender === 'M' ? familyNameBase : toFemaleLastName(familyNameBase);
            const fatherId = id('parent', parentSeq++);
            const motherId = id('parent', parentSeq++);
            const accountId = id('pacc', accountSeq++);
            const childId = id('child', childSeq++);
            const login = `${normalizeLoginText(firstName)}${pad(accountSeq, 6)}`;
            const address = `${kindergarten.address}, ${pick(STREET_NAMES)} mahallasi`;

            parentRows.push({
              id: fatherId,
              full_name: `${pick(FATHER_NAMES)} ${familyNameBase}`,
              workplace: pick(WORKPLACES),
              phone: fakePhone(parentSeq),
              passport_no: fakePassport('FA', parentSeq),
              role: 'FATHER',
              kindergarten_id: kgId,
              password: null,
              child_id: childId,
            });
            parentRows.push({
              id: motherId,
              full_name: `${pick(MOTHER_NAMES)} ${toFemaleLastName(pick(FAMILY_ROOTS))}`,
              workplace: pick(WORKPLACES),
              phone: fakePhone(parentSeq + 50000),
              passport_no: fakePassport('MO', parentSeq),
              role: 'MOTHER',
              kindergarten_id: kgId,
              password: null,
              child_id: childId,
            });

            accountRows.push({
              id: accountId,
              login,
              password_hash: parentPasswordHash,
              kindergarten_id: kgId,
            });

            childRows.push({
              id: childId,
              kindergarten_id: kgId,
              first_name: firstName,
              last_name: lastName,
              birth_date: isoBirthDate(groupConfig.birthYear),
              gender,
              group_id: groupId,
              parent_account_id: accountId,
              father_id: fatherId,
              mother_id: motherId,
              address,
              passport_info: fakePassport('BC', childSeq),
              birth_certificate_number: `T-${pad(childSeq, 8)}`,
              weight: randomInt(140, 260) / 10,
              height: randomInt(92, 126),
              is_allergic: random() < 0.08 ? 1 : 0,
              allergies: random() < 0.08 ? pick(['Sut mahsulotlari', 'Yong\'oq', 'Tuxum', 'Sitrus']) : null,
              medical_notes: random() < 0.12 ? 'Profilaktik kuzatuvda' : null,
              status: 'ACTIVE',
              age_category: groupConfig.age,
            });

            const status = statusForAttendance(kgIndex);
            if (status === 'EARLY') groupAttendance.early += 1;
            if (status === 'LATE') groupAttendance.late += 1;
            if (status === 'ABSENT' || status === 'KELMADI') groupAttendance.absent += 1;

            attendanceRows.push({
              id: id('att', attendanceSeq++),
              kindergarten_id: kgId,
              child_id: childId,
              date: today,
              status,
              reason: reasonForStatus(status),
              arrival_time: arrivalForStatus(status),
            });
          }

          mealPortionRows.push({
            id: id('portion', mealPortionSeq++),
            kindergarten_id: kgId,
            group_id: groupId,
            date: today,
            total_children: groupAttendance.total,
            early_count: groupAttendance.early,
            late_count: groupAttendance.late,
            absent_count: groupAttendance.absent,
            meal_portions: groupAttendance.total - groupAttendance.absent,
            entry_mode: 'ATTENDANCE',
          });
        });

        staffRows.push({
          id: id('staff', staffSeq++),
          kindergarten_id: kgId,
          full_name: `${pick(MOTHER_NAMES)} ${toFemaleLastName(pick(FAMILY_ROOTS))}`,
          position: 'Nurse',
          phone: fakePhone(100000 + staffSeq),
          email: null,
          passport_no: fakePassport('ST', staffSeq),
          birth_date: isoBirthDate(randomInt(1982, 1997)),
          education: 'Tibbiyot kolleji',
          experience_years: String(randomInt(3, 16)),
          group_id: null,
          salary: randomInt(2600000, 4600000),
          hire_date: `${randomInt(2018, 2025)}-${pad(randomInt(1, 12), 2)}-${pad(randomInt(1, 28), 2)}`,
          status: 'ACTIVE',
        });

        staffRows.push({
          id: id('staff', staffSeq++),
          kindergarten_id: kgId,
          full_name: `${pick(FATHER_NAMES)} ${pick(FAMILY_ROOTS)}`,
          position: 'Chef',
          phone: fakePhone(100000 + staffSeq),
          email: null,
          passport_no: fakePassport('ST', staffSeq),
          birth_date: isoBirthDate(randomInt(1978, 1995)),
          education: 'O\'rta maxsus',
          experience_years: String(randomInt(4, 20)),
          group_id: null,
          salary: randomInt(2600000, 4800000),
          hire_date: `${randomInt(2018, 2025)}-${pad(randomInt(1, 12), 2)}-${pad(randomInt(1, 28), 2)}`,
          status: 'ACTIVE',
        });

        teacherIds.forEach((teacherId) => {
          const groupRow = groupRows.find((row) => row.teacher_id === teacherId);
          if (groupRow) groupRow.teacher_id = teacherId;
        });
      });
    },
  };
};

(async () => {
  const startedAt = Date.now();
  const client = await db.pool.connect();

  try {
    console.log('Replacing mock data with synthetic Qashqadaryo kindergarten dataset...');
    const parentPasswordHash = await bcrypt.hash('parent123', 10);
    const dataset = buildDataset(parentPasswordHash);

    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE kindergartens RESTART IDENTITY CASCADE');

    const kindergartenIds = await insertKindergartens(client, dataset.kindergartenRows);
    dataset.attachChildren(kindergartenIds);

    for (const row of dataset.staffRows) {
      if (typeof row.kindergarten_id === 'string') {
        row.kindergarten_id = kindergartenIds.get(row.kindergarten_id);
      }
    }

    await insertChunked(client, 'groups', [
      'id',
      'kindergarten_id',
      'name',
      'teacher_name',
      'age_category',
      'age_limit',
      'capacity',
      'teacher_id',
    ], dataset.groupRows);

    await insertChunked(client, 'staff', [
      'id',
      'kindergarten_id',
      'full_name',
      'position',
      'phone',
      'email',
      'passport_no',
      'birth_date',
      'education',
      'experience_years',
      'group_id',
      'salary',
      'hire_date',
      'status',
    ], dataset.staffRows);

    await insertChunked(client, 'parents', [
      'id',
      'full_name',
      'workplace',
      'phone',
      'passport_no',
      'role',
      'kindergarten_id',
      'password',
      'child_id',
    ], dataset.parentRows);

    await insertChunked(client, 'parent_accounts', [
      'id',
      'login',
      'password_hash',
      'kindergarten_id',
    ], dataset.accountRows);

    await insertChunked(client, 'children', [
      'id',
      'kindergarten_id',
      'first_name',
      'last_name',
      'birth_date',
      'gender',
      'group_id',
      'parent_account_id',
      'father_id',
      'mother_id',
      'address',
      'passport_info',
      'birth_certificate_number',
      'weight',
      'height',
      'is_allergic',
      'allergies',
      'medical_notes',
      'status',
      'age_category',
    ], dataset.childRows, 2000);

    await insertChunked(client, 'attendance', [
      'id',
      'kindergarten_id',
      'child_id',
      'date',
      'status',
      'reason',
      'arrival_time',
    ], dataset.attendanceRows, 6000);

    await insertChunked(client, 'daily_meal_portions', [
      'id',
      'kindergarten_id',
      'group_id',
      'date',
      'total_children',
      'early_count',
      'late_count',
      'absent_count',
      'meal_portions',
      'entry_mode',
    ], dataset.mealPortionRows);

    await client.query('COMMIT');

    const summary = {
      districts: DISTRICTS.length,
      kindergartens: dataset.kindergartenRows.length,
      groups: dataset.groupRows.length,
      children: dataset.childRows.length,
      parents: dataset.parentRows.length,
      parentAccounts: dataset.accountRows.length,
      staff: dataset.staffRows.length,
      attendance: dataset.attendanceRows.length,
      dailyMealPortions: dataset.mealPortionRows.length,
      today,
      seconds: ((Date.now() - startedAt) / 1000).toFixed(1),
    };

    console.log('Seed finished successfully.');
    console.table(summary);
    console.log('Director login example: mtt0001 / 123456');
    console.log('Parent login example: first generated parent account / parent123');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('Error during seeding:', error.message || error);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.pool.end();
  }
})();

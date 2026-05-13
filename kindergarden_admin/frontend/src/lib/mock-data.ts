import { District, Kindergarten, KindergartenType, StatusType, AIInsight, DailyMenu, Meal } from '../types';

export const DISTRICTS: District[] = [
  { id: "1",  name: "Qarshi shahri",     totalMTTs: 145, totalChildren: 15000, attendedBefore9: 10200, attendedAfter9: 3000, absent: 1400, attendancePercentage: 88, status: StatusType.GOOD },
  { id: "2",  name: "Qarshi tumani",     totalMTTs: 112, totalChildren: 13000, attendedBefore9: 6800,  attendedAfter9: 2500, absent: 1500, attendancePercentage: 76, status: StatusType.AVERAGE },
  { id: "3",  name: "Shahrisabz shahri", totalMTTs: 88,  totalChildren: 10500, attendedBefore9: 5500,  attendedAfter9: 2200, absent: 600,  attendancePercentage: 91, status: StatusType.GOOD },
  { id: "4",  name: "Shahrisabz tumani", totalMTTs: 134, totalChildren: 9800,  attendedBefore9: 7800,  attendedAfter9: 1200, absent: 900,  attendancePercentage: 85, status: StatusType.GOOD },
  { id: "5",  name: "Kitob tumani",      totalMTTs: 120, totalChildren: 9200,  attendedBefore9: 7100,  attendedAfter9: 1200, absent: 900,  attendancePercentage: 84, status: StatusType.GOOD },
  { id: "6",  name: "Koson tumani",      totalMTTs: 156, totalChildren: 10800, attendedBefore9: 8900,  attendedAfter9: 1100, absent: 1400, attendancePercentage: 80, status: StatusType.AVERAGE },
  { id: "7",  name: "Muborak tumani",    totalMTTs: 64,  totalChildren: 8500,  attendedBefore9: 4000,  attendedAfter9: 1200, absent: 500,  attendancePercentage: 83, status: StatusType.GOOD },
  { id: "8",  name: "G'uzor tumani",     totalMTTs: 98,  totalChildren: 7200,  attendedBefore9: 6200,  attendedAfter9: 1000, absent: 900,  attendancePercentage: 81, status: StatusType.AVERAGE },
  { id: "9",  name: "Nishon tumani",     totalMTTs: 82,  totalChildren: 7500,  attendedBefore9: 4800,  attendedAfter9: 1100, absent: 700,  attendancePercentage: 81, status: StatusType.AVERAGE },
  { id: "10", name: "Dehqonobod tumani", totalMTTs: 76,  totalChildren: 6200,  attendedBefore9: 4200,  attendedAfter9: 900,  absent: 700,  attendancePercentage: 80, status: StatusType.AVERAGE },
  { id: "11", name: "Qamashi tumani",    totalMTTs: 124, totalChildren: 8800,  attendedBefore9: 7600,  attendedAfter9: 1200, absent: 900,  attendancePercentage: 83, status: StatusType.GOOD },
  { id: "12", name: "Chiroqchi tumani",  totalMTTs: 168, totalChildren: 13200, attendedBefore9: 10800, attendedAfter9: 1500, absent: 1500, attendancePercentage: 81, status: StatusType.AVERAGE },
  { id: "13", name: "Kasbi tumani",      totalMTTs: 94,  totalChildren: 6800,  attendedBefore9: 6000,  attendedAfter9: 900,  absent: 700,  attendancePercentage: 84, status: StatusType.GOOD },
  { id: "14", name: "Mirishkor tumani",  totalMTTs: 71,  totalChildren: 5900,  attendedBefore9: 4500,  attendedAfter9: 800,  absent: 600,  attendancePercentage: 82, status: StatusType.GOOD },
  { id: "15", name: "Yakkabog' tumani",  totalMTTs: 85,  totalChildren: 6400,  attendedBefore9: 5200,  attendedAfter9: 700,  absent: 600,  attendancePercentage: 83, status: StatusType.GOOD },
  { id: "16", name: "Beshkent tumani",   totalMTTs: 78,  totalChildren: 5600,  attendedBefore9: 4400,  attendedAfter9: 700,  absent: 500,  attendancePercentage: 82, status: StatusType.GOOD },
];

export const AI_INSIGHTS: AIInsight[] = [];

export const MOCK_KINDERGARTENS: Kindergarten[] = [
  {
    id: "k1",
    name: "12-sonli Quyoshcha MTT",
    type: KindergartenType.PUBLIC,
    district: "Qarshi shahri",
    director: "Alimov Abror",
    phone: "+998 90 123 45 67",
    totalChildren: 120,
    attendedBefore9: 105,
    attendedAfter9: 10,
    absent: 5,
    attendancePercentage: 87.5,
    rating: 9.2,
    status: StatusType.GOOD,
    violationsCount: 0,
    menuStatus: "active",
  },
  {
    id: "k2",
    name: "Golden Kids Private Nursery",
    type: KindergartenType.PRIVATE,
    district: "Qarshi shahri",
    director: "Karimova Zilola",
    phone: "+998 99 876 54 32",
    totalChildren: 45,
    attendedBefore9: 42,
    attendedAfter9: 2,
    absent: 1,
    attendancePercentage: 93.3,
    rating: 9.8,
    status: StatusType.GOOD,
    violationsCount: 0,
    menuStatus: "active",
  },
  {
    id: "k3",
    name: "Baraka Oilaviy Bogcha",
    type: KindergartenType.HOME,
    district: "Koson tumani",
    director: "Toshmirzoeva Nilufar",
    phone: "+998 91 222 33 44",
    totalChildren: 25,
    attendedBefore9: 15,
    attendedAfter9: 5,
    absent: 5,
    attendancePercentage: 60.0,
    rating: 6.5,
    status: StatusType.PROBLEM,
    violationsCount: 3,
    menuStatus: "violation",
  },
];

export const TEN_DAY_MENU: DailyMenu[] = [
  {
    day: 1,
    breakfast: { name: "Sutli botqa (Manna)", ingredients: [{ name: "Sut", amount: "200ml" }, { name: "Manna", amount: "30g" }] },
    lunch:     { name: "Mastava",             ingredients: [{ name: "Gosht", amount: "50g" }, { name: "Guruch", amount: "30g" }] },
    snack:     { name: "Pechenye va kompot",  ingredients: [{ name: "Pechenye", amount: "50g" }, { name: "Mevalar", amount: "20g" }] },
    dinner:    { name: "Teftel guruch bilan", ingredients: [{ name: "Qiymat", amount: "80g" }, { name: "Guruch", amount: "100g" }] },
  },
];

export const ATTENDANCE_TREND = [
  { date: "Du", attendance: 85 },
  { date: "Se", attendance: 88 },
  { date: "Ch", attendance: 82 },
  { date: "Pa", attendance: 90 },
  { date: "Ju", attendance: 87 },
];

export const MOCK_MEALS: Meal[] = [
  { id: "m1", code: "T001", name: "Palov (Osh)",            images: [], ingredients: [{ name: "Guruch", quantity: "100", unit: "g" }, { name: "Gosht", quantity: "50", unit: "g" }],    technologicalCard: "Gosht qovuriladi, sabzi va piyoz qoshiladi, guruch demlanadi.", category: "3-7 yosh" },
  { id: "m2", code: "T002", name: "Qozonkabob",             images: [], ingredients: [{ name: "Gosht", quantity: "150", unit: "g" }, { name: "Kartoshka", quantity: "200", unit: "g" }],  technologicalCard: "Gosht va kartoshka qozonda qovuriladi.", category: "3-7 yosh" },
  { id: "m3", code: "T003", name: "Manti",                  images: [], ingredients: [{ name: "Qiymat", quantity: "100", unit: "g" }, { name: "Un", quantity: "150", unit: "g" }],        technologicalCard: "Hamir yoyilib, qiymat bilan tugiladi va mantivarka pishiriladi.", category: "3-7 yosh" },
  { id: "m4", code: "T004", name: "Sutli botqa",            images: [], ingredients: [{ name: "Sut", quantity: "200", unit: "ml" }, { name: "Guruch", quantity: "50", unit: "g" }],       technologicalCard: "Sut qaynatiladi, guruch qoshib yumshoq bolguncha pishiriladi.", category: "1-3 yosh" },
  { id: "m5", code: "T005", name: "Sabzavotli shorva",      images: [], ingredients: [{ name: "Sabzi", quantity: "50", unit: "g" }, { name: "Kartoshka", quantity: "100", unit: "g" }],   technologicalCard: "Sabzavotlar tograb qaynatiladi.", category: "parhezli" },
  { id: "m6", code: "T006", name: "Bugda pishirilgan kotlet", images: [], ingredients: [{ name: "Gosht", quantity: "80", unit: "g" }], technologicalCard: "Qiymatdan kotletlar yasalib, bugda pishiriladi.", category: "parhezli" },
];

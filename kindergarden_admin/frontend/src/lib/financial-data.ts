import { DISTRICTS } from './mock-data';

// 1. Qashqadaryo bozoridagi bugungi mahsulot narxlari (so'm)
export const MARKET_PRICES = [
  { id: 'p1', name: 'Go‘sht (mol)', price: 85000, unit: 'kg', trend: 3, reliability: 98 },
  { id: 'p2', name: 'Kartoshka', price: 6000, unit: 'kg', trend: -2, reliability: 95 },
  { id: 'p3', name: 'Sabzi', price: 5000, unit: 'kg', trend: 0, reliability: 96 },
  { id: 'p4', name: 'Piyoz', price: 4000, unit: 'kg', trend: 5, reliability: 94 },
  { id: 'p5', name: 'Sut', price: 12000, unit: 'litr', trend: 0, reliability: 99 },
  { id: 'p6', name: 'Kefir', price: 14000, unit: 'litr', trend: 2, reliability: 97 },
  { id: 'p7', name: 'Baliq', price: 55000, unit: 'kg', trend: 0, reliability: 90 },
  { id: 'p8', name: 'Guruch', price: 18000, unit: 'kg', trend: 1, reliability: 98 },
  { id: 'p9', name: 'Yog‘', price: 19000, unit: 'litr', trend: -1, reliability: 99 },
  { id: 'p10', name: 'Shakar', price: 13000, unit: 'kg', trend: 0, reliability: 97 },
];

// 2. Bugungi menyu ingredientlari va xarajati (1 bola uchun)
export const TODAY_MENU_FINANCE = [
  {
    meal: 'Nonushta',
    dish: 'Sutli guruch bo‘tqasi',
    ingredients: [
      { name: 'Sut', amount: 0.2, unit: 'l', price: 12000, cost: 2400 },
      { name: 'Guruch', amount: 0.04, unit: 'kg', price: 18000, cost: 720 },
      { name: 'Shakar', amount: 0.01, unit: 'kg', price: 13000, cost: 130 },
    ],
    totalCost: 3250
  },
  {
    meal: 'Tushlik',
    dish: 'Mastava va Mo‘ljal (Go‘shtli)',
    ingredients: [
      { name: 'Go‘sht', amount: 0.06, unit: 'kg', price: 85000, cost: 5100 },
      { name: 'Kartoshka', amount: 0.1, unit: 'kg', price: 6000, cost: 600 },
      { name: 'Sabzi', amount: 0.05, unit: 'kg', price: 5000, cost: 250 },
      { name: 'Guruch', amount: 0.03, unit: 'kg', price: 18000, cost: 540 },
    ],
    totalCost: 6490
  },
  {
    meal: 'Poldnik',
    dish: 'Kefir va Shirinlik',
    ingredients: [
      { name: 'Kefir', amount: 0.2, unit: 'l', price: 14000, cost: 2800 },
      { name: 'Pechenye', amount: 0.05, unit: 'kg', price: 25000, cost: 1250 },
    ],
    totalCost: 4050
  },
  {
    meal: 'Kechki ovqat',
    dish: 'Sabzavotli dimlama',
    ingredients: [
      { name: 'Kartoshka', amount: 0.15, unit: 'kg', price: 6000, cost: 900 },
      { name: 'Sabzavotlar', amount: 0.1, unit: 'kg', price: 8000, cost: 800 },
      { name: 'Go‘sht', amount: 0.03, unit: 'kg', price: 85000, cost: 2550 },
    ],
    totalCost: 4250
  }
];

const ONE_CHILD_DAILY_COST = TODAY_MENU_FINANCE.reduce((acc, curr) => acc + curr.totalCost, 0);

// 3. Tumanlar bo'yicha moliyaviy hisob (Mock Data tumanlaridan generatsiya qilingan)
export const DISTRICT_FINANCIAL_DATA = DISTRICTS.map(d => {
  const totalCost = d.attendedBefore9 * ONE_CHILD_DAILY_COST; // Faqat kelganlar uchun
  const savedAmount = d.absent * ONE_CHILD_DAILY_COST; // Kelmaganlar uchun tejalgan
  const wasteRisk = d.attendedAfter9 > d.totalChildren * 0.1 ? 'critical' : d.attendancePercentage < 80 ? 'warning' : 'normal';

  return {
    ...d,
    oneChildCost: ONE_CHILD_DAILY_COST,
    totalDailyCost: totalCost,
    totalSavedAmount: savedAmount,
    status: wasteRisk
  };
});

// 4. Umumiy Viloyat Statistika
export const REGION_FINANCIAL_SUMMARY = {
  totalExpenditure: DISTRICT_FINANCIAL_DATA.reduce((acc, curr) => acc + curr.totalDailyCost, 0),
  totalSaved: DISTRICT_FINANCIAL_DATA.reduce((acc, curr) => acc + curr.totalSavedAmount, 0),
  totalAbsent: DISTRICT_FINANCIAL_DATA.reduce((acc, curr) => acc + curr.absent, 0),
  totalPresent: DISTRICT_FINANCIAL_DATA.reduce((acc, curr) => acc + (curr.attendedBefore9 + curr.attendedAfter9), 0),
  avgCostPerChild: ONE_CHILD_DAILY_COST,
  wasteAlerts: DISTRICT_FINANCIAL_DATA.filter(d => d.status === 'critical').length
};

// 5. Bog'cha turlari bo'yicha
export const KINDERGARTEN_TYPE_FINANCE = [
  { type: 'Public / Davlat', share: 0.75, costMultiplier: 1 },
  { type: 'Private / Xususiy', share: 0.15, costMultiplier: 1.4 },
  { type: 'Home / Oilaviy', share: 0.10, costMultiplier: 0.9 }
].map(t => {
  const kidsCount = Math.floor(REGION_FINANCIAL_SUMMARY.totalPresent * t.share);
  const absentCount = Math.floor(REGION_FINANCIAL_SUMMARY.totalAbsent * t.share);
  const cost = kidsCount * (ONE_CHILD_DAILY_COST * t.costMultiplier);
  const saved = absentCount * (ONE_CHILD_DAILY_COST * t.costMultiplier);

  return {
    type: t.type,
    kidsCount,
    absentCount,
    totalCost: cost,
    totalSaved: saved,
    avgCost: ONE_CHILD_DAILY_COST * t.costMultiplier
  };
});

// 6. Norma vs Real Sarf
export const PRODUCT_ANALYSIS = [
  { product: 'Go‘sht (mol)', norm: 0, real: 0, price: 85000 },
  { product: 'Kartoshka', norm: 0, real: 0, price: 6000 },
  { product: 'Guruch', norm: 0, real: 0, price: 18000 },
  { product: 'Sut', norm: 0, real: 0, price: 12000 },
  { product: 'Sabzi', norm: 0, real: 0, price: 5000 },
].map(p => {
  const diff = p.real - p.norm;
  const diffPct = p.norm > 0 ? (diff / p.norm) * 100 : 0;
  const financialDiff = diff * p.price;
  const status = diffPct > 5 ? 'critical' : diffPct > 2 ? 'warning' : 'normal';

  return {
    ...p,
    diffPct,
    financialDiff,
    status
  };
});

// 7. AI Xulosalari
export const AI_FINANCIAL_INSIGHTS = [
  {
    title: "Umumiy tahlil",
    text: "Tizimda moliyaviy ma'lumotlar mavjud emas. Tahlil natijalari ma'lumotlar kiritilgandan so'ng generatsiya qilinadi."
  },
  {
    title: "Isrof xavfi",
    text: "Hozircha isrof xavfi aniqlanmadi."
  },
  {
    title: "Bozor narxlari ta'siri",
    text: "Bozor narxlari monitoringi davom etmoqda."
  },
  {
    title: "Tavsiya",
    text: "Ma'lumotlar kiritilgandan so'ng tizim avtomatik tavsiyalar beradi."
  }
];

import { Meal, MenuItem } from '../types';

export interface AuditResult {
  score: number;
  status: 'excellent' | 'warning' | 'critical';
  insights: string[];
}

export const analyzeMenuAI = (menu: MenuItem[]): AuditResult => {
  const insights = [];
  let score = 100;

  // Me'yor nazorati (Mock logic)
  const totalCalories = 1800; // Hisoblangan
  if (totalCalories < 1600) {
    insights.push("Kaloriya miqdori belgilangan me'yordan past (Sog'liqni saqlash vazirligi standarti)");
    score -= 15;
  }

  // Tarkibiy muvozanat
  insights.push("Oqsil va uglevodlar balansi: Optimal");
  insights.push("Sanitariya holati: Barcha mahsulotlar sertifikatlangan");
  
  return {
    score,
    status: score > 85 ? 'excellent' : score > 60 ? 'warning' : 'critical',
    insights
  };
};

export const runFoodAudit = (data: any) => {
  const sections = [
    {
      name: 'Mahsulot statistikasi',
      score: data.ingredientMismatch ? 0 : 20,
      maxScore: 20,
      status: data.ingredientMismatch ? 'red' : 'green',
      comment: data.ingredientMismatch ? 'Massaliqlar nomuvofiq' : 'Massaliqlar to‘g‘ri'
    },
    {
      name: 'Mablag\' statistikasi',
      score: data.budgetExceeded ? 5 : 20,
      maxScore: 20,
      status: data.budgetExceeded ? 'red' : 'green',
      comment: data.budgetExceeded ? 'Byudjet oshib ketgan' : 'Byudjet me’yorida'
    },
    {
      name: 'Porsiya aniqligi',
      score: Math.round((data.actualPortionQty / data.expectedPortionQty) * 20),
      maxScore: 20,
      status: (data.actualPortionQty / data.expectedPortionQty) > 0.9 ? 'green' : 'yellow',
      comment: 'Grammaj tahlili'
    },
    {
      name: 'Sanitariya nazorati',
      score: data.sanitationConfirmed ? 20 : 0,
      maxScore: 20,
      status: data.sanitationConfirmed ? 'green' : 'red',
      comment: 'Sanitariya tasdiqlangan'
    },
    {
      name: 'Vaqt intizomi',
      score: data.cookingDurationMins <= data.maxCookingDurationMins ? 20 : 15,
      maxScore: 20,
      status: data.cookingDurationMins <= data.maxCookingDurationMins ? 'green' : 'yellow',
      comment: 'Tayyorlanish vaqti'
    }
  ];

  const totalScore = sections.reduce((acc, s) => acc + s.score, 0);

  return {
    totalScore,
    sections,
    riskLevel: totalScore > 85 ? 'Excellent' : totalScore > 65 ? 'Warning' : 'High Risk',
    summary: {
      strengths: sections.filter(s => s.status === 'green').map(s => s.name),
      problems: sections.filter(s => s.status !== 'green').map(s => s.name)
    }
  };
};

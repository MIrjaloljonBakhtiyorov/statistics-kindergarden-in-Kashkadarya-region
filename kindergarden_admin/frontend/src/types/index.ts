/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum KindergartenType {
  PUBLIC = 'Davlat (Public)',
  PRIVATE = 'Xususiy (Private)',
  HOME = 'Oilaviy (Home)',
}

export enum StatusType {
  GOOD = 'good',
  AVERAGE = 'average',
  PROBLEM = 'problem',
}

export interface Kindergarten {
  id: string;
  name: string;
  type: KindergartenType;
  district: string;
  director: string;
  phone: string;
  totalChildren: number;
  attendedBefore9: number;
  attendedAfter9: number;
  absent: number;
  attendancePercentage: number;
  rating: number;
  status: StatusType;
  violationsCount: number;
  menuStatus: 'active' | 'violation' | 'modified';
}

export interface District {
  id: string;
  name: string;
  totalMTTs: number;
  totalChildren: number;
  attendedBefore9: number;
  attendedAfter9: number;
  absent: number;
  attendancePercentage: number;
  status: StatusType;
}

export interface AIInsight {
  id: string;
  type: 'attendance' | 'delay' | 'risk' | 'menu' | 'supplier';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface MenuItem {
  name: string;
  ingredients: { name: string; amount: string }[];
}

export interface Meal {
  id: string;
  code: string;
  name: string;
  images: string[];
  ingredients: { name: string; quantity: string; unit: string }[];
  technologicalCard: string;
  category: '1-3 yosh' | '3-7 yosh' | 'parhezli';
}

export interface DailyMenu {
  day: number;
  breakfast: MenuItem;
  lunch: MenuItem;
  snack: MenuItem;
  dinner: MenuItem;
}

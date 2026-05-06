import { Baby, School, Users, TrendingUp, LayoutGrid } from 'lucide-react';

export const stats = [
  { label: '3-7 YOSHLI BOLALAR SONI', value: '341,403', icon: Baby, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
  { label: 'JAMI MTTlar SONI', value: '4,439', icon: School, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
  { label: 'MTTlardagi jami bolalar soni', value: '243,901', icon: Users, color: 'from-indigo-500 to-indigo-700', bg: 'bg-indigo-50' },
  { label: 'BOLALARNI QAMRAB OLISH FOIZI', value: '71.44%', icon: TrendingUp, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50' },
  { label: 'QASHQADARYODAGI MTT TURLARI', value: '5 TA', icon: LayoutGrid, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
];

export const attendanceData = [
  { name: 'Qarshi sh.', value: 81.06 }, { name: 'Shahrisabz sh.', value: 86.96 },
  { name: 'Qarshi t.', value: 86.20 }, { name: 'Shahrisabz t.', value: 73.42 },
  { name: 'Kitob t.', value: 67.44 }, { name: 'Koson t.', value: 71.32 },
  { name: 'Muborak t.', value: 95.31 }, { name: 'G\'uzor t.', value: 74.57 },
  { name: 'Nishon t.', value: 78.88 }, { name: 'Dehqonobod t.', value: 57.12 },
  { name: 'Qamashi t.', value: 66.11 }, { name: 'Chiroqchi t.', value: 60.39 },
  { name: 'Kasbi t.', value: 77.46 }, { name: 'Mirishkor t.', value: 77.26 },
  { name: 'Yakkabog\' t.', value: 73.48 }, { name: 'Ko\'kdala t.', value: 49.04 },
];

export const kindergartenTypes = [
  { 
    name: 'Davlat MTTlar', 
    count: 496, 
    children: 115202,
    description: 'Davlat tasarrufidagi maktabgacha ta\'lim tashkilotlari haqida ma\'lumot:',
    features: ['MTTlar soni: 496 ta', 'Bolalar soni: 115 202 ta', 'Malakali pedagoglar']
  },
  { 
    name: 'Nodavlat (xususiy) MTTlar', 
    count: 12, 
    children: 304,
    description: 'Xususiy tadbirkorlar tomonidan tashkil etilgan bog\'chalar haqida ma\'lumot:',
    features: ['MTTlar soni: 12 ta', 'Bolalar soni: 304 ta', 'Individual yondashuv']
  },
  { 
    name: 'Davlat-xususiy sherikchilik asosidagi MTTlar', 
    count: 200, 
    children: 19691,
    description: 'Davlat-xususiy sherikchilik asosidagi bog\'chalar haqida ma\'lumot:',
    features: ['MTTlar soni: 200 ta', 'Bolalar soni: 19 691 ta', 'Sifatli ta\'lim']
  },
  { 
    name: 'Oilaviy nodavlat MTTlar', 
    count: 3721, 
    children: 109443,
    description: 'Oilaviy sharoitda tashkil etilgan bog\'chalar haqida ma\'lumot:',
    features: ['MTTlar soni: 3 721 ta', 'Bolalar soni: 109 443 ta', 'Mahallaga yaqinlik']
  },
  { 
    name: 'Tashkilotga qarashli MTTlar', 
    count: 10, 
    children: 820,
    description: 'Yirik korxona va tashkilotlar qoshidagi bog\'chalar haqida ma\'lumot:',
    features: ['MTTlar soni: 10 ta', 'Bolalar soni: 820 ta', 'Xodimlar uchun imtiyozlar']
  },
];

export const COLORS = ['#4042a3', '#b0740c', '#177656', '#d9092c', '#5925d3'];

export const districts = [
  { 
    name: 'Qarshi sh.', 
    count: 269, 
    attendance: 81.06,
    details: {
      totalChildren3to7: 22318,
      totalMTT: 269,
      totalCoveredChildren: 18091,
      coveragePercentage: 81.06,
      types: [
        { name: 'Davlat MTTlar', count: 41, children: 9665 },
        { name: 'Nodavlat xususiy MTTlar', count: 0, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 27, children: 2314 },
        { name: 'Oilaviy nodavlat MTTlar', count: 197, children: 5876 },
        { name: 'Tashkilotga qarashli MTTlar', count: 4, children: 236 },
      ]
    }
  },
  { 
    name: 'Shahrisabz sh.', 
    count: 245, 
    attendance: 86.96,
    details: {
      totalChildren3to7: 12277,
      totalMTT: 245,
      totalCoveredChildren: 10676,
      coveragePercentage: 86.96,
      types: [
        { name: 'Davlat MTTlar', count: 33, children: 5184 },
        { name: 'Nodavlat xususiy MTTlar', count: 1, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 7, children: 584 },
        { name: 'Oilaviy nodavlat MTTlar', count: 204, children: 4908 },
        { name: 'Tashkilotga qarashli MTTlar', count: 0, children: 0 },
      ]
    }
  },
  { 
    name: 'Qarshi t.', 
    count: 359, 
    attendance: 86.20,
    details: {
      totalChildren3to7: 24041,
      totalMTT: 359,
      totalCoveredChildren: 20723,
      coveragePercentage: 86.20,
      types: [
        { name: 'Davlat MTTlar', count: 29, children: 7202 },
        { name: 'Nodavlat xususiy MTTlar', count: 0, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 27, children: 3315 },
        { name: 'Oilaviy nodavlat MTTlar', count: 303, children: 10206 },
        { name: 'Tashkilotga qarashli MTTlar', count: 0, children: 0 },
      ]
    }
  },
  { 
    name: 'Shahrisabz t.', 
    count: 280, 
    attendance: 73.42,
    details: {
      totalChildren3to7: 20934,
      totalMTT: 280,
      totalCoveredChildren: 15369,
      coveragePercentage: 73.42,
      types: [
        { name: 'Davlat MTTlar', count: 45, children: 8657 },
        { name: 'Nodavlat xususiy MTTlar', count: 1, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 9, children: 842 },
        { name: 'Oilaviy nodavlat MTTlar', count: 225, children: 5870 },
        { name: 'Tashkilotga qarashli MTTlar', count: 0, children: 0 },
      ]
    }
  },
  { 
    name: 'Kitob t.', 
    count: 305, 
    attendance: 67.44,
    details: {
      totalChildren3to7: 26303,
      totalMTT: 305,
      totalCoveredChildren: 17740,
      coveragePercentage: 67.44,
      types: [
        { name: 'Davlat MTTlar', count: 37, children: 8539 },
        { name: 'Nodavlat xususiy MTTlar', count: 7, children: 113 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 9, children: 604 },
        { name: 'Oilaviy nodavlat MTTlar', count: 252, children: 8484 },
        { name: 'Tashkilotga qarashli MTTlar', count: 0, children: 0 },
      ]
    }
  },
  { 
    name: 'Koson t.', 
    count: 379, 
    attendance: 71.32,
    details: {
      totalChildren3to7: 30200,
      totalMTT: 379,
      totalCoveredChildren: 21539,
      coveragePercentage: 71.32,
      types: [
        { name: 'Davlat MTTlar', count: 49, children: 9678 },
        { name: 'Nodavlat xususiy MTTlar', count: 0, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 25, children: 2942 },
        { name: 'Oilaviy nodavlat MTTlar', count: 305, children: 8919 },
        { name: 'Tashkilotga qarashli MTTlar', count: 0, children: 0 },
      ]
    }
  },
  { 
    name: 'Muborak t.', 
    count: 146, 
    attendance: 95.31,
    details: {
      totalChildren3to7: 8867,
      totalMTT: 146,
      totalCoveredChildren: 8451,
      coveragePercentage: 95.31,
      types: [
        { name: 'Davlat MTTlar', count: 21, children: 3849 },
        { name: 'Nodavlat xususiy MTTlar', count: 0, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 8, children: 787 },
        { name: 'Oilaviy nodavlat MTTlar', count: 117, children: 3815 },
        { name: 'Tashkilotga qarashli MTTlar', count: 0, children: 0 },
      ]
    }
  },
  { 
    name: 'G\'uzor t.', 
    count: 258, 
    attendance: 74.57,
    details: {
      totalChildren3to7: 21875,
      totalMTT: 258,
      totalCoveredChildren: 16312,
      coveragePercentage: 74.57,
      types: [
        { name: 'Davlat MTTlar', count: 34, children: 9364 },
        { name: 'Nodavlat xususiy MTTlar', count: 1, children: 120 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 5, children: 573 },
        { name: 'Oilaviy nodavlat MTTlar', count: 216, children: 6063 },
        { name: 'Tashkilotga qarashli MTTlar', count: 2, children: 192 },
      ]
    }
  },
  { 
    name: 'Nishon t.', 
    count: 212, 
    attendance: 78.88,
    details: {
      totalChildren3to7: 16116,
      totalMTT: 212,
      totalCoveredChildren: 12713,
      coveragePercentage: 78.88,
      types: [
        { name: 'Davlat MTTlar', count: 24, children: 6052 },
        { name: 'Nodavlat xususiy MTTlar', count: 1, children: 25 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 10, children: 940 },
        { name: 'Oilaviy nodavlat MTTlar', count: 175, children: 5356 },
        { name: 'Tashkilotga qarashli MTTlar', count: 2, children: 340 },
      ]
    }
  },
  { 
    name: 'Dehqonobod t.', 
    count: 192, 
    attendance: 57.12,
    details: {
      totalChildren3to7: 16491,
      totalMTT: 192,
      totalCoveredChildren: 9419,
      coveragePercentage: 57.12,
      types: [
        { name: 'Davlat MTTlar', count: 15, children: 4202 },
        { name: 'Nodavlat xususiy MTTlar', count: 0, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 11, children: 950 },
        { name: 'Oilaviy nodavlat MTTlar', count: 165, children: 4219 },
        { name: 'Tashkilotga qarashli MTTlar', count: 1, children: 48 },
      ]
    }
  },
  { 
    name: 'Qamashi t.', 
    count: 337, 
    attendance: 66.11,
    details: {
      totalChildren3to7: 29848,
      totalMTT: 337,
      totalCoveredChildren: 19734,
      coveragePercentage: 66.11,
      types: [
        { name: 'Davlat MTTlar', count: 32, children: 8602 },
        { name: 'Nodavlat xususiy MTTlar', count: 0, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 10, children: 837 },
        { name: 'Oilaviy nodavlat MTTlar', count: 295, children: 10295 },
        { name: 'Tashkilotga qarashli MTTlar', count: 0, children: 0 },
      ]
    }
  },
  { 
    name: 'Chiroqchi t.', 
    count: 339, 
    attendance: 60.39,
    details: {
      totalChildren3to7: 31124,
      totalMTT: 339,
      totalCoveredChildren: 18797,
      coveragePercentage: 60.39,
      types: [
        { name: 'Davlat MTTlar', count: 24, children: 8125 },
        { name: 'Nodavlat xususiy MTTlar', count: 0, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 7, children: 696 },
        { name: 'Oilaviy nodavlat MTTlar', count: 308, children: 9976 },
        { name: 'Tashkilotga qarashli MTTlar', count: 0, children: 0 },
      ]
    }
  },
  { 
    name: 'Kasbi t.', 
    count: 358, 
    attendance: 77.46,
    details: {
      totalChildren3to7: 20022,
      totalMTT: 358,
      totalCoveredChildren: 15510,
      coveragePercentage: 77.46,
      types: [
        { name: 'Davlat MTTlar', count: 32, children: 6530 },
        { name: 'Nodavlat xususiy MTTlar', count: 1, children: 46 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 17, children: 1502 },
        { name: 'Oilaviy nodavlat MTTlar', count: 307, children: 7428 },
        { name: 'Tashkilotga qarashli MTTlar', count: 1, children: 4 },
      ]
    }
  },
  { 
    name: 'Mirishkor t.', 
    count: 184, 
    attendance: 77.26,
    details: {
      totalChildren3to7: 11730,
      totalMTT: 184,
      totalCoveredChildren: 9063,
      coveragePercentage: 77.26,
      types: [
        { name: 'Davlat MTTlar', count: 21, children: 3722 },
        { name: 'Nodavlat xususiy MTTlar', count: 0, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 12, children: 1060 },
        { name: 'Oilaviy nodavlat MTTlar', count: 151, children: 4281 },
        { name: 'Tashkilotga qarashli MTTlar', count: 0, children: 0 },
      ]
    }
  },
  { 
    name: 'Yakkabog\' t.', 
    count: 481, 
    attendance: 73.48,
    details: {
      totalChildren3to7: 28545,
      totalMTT: 481,
      totalCoveredChildren: 20975,
      coveragePercentage: 73.48,
      types: [
        { name: 'Davlat MTTlar', count: 33, children: 7835 },
        { name: 'Nodavlat xususiy MTTlar', count: 0, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 12, children: 1383 },
        { name: 'Oilaviy nodavlat MTTlar', count: 436, children: 11757 },
        { name: 'Tashkilotga qarashli MTTlar', count: 0, children: 0 },
      ]
    }
  },
  { 
    name: 'Ko\'kdala t.', 
    count: 95, 
    attendance: 49.04,
    details: {
      totalChildren3to7: 21103,
      totalMTT: 95,
      totalCoveredChildren: 10348,
      coveragePercentage: 49.04,
      types: [
        { name: 'Davlat MTTlar', count: 26, children: 7996 },
        { name: 'Nodavlat xususiy MTTlar', count: 0, children: 0 },
        { name: 'Davlat-xususiy sheriklik asosidagi MTTlar', count: 4, children: 362 },
        { name: 'Oilaviy nodavlat MTTlar', count: 65, children: 1990 },
        { name: 'Tashkilotga qarashli MTTlar', count: 0, children: 0 },
      ]
    }
  }
];

export const productData = [
  { name: 'Qarshi sh.', Sut: 120, Go_sht: 80, Guruch: 90, Sabzavot: 50, Non: 40 },
  { name: 'Shahrisabz sh.', Sut: 100, Go_sht: 70, Guruch: 80, Sabzavot: 45, Non: 35 },
  { name: 'Qarshi t.', Sut: 110, Go_sht: 75, Guruch: 85, Sabzavot: 48, Non: 38 },
  { name: 'Shahrisabz t.', Sut: 105, Go_sht: 70, Guruch: 80, Sabzavot: 45, Non: 35 },
  { name: 'Kitob t.', Sut: 95, Go_sht: 65, Guruch: 75, Sabzavot: 40, Non: 30 },
  { name: 'Koson t.', Sut: 120, Go_sht: 85, Guruch: 95, Sabzavot: 55, Non: 45 },
  { name: 'Muborak t.', Sut: 80, Go_sht: 50, Guruch: 60, Sabzavot: 35, Non: 25 },
  { name: 'G\'uzor t.', Sut: 85, Go_sht: 55, Guruch: 65, Sabzavot: 38, Non: 28 },
  { name: 'Nishon t.', Sut: 75, Go_sht: 45, Guruch: 55, Sabzavot: 30, Non: 20 },
  { name: 'Dehqonobod t.', Sut: 85, Go_sht: 55, Guruch: 65, Sabzavot: 38, Non: 28 },
  { name: 'Qamashi t.', Sut: 90, Go_sht: 60, Guruch: 70, Sabzavot: 40, Non: 32 },
  { name: 'Chiroqchi t.', Sut: 130, Go_sht: 95, Guruch: 105, Sabzavot: 60, Non: 50 },
  { name: 'Kasbi t.', Sut: 85, Go_sht: 55, Guruch: 65, Sabzavot: 38, Non: 28 },
  { name: 'Mirishkor t.', Sut: 80, Go_sht: 50, Guruch: 60, Sabzavot: 35, Non: 25 },
  { name: 'Yakkabog\' t.', Sut: 95, Go_sht: 65, Guruch: 75, Sabzavot: 40, Non: 30 },
  { name: 'Ko\'kdala t.', Sut: 85, Go_sht: 55, Guruch: 65, Sabzavot: 38, Non: 28 },
];

import { Milk, Beef, Wheat, Carrot, Pizza } from 'lucide-react';

export const products = [
  { id: 'Sut', label: 'SUT', icon: Milk, color: '#3b82f6', grad: 'from-blue-500 to-blue-600', unit: 'litr' },
  { id: 'Go_sht', label: 'GO\'SHT', icon: Beef, color: '#ef4444', grad: 'from-red-500 to-red-600', unit: 'kg' },
  { id: 'Guruch', label: 'GURUCH', icon: Wheat, color: '#10b981', grad: 'from-emerald-500 to-emerald-600', unit: 'kg' },
  { id: 'Sabzavot', label: 'SABZAVOT', icon: Carrot, color: '#f59e0b', grad: 'from-amber-500 to-amber-600', unit: 'kg' },
  { id: 'Non', label: 'NON', icon: Pizza, color: '#a855f7', grad: 'from-purple-500 to-purple-600', unit: 'dona' },
];

export const languages = [
  { code: 'uz-lat', name: "O'zbek (Lotin)" },
  { code: 'uz-cyr', name: "O'zbek (Kirill)" },
  { code: 'kaa', name: "Qaraqalpaqsha" },
  { code: 'ru', name: "Rus tili" },
];

export const kindergartenImages = [
  { url: 'https://plus.unsplash.com/premium_photo-1661266853185-dc6e7a783cf5?q=80&w=1470&auto=format&fit=crop', title: 'Shodumon bolajonlar' },
  { url: 'https://plus.unsplash.com/premium_photo-1661281406994-090d20b3d61c?w=800&auto=format&fit=crop', title: 'Sog\'lom ovqatlanish' },
  { url: 'https://plus.unsplash.com/premium_photo-1701984401543-4b635f3a03b5?q=80&w=800&auto=format&fit=crop', title: 'Ta\'lim jarayoni' },
  { url: 'https://plus.unsplash.com/premium_photo-1681842143575-03bf1be4c11c?w=800&auto=format&fit=crop', title: 'Quvnoq o\'yinlar' },
];

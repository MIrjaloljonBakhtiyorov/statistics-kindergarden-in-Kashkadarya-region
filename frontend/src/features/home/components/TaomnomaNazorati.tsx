import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Snowflake, 
  Flower2, 
  Sun, 
  Leaf, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Fingerprint, 
  Activity,
  Pizza,
  Soup,
  Coffee,
  UtensilsCrossed,
  Dessert,
  Beef,
  Cake,
  IceCream,
  X as XIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Math helper for perfect SVG Arcs
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

const foodItems = [
  { image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop", label: "Pizza" },
  { image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=300&fit=crop", label: "Sho'rva" },
  { image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop", label: "Qahva" },
  { image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop", label: "Salat" },
  { image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop", label: "Shirinlik" },
  { image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?w=300&h=300&fit=crop", label: "Go'sht" },
  { image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop", label: "Tort" },
  { image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300&h=300&fit=crop", label: "Muzqaymoq" }
];

const seasonItems = [
  {
    icon: Snowflake,
    image: "https://images.unsplash.com/photo-1516476587287-b06497154630?auto=format&fit=crop&w=300&h=300&q=80",
    color: "text-blue-100",
    label: "Qish",
  },
  {
    icon: Flower2,
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&h=300&q=80",
    color: "text-emerald-100",
    label: "Bahor",
  },
  {
    icon: Sun,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&h=300&q=80",
    color: "text-amber-100",
    label: "Yoz",
  },
  {
    icon: Leaf,
    image: "https://images.unsplash.com/photo-1758506245226-0645aee6d8fd?auto=format&fit=crop&w=300&h=300&q=80",
    color: "text-yellow-100",
    label: "Kuz",
  },
];

const summerDayOneMenu = {
  title: "1-KUN TAOMNOMA",
  heroImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&w=1400&q=80",
  season: "Yoz mavsumi",
  audience: "3-7 yosh tarbiyalanuvchilar uchun",
  status: "Tashkilot tomonidan tasdiqlangan",
  summary: "Sutli nonushta, issiq tushlik va yengil ikkinchi tushlikdan iborat bolalar uchun mos kunlik menyu.",
  kidTags: ["Yumshoq taomlar", "Issiq ovqat", "Sut mahsulotlari", "Mevali kompot", "Nazoratli porsiya"],
  meals: [
    {
      title: "Ertalabki nonushta",
      accent: "from-amber-400 to-orange-500",
      softBg: "bg-amber-50",
      textColor: "text-amber-700",
      weight: "330 g",
      items: ["Tariq bo'tqasi", "Choy", "Saryog'li buterbrod"],
      products: [
        ["Tariq yormasi", "17.3 g", "60.2 kcal"],
        ["Sut", "52 g", "30.1 kcal"],
        ["Suv", "76 g", "0 kcal"],
        ["Saryog'", "13 g", "97.2 kcal"],
        ["Shakar", "2.5 g", "9.48 kcal"],
        ["Quruq choy", "0.2 g", "0.4 kcal"],
        ["Bug'doy noni", "40 g", "104.8 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~302 kcal"],
        ["Oqsil", "~7 g"],
        ["Yog'", "~15 g"],
        ["Uglevod", "~34 g"],
      ],
    },
    {
      title: "Tushlik",
      accent: "from-emerald-400 to-teal-500",
      softBg: "bg-emerald-50",
      textColor: "text-emerald-700",
      weight: "665 g",
      items: ["Mampar", "Dimlangan mol go'shtidan befstrogan", "Kartoshka pyuresi", "Bodring", "Olma kompoti", "Bug'doy noni"],
      products: [
        ["Bug'doy uni", "16 g", "53 kcal"],
        ["Mol go'shti", "98.2 g", "214.1 kcal"],
        ["Uzumshik yog'i", "7.5 g", "67.4 kcal"],
        ["Bosh piyoz", "24.8 g", "6.7 kcal"],
        ["Oq boshli karam", "7.5 g", "3.4 kcal"],
        ["Kartoshka", "142.5 g", "114 kcal"],
        ["Tomat pastasi", "7 g", "12.97 kcal"],
        ["Bodring", "47.4 g", "6.6 kcal"],
        ["Olma", "42.9 g", "97.4 kcal"],
        ["Bug'doy noni", "60 g", "157.2 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~940 kcal"],
        ["Oqsil", "~35 g"],
        ["Yog'", "~38 g"],
        ["Uglevod", "~117 g"],
      ],
    },
    {
      title: "Ikkinchi tushlik",
      accent: "from-sky-400 to-indigo-500",
      softBg: "bg-sky-50",
      textColor: "text-sky-700",
      weight: "250 g",
      items: ["Pishloqli bulochka", "Kefir"],
      products: [
        ["Saryog'", "2.6 g", "19.45 kcal"],
        ["Tovuq tuxumi", "8.4 g", "13.19 kcal"],
        ["Bug'doy uni", "30.8 g", "80.7 kcal"],
        ["Xamirturush", "1.04 g", "0.87 kcal"],
        ["Sut", "15.6 g", "9.05 kcal"],
        ["Shakar", "7.8 g", "29.56 kcal"],
        ["Pishloq", "2 g", "7.58 kcal"],
        ["Kefir", "150 g", "84 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~189 kcal"],
        ["Oqsil", "~5 g"],
        ["Yog'", "~4 g"],
        ["Uglevod", "~32 g"],
      ],
    },
  ],
  total: [
    ["Mahsulot vazni", "1393.14 g"],
    ["Chiqindisiz vazn", "758.74 g"],
    ["Oqsil", "47.27 g"],
    ["Yog'", "57.27 g"],
    ["Uglevod", "183.09 g"],
    ["Kaloriya", "1431.28 kcal"],
  ],
};

const summerDayTwoMenu = {
  title: "2-KUN TAOMNOMA",
  heroImage: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&w=1400&q=80",
  season: "Yoz mavsumi",
  audience: "3-7 yosh tarbiyalanuvchilar uchun",
  status: "Tashkilot tomonidan tasdiqlangan",
  summary: "Guruchli-sutli bo'tqa, qaynatma sho'rva va tvorogli keksni o'z ichiga olgan to'yimli kunlik menyu.",
  kidTags: ["Sutli bo'tqa", "Sho'rva", "Pishiriq", "Meva", "Tabiiy mahsulot"],
  meals: [
    {
      title: "Ertalabki nonushta",
      accent: "from-blue-400 to-indigo-500",
      softBg: "bg-blue-50",
      textColor: "text-blue-700",
      weight: "350 g",
      items: ["Guruchli-sutli bo'tqa", "Sutli kakao", "Pishloqli buterbrod"],
      products: [
        ["Guruch", "25 g", "82.5 kcal"],
        ["Sut (2.5-3.2%)", "131 g", "76 kcal"],
        ["Pishloq", "16 g", "53 kcal"],
        ["Saryog' (82.5%)", "8 g", "60 kcal"],
        ["Bug'doy noni", "30 g", "78.6 kcal"],
        ["Shakar", "12 g", "45.5 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~450 kcal"],
        ["Oqsil", "~12 g"],
        ["Yog'", "~16 g"],
        ["Uglevod", "~48 g"],
      ],
    },
    {
      title: "Tushlik",
      accent: "from-rose-400 to-red-500",
      softBg: "bg-rose-50",
      textColor: "text-rose-700",
      weight: "600 g",
      items: ["Qaynatma sho'rva", "Grechka palovi", "Shakarob salati", "Na'matak kompoti", "Bug'doy noni"],
      products: [
        ["Mol go'shti (1-kat)", "88.3 g", "192.6 kcal"],
        ["Grechka yormasi", "57 g", "190.9 kcal"],
        ["Kartoshka", "37.5 g", "30.0 kcal"],
        ["Bug'doy noni", "60 g", "157.2 kcal"],
        ["Piyoz/Sabzi/Salat", "150 g", "50 kcal"],
        ["Na'matak/Shakar", "23 g", "61 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~820 kcal"],
        ["Oqsil", "~34 g"],
        ["Yog'", "~30 g"],
        ["Uglevod", "~110 g"],
      ],
    },
    {
      title: "Ikkinchi tushlik",
      accent: "from-emerald-400 to-green-500",
      softBg: "bg-emerald-50",
      textColor: "text-emerald-700",
      weight: "360 g",
      items: ["Tvorogli keks", "Mavsumiy meva (Olma)", "Choy"],
      products: [
        ["Olma", "185 g", "87 kcal"],
        ["Tvorog (2.5-5%)", "15.4 g", "17.5 kcal"],
        ["Saryog' (82.5%)", "9.3 g", "69.6 kcal"],
        ["Bug'doy uni", "17.3 g", "57.3 kcal"],
        ["Tovuq tuxumi", "11.5 g", "18 kcal"],
        ["Shakar", "9.8 g", "37.1 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~210 kcal"],
        ["Oqsil", "~7 g"],
        ["Yog'", "~10 g"],
        ["Uglevod", "~38 g"],
      ],
    },
  ],
  total: [
    ["Mahsulot vazni", "1528.69 g"],
    ["Chiqindisiz vazn", "842.61 g"],
    ["Oqsil", "52.89 g"],
    ["Yog'", "55.99 g"],
    ["Uglevod", "195.92 g"],
    ["Kaloriya", "1476.97 kcal"],
  ],
};

const summerDayThreeMenu = {
  title: "3-KUN TAOMNOMA",
  heroImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&w=1400&q=80",
  season: "Yoz mavsumi",
  audience: "3-7 yosh tarbiyalanuvchilar uchun",
  status: "Tashkilot tomonidan tasdiqlangan",
  summary: "Sutli vermishelli suyuq osh, mastava va povidloli vatrushkani o'z ichiga olgan vitaminlarga boy kunlik menyu.",
  kidTags: ["Sutli taom", "Mastava", "Pishiriq", "Kefir", "Vitaminli"],
  meals: [
    {
      title: "Ertalabki nonushta",
      accent: "from-amber-400 to-orange-500",
      softBg: "bg-amber-50",
      textColor: "text-amber-700",
      weight: "380 g",
      items: ["Sutli vermishelli suyuq osh", "Sutli choy", "Bug'doy noni"],
      products: [
        ["Vermishel", "14.3 g", "47.5 kcal"],
        ["Sut (2.5-3.2%)", "177 g", "88 kcal"],
        ["Saryog' (82.5%)", "3.6 g", "19.5 kcal"],
        ["Bug'doy noni", "50 g", "131 kcal"],
        ["Shakar", "11.4 g", "43 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~330 kcal"],
        ["Oqsil", "~10 g"],
        ["Yog'", "~9 g"],
        ["Uglevod", "~50 g"],
      ],
    },
    {
      title: "Tushlik",
      accent: "from-emerald-400 to-teal-500",
      softBg: "bg-emerald-50",
      textColor: "text-emerald-700",
      weight: "615 g",
      items: ["Mastava", "Sabzavotli go'shtli ragu", "Vitamin salati", "Mevalli kompot", "Bug'doy noni"],
      products: [
        ["Mol go'shti (1-kat)", "73.9 g", "180.7 kcal"],
        ["Kartoshka", "78.8 g", "63 kcal"],
        ["Guruch", "15 g", "49.5 kcal"],
        ["Sabzavotlar", "110 g", "45 kcal"],
        ["Bug'doy noni", "60 g", "157.2 kcal"],
        ["Olma/Meva", "60 g", "35 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~780 kcal"],
        ["Oqsil", "~26 g"],
        ["Yog'", "~28 g"],
        ["Uglevod", "~105 g"],
      ],
    },
    {
      title: "Ikkinchi tushlik",
      accent: "from-sky-400 to-indigo-500",
      softBg: "bg-sky-50",
      textColor: "text-sky-700",
      weight: "235 g",
      items: ["Povidloli vatrushka", "Kefir"],
      products: [
        ["Bug'doy uni", "33.8 g", "88.6 kcal"],
        ["Kefir", "150 g", "84 kcal"],
        ["Povidlo", "25 g", "69.5 kcal"],
        ["Shakar", "7.8 g", "29.6 kcal"],
        ["Saryog'/Sut", "18.2 g", "28.5 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~300 kcal"],
        ["Oqsil", "~9 g"],
        ["Yog'", "~10 g"],
        ["Uglevod", "~55 g"],
      ],
    },
  ],
  total: [
    ["Mahsulot vazni", "1361.47 g"],
    ["Chiqindisiz vazn", "922.04 g"],
    ["Oqsil", "44.74 g"],
    ["Yog'", "47.21 g"],
    ["Uglevod", "185.74 g"],
    ["Kaloriya", "1340.66 kcal"],
  ],
};

const summerDayFourMenu = {
  title: "4-KUN TAOMNOMA",
  heroImage: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&w=1400&q=80",
  season: "Yoz mavsumi",
  audience: "3-7 yosh tarbiyalanuvchilar uchun",
  status: "Tashkilot tomonidan tasdiqlangan",
  summary: "Suli yormasidan bo'tqa, go'shtli gorox sho'rva va pishloqli rogalikni o'z ichiga olgan quvvatga boy kunlik menyu.",
  kidTags: ["Suli bo'tqasi", "Gorox sho'rva", "Tovuq go'shti", "Pishloqli pishiriq"],
  meals: [
    {
      title: "Ertalabki nonushta",
      accent: "from-orange-400 to-red-500",
      softBg: "bg-orange-50",
      textColor: "text-orange-700",
      weight: "350 g",
      items: ["Suli yormasidan bo'tqa", "Sutli kakao", "Saryog'li buterbrod"],
      products: [
        ["Suli yormasi", "16.6 g", "50.6 kcal"],
        ["Sut (2.5-3.2%)", "158 g", "91.6 kcal"],
        ["Saryog' (82.5%)", "11.8 g", "88.3 kcal"],
        ["Bug'doy noni", "40 g", "104.8 kcal"],
        ["Shakar", "10.3 g", "39 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~374 kcal"],
        ["Oqsil", "~11 g"],
        ["Yog'", "~16 g"],
        ["Uglevod", "~45 g"],
      ],
    },
    {
      title: "Tushlik",
      accent: "from-blue-400 to-cyan-500",
      softBg: "bg-blue-50",
      textColor: "text-blue-700",
      weight: "635 g",
      items: ["Gorox sho'rva", "Tovuq go'shtidan gulyash", "Kartoshka pyure", "Shakarob salati", "Quruq mevalar kompoti", "Bug'doy noni"],
      products: [
        ["Mol go'shti (1-kat)", "25 g", "74.1 kcal"],
        ["Tovuq go'shti (1-kat)", "37.5 g", "122.7 kcal"],
        ["Kartoshka", "131 g", "168 kcal"],
        ["Gorox (no'xat)", "12 g", "36.4 kcal"],
        ["Bug'doy noni", "60 g", "201 kcal"],
        ["Sabzavotlar/Mevalar", "160 g", "80 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~880 kcal"],
        ["Oqsil", "~32 g"],
        ["Yog'", "~31 g"],
        ["Uglevod", "~115 g"],
      ],
    },
    {
      title: "Ikkinchi tushlik",
      accent: "from-purple-400 to-pink-500",
      softBg: "bg-purple-50",
      textColor: "text-purple-700",
      weight: "370 g",
      items: ["Pishloqli rogalik", "Mavsumiy meva (Olma)", "Choy"],
      products: [
        ["Bug'doy uni", "30.6 g", "101.3 kcal"],
        ["Pishloq", "20 g", "66.3 kcal"],
        ["Saryog' (82.5%)", "15 g", "112.2 kcal"],
        ["Olma", "150 g", "87 kcal"],
        ["Tuxum/Shakar", "5 g", "15 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~325 kcal"],
        ["Oqsil", "~10 g"],
        ["Yog'", "~20 g"],
        ["Uglevod", "~42 g"],
      ],
    },
  ],
  total: [
    ["Mahsulot vazni", "1465.95 g"],
    ["Chiqindisiz vazn", "851.04 g"],
    ["Oqsil", "49.51 g"],
    ["Yog'", "63.82 g"],
    ["Uglevod", "198.16 g"],
    ["Kaloriya", "1579.29 kcal"],
  ],
};

const summerDayFiveMenu = {
  title: "5-KUN TAOMNOMA",
  heroImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&w=1400&q=80",
  season: "Yoz mavsumi",
  audience: "3-7 yosh tarbiyalanuvchilar uchun",
  status: "Tashkilot tomonidan tasdiqlangan",
  summary: "Manni bo'tqasi, milliy Bayram palovi va to'yimli kartoshka somsasini o'z ichiga olgan muvozanatli menyu.",
  kidTags: ["Manni bo'tqasi", "Bayram palovi", "Kartoshka somsa", "Meva"],
  meals: [
    {
      title: "Ertalabki nonushta",
      accent: "from-blue-400 to-indigo-500",
      softBg: "bg-blue-50",
      textColor: "text-blue-700",
      weight: "350 g",
      items: ["Manni yormasidan bo'tqa", "Sutli choy", "Pishloqli buterbrod"],
      products: [
        ["Manni yormasi", "18 g", "62.6 kcal"],
        ["Sut (2.5-3.2%)", "150 g", "87 kcal"],
        ["Pishloq", "16 g", "53 kcal"],
        ["Saryog' (82.5%)", "9.5 g", "71 kcal"],
        ["Bug'doy noni", "30 g", "78.6 kcal"],
        ["Shakar", "11 g", "45.5 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~440 kcal"],
        ["Oqsil", "~13 g"],
        ["Yog'", "~14 g"],
        ["Uglevod", "~65 g"],
      ],
    },
    {
      title: "Tushlik",
      accent: "from-rose-400 to-red-500",
      softBg: "bg-rose-50",
      textColor: "text-rose-700",
      weight: "580 g",
      items: ["Karam sho'rva", "Bayram palovi", "Achchiq-chuchuq salati", "Mavsumiy meva kompoti", "Bug'doy noni"],
      products: [
        ["Mol go'shti (1-kat)", "65 g", "192.6 kcal"],
        ["Guruch", "50.4 g", "166.3 kcal"],
        ["Sabzavotlar", "120 g", "35 kcal"],
        ["Bug'doy noni", "60 g", "157.2 kcal"],
        ["Saryog'/Yog'", "13 g", "40 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~650 kcal"],
        ["Oqsil", "~26 g"],
        ["Yog'", "~24 g"],
        ["Uglevod", "~82 g"],
      ],
    },
    {
      title: "Ikkinchi tushlik",
      accent: "from-emerald-400 to-green-500",
      softBg: "bg-emerald-50",
      textColor: "text-emerald-700",
      weight: "360 g",
      items: ["Kartoshka somsa", "Mavsumiy meva (Olma)", "Choy"],
      products: [
        ["Olma", "185 g", "87 kcal"],
        ["Bug'doy uni", "22.4 g", "74.1 kcal"],
        ["Kartoshka", "25 g", "20 kcal"],
        ["Saryog' (82.5%)", "3.9 g", "29.2 kcal"],
        ["Piyoz/Tuxum", "20 g", "10 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~240 kcal"],
        ["Oqsil", "~8 g"],
        ["Yog'", "~10 g"],
        ["Uglevod", "~32 g"],
      ],
    },
  ],
  total: [
    ["Mahsulot vazni", "1402.30 g"],
    ["Chiqindisiz vazn", "939.94 g"],
    ["Oqsil", "46.71 g"],
    ["Yog'", "48.15 g"],
    ["Uglevod", "179.11 g"],
    ["Kaloriya", "1331.93 kcal"],
  ],
};

const summerDaySixMenu = {
  title: "6-KUN TAOMNOMA",
  heroImage: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&w=1400&q=80",
  season: "Yoz mavsumi",
  audience: "3-7 yosh tarbiyalanuvchilar uchun",
  status: "Tashkilot tomonidan tasdiqlangan",
  summary: "Guruchli-sutli bo'tqa, ugrali sho'rva va vitaminlarga boy tvorogli sufledan iborat kunlik menyu.",
  kidTags: ["Sutli bo'tqa", "Ugrali sho'rva", "Tovuq go'shti", "Tvorogli sufle"],
  meals: [
    {
      title: "Ertalabki nonushta",
      accent: "from-amber-400 to-orange-500",
      softBg: "bg-amber-50",
      textColor: "text-amber-700",
      weight: "350 g",
      items: ["Guruchli-sutli bo'tqa", "Sutli kakao", "Saryog'li buterbrod"],
      products: [
        ["Guruch", "25 g", "82.5 kcal"],
        ["Sut (2.5-3.2%)", "131 g", "76 kcal"],
        ["Saryog' (82.5%)", "13 g", "97.2 kcal"],
        ["Bug'doy noni", "40 g", "104.8 kcal"],
        ["Shakar", "12 g", "45.5 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~406 kcal"],
        ["Oqsil", "~11 g"],
        ["Yog'", "~13 g"],
        ["Uglevod", "~60 g"],
      ],
    },
    {
      title: "Tushlik",
      accent: "from-emerald-400 to-teal-500",
      softBg: "bg-emerald-50",
      textColor: "text-emerald-700",
      weight: "615 g",
      items: ["Tovuq go'shtli ugrali sho'rva", "Tovuq go'shtidan kartoshka dimlama", "Bodring (porsiyali)", "Quruq mevalar kompoti", "Bug'doy noni"],
      products: [
        ["Tovuq go'shti", "93.3 g", "211 kcal"],
        ["Kartoshka", "143.8 g", "115 kcal"],
        ["Bug'doy uni (ugra)", "13.5 g", "44.7 kcal"],
        ["Bug'doy noni", "60 g", "201 kcal"],
        ["Bodring", "47.4 g", "6.6 kcal"],
        ["Quruq mevalar", "15.2 g", "34.5 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~850 kcal"],
        ["Oqsil", "~30 g"],
        ["Yog'", "~28 g"],
        ["Uglevod", "~100 g"],
      ],
    },
    {
      title: "Ikkinchi tushlik",
      accent: "from-sky-400 to-indigo-500",
      softBg: "bg-sky-50",
      textColor: "text-sky-700",
      weight: "400 g",
      items: ["Tvorogli sufle", "Mavsumiy meva (Olma)", "Asal choy"],
      products: [
        ["Tvorog (2.5-5%)", "82.2 g", "93.5 kcal"],
        ["Olma", "185 g", "87 kcal"],
        ["Tabiiy asal", "11 g", "35.6 kcal"],
        ["Tuxum", "29.8 g", "46.8 kcal"],
        ["Manni/Sut", "29.8 g", "28.3 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~260 kcal"],
        ["Oqsil", "~19 g"],
        ["Yog'", "~7 g"],
        ["Uglevod", "~45 g"],
      ],
    },
  ],
  total: [
    ["Mahsulot vazni", "1600.25 g"],
    ["Chiqindisiz vazn", "942.65 g"],
    ["Oqsil", "60.07 g"],
    ["Yog'", "48.43 g"],
    ["Uglevod", "207.55 g"],
    ["Kaloriya", "1517.07 kcal"],
  ],
};

const summerDaySevenMenu = {
  title: "7-KUN TAOMNOMA",
  heroImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&w=1400&q=80",
  season: "Yoz mavsumi",
  audience: "3-7 yosh tarbiyalanuvchilar uchun",
  status: "Tashkilot tomonidan tasdiqlangan",
  summary: "Manni bo'tqasi, to'yimli go'shtli borsh va makaron palovini o'z ichiga olgan vitaminli kunlik menyu.",
  kidTags: ["Manni bo'tqasi", "Go'shtli borsh", "Makaron palovi", "Mayizli keks", "Kefir"],
  meals: [
    {
      title: "Ertalabki nonushta",
      accent: "from-blue-400 to-indigo-500",
      softBg: "bg-blue-50",
      textColor: "text-blue-700",
      weight: "350 g",
      items: ["Manni yormasidan bo'tqa", "Shakar choy", "Pishloqli buterbrod"],
      products: [
        ["Manni yormasi", "18 g", "62.6 kcal"],
        ["Sut (2.5-3.2%)", "150 g", "87 kcal"],
        ["Pishloq", "15 g", "53 kcal"],
        ["Saryog' (82.5%)", "9.5 g", "71 kcal"],
        ["Bug'doy noni", "30 g", "78.6 kcal"],
        ["Shakar/Choy", "11 g", "24 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~376 kcal"],
        ["Oqsil", "~11 g"],
        ["Yog'", "~14 g"],
        ["Uglevod", "~50 g"],
      ],
    },
    {
      title: "Tushlik",
      accent: "from-rose-400 to-red-500",
      softBg: "bg-rose-50",
      textColor: "text-rose-700",
      weight: "620 g",
      items: ["Go'shtli borsh", "Makaron palovi", "Shakarob salati", "Olma kompoti", "Bug'doy noni"],
      products: [
        ["Mol go'shti (1-kat)", "65 g", "192.6 kcal"],
        ["Makaron", "39.9 g", "132.9 kcal"],
        ["Kartoshka", "48 g", "48 kcal"],
        ["Bug'doy noni", "60 g", "201 kcal"],
        ["Sabzavotlar/Olma", "150 g", "145 kcal"],
        ["Yog'/Smetana", "13 g", "90 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~810 kcal"],
        ["Oqsil", "~30 g"],
        ["Yog'", "~28 g"],
        ["Uglevod", "~110 g"],
      ],
    },
    {
      title: "Ikkinchi tushlik",
      accent: "from-emerald-400 to-green-500",
      softBg: "bg-emerald-50",
      textColor: "text-emerald-700",
      weight: "380 g",
      items: ["Mayizli keks", "Myusli probiotikli", "Kefir"],
      products: [
        ["Myusli", "20 g", "112 kcal"],
        ["Kefir", "150 g", "84 kcal"],
        ["Bug'doy uni", "21.6 g", "71.5 kcal"],
        ["Saryog' (82.5%)", "10.8 g", "80.8 kcal"],
        ["Tuxum/Mayiz", "13 g", "32 kcal"],
        ["Shakar", "10 g", "37.9 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~418 kcal"],
        ["Oqsil", "~11 g"],
        ["Yog'", "~28 g"],
        ["Uglevod", "~50 g"],
      ],
    },
  ],
  total: [
    ["Mahsulot vazni", "1340.38 g"],
    ["Chiqindisiz vazn", "873.21 g"],
    ["Oqsil", "52.28 g"],
    ["Yog'", "69.96 g"],
    ["Uglevod", "211.44 g"],
    ["Kaloriya", "1691.60 kcal"],
  ],
};

const summerDayEightMenu = {
  title: "8-KUN TAOMNOMA",
  heroImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&w=1400&q=80",
  season: "Yoz mavsumi",
  audience: "3-7 yosh tarbiyalanuvchilar uchun",
  status: "Tashkilot tomonidan tasdiqlangan",
  summary: "Tariq bo'tqasi, go'shtli rassolnik va olmali shirin pishiriqdan iborat vitaminlarga boy kunlik menyu.",
  kidTags: ["Tariq bo'tqasi", "Rassolnik", "Tipratikan tefteli", "Olmali pishiriq", "Kefir"],
  meals: [
    {
      title: "Ertalabki nonushta",
      accent: "from-amber-400 to-orange-500",
      softBg: "bg-amber-50",
      textColor: "text-amber-700",
      weight: "366 g",
      items: ["Tariq bo'tqasi", "Sutli choy", "Bug'doy noni (pishloq bilan)"],
      products: [
        ["Tariq yormasi", "19.17 g", "66.7 kcal"],
        ["Sut (2.5-3.2%)", "160 g", "78.3 kcal"],
        ["Bug'doy noni", "50 g", "131 kcal"],
        ["Pishloq", "16 g", "53 kcal"],
        ["Saryog' (82.5%)", "3.5 g", "26.2 kcal"],
        ["Shakar/Choy", "9 g", "38 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~393 kcal"],
        ["Oqsil", "~12 g"],
        ["Yog'", "~14 g"],
        ["Uglevod", "~55 g"],
      ],
    },
    {
      title: "Tushlik",
      accent: "from-emerald-400 to-teal-500",
      softBg: "bg-emerald-50",
      textColor: "text-emerald-700",
      weight: "655 g",
      items: ["Rassolnik", "Go'shtli \"Tipratikan\" tefteli", "Qaynatilgan kartoshka", "Bodring", "Quruq meva kompoti", "Bug'doy noni"],
      products: [
        ["Mol go'shti (1-kat)", "77.5 g", "168.9 kcal"],
        ["Kartoshka", "183.8 g", "147 kcal"],
        ["Guruch/Perlovka", "8 g", "25 kcal"],
        ["Bug'doy noni", "50 g", "131 kcal"],
        ["Quruq mevalar", "15.2 g", "34.5 kcal"],
        ["Sabzavotlar/Yog'", "120 g", "150 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~756 kcal"],
        ["Oqsil", "~25 g"],
        ["Yog'", "~28 g"],
        ["Uglevod", "~100 g"],
      ],
    },
    {
      title: "Ikkinchi tushlik",
      accent: "from-sky-400 to-indigo-500",
      softBg: "bg-sky-50",
      textColor: "text-sky-700",
      weight: "225 g",
      items: ["Olmali katlamali pishiriq", "Kefir"],
      products: [
        ["Bug'doy uni", "31 g", "102.6 kcal"],
        ["Kefir", "150 g", "84 kcal"],
        ["Olma", "33.9 g", "15.9 kcal"],
        ["Saryog' (82.5%)", "9.5 g", "71 kcal"],
        ["Shakar/Tuxum", "15 g", "46 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~320 kcal"],
        ["Oqsil", "~12 g"],
        ["Yog'", "~12 g"],
        ["Uglevod", "~42 g"],
      ],
    },
  ],
  total: [
    ["Mahsulot vazni", "1276.63 g"],
    ["Chiqindisiz vazn", "893.32 g"],
    ["Oqsil", "49.00 g"],
    ["Yog'", "54.02 g"],
    ["Uglevod", "179.51 g"],
    ["Kaloriya", "1409.20 kcal"],
  ],
};

const summerDayNineMenu = {
  title: "9-KUN TAOMNOMA",
  heroImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&w=1400&q=80",
  season: "Yoz mavsumi",
  audience: "3-7 yosh tarbiyalanuvchilar uchun",
  status: "Tashkilot tomonidan tasdiqlangan",
  summary: "Suli yormasidan bo'tqa, qiymali vermishelli sho'rva va shokoladli keksni o'z ichiga olgan vitaminli kunlik menyu.",
  kidTags: ["Suli bo'tqasi", "Qiymali sho'rva", "Bitochka", "Shokoladli keks", "Kefir"],
  meals: [
    {
      title: "Ertalabki nonushta",
      accent: "from-blue-400 to-indigo-500",
      softBg: "bg-blue-50",
      textColor: "text-blue-700",
      weight: "351 g",
      items: ["Suli yormasidan bo'tqa", "Sutli kakao", "Pishloqli buterbrod"],
      products: [
        ["Suli yormasi", "16.6 g", "50.6 kcal"],
        ["Sut (2.5-3.2%)", "158 g", "91.6 kcal"],
        ["Pishloq", "15 g", "53 kcal"],
        ["Saryog' (82.5%)", "11.8 g", "88.3 kcal"],
        ["Bug'doy noni", "30 g", "78.6 kcal"],
        ["Shakar/Kakao", "12.3 g", "46.6 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~408 kcal"],
        ["Oqsil", "~11 g"],
        ["Yog'", "~16 g"],
        ["Uglevod", "~50 g"],
      ],
    },
    {
      title: "Tushlik",
      accent: "from-rose-400 to-red-500",
      softBg: "bg-rose-50",
      textColor: "text-rose-700",
      weight: "615 g",
      items: ["Yumaloq qiymali vermishelli sho'rva", "Tovuq go'shtidan bitochka", "Kartoshka pyuresi", "Vitamin salati", "Olma kompoti", "Bug'doy noni"],
      products: [
        ["Mol go'shti (qiymali)", "25 g", "74.1 kcal"],
        ["Tovuq go'shti", "44.5 g", "143.1 kcal"],
        ["Kartoshka", "104.9 g", "146.1 kcal"],
        ["Bug'doy noni", "68 g", "222 kcal"],
        ["Sabzavotlar/Mevalar", "110 g", "110 kcal"],
        ["Yog'/Smetana", "15 g", "95 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~880 kcal"],
        ["Oqsil", "~34 g"],
        ["Yog'", "~32 g"],
        ["Uglevod", "~110 g"],
      ],
    },
    {
      title: "Ikkinchi tushlik",
      accent: "from-emerald-400 to-green-500",
      softBg: "bg-emerald-50",
      textColor: "text-emerald-700",
      weight: "360 g",
      items: ["Shokoladli keks", "Kefir"],
      products: [
        ["Kefir", "150 g", "84 kcal"],
        ["Bug'doy uni", "17 g", "56.2 kcal"],
        ["Saryog' (82.5%)", "12.4 g", "115.9 kcal"],
        ["Tuxum", "17 g", "31 kcal"],
        ["Shakar/Kakao", "12.5 g", "47 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~334 kcal"],
        ["Oqsil", "~9 g"],
        ["Yog'", "~22 g"],
        ["Uglevod", "~38 g"],
      ],
    },
  ],
  total: [
    ["Mahsulot vazni", "1356.45 g"],
    ["Chiqindisiz vazn", "861.34 g"],
    ["Oqsil", "53.83 g"],
    ["Yog'", "70.88 g"],
    ["Uglevod", "198.15 g"],
    ["Kaloriya", "1662.40 kcal"],
  ],
};

const summerDayTenMenu = {
  title: "10-KUN TAOMNOMA",
  heroImage: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&w=1400&q=80",
  season: "Yoz mavsumi",
  audience: "3-7 yosh tarbiyalanuvchilar uchun",
  status: "Tashkilot tomonidan tasdiqlangan",
  summary: "Guruchli bo'tqa, go'shtli dimlama va pishloqli bulochkadan iborat yakuniy kunlik menyu.",
  kidTags: ["Guruchli bo'tqa", "Go'shtli dimlama", "Pishloqli bulochka", "Olma sharbati", "Kefir"],
  meals: [
    {
      title: "Ertalabki nonushta",
      accent: "from-amber-400 to-orange-500",
      softBg: "bg-amber-50",
      textColor: "text-amber-700",
      weight: "340 g",
      items: ["Guruchli bo'tqa", "Choy", "Saryog'li buterbrod"],
      products: [
        ["Guruch", "25 g", "82.5 kcal"],
        ["Sut", "130 g", "75 kcal"],
        ["Saryog'", "12 g", "89.6 kcal"],
        ["Bug'doy noni", "40 g", "104.8 kcal"],
        ["Shakar", "8 g", "30.4 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~382 kcal"],
        ["Oqsil", "~9 g"],
        ["Yog'", "~14 g"],
        ["Uglevod", "~45 g"],
      ],
    },
    {
      title: "Tushlik",
      accent: "from-emerald-400 to-teal-500",
      softBg: "bg-emerald-50",
      textColor: "text-emerald-700",
      weight: "650 g",
      items: ["Moshxo'rda", "Go'shtli dimlama", "Bodring salati", "Olma sharbati", "Bug'doy noni"],
      products: [
        ["Mol go'shti", "85 g", "185 kcal"],
        ["Mosh", "20 g", "68 kcal"],
        ["Kartoshka", "120 g", "92 kcal"],
        ["Sabzavotlar", "150 g", "45 kcal"],
        ["Yog'", "10 g", "89.9 kcal"],
        ["Bug'doy noni", "60 g", "157.2 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~890 kcal"],
        ["Oqsil", "~32 g"],
        ["Yog'", "~30 g"],
        ["Uglevod", "~115 g"],
      ],
    },
    {
      title: "Ikkinchi tushlik",
      accent: "from-sky-400 to-indigo-500",
      softBg: "bg-sky-50",
      textColor: "text-sky-700",
      weight: "260 g",
      items: ["Pishloqli bulochka", "Kefir"],
      products: [
        ["Bug'doy uni", "35 g", "114 kcal"],
        ["Pishloq", "15 g", "53 kcal"],
        ["Kefir", "150 g", "84 kcal"],
        ["Saryog'/Shakar", "10 g", "65 kcal"],
      ],
      nutrition: [
        ["Kaloriya", "~316 kcal"],
        ["Oqsil", "~11 g"],
        ["Yog'", "~10 g"],
        ["Uglevod", "~38 g"],
      ],
    },
  ],
  total: [
    ["Mahsulot vazni", "1250.00 g"],
    ["Chiqindisiz vazn", "850.00 g"],
    ["Oqsil", "52.00 g"],
    ["Yog'", "54.00 g"],
    ["Uglevod", "198.00 g"],
    ["Kaloriya", "1588.00 kcal"],
  ],
};

function ArcSegment({ startAngle, endAngle, cx, cy, innerRadius, outerRadius, label, index, onClick, isAvailable }: any) {
  const gap = 3; 
  const p1 = polarToCartesian(cx, cy, outerRadius, startAngle + gap);
  const p2 = polarToCartesian(cx, cy, outerRadius, endAngle - gap);
  const p3 = polarToCartesian(cx, cy, innerRadius, endAngle - gap);
  const p4 = polarToCartesian(cx, cy, innerRadius, startAngle + gap);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const d = [
    "M", p1.x, p1.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 1, p2.x, p2.y,
    "L", p3.x, p3.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 0, p4.x, p4.y,
    "Z"
  ].join(" ");

  const midAngle = (startAngle + endAngle) / 2;
  const labelRadius = innerRadius + (outerRadius - innerRadius) / 2;
  const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);

  return (
    <motion.g 
      className={`${isAvailable ? 'cursor-pointer' : 'cursor-default'} group`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 100, damping: 15 }}
      whileHover={isAvailable ? { scale: 1.04, zIndex: 50 } : undefined}
    >
      <defs>
        <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.7" />
        </linearGradient>
        <filter id="segmentShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
        </filter>
      </defs>
      
      <path 
        d={d} 
        fill={`url(#grad-${index})`}
        stroke="rgba(255,255,255,0.9)" 
        strokeWidth="1.5" 
        filter="url(#segmentShadow)"
        className={isAvailable ? "transition-all duration-500 group-hover:fill-indigo-600 group-hover:stroke-indigo-400" : ""}
      />
      
      <text 
        x={labelPos.x} 
        y={labelPos.y} 
        textAnchor="middle" 
        dominantBaseline="middle" 
        className={isAvailable ? "text-[12px] font-black fill-slate-500 transition-all duration-300 group-hover:fill-white pointer-events-none tracking-widest" : "text-[12px] font-black fill-slate-400 pointer-events-none tracking-widest"}
      >
        {label}
      </text>
    </motion.g>
  );
}

const TaomnomaNazorati: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const { t, i18n } = useTranslation();
  const textKeyMap: Record<string, string> = {
    "Yoz mavsumi": "taomnoma.seasonSummer",
    "3-7 yosh tarbiyalanuvchilar uchun": "taomnoma.audience3to7",
    "Tashkilot tomonidan tasdiqlangan": "taomnoma.approvedByOrg",
    "Kaloriya": "taomnoma.calorie",
    "Oqsil": "taomnoma.protein",
    "Yog'": "taomnoma.fat",
    "Uglevod": "taomnoma.carbs",
    "Mahsulot vazni": "taomnoma.productWeight",
    "Chiqindisiz vazn": "taomnoma.cleanWeight",
    "Yumshoq taomlar": "taomnoma.tagSoft",
    "Issiq ovqat": "taomnoma.tagHot",
    "Sut mahsulotlari": "taomnoma.tagDairy",
    "Mevali kompot": "taomnoma.tagCompote",
    "Nazoratli porsiya": "taomnoma.tagPortion",
    "Sutli bo'tqa": "taomnoma.tagMilkPorridge",
    "Sho'rva": "taomnoma.tagSoup",
    "Pishiriq": "taomnoma.tagBakery",
    "Meva": "taomnoma.tagFruit",
    "Tabiiy mahsulot": "taomnoma.tagNatural",
    "Sutli taom": "taomnoma.tagMilkDish",
    "Mastava": "taomnoma.tagMastava",
    "Kefir": "taomnoma.tagKefir",
    "Vitaminli": "taomnoma.tagVitamin",
    "Suli bo'tqasi": "taomnoma.tagOatPorridge",
    "Gorox sho'rva": "taomnoma.tagPeaSoup",
    "Tovuq go'shti": "taomnoma.tagChicken",
    "Pishloqli pishiriq": "taomnoma.tagCheeseBakery",
    "Manni bo'tqasi": "taomnoma.tagSemolina",
    "Bayram palovi": "taomnoma.tagPilaf",
    "Kartoshka somsa": "taomnoma.tagPotatoSomsa",
    "Ugrali sho'rva": "taomnoma.tagNoodleSoup",
    "Tvorogli sufle": "taomnoma.tagCurdSouffle",
    "Go'shtli borsh": "taomnoma.tagMeatBorscht",
    "Makaron palovi": "taomnoma.tagPastaPilaf",
    "Mayizli keks": "taomnoma.tagRaisinCake",
    "Tariq bo'tqasi": "taomnoma.tagMilletPorridge",
    "Rassolnik": "taomnoma.tagRassolnik",
    "Tipratikan tefteli": "taomnoma.tagMeatballs",
    "Olmali pishiriq": "taomnoma.tagAppleBakery",
    "Qiymali sho'rva": "taomnoma.tagMincedSoup",
    "Bitochka": "taomnoma.tagBitochka",
    "Shokoladli keks": "taomnoma.tagChocolateCake",
    "Guruchli bo'tqa": "taomnoma.tagRicePorridge",
    "Go'shtli dimlama": "taomnoma.tagMeatStew",
    "Pishloqli bulochka": "taomnoma.tagCheeseBun",
    "Olma sharbati": "taomnoma.tagAppleJuice",
    "Choy": "food.tea",
    "Saryog'li buterbrod": "food.butterSandwich",
    "Mampar": "food.mampar",
    "Dimlangan mol go'shtidan befstrogan": "food.beefStroganoff",
    "Kartoshka pyuresi": "food.mashedPotatoes",
    "Bodring": "food.cucumber",
    "Olma kompoti": "food.appleCompote",
    "Bug'doy noni": "food.wheatBread",
    "Tariq yormasi": "food.milletGroats",
    "Sut": "food.milk",
    "Suv": "food.water",
    "Saryog'": "food.butter",
    "Shakar": "food.sugar",
    "Quruq choy": "food.dryTea",
    "Bug'doy uni": "food.wheatFlour",
    "Mol go'shti": "food.beef",
    "Uzumshik yog'i": "food.oil",
    "Bosh piyoz": "food.onion",
    "Oq boshli karam": "food.cabbage",
    "Kartoshka": "food.potato",
    "Tomat pastasi": "food.tomatoPaste",
    "Olma": "food.apple",
    "Tovuq tuxumi": "food.egg",
    "Xamirturush": "food.yeast",
    "Pishloq": "food.cheese",
  };
  const formatDataText = (text: string) => t(textKeyMap[text] ?? `food.${text}`, { defaultValue: text });
  const formatSummary = (text: string) => i18n.language === 'uz-lat' ? text : t('taomnoma.summaryGeneric', { defaultValue: text });
  const formatMenuTitle = (title: string) => {
    const day = title.match(/^(\d+)-/)?.[1];
    return day ? `${day}-${t('taomnoma.day').toUpperCase()} ${t('taomnoma.menuTitleWord').toUpperCase()}` : title;
  };
  const formatMealTitle = (title: string) => {
    if (title === 'Ertalabki nonushta') return t('taomnoma.breakfast');
    if (title === 'Tushlik') return t('taomnoma.lunch');
    if (title === 'Ikkinchi tushlik') return t('taomnoma.secondLunch');
    return title;
  };

  return (
    <div className="relative w-full min-h-[1100px] flex items-center justify-center p-4 md:p-12 overflow-hidden rounded-[4rem] bg-white border border-slate-100 shadow-[0_0_100px_rgba(0,0,0,0.02)]">
      
      {/* NOISE & GRAIN OVERLAY */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      {/* AMBIENT LIGHT SYSTEM */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 200, 0], y: [0, 100, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[160px]"
        />
        <motion.div 
          animate={{ x: [0, -200, 0], y: [0, 200, 0], scale: [1, 1.4, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-[-10%] w-[700px] h-[700px] bg-sky-400/15 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -150, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-60 left-1/4 w-[1000px] h-[1000px] bg-purple-500/10 rounded-full blur-[180px]"
        />
      </div>

      {/* FLOATING GLASS DECOR */}
      <motion.div 
        animate={{ y: [0, -40, 0], rotate: [0, 10, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-40 h-40 bg-white/20 backdrop-blur-3xl border border-white/60 rounded-[3rem] shadow-2xl z-10 hidden xl:block"
      />
      <motion.div 
        animate={{ y: [0, 50, 0], rotate: [0, -15, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-40 right-20 w-32 h-32 bg-white/10 backdrop-blur-2xl border border-white/40 rounded-full shadow-2xl z-10 hidden xl:block"
      />

      {/* CORE WRAPPER */}
      <div className="relative z-10 w-full max-w-7xl bg-white/40 backdrop-blur-3xl border border-white/80 p-8 md:p-20 rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(255,255,255,1)] flex flex-col">
        
        {/* TOP STATUS BAR */}
        <div className="flex flex-col items-center text-center mb-20 md:mb-32">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600 drop-shadow-md">{t('taomnoma.cycle')}</span>
          </h2>
          <p className="text-xs md:text-xl text-slate-500 font-bold uppercase tracking-[0.4em] max-w-2xl">
            {t('taomnoma.subtitle')}
          </p>
        </div>

        <div className="flex flex-col items-center gap-24">
          
          {/* THE MASTER DIAL (Luxury Watch/Cockpit style) */}
          <div className="relative w-[380px] h-[380px] md:w-[640px] md:h-[640px] shrink-0 flex items-center justify-center">
            
            {/* Seasonal Satellites (Outer Orbit - Clockwise) */}
            <motion.div 
              animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-60px] pointer-events-none hidden md:block"
            >
              {seasonItems.map((s, i) => {
                const angle = i * 90;
                const x = 50 + 55 * Math.cos(angle * Math.PI / 180);
                const y = 50 + 55 * Math.sin(angle * Math.PI / 180);
                return (
                  <div key={i} className="absolute w-24 h-24" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                      className="relative w-full h-full bg-white p-1 rounded-full shadow-2xl overflow-hidden border-2 border-white flex items-center justify-center"
                    >
                      <img src={s.image} alt={s.label} className="absolute inset-1 w-[calc(100%-0.5rem)] h-[calc(100%-0.5rem)] object-cover rounded-full" />
                      <div className="absolute inset-1 rounded-full bg-gradient-to-t from-slate-950/70 via-slate-900/15 to-white/10" />
                      <s.icon className={`relative z-10 w-8 h-8 ${s.color} drop-shadow-lg`} strokeWidth={1.8} />
                      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[9px] font-black text-white uppercase tracking-widest drop-shadow-lg">{s.label}</span>
                    </motion.div>
                  </div>
                )
              })}
            </motion.div>

            {/* Food Satellites (Inner Orbit - Counter-Clockwise) */}
            <motion.div 
              animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-10px] pointer-events-none hidden md:block z-20"
            >
              {foodItems.map((s, i) => {
                const angle = (i / foodItems.length) * 360;
                const x = 50 + 48 * Math.cos(angle * Math.PI / 180);
                const y = 50 + 48 * Math.sin(angle * Math.PI / 180);
                return (
                  <div key={i} className="absolute w-20 h-20 bg-white p-1 rounded-full shadow-2xl flex items-center justify-center overflow-hidden border-2 border-white" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                    <motion.img 
                      src={s.image}
                      alt={s.label}
                      className="w-full h-full object-cover rounded-full"
                      animate={{ rotate: [0, 360] }} 
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )
              })}
            </motion.div>

            {/* SVG Layers */}

            <svg width="100%" height="100%" viewBox="0 0 640 640" className="absolute z-10 drop-shadow-[0_60px_100px_rgba(0,0,0,0.12)] overflow-visible">
               {/* Precision Ticks */}
               <g opacity="0.4">
                 {Array.from({ length: 120 }).map((_, i) => {
                    const isMajor = i % 12 === 0;
                    const angle = i * 3;
                    const rO = 310;
                    const rI = isMajor ? 285 : 300;
                    const p1 = polarToCartesian(320, 320, rO, angle);
                    const p2 = polarToCartesian(320, 320, rI, angle);
                    return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#64748b" strokeWidth={isMajor ? 2 : 1} />;
                 })}
               </g>

               {/* Inner rotating rings */}
               <motion.circle cx="320" cy="320" r="270" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 12" animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: 'center' }} />
               <motion.circle cx="320" cy="320" r="260" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="1 8" animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: 'center' }} />

               <circle cx="320" cy="320" r="250" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />

               {/* Day Segments */}
               {Array.from({ length: 10 }).map((_, i) => (
                 <ArcSegment
                   key={i}
                   index={i}
                   cx={320}
                   cy={320}
                   innerRadius={170}
                   outerRadius={245}
                   startAngle={i * 36}
                   endAngle={(i + 1) * 36}
                   label={`${i + 1}-${t('taomnoma.day').toUpperCase()}`}
                   isAvailable={true}
                   onClick={
                     i === 0 ? () => setSelectedMenu(summerDayOneMenu) : 
                     i === 1 ? () => setSelectedMenu(summerDayTwoMenu) : 
                     i === 2 ? () => setSelectedMenu(summerDayThreeMenu) : 
                     i === 3 ? () => setSelectedMenu(summerDayFourMenu) : 
                     i === 4 ? () => setSelectedMenu(summerDayFiveMenu) : 
                     i === 5 ? () => setSelectedMenu(summerDaySixMenu) : 
                     i === 6 ? () => setSelectedMenu(summerDaySevenMenu) : 
                     i === 7 ? () => setSelectedMenu(summerDayEightMenu) : 
                     i === 8 ? () => setSelectedMenu(summerDayNineMenu) : 
                     i === 9 ? () => setSelectedMenu(summerDayTenMenu) : 
                     undefined
                   }
                 />
               ))}

               {/* Flow Indicator */}
               <path d="M 320,140 A 180,180 0 0,1 500,320" fill="none" stroke="#4f46e5" strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
            </svg>

            {/* THE CENTRAL BADGE (The Jewel) */}
            <div className="absolute w-[280px] h-[280px] md:w-[320px] md:h-[320px] z-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[12px] border-white/50 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15),inset_0_10px_20px_rgba(255,255,255,0.8)]"></div>
              
              <div className="relative w-[236px] h-[226px] md:w-[276px] md:h-[276px] bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 rounded-full shadow-[inset_0_-20px_40px_rgba(0,0,0,0.8),0_30px_60px_rgba(0,0,0,0.6)] border border-slate-700 flex flex-col items-center justify-center p-8 group overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-indigo-500/40 rounded-full blur-[60px] mix-blend-screen"></div>
                
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border border-indigo-500/30 border-t-indigo-400"></motion.div>
                
                <div className="relative z-10 w-24 h-24 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                  <Fingerprint className="w-12 h-12 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" strokeWidth={1.2} />
                </div>
                
                <h3 className="relative z-10 text-center">
                  <span className="block text-[11px] font-black tracking-[0.5em] text-indigo-300 mb-2 opacity-80 uppercase">{t('taomnoma.org')}</span>
                  <span className="block text-3xl font-black uppercase tracking-tighter text-white drop-shadow-2xl leading-none">{t('taomnoma.approved')}</span>
                </h3>
              </div>
            </div>
          </div>

          {/* INFOGRAPHIC CARDS - MOVED BELOW */}
          <div className="w-full max-w-6xl z-20 space-y-10 mt-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", label: t('taomnoma.expertBase'), desc: t('taomnoma.expertDesc') },
                { icon: Lock, color: "text-rose-500", bg: "bg-rose-50", label: t('taomnoma.strictLock'), desc: t('taomnoma.lockDesc') }
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                  className="bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-white/90 hover:shadow-[0_40px_100px_rgba(79,70,229,0.15)] transition-all duration-700 group h-full"
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">
                     <div className={`w-20 h-20 rounded-[2.2rem] ${card.bg} border-2 border-white flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700`}>
                        <card.icon className={`w-10 h-10 ${card.color}`} strokeWidth={1.5} />
                     </div>
                     <div>
                        <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{card.label}</h4>
                        <p className="text-sm md:text-base text-slate-500 font-bold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{card.desc}</p>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* LIVE STATUS CARD */}
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="mt-6 bg-slate-900 p-2 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group"
            >
               <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-[spin_5s_linear_infinite] opacity-30"></div>
               <div className="relative bg-slate-900/95 backdrop-blur-3xl p-8 px-10 rounded-[3.2rem] flex items-center justify-between border border-slate-700/50">
                  <div className="flex items-center gap-6">
                    <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                       <Activity className="w-8 h-8 text-emerald-400" />
                       <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-10"></div>
                    </div>
                    <div>
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-2">{t('taomnoma.status')}</p>
                       <p className="text-white font-black text-3xl tracking-tighter">{t('taomnoma.safe')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">{t('taomnoma.live')}</span>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {selectedMenu && (
          <div className="fixed inset-x-0 top-[calc(4rem+6vh)] md:top-[calc(5rem+6vh)] bottom-[6vh] z-[200] flex items-center justify-center px-[5vw]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMenu(null)}
              className="fixed inset-0 bg-transparent"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              className="relative z-10 w-full max-w-6xl max-h-full overflow-y-auto rounded-[1%] bg-[#fffdf8] shadow-2xl border border-white p-4 md:p-6"
            >
              <div className="sticky top-0 z-40 -mx-1 -mt-1 mb-2 flex justify-end pointer-events-none">
                <button
                  onClick={() => setSelectedMenu(null)}
                  className="pointer-events-auto w-11 h-11 rounded-[1%] bg-white/95 hover:bg-white text-slate-700 font-black shrink-0 shadow-lg ring-1 ring-slate-200 flex items-center justify-center backdrop-blur"
                  aria-label={t('taomnoma.close')}
                >
                  <XIcon size={18} />
                </button>
              </div>
              <div className="relative overflow-hidden rounded-[1%] bg-[#fff7ed] border border-amber-100 p-5 md:p-7 mb-6">
                <div className="absolute right-8 top-6 hidden md:grid grid-cols-2 gap-2 opacity-80">
                  <span className="w-12 h-12 rounded-full bg-amber-200/70 border-4 border-white" />
                  <span className="w-12 h-12 rounded-full bg-emerald-200/70 border-4 border-white" />
                  <span className="w-12 h-12 rounded-full bg-sky-200/70 border-4 border-white" />
                  <span className="w-12 h-12 rounded-full bg-rose-200/70 border-4 border-white" />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-white/80 text-amber-600 text-[10px] font-black uppercase tracking-widest shadow-sm">{formatDataText(selectedMenu.season)}</span>
                    <span className="px-3 py-1 rounded-full bg-white/80 text-emerald-600 text-[10px] font-black uppercase tracking-widest shadow-sm">{formatDataText(selectedMenu.audience)}</span>
                    <span className="px-3 py-1 rounded-full bg-white/80 text-indigo-600 text-[10px] font-black uppercase tracking-widest shadow-sm">{t('taomnoma.tenDayCycle')}</span>
                  </div>
                  <p className="text-[11px] font-black text-orange-500 uppercase tracking-[0.35em] mb-2">{t('taomnoma.healthyKids')}</p>
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">{formatMenuTitle(selectedMenu.title)}</h3>
                  {selectedMenu.heroImage && (
                    <div className="mt-5 mb-5 w-full overflow-hidden rounded-[1%] border border-white bg-amber-50 shadow-lg">
                      <img
                        src={selectedMenu.heroImage}
                        alt={formatMenuTitle(selectedMenu.title)}
                        className="w-full h-44 sm:h-56 md:h-64 lg:h-72 object-cover object-center"
                        onError={(event) => {
                          event.currentTarget.src = "/welcome_image.png";
                        }}
                      />
                    </div>
                  )}
                  <p className="mt-3 max-w-2xl text-sm md:text-base font-bold text-slate-600 leading-relaxed">{formatSummary(selectedMenu.summary)}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {selectedMenu.kidTags.map((tag: string) => (
                      <span key={tag} className="px-3 py-2 rounded-[1%] bg-white text-slate-700 text-[11px] font-black uppercase tracking-wider border border-amber-100 shadow-sm">
                        {formatDataText(tag)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-[1%] bg-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={14} />
                    {formatDataText(selectedMenu.status)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMenu(null)}
                  className="hidden md:flex w-11 h-11 rounded-[1%] bg-white/80 hover:bg-white text-slate-600 font-black shrink-0 shadow-sm items-center justify-center"
                  aria-label={t('taomnoma.close')}
                >
                  <XIcon size={18} />
                </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {selectedMenu.meals.map((meal: any, mealIndex: number) => (
                  <div key={meal.title} className={`rounded-[1%] border border-white bg-white p-4 shadow-sm ring-1 ring-slate-100`}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-[1%] bg-gradient-to-br ${meal.accent} flex items-center justify-center text-white font-black shadow-lg`}>
                          {mealIndex === 0 ? <Coffee size={22} /> : mealIndex === 1 ? <Soup size={22} /> : <UtensilsCrossed size={22} />}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900">{formatMealTitle(meal.title)}</h4>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${meal.textColor}`}>{t('taomnoma.kidPortion')}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-2 rounded-[1%] ${meal.softBg} ${meal.textColor} text-[10px] font-black uppercase tracking-widest`}>
                        {meal.weight}
                      </span>
                    </div>

                    <div className={`${meal.softBg} rounded-[1%] border border-white p-3 mb-4`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${meal.textColor}`}>{t('taomnoma.mainMeals')}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {meal.items.map((item: string) => (
                        <div key={item} className="rounded-[1%] bg-white border border-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
                          {formatDataText(item)}
                        </div>
                      ))}
                    </div>
                    </div>

                    <div className="overflow-hidden rounded-[1%] border border-slate-100 mb-4">
                      <div className={`grid grid-cols-[1fr_72px_82px] bg-gradient-to-r ${meal.accent} text-white text-[9px] font-black uppercase tracking-wider`}>
                        <span className="px-3 py-2">{t('taomnoma.product')}</span>
                        <span className="px-3 py-2">{t('taomnoma.weight')}</span>
                        <span className="px-3 py-2">{t('taomnoma.kcal')}</span>
                      </div>
                      {meal.products.map(([product, weight, kcal]: string[]) => (
                        <div key={product} className="grid grid-cols-[1fr_72px_82px] border-t border-slate-100 text-[11px] font-bold text-slate-600">
                          <span className="px-3 py-2">{formatDataText(product)}</span>
                          <span className="px-3 py-2">{weight}</span>
                          <span className="px-3 py-2">{kcal}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('taomnoma.nutrition')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {meal.nutrition.map(([label, value]: string[]) => (
                        <div key={label} className="rounded-[1%] bg-slate-50 border border-slate-100 p-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase">{formatDataText(label)}</p>
                          <p className="text-sm font-black text-slate-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1%] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em]">{t('taomnoma.dailyBalance')}</p>
                    <p className="text-sm font-bold text-slate-300 mt-2">{t('taomnoma.balanceDesc')}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-[1%] bg-white/10 border border-white/10 px-4 py-3 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                    <Activity size={14} />
                    {t('taomnoma.balanced')}
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                  {selectedMenu.total.map(([label, value]: string[]) => (
                    <div key={label} className="rounded-[1%] bg-white/10 border border-white/10 p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase">{formatDataText(label)}</p>
                      <p className="text-lg font-black text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaomnomaNazorati;

import { 
  ChefHat, 
  Warehouse, 
  Sparkles, 
  Beaker, 
  Utensils,
  Bed,
  Trees,
  Stethoscope,
  BookOpen,
  Activity,
  ShieldCheck,
  Thermometer,
  Wind
} from 'lucide-react';

export const INSPECTION_CATEGORIES = [
  { 
    id: 'KITCHEN', 
    name: "Organoleptik ko'rsatkichlar", 
    icon: ChefHat, 
    items: 10,
    questions: [
      "Tayyor taomning tashqi ko'rinishi retseptura va porsiya talablariga mosmi?",
      "Taomning hidi yangi, tabiiy va begona hidsizmi?",
      "Taomning ta'mi bolalar ovqatlanishi uchun me'yoridami?",
      "Taomning rangi va tuzilishi mahsulot tarkibiga mos ko'rinyaptimi?",
      "Taom harorati tarqatish uchun belgilangan me'yordami?",
      "Taom konsistensiyasi bolalar yoshi va menyu turiga mosmi?",
      "Taomda kuygan, achigan yoki yot aralashma belgisi yo'qmi?",
      "Porsiya hajmi va bezatilishi bolalar uchun mosmi?",
      "Sinama olishdan oldin organoleptik baholash qayd etildimi?",
      "Organoleptik tekshiruv natijasi mas'ul xodim tomonidan tasdiqlandimi?"
    
    ]
  },
  { 
    id: 'WAREHOUSE', 
    name: 'Omborxona', 
    icon: Warehouse, 
    items: 10,
    questions: [
      'Mahsulotlarning yaroqlilik muddati va qadoqlari butunligi tekshirildimi?',
      'Omborxonada harorat va namlik koвЂrsatkichlari jurnalga kiritilyaptimi?',
      'Xom-ashyolar turlari boвЂyicha alohida saqlanyaptimi?',
      'Omborxona poli va devorlari toza, kemiruvchilarga qarshi chora koвЂrilganmi?',
      'Keltirilgan mahsulotlarning sifat sertifikatlari mavjudmi?',
      'Mahsulotlar poldan kamida 15 sm balandlikda (stellajda) saqlanyaptimi?',
      'Tez buziluvchi mahsulotlar uchun muzlatkichlar yetarlimi?',
      'Yuvish vositalari oziq-ovqatdan alohida saqlanyaptimi?',
      'Omborxonada begona shaxslar yoвЂqligi nazorat qilinadimi?',
      'Kirish va chiqish hujjatlari muntazam yuritilyaptimi?'
    ]
  },
  { 
    id: 'SANITARY', 
    name: 'Sanitariya', 
    icon: Sparkles, 
    items: 10,
    questions: [
      'Xodimlar ish boshlashdan oldin tibbiy koвЂrikdan oвЂtkazildimi?',
      'Yuvinish xonalari sanitariya vositalari bilan taвЂ™minlanganmi?',
      'Bolalar ovqatlanishdan oldin va keyin qoвЂl yuvganmi?',
      'Chiqindilar yopiq idishda saqlanyaptimi?',
      'Xonalar muntazam shamollatilib, tozalanadimi?',
      'Dezinfeksiya eritmalari toвЂgвЂri tayyorlangan va saqlanyaptimi?',
      'Tozalash anjomlari (paqir, latta) tamgвЂalanganmi?',
      'Guruhlarda ichimlik suvi rejimi taвЂ™minlanganmi?',
      'Bolalar tuvaklari yoki unitazlari sanitariya holatidami?',
      'Umumiy hududda (koridor, zinapoya) tozalik saqlanyaptimi?'
    ]
  },
  { 
    id: 'DORMITORY', 
    name: 'Yotoqxona', 
    icon: Bed, 
    items: 8,
    questions: [
      'Yotoqxonalarda havo harorati meвЂ™yordami?',
      'Krovatlar orasidagi masofa sanitariya qoidalariga mosmi?',
      'Yotoq choyshablari toza va vaqtida almashtirilganmi?',
      'Choyshablar markirovka qilinganmi?',
      'Yotoqxonada begona buyumlar saqlanmayaptimi?',
      'Uxlash vaqtida shamollatish tartibiga rioya qilinadimi?',
      'Shaxsiy gigiyena buyumlari (sochiq va b.) alohida joylanganmi?',
      'Yotoqxona javonlari changdan tozalanganmi?'
    ]
  },
  { 
    id: 'PLAYGROUND', 
    name: 'OвЂyin maydonchasi', 
    icon: Trees, 
    items: 8,
    questions: [
      'OвЂyin jihozlari (argвЂimchoq, tepalik) mustahkam va xavfsizmi?',
      'Maydoncha hududi begona chiqindilardan tozalanganmi?',
      'Qumloqlar (pesochnitsa) yopiq holatda va qumi toza holatdami?',
      'Maydonchada bolalar xavfsizligini taвЂ™minlovchi qoplama bormi?',
      'Atrof-muhitdagi daraxtlar va butalar butalganmi?',
      'Bolalar yoshi uchun moвЂljallangan oвЂyinchoqlar mavjudmi?',
      'Ochiq suv havzalari yoki xavfli chuqurlar yoвЂqligi tekshirildimi?',
      'Soyabonlar (naves) quyoshdan himoya qila oladimi?'
    ]
  },
  { 
    id: 'MEDICAL', 
    name: 'Tibbiyot xonasi', 
    icon: Stethoscope, 
    items: 8,
    questions: [
      'Tibbiyot xonasi zaruriy asbob-uskunalar bilan taвЂ™minlanganmi?',
      'Birinchi yordam dorichasi (aptechka) toвЂla va muddati oвЂtmaganmi?',
      'Dori-darmonlar saqlash tartibiga rioya qilinyaptimi?',
      'Izolyator xonasi tayyor holatdami?',
      'Bolalarning antropometrik koвЂrsatkichlari qayd etilganmi?',
      'Emlash jurnallari va kartalari muntazam yuritilyaptimi?',
      'Tibbiy xodimning maxsus kiyimi va gigiyenasi joyidami?',
      'Kvarts lampasi oвЂrnatilgan va rejali ishlatilyaptimi?'
    ]
  },
  { 
    id: 'EDUCATION', 
    name: 'TaвЂ™lim jarayoni', 
    icon: BookOpen, 
    items: 8,
    questions: [
      'MashgвЂulotlar rejaga muvofiq olib borilyaptimi?',
      'OвЂquv qurollari va materiallari yosh guruhiga mosmi?',
      'Bolalarning mashgвЂulotlardagi ishtiroki va qiziqishi yuqorimi?',
      'Tarbiyachining bolalar bilan muloqoti etikasi saqlanyaptimi?',
      'Guruhda rivojlantiruvchi markazlar (burchaklar) mavjudmi?',
      'Bolalarning ijodiy ishlari namoyish etilganmi?',
      'MashgвЂulotlar davomiyligi meвЂ™yorga mosmi?',
      'Guruhda psixologik iqlim ijobiymi?'
    ]
  },
  { 
    id: 'SAMPLES', 
    name: 'Sinamalar', 
    icon: Beaker, 
    items: 8,
    questions: [
      'Kundalik tayyorlangan barcha taomlardan sinama olinganmi?',
      'Sinamalar maxsus steril idishlarda saqlanyaptimi?',
      'Sinama idishlarida taom nomi, tayyorlangan sana va vaqt yozilganmi?',
      'Sinamalar muzlatkich haroratida saqlanyaptimi?',
      'Sinamalar uchun masвЂ™ul shaxs imzosi mavjudmi?',
      'Sinamalar 24 soat davomida saqlanishi taвЂ™minlanganmi?',
      'Sinama olish idishlari har safar sterilizatsiya qilinadimi?',
      'Sinamalar jurnali xatolarsiz toвЂldirilganmi?'
    ]
  },
  { 
    id: 'FOOD_CONSUMPTION', 
    name: 'Ovqat isteвЂ™moli nazorati', 
    icon: Utensils, 
    items: 10,
    questions: []
  },
];

export const CONSUMPTION_LEVELS = [
  { value: 100, label: '100%', description: 'toвЂliq yedi', color: 'bg-emerald-500' },
  { value: 75, label: '75%', description: 'katta qismini yedi', color: 'bg-blue-500' },
  { value: 50, label: '50%', description: 'yarmini yedi', color: 'bg-yellow-500' },
  { value: 25, label: '25%', description: 'kam yedi', color: 'bg-orange-500' },
  { value: 0, label: '0%', description: 'yemadi', color: 'bg-red-500' },
];

export const SEVERITY_LEVELS = [
  { id: 'LOW', label: 'LOW', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'MEDIUM', label: 'MEDIUM', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'HIGH', label: 'HIGH', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'CRITICAL', label: 'CRITICAL', color: 'bg-red-100 text-red-700 border-red-200' },
];


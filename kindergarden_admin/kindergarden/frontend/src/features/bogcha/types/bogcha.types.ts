export type BogchaTuri = 'DAVLAT' | 'NODAVLAT' | 'OILAVIY' | 'DAVLAT_XUSUSIY' | 'TASHKILOT';

export interface BogchaFormData {
  turi: BogchaTuri | '';
  nomi: string;
  telefon: string;
  email: string;
  litsenziya: string;
  tuman: string;
  mahalla: string;
  manzil: string;
  orientir: string;
  direktorIsmi: string;
  direktorTelefon: string;
  direktorPassport: string;
  direktorTajriba: string;
  tarbiyachiSoni: number;
  hamshiraSoni: number;
  oshpazSoni: number;
  boshqaXodimlar: number;
  guruhlarSoni: number;
  bolalarJami: number;
  yoshChegarasi: string;
  taomnomaTuri: string;
  nonushtaVaqti: string;
  tushlikVaqti: string;
  kechkiVaqti: string;
}

export const defaultFormData: BogchaFormData = {
  turi: '',
  nomi: '',
  telefon: '',
  email: '',
  litsenziya: '',
  tuman: '',
  mahalla: '',
  manzil: '',
  orientir: '',
  direktorIsmi: '',
  direktorTelefon: '',
  direktorPassport: '',
  direktorTajriba: '',
  tarbiyachiSoni: 0,
  hamshiraSoni: 0,
  oshpazSoni: 0,
  boshqaXodimlar: 0,
  guruhlarSoni: 1,
  bolalarJami: 25,
  yoshChegarasi: '3-7 yosh',
  taomnomaTuri: 'Standart',
  nonushtaVaqti: '08:00',
  tushlikVaqti: '12:00',
  kechkiVaqti: '16:00',
};

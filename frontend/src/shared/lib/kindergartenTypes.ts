export const KINDERGARTEN_TYPES = [
  {
    value: 'Public',
    label: 'Davlat MTT',
    shortLabel: 'Davlat',
    groupLabel: "Davlat bog'chalar",
  },
  {
    value: 'Private',
    label: 'Nodavlat xususiy MTT',
    shortLabel: 'Xususiy',
    groupLabel: "Nodavlat xususiy bog'chalar",
  },
  {
    value: 'PPP',
    label: 'Davlat-xususiy sherikchilik asosida MTT',
    shortLabel: 'DXSH',
    groupLabel: "DXSH asosidagi bog'chalar",
  },
  {
    value: 'Home',
    label: 'Oilaviy nodavlat MTT',
    shortLabel: 'Oilaviy',
    groupLabel: "Oilaviy nodavlat bog'chalar",
  },
  {
    value: 'Organization',
    label: 'Tashkilotga qarashli MTT',
    shortLabel: 'Tashkilot',
    groupLabel: "Tashkilotga qarashli bog'chalar",
  },
] as const;

export type KindergartenTypeValue = typeof KINDERGARTEN_TYPES[number]['value'];

export const KINDERGARTEN_TYPE_VALUES = KINDERGARTEN_TYPES.map((type) => type.value) as [
  KindergartenTypeValue,
  ...KindergartenTypeValue[]
];

export const KINDERGARTEN_TYPE_OPTIONS = KINDERGARTEN_TYPES.map(({ value, label }) => ({
  value,
  label,
}));

export const KINDERGARTEN_TYPE_LABELS = KINDERGARTEN_TYPES.reduce<Record<string, string>>((acc, type) => {
  acc[type.value] = type.label;
  return acc;
}, {});

export const KINDERGARTEN_TYPE_SHORT_LABELS = KINDERGARTEN_TYPES.reduce<Record<string, string>>((acc, type) => {
  acc[type.value] = type.shortLabel;
  return acc;
}, {});

export const KINDERGARTEN_TYPE_GROUP_LABELS = KINDERGARTEN_TYPES.reduce<Record<string, string>>((acc, type) => {
  acc[type.value] = type.groupLabel;
  return acc;
}, {});

export const getKindergartenTypeLabel = (value?: string) =>
  KINDERGARTEN_TYPE_LABELS[value || ''] || value || 'Turi kiritilmagan';

export const makeEmptyKindergartenTypeStats = () =>
  KINDERGARTEN_TYPES.map((type) => ({
    name: type.value,
    label: type.label,
    count: 0,
    children: 0,
  }));

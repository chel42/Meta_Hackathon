export type MapTimeFilter = 'Aujourd’hui' | 'Cette semaine' | 'Ce mois' | 'Cette année';

export type MapCategoryFilter =
  | 'Toutes catégories'
  | 'Politique'
  | 'Santé'
  | 'Économie'
  | 'Technologie'
  | 'Société'
  | 'Sport';

export interface HeatmapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  countryCode: string;
  category: string;
  intensity: 'very-high' | 'high' | 'moderate' | 'low';
  reports: number;
  color: string;
}

export interface TopFakeNewsItem {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  reports: number;
  countryCode: string;
  countryName: string;
  verdict: 'Contredite' | 'Trompeuse' | 'Non vérifiable';
}

export interface MapActivityItem {
  id: string;
  countryCode: string;
  countryName: string;
  title: string;
  category: string;
  categoryColor: string;
  time: string;
}

export const MAP_TIME_FILTERS: MapTimeFilter[] = [
  'Aujourd’hui',
  'Cette semaine',
  'Ce mois',
  'Cette année',
];

export const MAP_CATEGORY_FILTERS: MapCategoryFilter[] = [
  'Toutes catégories',
  'Politique',
  'Santé',
  'Économie',
  'Technologie',
  'Société',
  'Sport',
];

export const MAP_HOTSPOTS: HeatmapPoint[] = [
  { id: 'fr', lat: 46.6, lng: 2.5, label: 'France', countryCode: 'FR', category: 'Politique', intensity: 'very-high', reports: 284, color: '#DC2626' },
  { id: 'us', lat: 38.9, lng: -77.0, label: 'États-Unis', countryCode: 'US', category: 'Politique', intensity: 'very-high', reports: 412, color: '#DC2626' },
  { id: 'br', lat: -15.8, lng: -47.9, label: 'Brésil', countryCode: 'BR', category: 'Santé', intensity: 'high', reports: 198, color: '#F97316' },
  { id: 'sn', lat: 14.7, lng: -17.4, label: 'Sénégal', countryCode: 'SN', category: 'Société', intensity: 'high', reports: 145, color: '#F97316' },
  { id: 'ci', lat: 5.3, lng: -4.0, label: 'Côte d’Ivoire', countryCode: 'CI', category: 'Économie', intensity: 'high', reports: 132, color: '#F97316' },
  { id: 'cd', lat: -4.4, lng: 15.3, label: 'RDC', countryCode: 'CD', category: 'Santé', intensity: 'very-high', reports: 240, color: '#DC2626' },
  { id: 'in', lat: 20.6, lng: 78.9, label: 'Inde', countryCode: 'IN', category: 'Technologie', intensity: 'very-high', reports: 367, color: '#DC2626' },
  { id: 'de', lat: 51.2, lng: 10.4, label: 'Allemagne', countryCode: 'DE', category: 'Technologie', intensity: 'moderate', reports: 112, color: '#FBBF24' },
  { id: 'ca', lat: 45.5, lng: -73.6, label: 'Canada', countryCode: 'CA', category: 'Santé', intensity: 'moderate', reports: 94, color: '#FBBF24' },
  { id: 'mx', lat: 19.4, lng: -99.1, label: 'Mexique', countryCode: 'MX', category: 'Société', intensity: 'moderate', reports: 88, color: '#FBBF24' },
  { id: 'jp', lat: 35.7, lng: 139.7, label: 'Japon', countryCode: 'JP', category: 'Technologie', intensity: 'low', reports: 56, color: '#93C5FD' },
];

export const TOP_FAKE_NEWS: TopFakeNewsItem[] = [
  {
    id: 'fn-1',
    title: 'Fausse annonce d’un arrêt immédiat des subventions agricoles européennes',
    category: 'Économie',
    categoryColor: '#D97706',
    reports: 432,
    countryCode: 'FR',
    countryName: 'France',
    verdict: 'Contredite',
  },
  {
    id: 'fn-2',
    title: 'Vidéo truquée par IA prêtant des propos alarmistes sur les vaccins au Dr Tedros',
    category: 'Santé',
    categoryColor: '#059669',
    reports: 378,
    countryCode: 'CD',
    countryName: 'RDC',
    verdict: 'Contredite',
  },
  {
    id: 'fn-3',
    title: 'Image recyclée de 2017 prétendant montrer un séisme récent dans les Caraïbes',
    category: 'Société',
    categoryColor: '#2563EB',
    reports: 265,
    countryCode: 'SN',
    countryName: 'Sénégal',
    verdict: 'Trompeuse',
  },
  {
    id: 'fn-4',
    title: 'Rumeur sur la suppression totale de l’argent liquide dès le 1er mai',
    category: 'Économie',
    categoryColor: '#D97706',
    reports: 210,
    countryCode: 'CA',
    countryName: 'Canada',
    verdict: 'Contredite',
  },
  {
    id: 'fn-5',
    title: 'Deepfake vocal d’un leader politique appelant à bloquer les transports',
    category: 'Politique',
    categoryColor: '#DC2626',
    reports: 195,
    countryCode: 'CI',
    countryName: 'Côte d’Ivoire',
    verdict: 'Contredite',
  },
];

export const MAP_ACTIVITIES: MapActivityItem[] = [
  {
    id: 'act-1',
    countryCode: 'FR',
    countryName: 'France',
    title: 'Signalement groupé sur un prétendu rationnement d’énergie',
    category: 'Société',
    categoryColor: '#2563EB',
    time: 'Il y a 12 min',
  },
  {
    id: 'act-2',
    countryCode: 'SN',
    countryName: 'Sénégal',
    title: 'Vérification terminée : déclaration falsifiée d’un ministre',
    category: 'Politique',
    categoryColor: '#DC2626',
    time: 'Il y a 28 min',
  },
  {
    id: 'act-3',
    countryCode: 'CD',
    countryName: 'RDC',
    title: 'Alerte infox santé : faux traitement viral sur WhatsApp',
    category: 'Santé',
    categoryColor: '#059669',
    time: 'Il y a 45 min',
  },
  {
    id: 'act-4',
    countryCode: 'CA',
    countryName: 'Canada',
    title: 'Nouveau dossier TRAUNES AI sur les rumeurs bancaires',
    category: 'Économie',
    categoryColor: '#D97706',
    time: 'Il y a 1h 10m',
  },
];

export const MAP_STATS = {
  totalReports: '1 892',
  countriesAffected: '48 pays',
  verifiedPercentage: '94,2 %',
  debunkedToday: '128',
};

export const CATEGORY_BREAKDOWN = [
  { name: 'Politique', count: 620, color: '#DC2626', percentage: 33 },
  { name: 'Santé', count: 480, color: '#059669', percentage: 25 },
  { name: 'Économie', count: 340, color: '#D97706', percentage: 18 },
  { name: 'Technologie & IA', count: 260, color: '#7C3AED', percentage: 14 },
  { name: 'Société', count: 192, color: '#2563EB', percentage: 10 },
];

/**
 * Textes en anglais (langue par défaut). Traductions : public/i18n/<langue>.json, clés « data.* ».
 *
 * Informations officielles NovaBridge Global Supply LLC
 * Source : NovaBridge Company Portfolio 2026.
 */
export const COMPANY = {
  name: 'NovaBridge Global Supply LLC',
  shortName: 'NovaBridge',
  tagline: 'Your direct sourcing partner from China to the world',
  slogan: 'Bridging Worlds. Delivering Value.',
  email: 'info@novabridgedistribution.com',
  website: 'www.novabridgedistribution.com',
  websiteUrl: 'https://www.novabridgedistribution.com',
  city: 'Dallas, Texas',
  country: 'USA',
  location: 'Dallas, Texas — USA',
  intro:
    'NovaBridge Global Supply LLC is a Dallas-based company with manufacturing facilities based in Guangzhou, Shenzhen, Yiwu, Jiangsu, and Zhuji, China. We source, quality-check, and deliver products directly to businesses across the USA, Canada, Europe, and Africa.',
  promise: ['No middlemen.', 'Factory-direct pricing.', 'North American service standards.'],
  languages: ['English', 'French', 'Chinese'],
};

export interface Stat { key: string; value: number | null; display?: string; suffix?: string; label: string; }
export const STATS: Stat[] = [
  { key: 'continents', value: 4, label: 'Continents Served' },
  { key: 'productLines', value: 9, label: 'Product Lines' },
  { key: 'savings', value: 40, suffix: '%', label: 'Average Client Savings' },
  { key: 'leadTime', value: null, display: '3–4', suffix: 'W', label: 'Average Lead Time' },
];

export interface Market { id: string; name: string; flag: string; badge?: string; cities: string[]; sectors: string[]; image: string; }
export const MARKETS: Market[] = [
  { id: 'usa', name: 'USA', flag: '🇺🇸', badge: 'Primary Market', cities: ['Dallas, TX'], sectors: ['FEC', 'Construction', 'Healthcare', 'Corporate', 'Oil & Gas'], image: 'photo-1601584115197-04ecc0da31d7' },
  { id: 'canada', name: 'Canada', flag: '🇨🇦', cities: ['Montreal', 'Toronto', 'Vancouver'], sectors: ['Corporate', 'Healthcare', 'Entertainment'], image: 'photo-1565793298595-6a879b1d9492' },
  { id: 'europe', name: 'Europe', flag: '🇪🇺', cities: ['Italy', 'Western Europe'], sectors: ['Medical supplies', 'PPE', 'Corporate merchandise'], image: 'photo-1605745341112-85968b19335b' },
  { id: 'africa', name: 'Africa', flag: '🌍', cities: ['DRC Congo', 'Lubumbashi', 'South Africa'], sectors: ['Mining PPE', 'Construction', 'Medical'], image: 'photo-1541888946425-d81bb19240f5' },
];

export const STEPS = [
  { n: '01', title: 'You Contact Us', text: 'Tell us your product, quantity & specs.' },
  { n: '02', title: 'Quote in 24h', text: 'Detailed quote with pricing & timeline.' },
  { n: '03', title: '50% Deposit', text: 'Confirm & pay 50% to start production.' },
  { n: '04', title: 'We Produce', text: 'Factory produces & QC photos are sent to you.' },
  { n: '05', title: 'Delivered', text: 'DDP to your door. Pay the balance.' },
];

export const ADVANTAGES = [
  { icon: 'factory', title: 'Factory-direct pricing', text: 'No middlemen between the factory and your business.' },
  { icon: 'globe', title: "Direct sourcing from China's top hubs", text: "Access to China's leading production centers." },
  { icon: 'brand', title: 'Custom branding', text: 'Your logo on every product.' },
  { icon: 'truck', title: 'DDP delivery', text: 'Customs & freight included, delivered to your door.' },
  { icon: 'camera', title: 'Quality control photos', text: 'QC photos before every shipment.' },
  { icon: 'box', title: 'Low MOQ', text: 'Starting from 50–100 units.' },
  { icon: 'clock', title: '24h quote turnaround', text: 'A detailed quote within 24 hours.' },
  { icon: 'chat', title: 'Multilingual team', text: 'English, French, Chinese.' },
];

export const SOURCING_NETWORK = [
  { place: 'Guangzhou', detail: 'Apparel, uniforms & PPE' },
  { place: 'Shenzhen', detail: 'Electronics & tech products' },
  { place: 'Yiwu', detail: 'Promotional & corporate products' },
  { place: 'Jiangsu', detail: 'Industrial & safety equipment' },
  { place: 'Zhuji, Zhejiang', detail: 'Socks & footwear hub' },
];

export const LOGISTICS = [
  { title: 'Sea freight via Durban → Africa', text: 'Cost-effective ocean freight for African deliveries.' },
  { title: 'DHL / FedEx Express', text: 'Air express for urgent orders.' },
  { title: 'Private label & OEM available', text: 'Your own brand, manufactured to your specs.' },
];

/**
 * Construit une URL d'image Unsplash optimisée à partir de son identifiant.
 * Une URL complète (https://…) ou un chemin local (/images/…) est renvoyé tel quel.
 */
export const img = (id: string, w = 1200, h?: number) =>
  id.startsWith('http') || id.startsWith('/')
    ? id
    : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=75`;

export const IMAGES = {
  hero: 'photo-1494412574643-ff11b0a5c1c3',
  ship: 'photo-1578575437130-527eed3abbec',
  containers: 'photo-1494961104209-3c223057bd26',
  warehouse: 'photo-1553413077-190dd305871c',
  warehouse2: 'photo-1586528116311-ad8dd3c8310d',
  qc: 'photo-1581092160562-40aa08e78837',
  team: 'photo-1600880292203-757bb62b4baf',
  office: 'photo-1572021335469-31706a17aaef',
  truck: 'photo-1601584115197-04ecc0da31d7',
};

import { Announcement, ContactMessage, ProductLine, QuoteRequest } from '../models';

/** Gammes de produits — contenu du Company Portfolio 2026. */
export const PRODUCT_LINES: ProductLine[] = [
  {
    slug: 'entertainment-merch',
    name: 'Entertainment Merchandise',
    short: 'Custom-branded merchandise for playgrounds, trampoline parks and family entertainment centers.',
    description:
      'Turn your brand into an experience: grip socks, wristbands, cups, balloons and party essentials with your logo — for indoor playgrounds, trampoline parks and family entertainment centers. Free 3D mock-up before production.',
    icon: 'sock',
    image: '/images/products/merch-socks.jpg',
    gallery: ['/images/products/merch-wristbands.jpg', '/images/products/merch-cups.jpg', '/images/products/merch-balloons.jpg'],
    items: [
      'Grip Socks — 3D silicone grip sole',
      'Wristbands — sequential numbering',
      'Custom Cups — reusable & eco-friendly',
      'Fake Tattoos',
      'Mylar Balloons — custom shapes',
      'Drawstring & Party Bags',
      'Lanyards & Keychains',
      'T-shirts & Hats',
      'Beach Towels',
      'Water Bottles',
    ],
    industries: ['Trampoline Parks', 'Indoor Playgrounds', 'Family Entertainment Centers', 'Events'],
    hub: 'Zhuji · Yiwu',
    visible: true,
  },
  {
    slug: 'ppe-safety',
    name: 'PPE & Safety',
    short: 'Protective equipment for demanding work sites.',
    description:
      'Certified-grade personal protective equipment sourced from Guangzhou and Jiangsu — built for mining, construction, oil & gas and industrial teams.',
    icon: 'shield',
    image: 'photo-1504307651254-35680f356dfd',
    gallery: ['photo-1541888946425-d81bb19240f5', 'photo-1504917595217-d4dc5ebe6122'],
    items: [
      'Safety Gloves — cut, abrasion & heat resistant', 'Safety Glasses & Work Goggles', 'Safety Helmets', 'Face Shields',
      'Hearing Protection', 'Safety Boots (SP818, SP918) & Shoes', 'Reflective Vests', 'Coveralls & Hi-Vis Mining Coveralls',
      'Hi-Vis Jackets', 'Respirators', 'Face Masks', 'Safety Harnesses', 'Protective Sleeves', 'Knee Pads',
      'Rain Wear', 'Welding Helmets', 'Disposable & Nitrile Gloves', 'Safety Aprons',
    ],
    industries: ['Mining', 'Construction', 'Oil & Gas', 'Industrial'],
    hub: 'Guangzhou · Jiangsu',
    visible: true,
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    short: 'Medical consumables and apparel for care providers.',
    description:
      'Reliable medical supplies for clinics, hospitals, dental practices and salons — with quality-control photos before every shipment.',
    icon: 'medical',
    image: 'photo-1582750433449-648ed127bb54',
    gallery: ['photo-1576091160550-2173dba999ef', 'photo-1586528116311-ad8dd3c8310d'],
    items: ['Medical Scrubs (Women)', 'Nitrile Exam Gloves', 'Surgical Masks FFP2', 'First Aid Kits', 'Medical Consumables'],
    industries: ['Clinics', 'Hospitals', 'Dental', 'Salons'],
    hub: 'Guangzhou',
    visible: true,
  },
  {
    slug: 'apparel-uniforms',
    name: 'Apparel & Uniforms',
    short: 'Branded apparel and staff uniforms.',
    description:
      'Custom apparel and uniforms produced in Guangzhou and Zhuji — your logo, your colors, your sizes, from 50–100 units.',
    icon: 'shirt',
    image: 'photo-1489987707025-afc232f7ea0f',
    gallery: ['photo-1620799140408-edc6dcb6d633', 'photo-1618354691373-d851c5c3a990'],
    items: ['Custom Hoodies & Zip-ups', 'School Uniforms', 'Restaurant Aprons', 'Hotel Staff Uniforms', 'Custom T-shirts', 'Branded Workwear'],
    industries: ['Schools', 'Hotels', 'Restaurants', 'Spas'],
    hub: 'Guangzhou · Zhuji',
    visible: true,
  },
  {
    slug: 'corporate-promo',
    name: 'Corporate & Promo',
    short: 'Merchandise and gifts that carry your brand.',
    description:
      'Promotional and corporate products from Yiwu, the world’s largest small-commodities hub — for events, conferences and corporate gifting.',
    icon: 'gift',
    image: 'photo-1549465220-1a8b9238cd48',
    gallery: ['photo-1544816155-12df9643f363', 'photo-1531346878377-a5be20888e57'],
    items: ['Custom Pens & Notebooks', 'Branded Tote Bags', 'Custom Grip Socks', 'Event Merchandise', 'Wristbands', 'Corporate Gift Sets'],
    industries: ['Fortune 500', 'Events', 'SMBs', 'Conferences'],
    hub: 'Yiwu · Zhuji',
    visible: true,
  },
];

const today = new Date();
const daysAgo = (d: number, h = 10) => {
  const x = new Date(today);
  x.setDate(x.getDate() - d);
  x.setHours(h, 15, 0, 0);
  return x.toISOString();
};

/** Annonces de départ : reprennent des informations réelles du portfolio. */
export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Company Portfolio 2026 is now available',
    category: 'News',
    excerpt: 'Discover our four product lines, our markets on four continents and how we work — from quote to DDP delivery.',
    content:
      'Our 2026 portfolio presents NovaBridge Global Supply LLC: a Dallas-based sourcing partner with manufacturing facilities in Guangzhou, Shenzhen, Yiwu, Jiangsu and Zhuji. Ask us for a copy at our e-mail address or request a free quote in 24 hours.',
    image: 'photo-1600880292203-757bb62b4baf',
    published: true,
    featured: true,
    date: daysAgo(3),
  },
  {
    id: 'a2',
    title: 'Sea freight to Africa via Durban',
    category: 'Logistics',
    excerpt: 'Cost-effective ocean freight for our clients in DRC Congo, Lubumbashi and South Africa.',
    content:
      'For African deliveries we route sea freight through the port of Durban, serving mining PPE, construction and medical clients across the region. Urgent orders can travel via DHL or FedEx Express.',
    image: 'photo-1578575437130-527eed3abbec',
    published: true,
    featured: false,
    date: daysAgo(9),
  },
  {
    id: 'a3',
    title: 'Low MOQ: custom branding from 50–100 units',
    category: 'Offer',
    excerpt: 'Your logo on hoodies, T-shirts, tote bags, notebooks and more — without massive minimum orders.',
    content:
      'Small and mid-sized businesses can now brand their apparel and promotional products with a minimum order starting from 50–100 units. Private label and OEM are available.',
    image: 'photo-1618354691373-d851c5c3a990',
    published: true,
    featured: false,
    date: daysAgo(16),
  },
  {
    id: 'a4',
    title: 'Hi-Vis mining coveralls — new production run',
    category: 'Product',
    excerpt: 'Brouillon : annonce en préparation pour la gamme PPE & Safety.',
    content: 'Texte à compléter avant publication.',
    image: 'photo-1541888946425-d81bb19240f5',
    published: false,
    featured: false,
    date: daysAgo(1),
  },
];

/** Demandes de devis fictives — uniquement pour la démonstration du back-office. */
export const SEED_QUOTES: QuoteRequest[] = [
  { id: 'Q-1042', createdAt: daysAgo(0, 9), name: 'Exemple — Client A', company: 'Société de démonstration 1', email: 'client.a@example.com', country: 'DRC Congo', productLine: 'PPE & Safety', product: 'Hi-Vis Mining Coveralls', quantity: 500, branding: true, delivery: 'standard', message: 'Sizes M to XXL, reflective tape.', status: 'nouveau', notes: [], demo: true },
  { id: 'Q-1041', createdAt: daysAgo(1, 14), name: 'Exemple — Client B', company: 'Société de démonstration 2', email: 'client.b@example.com', country: 'USA', productLine: 'Healthcare', product: 'Nitrile Exam Gloves', quantity: 10000, branding: false, delivery: 'express', status: 'en_cours', notes: ['Demander la taille des boîtes.'], demo: true },
  { id: 'Q-1040', createdAt: daysAgo(2, 11), name: 'Exemple — Client C', company: 'Société de démonstration 3', email: 'client.c@example.com', country: 'Canada', productLine: 'Corporate & Promo', product: 'Branded Tote Bags', quantity: 300, branding: true, delivery: 'standard', status: 'devis_envoye', notes: [], demo: true },
  { id: 'Q-1039', createdAt: daysAgo(4, 16), name: 'Exemple — Client D', company: 'Société de démonstration 4', email: 'client.d@example.com', country: 'Italy', productLine: 'Healthcare', product: 'Surgical Masks FFP2', quantity: 20000, branding: false, delivery: 'standard', status: 'gagne', notes: ['Acompte de 50 % reçu.'], demo: true },
  { id: 'Q-1038', createdAt: daysAgo(6, 10), name: 'Exemple — Client E', company: 'Société de démonstration 5', email: 'client.e@example.com', country: 'USA', productLine: 'Apparel & Uniforms', product: 'Hotel Staff Uniforms', quantity: 120, branding: true, delivery: 'standard', status: 'en_cours', notes: [], demo: true },
  { id: 'Q-1037', createdAt: daysAgo(8, 15), name: 'Exemple — Client F', company: 'Société de démonstration 6', email: 'client.f@example.com', country: 'South Africa', productLine: 'PPE & Safety', product: 'Safety Boots (SP818)', quantity: 800, branding: false, delivery: 'standard', status: 'perdu', notes: [], demo: true },
  { id: 'Q-1036', createdAt: daysAgo(11, 9), name: 'Exemple — Client G', company: 'Société de démonstration 7', email: 'client.g@example.com', country: 'USA', productLine: 'Corporate & Promo', product: 'Custom Grip Socks', quantity: 1000, branding: true, delivery: 'express', status: 'gagne', notes: [], demo: true },
];

export const SEED_MESSAGES: ContactMessage[] = [
  { id: 'M-208', createdAt: daysAgo(0, 12), name: 'Exemple — Visiteur 1', email: 'visiteur1@example.com', subject: 'Private label', message: 'Do you offer private label for safety vests?', read: false, demo: true },
  { id: 'M-207', createdAt: daysAgo(2, 17), name: 'Exemple — Visiteur 2', email: 'visiteur2@example.com', subject: 'Delivery to Montreal', message: 'What is the lead time for DDP delivery to Montreal?', read: true, demo: true },
];

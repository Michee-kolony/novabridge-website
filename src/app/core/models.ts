export interface ProductLine {
  slug: string;
  name: string;
  short: string;
  description: string;
  icon: string;
  image: string;
  gallery: string[];
  items: string[];
  industries: string[];
  hub: string;
  visible: boolean;
}

export type QuoteStatus = 'nouveau' | 'en_cours' | 'devis_envoye' | 'gagne' | 'perdu';

export interface QuoteRequest {
  id: string;
  createdAt: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  productLine: string;
  product: string;
  quantity: number;
  branding: boolean;
  delivery: 'standard' | 'express';
  message?: string;
  status: QuoteStatus;
  notes: string[];
  demo?: boolean;
}

export interface ContactMessage {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  demo?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'News' | 'Product' | 'Logistics' | 'Offer';
  excerpt: string;
  content: string;
  image: string;
  published: boolean;
  featured: boolean;
  date: string;
}

export const STATUS_LABELS: Record<QuoteStatus, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  devis_envoye: 'Devis envoyé',
  gagne: 'Gagné',
  perdu: 'Perdu',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SiteSettings {
  id: string;
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
  twitter: string | null;
  heroTitle: string;
  heroSubtitle: string;
  priceBasic: number;
  pricePremium: number;
  priceUltimate: number;
  colorTheme: string;
  homepageLayout: string;
  listingLayout: string;
  detailLayout: string;
  maintenanceMode: boolean;
  maintenanceMsg: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'default',
  siteName: 'PropertyHub',
  tagline: 'Temukan Properti Impian Anda',
  logoUrl: null,
  faviconUrl: null,
  email: null,
  phone: null,
  whatsapp: null,
  address: null,
  instagram: null,
  facebook: null,
  tiktok: null,
  youtube: null,
  twitter: null,
  heroTitle: 'Temukan Properti Impian Anda',
  heroSubtitle: 'Jual, beli, dan sewa properti terpercaya di Indonesia',
  priceBasic: 99000,
  pricePremium: 299000,
  priceUltimate: 599000,
  colorTheme: 'modern',
  homepageLayout: 'hero-search',
  listingLayout: 'card-grid',
  detailLayout: 'gallery-top',
  maintenanceMode: false,
  maintenanceMsg: 'Sedang dalam pemeliharaan',
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return DEFAULT_SETTINGS;
    return res.json();
  } catch {
    return DEFAULT_SETTINGS;
  }
}

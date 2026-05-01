// Shared mock data for the "AI in Your Project" course demos.
// All demos import from here so the schema is consistent across lessons.

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;       // ISO date
  lastOrderAt: string | null;
  tags: string[];
};

export type Product = {
  id: number;
  name: string;
  sku: string;
  priceCents: number;
  category: 'apparel' | 'home' | 'food' | 'accessories';
  active: boolean;
};

export type OrderItem = { productId: number; qty: number; unitPriceCents: number };

export type Order = {
  id: number;
  customerId: number;
  totalCents: number;
  placedAt: string;
  items: OrderItem[];
};

export type Promotion = {
  id: number;
  code: string;
  description: string;
  discountType: 'pct' | 'fixed';
  discountValue: number;             // 15 means 15% or 1500 cents depending on type
  startsAt: string;
  endsAt: string;
  audienceFilter: { lapsedDays?: number; tagIn?: string[] } | null;
  active: boolean;
  createdBy: 'system' | 'operator' | 'ai';
};

export type EmailDraft = {
  id: number;
  customerId: number;
  subject: string;
  body: string;
  createdAt: string;
  sentAt: string | null;
};

// Helper: ISO date N days ago.
function daysAgo(n: number): string {
  const d = new Date('2026-05-01T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
}

export const SEED_CUSTOMERS: Customer[] = [
  { id: 1, name: 'Wei Chen',         email: 'wei.chen@example.com',     phone: '555-0101', createdAt: daysAgo(420), lastOrderAt: daysAgo(7),   tags: [] },
  { id: 2, name: 'Ana Garcia',       email: 'ana.garcia@example.com',   phone: '555-0102', createdAt: daysAgo(380), lastOrderAt: daysAgo(2),   tags: ['vip'] },
  { id: 3, name: 'Anika Patel',      email: 'anika.patel@example.com',  phone: '555-0103', createdAt: daysAgo(310), lastOrderAt: daysAgo(45),  tags: [] },
  { id: 4, name: 'Phuoc Vuong',      email: 'phuoc.vuong@example.com',  phone: '555-0104', createdAt: daysAgo(290), lastOrderAt: daysAgo(120), tags: [] },
  { id: 5, name: 'Ada Okafor',       email: 'ada.okafor@example.com',   phone: '555-0105', createdAt: daysAgo(260), lastOrderAt: daysAgo(95),  tags: [] },
  { id: 6, name: 'Liam O\'Connor',   email: 'liam.oc@example.com',      phone: '555-0106', createdAt: daysAgo(240), lastOrderAt: daysAgo(14),  tags: [] },
  { id: 7, name: 'Sofia Russo',      email: 'sofia.russo@example.com',  phone: '555-0107', createdAt: daysAgo(220), lastOrderAt: daysAgo(180), tags: [] },
  { id: 8, name: 'Mateo Diaz',       email: 'mateo.diaz@example.com',   phone: '555-0108', createdAt: daysAgo(210), lastOrderAt: daysAgo(60),  tags: [] },
  { id: 9, name: 'Yuki Tanaka',      email: 'yuki.t@example.com',       phone: '555-0109', createdAt: daysAgo(200), lastOrderAt: daysAgo(8),   tags: ['vip'] },
  { id: 10, name: 'Femi Adeyemi',    email: 'femi.a@example.com',       phone: '555-0110', createdAt: daysAgo(190), lastOrderAt: daysAgo(150), tags: [] },
  // Add 5 more lapsed (>90 days), 5 dormant (30-90), 5 active (<30) for a total of 25
  { id: 11, name: 'Priya Singh',     email: 'priya.s@example.com',      phone: '555-0111', createdAt: daysAgo(175), lastOrderAt: daysAgo(110), tags: [] },
  { id: 12, name: 'Marco Bianchi',   email: 'marco.b@example.com',      phone: '555-0112', createdAt: daysAgo(160), lastOrderAt: daysAgo(75),  tags: [] },
  { id: 13, name: 'Lena Schulz',     email: 'lena.s@example.com',       phone: '555-0113', createdAt: daysAgo(150), lastOrderAt: daysAgo(11),  tags: [] },
  { id: 14, name: 'Theo Martin',     email: 'theo.m@example.com',       phone: '555-0114', createdAt: daysAgo(140), lastOrderAt: daysAgo(200), tags: [] },
  { id: 15, name: 'Hana Park',       email: 'hana.p@example.com',       phone: '555-0115', createdAt: daysAgo(130), lastOrderAt: daysAgo(40),  tags: [] },
];

export const SEED_PRODUCTS: Product[] = [
  { id: 101, name: 'Linen apron',         sku: 'LIN-AP-01', priceCents: 4800, category: 'apparel',     active: true  },
  { id: 102, name: 'Ceramic pour-over',   sku: 'CER-PO-01', priceCents: 6200, category: 'home',        active: true  },
  { id: 103, name: 'Wool throw',          sku: 'WOL-TH-01', priceCents: 8900, category: 'home',        active: true  },
  { id: 104, name: 'Stoneware mug',       sku: 'STN-MG-01', priceCents: 1800, category: 'home',        active: true  },
  { id: 105, name: 'Olive oil 500ml',     sku: 'OIL-OO-50', priceCents: 2400, category: 'food',        active: true  },
  { id: 106, name: 'Sea salt 200g',       sku: 'SLT-SS-20', priceCents: 1200, category: 'food',        active: true  },
  { id: 107, name: 'Linen tea towel',     sku: 'LIN-TT-01', priceCents: 2200, category: 'apparel',     active: true  },
  { id: 108, name: 'Brass bottle opener', sku: 'BRS-BO-01', priceCents: 1900, category: 'accessories', active: true  },
  { id: 109, name: 'Canvas tote',         sku: 'CNV-TT-01', priceCents: 3400, category: 'apparel',     active: true  },
  { id: 110, name: 'Beeswax candle',      sku: 'WAX-CD-01', priceCents: 2800, category: 'home',        active: true  },
];

export const SEED_PROMOTIONS: Promotion[] = [
  { id: 1, code: 'SPRING24',     description: 'Spring 24 storewide',  discountType: 'pct',   discountValue: 10,   startsAt: daysAgo(120), endsAt: daysAgo(60),  audienceFilter: null,                       active: false, createdBy: 'operator' },
  { id: 2, code: 'WELCOME10',    description: 'New customer welcome', discountType: 'pct',   discountValue: 10,   startsAt: daysAgo(30),  endsAt: daysAgo(-30), audienceFilter: { tagIn: ['new'] },         active: true,  createdBy: 'operator' },
  { id: 3, code: 'PREVIEW',      description: 'Upcoming launch',      discountType: 'fixed', discountValue: 1000, startsAt: daysAgo(-10), endsAt: daysAgo(-40), audienceFilter: null,                       active: false, createdBy: 'operator' },
];

// Helpers used by demos to compute segments without re-implementing the logic.
export function lapsedCustomers(days = 60): Customer[] {
  const cutoff = daysAgo(days);
  return SEED_CUSTOMERS.filter((c) => c.lastOrderAt !== null && c.lastOrderAt < cutoff);
}

export function activeCustomers(days = 30): Customer[] {
  const cutoff = daysAgo(days);
  return SEED_CUSTOMERS.filter((c) => c.lastOrderAt !== null && c.lastOrderAt >= cutoff);
}

export function customerById(id: number): Customer | undefined {
  return SEED_CUSTOMERS.find((c) => c.id === id);
}

export function productById(id: number): Product | undefined {
  return SEED_PRODUCTS.find((p) => p.id === id);
}

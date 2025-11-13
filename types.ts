export interface RecipeItem {
  ingredientId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Lanche' | 'Bebida' | 'Combo' | 'Sobremesa';
  status: 'active' | 'inactive' | 'deleted';
  recipe?: RecipeItem[];
  deletedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao';

export interface Sale {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  attendantName?: string;
  notes?: string;
  timestamp: string; // ISO8601 string
  hasReceipt?: boolean;
  status: 'active' | 'deleted';
  deletedAt?: string;
  amountReceived?: number;
  changeGiven?: number;
}

export interface Receipt {
    saleId: string;
    fileName: string;
    fileType: string;
    fileData: string; // Base64 encoded string
    uploadedAt: string; // ISO8601 string
    status: 'active' | 'deleted';
    deletedAt?: string;
}

export enum TimeFilter {
  Today = 'today',
  Last7Days = '7d',
  Last30Days = '30d',
}

// FIX: Added Bid, Auction, and AuctionWithMetrics interfaces to resolve type errors in components.
export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: string; // ISO8601 string
}

export interface Auction {
  id: string;
  title: string;
  status: 'active' | 'closed' | 'upcoming';
}

export interface AuctionWithMetrics extends Auction {
  metrics: {
    totalBids: number;
    totalRevenue: number;
    lastBid?: {
      amount: number;
      user: string;
    };
  };
}

// New types for Inventory Management
export type UnitOfMeasure = 'kg' | 'g' | 'un' | 'l' | 'ml';

export interface Ingredient {
  id: string;
  name: string;
  unit: UnitOfMeasure;
  stock: number;
  price: number; // Price per unit
  supplier?: string;
  category?: string;
  minStock?: number;
  status: 'active' | 'deleted';
  deletedAt?: string;
}

export interface IngredientUsage {
  ingredientId: string;
  ingredientName: string;
  unit: UnitOfMeasure;
  quantityUsed: number;
  cost: number;
}

export interface DailyUsageReport {
  id: string;
  date: string; // YYYY-MM-DD
  usages: IngredientUsage[];
  totalCost: number;
  notes?: string;
  status: 'active' | 'deleted';
  deletedAt?: string;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    action: 'deleted' | 'restored' | 'permanently_deleted';
    itemType: string;
    itemId: string;
    itemName: string;
    user: string;
}

export interface RecycleBinItems {
    products: Product[];
    ingredients: Ingredient[];
    sales: Sale[];
    reports: DailyUsageReport[];
    receipts: Receipt[];
}
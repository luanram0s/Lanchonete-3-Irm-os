import { Product, Sale, OrderItem, TimeFilter, Auction, Bid, PaymentMethod, Ingredient, DailyUsageReport, IngredientUsage, Receipt, LogEntry, RecycleBinItems } from '../types';

const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, value: T): void => {
    try {
        const serializedValue = JSON.stringify(value);
        window.localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

const initialProducts: Product[] = [
    { 
        id: 'prod-1', 
        name: 'X-Burger Clássico', 
        price: 25.50, 
        category: 'Lanche', 
        status: 'active',
        recipe: [
            { ingredientId: 'ing-1', quantity: 1 },    // 1 un Pão de Hambúrguer
            { ingredientId: 'ing-2', quantity: 150 },  // 150g Carne
            { ingredientId: 'ing-3', quantity: 30 },   // 30g Queijo
        ]
    },
    { id: 'prod-2', name: 'Batata Frita Média', price: 12.00, category: 'Lanche', status: 'active' },
    { id: 'prod-3', name: 'Refrigerante Lata', price: 6.00, category: 'Bebida', status: 'active' },
    { id: 'prod-4', name: 'Combo Clássico', price: 40.00, category: 'Combo', status: 'active' },
    { id: 'prod-5', name: 'Milkshake de Chocolate', price: 18.00, category: 'Sobremesa', status: 'active' },
    { id: 'prod-6', name: 'X-Salada Especial', price: 28.00, category: 'Lanche', status: 'inactive' },
];

// --- INITIALIZE DATABASES ---
let MOCK_PRODUCTS_DB = getFromStorage<Product[]>('products', initialProducts);
if (getFromStorage<Product[]>('products', []).length === 0) {
    saveToStorage('products', initialProducts);
}
let MOCK_SALES_DB = getFromStorage<Sale[]>('sales', []);

const initialIngredients: Ingredient[] = [
    { id: 'ing-1', name: 'Pão de Hambúrguer', unit: 'un', stock: 100, price: 1.50, supplier: 'Pão Dourado', category: 'Pães', minStock: 20, status: 'active' },
    { id: 'ing-2', name: 'Carne de Hambúrguer', unit: 'g', stock: 5000, price: 0.05, supplier: 'Carnes Nobres', category: 'Carnes', minStock: 1000, status: 'active' },
    { id: 'ing-3', name: 'Queijo Cheddar', unit: 'g', stock: 2000, price: 0.07, supplier: 'Laticínios Bom Sabor', category: 'Frios', minStock: 500, status: 'active' },
    { id: 'ing-4', name: 'Alface', unit: 'kg', stock: 2, price: 5.00, category: 'Vegetais', minStock: 1, status: 'active' },
    { id: 'ing-5', name: 'Batata Congelada', unit: 'kg', stock: 10, price: 15.00, supplier: 'Gelados da Serra', category: 'Congelados', minStock: 5, status: 'active' },
];

let MOCK_INGREDIENTS_DB = getFromStorage<Ingredient[]>('ingredients', initialIngredients);
if (getFromStorage<Ingredient[]>('ingredients', []).length === 0) {
    saveToStorage('ingredients', initialIngredients);
}
let MOCK_REPORTS_DB = getFromStorage<DailyUsageReport[]>('daily_reports', []);
let MOCK_LOGS_DB = getFromStorage<LogEntry[]>('action_logs', []);

const apiDelay = <T,>(data: T): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), 300));
  
const logAction = (action: LogEntry['action'], itemType: string, itemId: string, itemName: string) => {
    const user = localStorage.getItem('attendantName') || 'Sistema';
    const logEntry: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action,
        itemType,
        itemId,
        itemName,
        user
    };
    MOCK_LOGS_DB.unshift(logEntry);
    saveToStorage('action_logs', MOCK_LOGS_DB);
};


// --- Product API ---

export const getProducts = async (): Promise<Product[]> => {
    const activeProducts = MOCK_PRODUCTS_DB.filter(p => p.status !== 'deleted');
    return apiDelay(activeProducts);
};

export const saveProduct = async (product: Omit<Product, 'id' | 'status' | 'deletedAt'> & { id?: string }): Promise<Product> => {
    let savedProduct: Product;
    if (product.id) {
        const existing = MOCK_PRODUCTS_DB.find(p => p.id === product.id);
        savedProduct = { ...existing!, ...product };
        MOCK_PRODUCTS_DB = MOCK_PRODUCTS_DB.map(p => p.id === product.id ? savedProduct : p);
    } else {
        savedProduct = { ...product, id: `prod-${Date.now()}`, status: 'active' };
        MOCK_PRODUCTS_DB.push(savedProduct);
    }
    saveToStorage('products', MOCK_PRODUCTS_DB);
    return apiDelay(savedProduct);
};

export const softDeleteProduct = async (productId: string): Promise<void> => {
    const product = MOCK_PRODUCTS_DB.find(p => p.id === productId);
    if(product) {
        product.status = 'deleted';
        product.deletedAt = new Date().toISOString();
        saveToStorage('products', MOCK_PRODUCTS_DB);
        logAction('deleted', 'Produto', productId, product.name);
    }
    return apiDelay(undefined);
};

export const restoreProduct = async (productId: string): Promise<void> => {
    const product = MOCK_PRODUCTS_DB.find(p => p.id === productId);
    if(product) {
        product.status = 'active';
        product.deletedAt = undefined;
        saveToStorage('products', MOCK_PRODUCTS_DB);
        logAction('restored', 'Produto', productId, product.name);
    }
    return apiDelay(undefined);
};

export const permanentlyDeleteProduct = async (productId: string): Promise<void> => {
    const product = MOCK_PRODUCTS_DB.find(p => p.id === productId);
    if(product) {
        MOCK_PRODUCTS_DB = MOCK_PRODUCTS_DB.filter(p => p.id !== productId);
        saveToStorage('products', MOCK_PRODUCTS_DB);
        logAction('permanently_deleted', 'Produto', productId, product.name);
    }
    return apiDelay(undefined);
}

// --- Sales API ---

const getNextOrderNumber = (): string => {
    const lastOrderNum = parseInt(getFromStorage('lastOrderNumber', '0'), 10);
    const nextOrderNum = lastOrderNum + 1;
    saveToStorage('lastOrderNumber', nextOrderNum.toString());
    return `3IR${nextOrderNum.toString().padStart(3, '0')}`;
};


export const getSales = async (filter: TimeFilter): Promise<Sale[]> => {
    const now = new Date();
    let startDate = new Date();

    switch (filter) {
        case TimeFilter.Today:
            startDate.setHours(0, 0, 0, 0);
            break;
        case TimeFilter.Last7Days:
            startDate.setDate(now.getDate() - 7);
            break;
        case TimeFilter.Last30Days:
            startDate.setDate(now.getDate() - 30);
            break;
    }

    const filteredSales = MOCK_SALES_DB
        .filter(sale => new Date(sale.timestamp) >= startDate && sale.status !== 'deleted')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map(sale => ({
            ...sale,
            hasReceipt: hasReceipt(sale.id)
        }));
        
    return apiDelay(filteredSales);
};

export const addSale = async (items: OrderItem[], paymentMethod: PaymentMethod, attendantName?: string, notes?: string, amountReceived?: number, changeGiven?: number): Promise<Sale> => {
    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const newSale: Sale = {
        id: `sale-${Date.now()}`,
        orderNumber: getNextOrderNumber(),
        items,
        totalAmount,
        paymentMethod,
        attendantName,
        notes,
        timestamp: new Date().toISOString(),
        status: 'active',
        amountReceived,
        changeGiven,
    };
    
    // Deduct ingredients from stock based on recipes
    for (const item of items) {
        const product = MOCK_PRODUCTS_DB.find(p => p.id === item.productId);
        if (product && product.recipe) {
            for (const recipeItem of product.recipe) {
                const ingredient = MOCK_INGREDIENTS_DB.find(i => i.id === recipeItem.ingredientId);
                if (ingredient) {
                    const quantityToDeduct = recipeItem.quantity * item.quantity;
                    ingredient.stock -= quantityToDeduct;
                }
            }
        }
    }

    MOCK_SALES_DB.unshift(newSale); // Add to the beginning
    saveToStorage('sales', MOCK_SALES_DB);
    saveToStorage('ingredients', MOCK_INGREDIENTS_DB); // Save updated stock
    return apiDelay(newSale);
};

export const softDeleteSale = async (saleId: string): Promise<void> => {
    const sale = MOCK_SALES_DB.find(s => s.id === saleId);
    if(sale) {
        sale.status = 'deleted';
        sale.deletedAt = new Date().toISOString();
        saveToStorage('sales', MOCK_SALES_DB);
        logAction('deleted', 'Venda', saleId, sale.orderNumber);
    }
    return apiDelay(undefined);
};

export const restoreSale = async (saleId: string): Promise<void> => {
    const sale = MOCK_SALES_DB.find(s => s.id === saleId);
    if(sale) {
        sale.status = 'active';
        sale.deletedAt = undefined;
        saveToStorage('sales', MOCK_SALES_DB);
        logAction('restored', 'Venda', saleId, sale.orderNumber);
    }
    return apiDelay(undefined);
};

export const permanentlyDeleteSale = async (saleId: string): Promise<void> => {
    const sale = MOCK_SALES_DB.find(s => s.id === saleId);
    if (sale) {
        MOCK_SALES_DB = MOCK_SALES_DB.filter(s => s.id !== saleId);
        // Also permanently delete associated receipt
        window.localStorage.removeItem(`receipt_${saleId}`);
        saveToStorage('sales', MOCK_SALES_DB);
        logAction('permanently_deleted', 'Venda', saleId, sale.orderNumber);
    }
    return apiDelay(undefined);
};

// --- Receipt API ---
export const saveReceipt = async (saleId: string, file: File): Promise<Receipt> => {
    const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    const fileData = await toBase64(file);
    const newReceipt: Receipt = {
        saleId,
        fileName: file.name,
        fileType: file.type,
        fileData,
        uploadedAt: new Date().toISOString(),
        status: 'active'
    };
    saveToStorage(`receipt_${saleId}`, newReceipt);
    return apiDelay(newReceipt);
};

export const getReceipt = async (saleId: string): Promise<Receipt | null> => {
    const receipt = getFromStorage<Receipt | null>(`receipt_${saleId}`, null);
    if (receipt && receipt.status === 'deleted') return apiDelay(null);
    return apiDelay(receipt);
}

export const hasReceipt = (saleId: string): boolean => {
    const receipt = getFromStorage<Receipt | null>(`receipt_${saleId}`, null);
    return receipt !== null && receipt.status !== 'deleted';
}

export const softDeleteReceipt = async (saleId: string): Promise<void> => {
    const receipt = getFromStorage<Receipt | null>(`receipt_${saleId}`, null);
    if (receipt) {
        receipt.status = 'deleted';
        receipt.deletedAt = new Date().toISOString();
        saveToStorage(`receipt_${saleId}`, receipt);
        logAction('deleted', 'Comprovante', saleId, receipt.fileName);
    }
    return apiDelay(undefined);
}

export const restoreReceipt = async (saleId: string): Promise<void> => {
    const receipt = getFromStorage<Receipt | null>(`receipt_${saleId}`, null);
    if (receipt) {
        receipt.status = 'active';
        receipt.deletedAt = undefined;
        saveToStorage(`receipt_${saleId}`, receipt);
        logAction('restored', 'Comprovante', saleId, receipt.fileName);
    }
    return apiDelay(undefined);
}

export const permanentlyDeleteReceipt = async (saleId: string): Promise<void> => {
    const receipt = getFromStorage<Receipt | null>(`receipt_${saleId}`, null);
    if (receipt) {
        window.localStorage.removeItem(`receipt_${saleId}`);
        logAction('permanently_deleted', 'Comprovante', saleId, receipt.fileName);
    }
    return apiDelay(undefined);
}

// --- Inventory API ---

export const getIngredients = async (): Promise<Ingredient[]> => {
    const activeIngredients = [...MOCK_INGREDIENTS_DB].filter(i => i.status !== 'deleted').sort((a, b) => a.name.localeCompare(b.name));
    return apiDelay(activeIngredients);
};

export const saveIngredient = async (ingredient: Omit<Ingredient, 'id' | 'status' | 'deletedAt'> & { id?: string }): Promise<Ingredient> => {
    let savedIngredient: Ingredient;
    if (ingredient.id) {
        const existing = MOCK_INGREDIENTS_DB.find(i => i.id === ingredient.id);
        savedIngredient = { ...existing!, ...ingredient };
        MOCK_INGREDIENTS_DB = MOCK_INGREDIENTS_DB.map(i => i.id === ingredient.id ? savedIngredient : i);
    } else {
        savedIngredient = { ...ingredient, id: `ing-${Date.now()}`, status: 'active' };
        MOCK_INGREDIENTS_DB.push(savedIngredient);
    }
    saveToStorage('ingredients', MOCK_INGREDIENTS_DB);
    return apiDelay(savedIngredient);
};

export const softDeleteIngredient = async (ingredientId: string): Promise<void> => {
    const ingredient = MOCK_INGREDIENTS_DB.find(i => i.id === ingredientId);
    if(ingredient) {
        ingredient.status = 'deleted';
        ingredient.deletedAt = new Date().toISOString();
        saveToStorage('ingredients', MOCK_INGREDIENTS_DB);
        logAction('deleted', 'Ingrediente', ingredientId, ingredient.name);
    }
    return apiDelay(undefined);
};

export const restoreIngredient = async (ingredientId: string): Promise<void> => {
    const ingredient = MOCK_INGREDIENTS_DB.find(i => i.id === ingredientId);
    if(ingredient) {
        ingredient.status = 'active';
        ingredient.deletedAt = undefined;
        saveToStorage('ingredients', MOCK_INGREDIENTS_DB);
        logAction('restored', 'Ingrediente', ingredientId, ingredient.name);
    }
    return apiDelay(undefined);
};

export const permanentlyDeleteIngredient = async (ingredientId: string): Promise<void> => {
    const ingredient = MOCK_INGREDIENTS_DB.find(i => i.id === ingredientId);
    if(ingredient) {
        MOCK_INGREDIENTS_DB = MOCK_INGREDIENTS_DB.filter(i => i.id !== ingredientId);
        saveToStorage('ingredients', MOCK_INGREDIENTS_DB);
        logAction('permanently_deleted', 'Ingrediente', ingredientId, ingredient.name);
    }
    return apiDelay(undefined);
};


export const getDailyReports = async (): Promise<DailyUsageReport[]> => {
    const sortedReports = [...MOCK_REPORTS_DB]
        .filter(r => r.status !== 'deleted')
        .sort((a,b) => b.date.localeCompare(a.date));
    return apiDelay(sortedReports);
};

export const saveDailyReport = async (reportData: { usages: Omit<IngredientUsage, 'cost' | 'ingredientName' | 'unit'>[], notes?: string, date: string }): Promise<DailyUsageReport> => {
    let totalCost = 0;
    
    const detailedUsages: IngredientUsage[] = reportData.usages.map(usage => {
        const ingredient = MOCK_INGREDIENTS_DB.find(i => i.id === usage.ingredientId);
        if (!ingredient) {
            throw new Error(`Ingredient with id ${usage.ingredientId} not found.`);
        }
        
        const cost = usage.quantityUsed * ingredient.price;
        totalCost += cost;
        
        // Update stock
        ingredient.stock -= usage.quantityUsed;

        return {
            ...usage,
            ingredientName: ingredient.name,
            unit: ingredient.unit,
            cost: cost,
        };
    });
    
    const newReport: DailyUsageReport = {
        id: `rep-${Date.now()}`,
        date: reportData.date,
        usages: detailedUsages,
        totalCost: totalCost,
        notes: reportData.notes,
        status: 'active',
    };

    MOCK_REPORTS_DB.push(newReport);
    saveToStorage('ingredients', MOCK_INGREDIENTS_DB); // Save updated stock
    saveToStorage('daily_reports', MOCK_REPORTS_DB);
    
    return apiDelay(newReport);
};

export const softDeleteReport = async (reportId: string): Promise<void> => {
    const report = MOCK_REPORTS_DB.find(r => r.id === reportId);
    if(report) {
        report.status = 'deleted';
        report.deletedAt = new Date().toISOString();
        saveToStorage('daily_reports', MOCK_REPORTS_DB);
        logAction('deleted', 'Relatório', reportId, `Relatório de ${report.date}`);
    }
    return apiDelay(undefined);
};

export const restoreReport = async (reportId: string): Promise<void> => {
    const report = MOCK_REPORTS_DB.find(r => r.id === reportId);
    if(report) {
        report.status = 'active';
        report.deletedAt = undefined;
        saveToStorage('daily_reports', MOCK_REPORTS_DB);
        logAction('restored', 'Relatório', reportId, `Relatório de ${report.date}`);
    }
    return apiDelay(undefined);
};

export const permanentlyDeleteReport = async (reportId: string): Promise<void> => {
    const report = MOCK_REPORTS_DB.find(r => r.id === reportId);
    if(report) {
        MOCK_REPORTS_DB = MOCK_REPORTS_DB.filter(r => r.id !== reportId);
        saveToStorage('daily_reports', MOCK_REPORTS_DB);
        logAction('permanently_deleted', 'Relatório', reportId, `Relatório de ${report.date}`);
    }
    return apiDelay(undefined);
};


// --- Recycle Bin API ---
export const getRecycleBinItems = async (): Promise<RecycleBinItems> => {
    const deletedProducts = MOCK_PRODUCTS_DB.filter(p => p.status === 'deleted');
    const deletedIngredients = MOCK_INGREDIENTS_DB.filter(i => i.status === 'deleted');
    const deletedSales = MOCK_SALES_DB.filter(s => s.status === 'deleted');
    const deletedReports = MOCK_REPORTS_DB.filter(r => r.status === 'deleted');
    
    // Receipts are stored differently
    const deletedReceipts: Receipt[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('receipt_')) {
            const receipt = getFromStorage<Receipt | null>(key, null);
            if (receipt && receipt.status === 'deleted') {
                deletedReceipts.push(receipt);
            }
        }
    }

    return apiDelay({
        products: deletedProducts,
        ingredients: deletedIngredients,
        sales: deletedSales,
        reports: deletedReports,
        receipts: deletedReceipts,
    });
};


// FIX: Added mock data and API functions for auctions and bids to resolve compilation errors.
const MOCK_AUCTIONS_DB: Auction[] = [
    { id: 'auc-1', title: 'Obra de Arte Rara', status: 'active' },
    { id: 'auc-2', title: 'Coleção de Moedas Antigas', status: 'closed' },
    { id: 'auc-3', title: 'Leilão de Caridade', status: 'upcoming' },
];

const MOCK_BIDS_DB: Bid[] = Array.from({ length: 50 }, (_, i) => {
    const auctionId = `auc-${(i % 3) + 1}`;
    const date = new Date();
    date.setDate(date.getDate() - (i % 15));
    date.setHours(date.getHours() - (i % 24));
    return {
        id: `bid-${i + 1}`,
        auctionId: auctionId,
        userId: `user-${String.fromCharCode(97 + (i % 26))}`, // user-a, user-b, etc.
        amount: 100 + i * 15.5,
        timestamp: date.toISOString(),
    };
});

// --- Auction API ---

export const getAuctionDetails = async (auctionId: string): Promise<Auction | undefined> => {
    return apiDelay(MOCK_AUCTIONS_DB.find(a => a.id === auctionId));
};

export const getBidsForAuction = async (
    auctionId: string,
    filter: TimeFilter,
    page: number,
    limit: number
): Promise<{ bids: Bid[], total: number }> => {
    const now = new Date();
    let startDate = new Date();

    switch (filter) {
        case TimeFilter.Today:
            startDate.setHours(0, 0, 0, 0);
            break;
        case TimeFilter.Last7Days:
            startDate.setDate(now.getDate() - 7);
            break;
        case TimeFilter.Last30Days:
            startDate.setDate(now.getDate() - 30);
            break;
    }

    const filteredBids = MOCK_BIDS_DB
        .filter(bid => bid.auctionId === auctionId && new Date(bid.timestamp) >= startDate)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = filteredBids.length;
    const paginatedBids = filteredBids.slice((page - 1) * limit, page * limit);

    return apiDelay({ bids: paginatedBids, total });
};
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RegisterSale from './RegisterSale';
import OrderHistory from './RecentSales';
import ProductManager from './ProductManager';
import OrderSlip from './OrderSlip';
import MetricCard from './MetricCard';
import { getProducts, getSales, addSale, getIngredients } from '../services/api';
import { Product, Sale, TimeFilter, OrderItem, PaymentMethod, Ingredient } from '../types';
import { CogIcon } from './icons/CogIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { exportSalesToCSV } from '../utils/formatters';
import { ToastMessage } from '../App';

interface SalesDashboardProps {
    showToast: (message: string, type?: ToastMessage['type']) => void;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ showToast }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProductManagerOpen, setProductManagerOpen] = useState(false);
    const [isSlipModalOpen, setSlipModalOpen] = useState(false);
    const [currentSaleForSlip, setCurrentSaleForSlip] = useState<Sale | null>(null);

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [productsData, salesData, ingredientsData] = await Promise.all([
                getProducts(),
                getSales(TimeFilter.Last30Days),
                getIngredients(),
            ]);
            setProducts(productsData);
            setSales(salesData);
            setIngredients(ingredientsData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const todaySales = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return sales.filter(sale => new Date(sale.timestamp) >= today);
    }, [sales]);

    const totalRevenueToday = useMemo(() => {
        return todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    }, [todaySales]);

    const handleGenerateNote = async (
        items: OrderItem[], 
        paymentMethod: PaymentMethod,
        attendantName: string,
        notes: string,
        amountReceived?: number,
        changeGiven?: number
    ) => {
        if (items.length === 0) return;
        try {
            const newSale = await addSale(items, paymentMethod, attendantName, notes, amountReceived, changeGiven);
            const saleSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-cash-register-bell-1721.mp3");
            saleSound.volume = 0.5;
            saleSound.play();
            setCurrentSaleForSlip(newSale);
            setSlipModalOpen(true);
            await refreshData();
        } catch (error) {
            console.error("Failed to register sale:", error);
        }
    };
    
    const handleViewSlip = (sale: Sale) => {
        setCurrentSaleForSlip(sale);
        setSlipModalOpen(true);
    };

    const handleExport = () => {
        if(todaySales.length > 0) {
            exportSalesToCSV(todaySales, 'hoje');
        } else {
            alert("Nenhuma venda registrada hoje para exportar.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard 
                    title="Total Vendas (Hoje)"
                    value={totalRevenueToday}
                    icon={<CurrencyDollarIcon className="h-6 w-6 text-accent" />}
                    isCurrency
                />
                <MetricCard 
                    title="Pedidos Realizados (Hoje)"
                    value={todaySales.length}
                    icon={<ShoppingCartIcon className="h-6 w-6 text-accent" />}
                />
            </div>

            <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-center mb-4">Ações Rápidas</h2>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <button 
                        onClick={() => setProductManagerOpen(true)} 
                        className="flex flex-col items-center justify-center gap-2 p-4 w-48 h-28 bg-background dark:bg-dark-background rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-accent transition-all duration-300 group"
                    >
                        <CogIcon className="h-7 w-7 text-text-secondary dark:text-dark-text-secondary group-hover:text-accent transition-colors" />
                        <span className="text-base font-semibold text-center text-text-primary dark:text-dark-text-primary">Gerenciar Produtos</span>
                    </button>
                    <button 
                        onClick={handleExport} 
                        className="flex flex-col items-center justify-center gap-2 p-4 w-48 h-28 bg-background dark:bg-dark-background rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-accent transition-all duration-300 group"
                    >
                        <DocumentTextIcon className="h-7 w-7 text-text-secondary dark:text-dark-text-secondary group-hover:text-accent transition-colors" />
                        <span className="text-base font-semibold text-center text-text-primary dark:text-dark-text-primary">Exportar Vendas</span>
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <RegisterSale 
                        products={products.filter(p => p.status === 'active')} 
                        onGenerateNote={handleGenerateNote} 
                        isLoading={isLoading} 
                    />
                </div>
                <div className="lg:col-span-2">
                    <OrderHistory 
                        sales={sales} 
                        isLoading={isLoading} 
                        onViewSlip={handleViewSlip}
                        onUpdate={refreshData}
                        showToast={showToast}
                    />
                </div>
            </div>

            {isProductManagerOpen && (
                <ProductManager
                    initialProducts={products}
                    ingredients={ingredients}
                    onClose={() => setProductManagerOpen(false)}
                    onSave={refreshData}
                    showToast={showToast}
                />
            )}

            {isSlipModalOpen && currentSaleForSlip && (
                <OrderSlip 
                    sale={currentSaleForSlip}
                    onClose={() => setSlipModalOpen(false)}
                    onReceiptUpdate={refreshData}
                    showToast={showToast}
                />
            )}
        </div>
    );
};

export default SalesDashboard;
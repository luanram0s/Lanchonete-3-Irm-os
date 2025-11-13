import React, { useState } from 'react';
import Header from './components/Header';
import { ThemeProvider } from './contexts/ThemeContext';
import SalesDashboard from './components/SalesDashboard';
import InventoryDashboard from './components/InventoryDashboard';
import RecycleBinDashboard from './components/RecycleBinDashboard';
import Toast from './components/Toast';
import { ShoppingCartIcon } from './components/icons/ShoppingCartIcon';
import { ArchiveBoxIcon } from './components/icons/ArchiveBoxIcon';
import { RecycleBinIcon } from './components/icons/RecycleBinIcon';

export type View = 'sales' | 'inventory' | 'recycle_bin';

export type ToastMessage = {
    id: number;
    message: string;
    type: 'success' | 'error';
};

const AppContent: React.FC = () => {
    const [view, setView] = useState<View>('sales');
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const newToast: ToastMessage = {
            id: Date.now(),
            message,
            type,
        };
        setToasts(prevToasts => [...prevToasts, newToast]);
    };
    
    const removeToast = (id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };

    return (
        <div className="min-h-screen bg-background text-text-primary dark:bg-dark-background dark:text-dark-text-primary">
            <Header currentView={view} />
            <main className="container mx-auto p-2 md:p-4 space-y-4">
                
                <div className="flex items-stretch justify-center p-2 gap-4 rounded-xl bg-gray-100 dark:bg-dark-border shadow-inner">
                    <button 
                        onClick={() => setView('sales')}
                        className={`w-1/3 flex items-center justify-center gap-3 p-3 text-base font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:focus-visible:ring-offset-dark-background ${
                            view === 'sales'
                                ? 'bg-accent text-white shadow-xl -translate-y-1'
                                : 'bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary shadow-md hover:shadow-lg hover:-translate-y-1'
                        }`}
                    >
                        <ShoppingCartIcon className="h-6 w-6"/>
                        Frente de Caixa
                    </button>
                    <button 
                        onClick={() => setView('inventory')}
                         className={`w-1/3 flex items-center justify-center gap-3 p-3 text-base font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:focus-visible:ring-offset-dark-background ${
                            view === 'inventory'
                                ? 'bg-accent text-white shadow-xl -translate-y-1'
                                : 'bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary shadow-md hover:shadow-lg hover:-translate-y-1'
                        }`}
                    >
                        <ArchiveBoxIcon className="h-6 w-6"/>
                        Controle de Estoque
                    </button>
                     <button 
                        onClick={() => setView('recycle_bin')}
                         className={`w-1/3 flex items-center justify-center gap-3 p-3 text-base font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:focus-visible:ring-offset-dark-background ${
                            view === 'recycle_bin'
                                ? 'bg-accent text-white shadow-xl -translate-y-1'
                                : 'bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary shadow-md hover:shadow-lg hover:-translate-y-1'
                        }`}
                    >
                        <RecycleBinIcon className="h-6 w-6"/>
                        Lixeira
                    </button>
                </div>

                {view === 'sales' && <SalesDashboard showToast={showToast} />}
                {view === 'inventory' && <InventoryDashboard showToast={showToast} />}
                {view === 'recycle_bin' && <RecycleBinDashboard showToast={showToast} />}
                
            </main>
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
};


export default App;
import React, { useState, useMemo } from 'react';
import { Sale, PaymentMethod } from '../types';
import { formatCurrencyBRL, formatDateTimeLocal } from '../utils/formatters';
import { softDeleteSale } from '../services/api';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';
import { TrashIcon } from './icons/TrashIcon';
import ReceiptViewer from './ReceiptViewer';
import ConfirmationModal from './ConfirmationModal';

interface OrderHistoryProps {
    sales: Sale[];
    isLoading: boolean;
    onViewSlip: (sale: Sale) => void;
    onUpdate: () => void;
    showToast: (message: string) => void;
}

const getPaymentMethodStyle = (method: PaymentMethod): { label: string; className: string } => {
    const labels: Record<PaymentMethod, string> = {
        dinheiro: 'Dinheiro',
        pix: 'Pix',
        cartao: 'Cartão',
    };
    return {
        label: labels[method],
        className: 'bg-accent/20 text-accent',
    };
};


const OrderHistory: React.FC<OrderHistoryProps> = ({ sales, isLoading, onViewSlip, onUpdate, showToast }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingReceiptFor, setViewingReceiptFor] = useState<Sale | null>(null);
    const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);


    const filteredSales = useMemo(() => {
        if (!searchTerm) return sales;
        const lowercasedFilter = searchTerm.toLowerCase();
        return sales.filter(sale =>
            sale.orderNumber.toLowerCase().includes(lowercasedFilter) ||
            (sale.attendantName && sale.attendantName.toLowerCase().includes(lowercasedFilter))
        );
    }, [sales, searchTerm]);
    
    const confirmDelete = async () => {
        if (saleToDelete) {
            await softDeleteSale(saleToDelete.id);
            showToast(`✅ Pedido "${saleToDelete.orderNumber}" movido para a lixeira.`);
            setSaleToDelete(null);
            onUpdate();
        }
    };

    return (
        <>
            <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-md h-full flex flex-col">
                <h3 className="text-lg font-bold mb-4 text-text-primary dark:text-dark-text-primary">Histórico de Pedidos</h3>
                
                <div className="relative mb-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-text-secondary dark:text-dark-text-secondary absolute top-1/2 left-3 -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Buscar por Nº do Pedido ou Atendente"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-10 rounded bg-background dark:bg-dark-background border border-border-color dark:border-dark-border focus:ring-accent focus:border-accent"
                    />
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="space-y-2 animate-pulse">
                            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 dark:bg-dark-border rounded-md"></div>)}
                        </div>
                    ) : filteredSales.length === 0 ? (
                        <p className="text-text-secondary dark:text-dark-text-secondary text-center py-8">
                            {searchTerm ? 'Nenhum pedido encontrado.' : 'Nenhum pedido registrado hoje.'}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {filteredSales.map(sale => {
                                const paymentStyle = getPaymentMethodStyle(sale.paymentMethod);
                                return (
                                    <div key={sale.id} className="flex items-center justify-between p-2 bg-background dark:bg-dark-background rounded-lg">
                                        <div>
                                            <p className="font-bold text-accent flex items-center gap-1.5">
                                                {sale.orderNumber}
                                                {sale.hasReceipt && <PaperClipIcon className="h-4 w-4 text-text-secondary dark:text-dark-text-secondary" />}
                                            </p>
                                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{formatDateTimeLocal(sale.timestamp)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-text-primary dark:text-dark-text-primary">{formatCurrencyBRL(sale.totalAmount)}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStyle.className}`}>
                                                {paymentStyle.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {sale.hasReceipt && (
                                                <button onClick={() => setViewingReceiptFor(sale)} className="p-2 hover:bg-gray-200 dark:hover:bg-dark-surface rounded-full" aria-label="Ver Comprovante">
                                                    <PaperClipIcon className="h-5 w-5 text-text-secondary dark:text-dark-text-secondary" />
                                                </button>
                                            )}
                                            <button onClick={() => onViewSlip(sale)} className="p-2 hover:bg-gray-200 dark:hover:bg-dark-surface rounded-full" aria-label="Ver Nota">
                                                <DocumentTextIcon className="h-5 w-5 text-text-secondary dark:text-dark-text-secondary" />
                                            </button>
                                            <button onClick={() => setSaleToDelete(sale)} className="p-2 hover:bg-gray-200 dark:hover:bg-dark-surface rounded-full" aria-label="Mover para Lixeira">
                                                <TrashIcon className="h-5 w-5 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
                {viewingReceiptFor && (
                    <ReceiptViewer
                        sale={viewingReceiptFor}
                        onClose={() => setViewingReceiptFor(null)}
                    />
                )}
            </div>
            {saleToDelete && (
                <ConfirmationModal
                    isOpen={!!saleToDelete}
                    onClose={() => setSaleToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Mover Venda para a Lixeira"
                    message={`Tem certeza que deseja excluir o pedido "${saleToDelete.orderNumber}"? Essa ação pode ser desfeita.`}
                />
            )}
        </>
    );
};

export default OrderHistory;
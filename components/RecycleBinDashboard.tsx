import React, { useState, useEffect, useCallback } from 'react';
import { getRecycleBinItems, restoreProduct, permanentlyDeleteProduct, restoreIngredient, permanentlyDeleteIngredient, restoreSale, permanentlyDeleteSale, restoreReport, permanentlyDeleteReport, restoreReceipt, permanentlyDeleteReceipt } from '../services/api';
import { RecycleBinItems, Product, Ingredient, Sale, DailyUsageReport, Receipt } from '../types';
import { formatDateTimeLocal } from '../utils/formatters';
import { ToastMessage } from '../App';
import ConfirmationModal from './ConfirmationModal';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { TrashIcon } from './icons/TrashIcon';

interface RecycleBinDashboardProps {
    showToast: (message: string, type?: ToastMessage['type']) => void;
}

type ItemType = 'Venda' | 'Produto' | 'Ingrediente' | 'Relatório' | 'Comprovante';
type DeletableItem = (Product | Ingredient | Sale | DailyUsageReport | Receipt) & { itemType: ItemType; displayName: string };

const RecycleBinDashboard: React.FC<RecycleBinDashboardProps> = ({ showToast }) => {
    const [items, setItems] = useState<RecycleBinItems | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ItemType>('Venda');
    const [itemToConfirm, setItemToConfirm] = useState<{ action: 'restore' | 'delete', item: DeletableItem } | null>(null);

    const refreshItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getRecycleBinItems();
            setItems(data);
        } catch (error) {
            console.error("Failed to fetch recycle bin items:", error);
            showToast("Falha ao carregar itens da lixeira.", 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        refreshItems();
    }, [refreshItems]);

    const handleRestore = async (item: DeletableItem) => {
        const actions = {
            'Produto': restoreProduct,
            'Ingrediente': restoreIngredient,
            'Venda': restoreSale,
            'Relatório': restoreReport,
            'Comprovante': restoreReceipt,
        };
        const id = 'saleId' in item ? item.saleId : item.id;
        await actions[item.itemType](id);
        showToast(`♻️ ${item.itemType} "${item.displayName}" restaurado com sucesso.`);
        refreshItems();
    };

    const handlePermanentDelete = async (item: DeletableItem) => {
        const actions = {
            'Produto': permanentlyDeleteProduct,
            'Ingrediente': permanentlyDeleteIngredient,
            'Venda': permanentlyDeleteSale,
            'Relatório': permanentlyDeleteReport,
            'Comprovante': permanentlyDeleteReceipt,
        };
        const id = 'saleId' in item ? item.saleId : item.id;
        await actions[item.itemType](id);
        showToast(`🗑️ ${item.itemType} "${item.displayName}" excluído permanentemente.`);
        refreshItems();
    };
    
    const onConfirm = () => {
        if(itemToConfirm) {
            if(itemToConfirm.action === 'restore') {
                handleRestore(itemToConfirm.item);
            } else {
                handlePermanentDelete(itemToConfirm.item);
            }
            setItemToConfirm(null);
        }
    }

    const renderList = (data: DeletableItem[]) => {
        if (data.length === 0) {
            return <p className="text-center text-text-secondary dark:text-dark-text-secondary py-8">Lixeira de {activeTab.toLowerCase()} está vazia.</p>;
        }
        return (
            <div className="space-y-2">
                {data.sort((a,b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime()).map(item => {
                     const id = 'saleId' in item ? item.saleId : item.id;
                     return(
                        <div key={id} className="flex items-center justify-between p-2 bg-background dark:bg-dark-background rounded-lg">
                            <div>
                                <p className="font-semibold text-text-primary dark:text-dark-text-primary">{item.displayName}</p>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Excluído em: {formatDateTimeLocal(item.deletedAt!)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setItemToConfirm({ action: 'restore', item })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white hover:bg-blue-500 transition-colors text-sm font-semibold">
                                    <ArrowUturnLeftIcon className="h-4 w-4" /> Restaurar
                                </button>
                                <button onClick={() => setItemToConfirm({ action: 'delete', item })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold">
                                    <TrashIcon className="h-4 w-4" /> Excluir
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    };
    
    const TABS: ItemType[] = ['Venda', 'Produto', 'Ingrediente', 'Relatório', 'Comprovante'];
    
    const tabData: Record<ItemType, DeletableItem[]> = {
        'Produto': items?.products.map(p => ({ ...p, itemType: 'Produto', displayName: p.name })) || [],
        'Ingrediente': items?.ingredients.map(i => ({ ...i, itemType: 'Ingrediente', displayName: i.name })) || [],
        'Venda': items?.sales.map(s => ({ ...s, itemType: 'Venda', displayName: s.orderNumber })) || [],
        'Relatório': items?.reports.map(r => ({ ...r, itemType: 'Relatório', displayName: `Relatório de ${formatDateTimeLocal(r.date)}` })) || [],
        'Comprovante': items?.receipts.map(r => ({ ...r, itemType: 'Comprovante', displayName: r.fileName })) || [],
    };
    
    return (
        <>
            <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-md">
                <div className="mb-4 border-b border-border-color dark:border-dark-border">
                    <div className="overflow-x-auto pb-2">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            {TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`${
                                        activeTab === tab
                                            ? 'border-accent text-accent'
                                            : 'border-transparent text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:border-gray-300 dark:hover:border-dark-border'
                                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg transition-colors`}
                                >
                                    {tab} ({tabData[tab].length})
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {isLoading ? (
                    <p className="text-center py-8">Carregando...</p>
                ) : (
                    renderList(tabData[activeTab])
                )}
            </div>
            
             {itemToConfirm && (
                <ConfirmationModal
                    isOpen={!!itemToConfirm}
                    onClose={() => setItemToConfirm(null)}
                    onConfirm={onConfirm}
                    title={itemToConfirm.action === 'restore' ? `Restaurar ${itemToConfirm.item.itemType}` : `Excluir ${itemToConfirm.item.itemType}`}
                    message={
                        itemToConfirm.action === 'restore'
                        ? `Tem certeza que deseja restaurar o item "${itemToConfirm.item.displayName}"?`
                        : `Esta ação é IRREVERSÍVEL. Tem certeza que deseja excluir permanentemente o item "${itemToConfirm.item.displayName}"?`
                    }
                    confirmText={itemToConfirm.action === 'restore' ? 'Restaurar' : 'Excluir'}
                    isDestructive={itemToConfirm.action === 'delete'}
                />
            )}
        </>
    );
};

export default RecycleBinDashboard;
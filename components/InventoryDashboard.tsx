import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getIngredients, getDailyReports, softDeleteIngredient } from '../services/api';
import { Ingredient, DailyUsageReport } from '../types';
import MetricCard from './MetricCard';
import { CogIcon } from './icons/CogIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import IngredientManager from './IngredientManager';
import ReportHistoryTable from './ReportHistoryTable';
import ReportSlip from './ReportSlip';
import { exportInventoryToCSV } from '../utils/formatters';
import CurrentStockList from './CurrentStockList';
import ConfirmationModal from './ConfirmationModal';
import { ToastMessage } from '../App';

interface InventoryDashboardProps {
    showToast: (message: string, type?: ToastMessage['type']) => void;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ showToast }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [reports, setReports] = useState<DailyUsageReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isIngredientManagerOpen, setIngredientManagerOpen] = useState(false);
    const [viewingReport, setViewingReport] = useState<DailyUsageReport | null>(null);
    const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);


    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ingredientsData, reportsData] = await Promise.all([
                getIngredients(),
                getDailyReports(),
            ]);
            setIngredients(ingredientsData);
            setReports(reportsData);
        } catch (error) {
            console.error("Failed to fetch inventory data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const inventoryMetrics = useMemo(() => {
        const totalStockValue = ingredients.reduce((sum, i) => sum + (i.stock * i.price), 0);
        const lowStockItemsCount = ingredients.filter(i => (i.minStock ?? 0) > 0 && i.stock <= (i.minStock ?? 0)).length;
        return {
            totalIngredients: ingredients.length,
            totalStockValue,
            lowStockItemsCount,
        };
    }, [ingredients]);
    
    const handleDeleteIngredient = (ingredient: Ingredient) => {
        setIngredientToDelete(ingredient);
    };
    
    const confirmDeleteIngredient = async () => {
        if (ingredientToDelete) {
            try {
                await softDeleteIngredient(ingredientToDelete.id);
                showToast(`✅ Ingrediente "${ingredientToDelete.name}" movido para a lixeira.`);
                setIngredientToDelete(null);
                await refreshData();
            } catch (error) {
                console.error('Failed to delete ingredient:', error);
                showToast('Ocorreu um erro ao excluir o ingrediente.', 'error');
            }
        }
    }


    const handleExport = () => {
        if (reports.length > 0) {
            exportInventoryToCSV(reports);
        } else {
            alert("Nenhum relatório para exportar.");
        }
    };


    return (
        <div className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard 
                    title="Total de Ingredientes"
                    value={inventoryMetrics.totalIngredients}
                    icon={<ArchiveBoxIcon className="h-6 w-6 text-accent" />}
                />
                <MetricCard 
                    title="Custo Total do Estoque"
                    value={inventoryMetrics.totalStockValue}
                    icon={<CurrencyDollarIcon className="h-6 w-6 text-accent" />}
                    isCurrency
                />
                <MetricCard 
                    title="Itens com Estoque Baixo"
                    value={inventoryMetrics.lowStockItemsCount}
                    icon={<ExclamationTriangleIcon className="h-6 w-6 text-accent" />}
                />
            </div>
            
            <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-center mb-4">Ações Rápidas</h2>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <button 
                        onClick={() => setIngredientManagerOpen(true)} 
                        className="flex flex-col items-center justify-center gap-2 p-4 w-48 h-28 bg-background dark:bg-dark-background rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-accent transition-all duration-300 group"
                    >
                        <CogIcon className="h-7 w-7 text-text-secondary dark:text-dark-text-secondary group-hover:text-accent transition-colors" />
                        <span className="text-base font-semibold text-center text-text-primary dark:text-dark-text-primary">Gerenciar Ingredientes</span>
                    </button>
                    <button 
                        onClick={handleExport} 
                        className="flex flex-col items-center justify-center gap-2 p-4 w-48 h-28 bg-background dark:bg-dark-background rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-accent transition-all duration-300 group"
                    >
                        <DocumentArrowDownIcon className="h-7 w-7 text-text-secondary dark:text-dark-text-secondary group-hover:text-accent transition-colors" />
                        <span className="text-base font-semibold text-center text-text-primary dark:text-dark-text-primary">Exportar Histórico</span>
                    </button>
                </div>
            </div>

            <CurrentStockList
                ingredients={ingredients}
                isLoading={isLoading}
                onDelete={handleDeleteIngredient}
            />

            <ReportHistoryTable
                reports={reports}
                isLoading={isLoading}
                onViewReport={setViewingReport}
                onUpdate={refreshData}
                showToast={showToast}
            />

            {isIngredientManagerOpen && (
                <IngredientManager
                    initialIngredients={ingredients}
                    onClose={() => setIngredientManagerOpen(false)}
                    onSave={refreshData}
                    showToast={showToast}
                />
            )}

            {viewingReport && (
                <ReportSlip 
                    report={viewingReport}
                    onClose={() => setViewingReport(null)}
                />
            )}
            
            {ingredientToDelete && (
                 <ConfirmationModal
                    isOpen={!!ingredientToDelete}
                    onClose={() => setIngredientToDelete(null)}
                    onConfirm={confirmDeleteIngredient}
                    title="Mover para a Lixeira"
                    message={`Tem certeza que deseja excluir o ingrediente "${ingredientToDelete.name}"? Essa ação pode ser desfeita.`}
                />
            )}

        </div>
    );
};

export default InventoryDashboard;
import React, { useState, useMemo, Fragment } from 'react';
import { DailyUsageReport } from '../types';
import { formatCurrencyBRL, formatDateLocal } from '../utils/formatters';
import { softDeleteReport } from '../services/api';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { TrashIcon } from './icons/TrashIcon';
import ConfirmationModal from './ConfirmationModal';

interface ReportHistoryTableProps {
    reports: DailyUsageReport[];
    isLoading: boolean;
    onViewReport: (report: DailyUsageReport) => void;
    onUpdate: () => void;
    showToast: (message: string) => void;
}

const ReportHistoryTable: React.FC<ReportHistoryTableProps> = ({ reports, isLoading, onViewReport, onUpdate, showToast }) => {
    const [dateFilter, setDateFilter] = useState('');
    const [ingredientFilter, setIngredientFilter] = useState('');
    const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
    const [reportToDelete, setReportToDelete] = useState<DailyUsageReport | null>(null);


    const handleToggleExpand = (reportId: string) => {
        setExpandedReportId(prevId => (prevId === reportId ? null : reportId));
    };

    const confirmDelete = async () => {
        if (reportToDelete) {
            await softDeleteReport(reportToDelete.id);
            showToast(`✅ Relatório de "${formatDateLocal(reportToDelete.date)}" movido para a lixeira.`);
            setReportToDelete(null);
            onUpdate();
        }
    };

    const filteredReports = useMemo(() => {
        let tempReports = reports;
        
        if (dateFilter) {
            const lowercasedFilter = dateFilter.toLowerCase();
            tempReports = tempReports.filter(report =>
                formatDateLocal(report.date).toLowerCase().includes(lowercasedFilter)
            );
        }

        if (ingredientFilter) {
            const lowercasedIngredient = ingredientFilter.toLowerCase();
            tempReports = tempReports.filter(report => 
                report.usages.some(usage => 
                    usage.ingredientName.toLowerCase().includes(lowercasedIngredient)
                )
            );
        }

        return tempReports;
    }, [reports, dateFilter, ingredientFilter]);

    if (isLoading) {
        return (
             <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-md">
                <div className="space-y-2 animate-pulse">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200 dark:bg-dark-border rounded-md"></div>)}
                </div>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
             <div className="text-center py-10 px-4 bg-surface dark:bg-dark-surface rounded-lg shadow-md">
                <p className="text-text-secondary dark:text-dark-text-secondary">Nenhum relatório de uso foi registrado ainda.</p>
            </div>
        );
    }


    return (
        <>
            <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-md h-full flex flex-col">
                <h3 className="text-lg font-bold mb-4 text-text-primary dark:text-dark-text-primary">Histórico de Relatórios</h3>
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="h-5 w-5 text-text-secondary dark:text-dark-text-secondary absolute top-1/2 left-3 -translate-y-1/2" />
                        <input 
                            type="text"
                            placeholder="Buscar por data..."
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full p-2 pl-10 rounded bg-background dark:bg-dark-background border border-border-color dark:border-dark-border focus:ring-accent focus:border-accent"
                        />
                    </div>
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="h-5 w-5 text-text-secondary dark:text-dark-text-secondary absolute top-1/2 left-3 -translate-y-1/2" />
                        <input 
                            type="text"
                            placeholder="Buscar por ingrediente..."
                            value={ingredientFilter}
                            onChange={(e) => setIngredientFilter(e.target.value)}
                            className="w-full p-2 pl-10 rounded bg-background dark:bg-dark-background border border-border-color dark:border-dark-border focus:ring-accent focus:border-accent"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-dark-background">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Data</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Custo Total do Dia</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Observações</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface dark:bg-dark-surface divide-y divide-border-color dark:divide-dark-border">
                            {filteredReports.map((report) => (
                                <Fragment key={report.id}>
                                    <tr>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-primary dark:text-dark-text-primary">{formatDateLocal(report.date)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-semibold">{formatCurrencyBRL(report.totalCost)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary dark:text-dark-text-secondary max-w-xs truncate">{report.notes || '-'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => onViewReport(report)} className="text-accent hover:text-blue-700 flex items-center gap-1">
                                                    <DocumentTextIcon className="h-4 w-4" />
                                                    Ver Nota
                                                </button>
                                                <button onClick={() => setReportToDelete(report)} className="text-red-500 hover:text-red-700">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleToggleExpand(report.id)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-background transition-colors">
                                                    {expandedReportId === report.id 
                                                        ? <ChevronUpIcon className="h-5 w-5 text-text-secondary dark:text-dark-text-secondary" /> 
                                                        : <ChevronDownIcon className="h-5 w-5 text-text-secondary dark:text-dark-text-secondary" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedReportId === report.id && (
                                        <tr className="bg-background dark:bg-dark-background/50">
                                            <td colSpan={4} className="p-3">
                                                <div className="p-2 bg-surface dark:bg-dark-surface rounded-md border border-border-color dark:border-dark-border">
                                                <h4 className="font-semibold mb-2 text-text-primary dark:text-dark-text-primary">Ingredientes Utilizados no Dia:</h4>
                                                <table className="min-w-full">
                                                    <thead>
                                                        <tr className="border-b border-border-color dark:border-dark-border">
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase">Ingrediente</th>
                                                            <th className="px-3 py-2 text-right text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase">Quantidade</th>
                                                            <th className="px-3 py-2 text-right text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase">Custo</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {report.usages.map(usage => (
                                                            <tr key={usage.ingredientId} className="border-b border-border-color/50 dark:border-dark-border/50 last:border-b-0">
                                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-text-primary dark:text-dark-text-primary">{usage.ingredientName}</td>
                                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-text-secondary dark:text-dark-text-secondary">{usage.quantityUsed.toLocaleString('pt-BR')} {usage.unit}</td>
                                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-text-secondary dark:text-dark-text-secondary">{formatCurrencyBRL(usage.cost)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                    {filteredReports.length === 0 && (
                        <p className="text-text-secondary dark:text-dark-text-secondary text-center py-8">
                            Nenhum relatório encontrado para o filtro aplicado.
                        </p>
                    )}
                </div>
            </div>
            {reportToDelete && (
                <ConfirmationModal
                    isOpen={!!reportToDelete}
                    onClose={() => setReportToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Mover Relatório para a Lixeira"
                    message={`Tem certeza que deseja excluir o relatório de "${formatDateLocal(reportToDelete.date)}"? Essa ação pode ser desfeita.`}
                />
            )}
        </>
    );
};

export default ReportHistoryTable;
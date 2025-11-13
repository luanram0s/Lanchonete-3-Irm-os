import React, { useEffect } from 'react';
import { DailyUsageReport } from '../types';
import { formatCurrencyBRL, formatDateLocal } from '../utils/formatters';
import { XMarkIcon } from './icons/XMarkIcon';

interface ReportSlipProps {
    report: DailyUsageReport;
    onClose: () => void;
}

const ReportSlip: React.FC<ReportSlipProps> = ({ report, onClose }) => {

    useEffect(() => {
        const originalOverflow = window.getComputedStyle(document.body).overflow;
        const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, []);

    const handlePrint = () => {
        window.print();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-2xl w-full max-w-md flex flex-col no-print text-text-primary dark:text-dark-text-primary">
                 <div className="flex justify-between items-center p-4 border-b border-border-color dark:border-dark-border">
                    <h2 className="text-xl font-bold">Relatório Diário de Uso</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-4 overflow-y-auto">
                    <div id="printable-area" className="bg-white text-black p-4 font-sans">
                         <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold" style={{ color: '#003366' }}>Lanchonete 3 Irmãos</h1>
                            <p className="text-sm">Relatório Diário de Ingredientes</p>
                        </div>
                        <div className="border-b pb-2 mb-2 text-sm">
                            <p>Data: <span className="font-bold">{formatDateLocal(report.date)}</span></p>
                        </div>
                        
                        <table className="w-full text-sm mb-4">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-1">Ingrediente</th>
                                    <th className="text-center py-1">Qtd. Usada</th>
                                    <th className="text-right py-1">Custo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.usages.map(usage => (
                                    <tr key={usage.ingredientId}>
                                        <td className="py-1">{usage.ingredientName}</td>
                                        <td className="text-center py-1">{usage.quantityUsed} {usage.unit}</td>
                                        <td className="text-right py-1">{formatCurrencyBRL(usage.cost)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="border-t-2 border-dashed pt-2">
                             <div className="flex justify-between font-bold text-lg mb-2">
                                <span>CUSTO TOTAL</span>
                                <span>{formatCurrencyBRL(report.totalCost)}</span>
                            </div>
                        </div>

                        {report.notes && (
                            <div className="mt-4 border-t pt-2">
                                <p className="font-bold text-sm">Observações:</p>
                                <p className="text-sm whitespace-pre-wrap">{report.notes}</p>
                            </div>
                        )}
                        
                        <div className="text-center mt-8 text-xs">
                            <p>Relatório gerado pelo sistema de controle da Lanchonete 3 Irmãos.</p>
                        </div>
                    </div>
                </div>

                 <div className="p-4 border-t border-border-color dark:border-dark-border mt-auto flex gap-4">
                    <button onClick={onClose} className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-dark-border hover:bg-opacity-80 font-semibold transition-opacity">Fechar</button>
                    <button onClick={handlePrint} className="w-full px-4 py-3 rounded-lg bg-accent text-white hover:bg-blue-500 font-semibold transition-colors">Imprimir</button>
                </div>
            </div>
        </div>
    );
};

export default ReportSlip;

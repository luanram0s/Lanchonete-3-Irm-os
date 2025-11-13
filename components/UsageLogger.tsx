import React, { useState, useEffect } from 'react';
import { Ingredient, IngredientUsage } from '../types';
import { saveDailyReport } from '../services/api';
import { formatCurrencyBRL } from '../utils/formatters';
import { XMarkIcon } from './icons/XMarkIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface UsageLoggerProps {
    ingredients: Ingredient[];
    onClose: () => void;
    onSave: () => void;
    existingReportDates: string[];
}

type UsageInput = {
    ingredientId: string;
    quantityUsed: number;
}

const UsageLogger: React.FC<UsageLoggerProps> = ({ ingredients, onClose, onSave, existingReportDates }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [usages, setUsages] = useState<UsageInput[]>([{ ingredientId: '', quantityUsed: 0 }]);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

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

    const handleUsageChange = (index: number, field: keyof UsageInput, value: string | number) => {
        const newUsages = [...usages];
        if (field === 'quantityUsed') {
            newUsages[index][field] = Number(value);
        } else {
            newUsages[index][field] = value as string;
        }
        setUsages(newUsages);
    };

    const addUsageRow = () => {
        setUsages([...usages, { ingredientId: '', quantityUsed: 0 }]);
    };
    
    const removeUsageRow = (index: number) => {
        setUsages(usages.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (existingReportDates.includes(date)) {
            setError(`Já existe um relatório para a data ${date}.`);
            return;
        }

        const validUsages = usages.filter(u => u.ingredientId && u.quantityUsed > 0);
        
        if(validUsages.length === 0) {
            setError('Adicione pelo menos um ingrediente com quantidade maior que zero.');
            return;
        }

        try {
            await saveDailyReport({ date, usages: validUsages, notes });
            onSave();
        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao salvar o relatório.');
        }
    };

    const availableIngredients = ingredients.filter(ing => !usages.some(u => u.ingredientId === ing.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface text-text-primary dark:bg-dark-surface dark:text-dark-text-primary rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-border-color dark:border-dark-border">
                    <h2 className="text-xl font-bold">Registrar Uso de Ingredientes</h2>
                    <button type="button" onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                
                <div className="p-4 overflow-y-auto space-y-4">
                    <div>
                        <label htmlFor="report-date" className="block text-sm font-medium mb-1">Data do Relatório</label>
                        <input 
                            type="date" 
                            id="report-date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-background dark:bg-dark-background border border-border-color dark:border-dark-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium">Itens Utilizados</label>
                        {usages.map((usage, index) => (
                            <div key={index} className="flex items-center gap-2 bg-background dark:bg-dark-background p-2 rounded-md">
                                <select 
                                    value={usage.ingredientId} 
                                    onChange={e => handleUsageChange(index, 'ingredientId', e.target.value)}
                                    required
                                    className="flex-grow p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border"
                                >
                                    <option value="" disabled>Selecione um ingrediente</option>
                                    {usage.ingredientId && <option value={usage.ingredientId}>{ingredients.find(i => i.id === usage.ingredientId)?.name}</option>}
                                    {availableIngredients.map(ing => (
                                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                                    ))}
                                </select>
                                <input 
                                    type="number"
                                    placeholder="Qtd."
                                    value={usage.quantityUsed || ''}
                                    onChange={e => handleUsageChange(index, 'quantityUsed', e.target.value)}
                                    required
                                    min="0"
                                    step="any"
                                    className="w-32 p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border"
                                />
                                <button type="button" onClick={() => removeUsageRow(index)}>
                                    <TrashIcon className="h-5 w-5 text-red-500"/>
                                </button>
                            </div>
                        ))}
                         <button type="button" onClick={addUsageRow} className="flex items-center gap-2 text-sm text-accent font-semibold mt-2">
                            <PlusIcon className="h-4 w-4"/>
                            Adicionar Item
                        </button>
                    </div>

                     <div>
                        <label htmlFor="report-notes" className="block text-sm font-medium mb-1">Observações (desperdícios, sobras, etc.)</label>
                        <textarea 
                            id="report-notes"
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full p-2 rounded bg-background dark:bg-dark-background border border-border-color dark:border-dark-border"
                        />
                    </div>
                     {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                </div>

                <div className="p-4 border-t border-border-color dark:border-dark-border mt-auto flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-dark-border hover:opacity-80 transition-opacity">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-blue-500 font-semibold transition-colors">Salvar Relatório</button>
                </div>
            </form>
        </div>
    );
};

export default UsageLogger;

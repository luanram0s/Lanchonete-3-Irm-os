import React, { useState, useEffect } from 'react';
import { Ingredient, UnitOfMeasure } from '../types';
import { saveIngredient, softDeleteIngredient } from '../services/api';
import { formatCurrencyBRL } from '../utils/formatters';
import { XMarkIcon } from './icons/XMarkIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import ConfirmationModal from './ConfirmationModal';

interface IngredientManagerProps {
    initialIngredients: Ingredient[];
    onClose: () => void;
    onSave: () => void;
    showToast: (message: string) => void;
}

const UNITS: UnitOfMeasure[] = ['un', 'kg', 'g', 'l', 'ml'];

const IngredientForm: React.FC<{ ingredient?: Ingredient; onSave: () => void; onCancel: () => void }> = ({ ingredient, onSave, onCancel }) => {
    const [name, setName] = useState(ingredient?.name || '');
    const [stock, setStock] = useState(ingredient?.stock || 0);
    const [price, setPrice] = useState(ingredient?.price || 0);
    const [unit, setUnit] = useState<UnitOfMeasure>(ingredient?.unit || 'un');
    const [supplier, setSupplier] = useState(ingredient?.supplier || '');
    const [category, setCategory] = useState(ingredient?.category || '');
    const [minStock, setMinStock] = useState(ingredient?.minStock || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ingredientData = { name, stock: Number(stock), price: Number(price), unit, supplier, category, minStock: Number(minStock) };
        await saveIngredient(ingredient ? { ...ingredientData, id: ingredient.id } : ingredientData);
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-background dark:bg-dark-background rounded-lg space-y-4">
             <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{ingredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <input type="text" placeholder="Nome do Ingrediente" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border" />
                <input type="text" placeholder="Categoria (ex: Pães, Carnes)" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border" />
                <input type="number" placeholder="Estoque Atual" value={stock} onChange={e => setStock(parseFloat(e.target.value))} required min="0" step="any" className="w-full p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border" />
                <input type="number" placeholder="Estoque Mínimo p/ Alerta" value={minStock} onChange={e => setMinStock(parseFloat(e.target.value))} min="0" step="any" className="w-full p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border" />
                <input type="number" placeholder="Preço Unitário (R$)" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required min="0" step="0.01" className="w-full p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border" />
                 <select value={unit} onChange={e => setUnit(e.target.value as any)} className="w-full p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <input type="text" placeholder="Fornecedor (opcional)" value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border md:col-span-2" />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-dark-border dark:hover:bg-gray-600 text-text-primary dark:text-dark-text-primary">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-accent text-white hover:bg-blue-500">Salvar</button>
            </div>
        </form>
    );
};


const IngredientManager: React.FC<IngredientManagerProps> = ({ initialIngredients, onClose, onSave, showToast }) => {
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null | 'new'>(null);
    const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);

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

    const handleSave = async () => {
        setEditingIngredient(null);
        onSave();
    };

    const handleDeleteClick = (ingredient: Ingredient) => {
        setIngredientToDelete(ingredient);
    };

    const confirmDelete = async () => {
        if(ingredientToDelete) {
            try {
                await softDeleteIngredient(ingredientToDelete.id);
                showToast(`✅ Ingrediente "${ingredientToDelete.name}" movido para a lixeira.`);
                setIngredientToDelete(null);
                onSave();
            } catch (error) {
                console.error('Failed to delete ingredient:', error);
                alert('Ocorreu um erro ao mover o ingrediente para a lixeira.');
            }
        }
    };
    
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-surface text-text-primary dark:bg-dark-surface dark:text-dark-text-primary rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-border-color dark:border-dark-border">
                        <h2 className="text-xl font-bold">Gerenciador de Ingredientes</h2>
                        <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    
                    <div className="p-4 overflow-y-auto space-y-4">
                        {editingIngredient && (
                            <IngredientForm 
                                ingredient={editingIngredient === 'new' ? undefined : editingIngredient} 
                                onSave={handleSave} 
                                onCancel={() => setEditingIngredient(null)} 
                            />
                        )}

                        <div className="flex justify-end">
                            <button onClick={() => setEditingIngredient('new')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white hover:bg-blue-500 transition-colors">
                                <PlusIcon className="h-5 w-5" />
                                Adicionar Ingrediente
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-dark-background">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase">Ingrediente</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase">Estoque</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase">Custo Unit.</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase">Categoria</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase">Fornecedor</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface dark:bg-dark-surface divide-y divide-border-color dark:divide-dark-border">
                                    {initialIngredients.map(i => (
                                        <tr key={i.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{i.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{i.stock.toLocaleString('pt-BR')} {i.unit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{formatCurrencyBRL(i.price)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{i.category || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{i.supplier || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setEditingIngredient(i)} className="p-2 hover:bg-gray-200 dark:hover:bg-dark-background rounded-full transition-colors"><PencilIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => handleDeleteClick(i)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"><TrashIcon className="h-5 w-5 text-red-500" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-4 border-t border-border-color dark:border-dark-border mt-auto">
                        <button onClick={onClose} className="w-full px-4 py-2 rounded-lg bg-gray-200 dark:bg-dark-border hover:opacity-80 transition-opacity">Fechar</button>
                    </div>
                </div>
            </div>
            {ingredientToDelete && (
                <ConfirmationModal
                    isOpen={!!ingredientToDelete}
                    onClose={() => setIngredientToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Mover para a Lixeira"
                    message={`Tem certeza que deseja excluir o ingrediente "${ingredientToDelete.name}"? Essa ação pode ser desfeita.`}
                />
            )}
        </>
    );
};

export default IngredientManager;

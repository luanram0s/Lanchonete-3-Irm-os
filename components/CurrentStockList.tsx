import React from 'react';
import { Ingredient } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface CurrentStockListProps {
    ingredients: Ingredient[];
    isLoading: boolean;
    onDelete: (ingredient: Ingredient) => void;
}

const CurrentStockList: React.FC<CurrentStockListProps> = ({ ingredients, isLoading, onDelete }) => {
    
    if (isLoading) {
        return (
             <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4 text-text-primary dark:text-dark-text-primary">Estoque Atual</h3>
                <div className="space-y-2 animate-pulse">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200 dark:bg-dark-border rounded-md"></div>)}
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4 text-text-primary dark:text-dark-text-primary">Estoque Atual de Ingredientes</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-dark-background">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Ingrediente</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Estoque Atual</th>
                            <th scope="col" className="relative px-4 py-3">
                                <span className="sr-only">Excluir</span>
                            </th>
                        </tr>
                    </thead>
                     <tbody className="bg-surface dark:bg-dark-surface divide-y divide-border-color dark:divide-dark-border">
                        {ingredients.map((ingredient) => {
                            const isLowStock = (ingredient.minStock ?? 0) > 0 && ingredient.stock <= (ingredient.minStock ?? 0);
                            return (
                                <tr key={ingredient.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-primary dark:text-dark-text-primary">{ingredient.name}</td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${isLowStock ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-text-secondary dark:text-dark-text-secondary'}`}>
                                        <div className="flex items-center">
                                            {isLowStock && <ExclamationTriangleIcon className="h-5 w-5 mr-2" />}
                                            <span>{ingredient.stock.toLocaleString('pt-BR')} {ingredient.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => onDelete(ingredient)}
                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                            aria-label={`Mover ${ingredient.name} para a lixeira`}
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                     </tbody>
                </table>
                 {ingredients.length === 0 && !isLoading && (
                     <p className="text-text-secondary dark:text-dark-text-secondary text-center py-8">
                        Nenhum ingrediente cadastrado.
                    </p>
                 )}
            </div>
        </div>
    )
}

export default CurrentStockList;
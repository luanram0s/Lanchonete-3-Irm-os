import React, { useState, useEffect } from 'react';
import { Product, Ingredient, RecipeItem } from '../types';
import { saveProduct, softDeleteProduct } from '../services/api';
import { formatCurrencyBRL } from '../utils/formatters';
import { XMarkIcon } from './icons/XMarkIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import ConfirmationModal from './ConfirmationModal';

interface ProductManagerProps {
    initialProducts: Product[];
    ingredients: Ingredient[];
    onClose: () => void;
    onSave: () => void;
    showToast: (message: string) => void;
}

const ProductForm: React.FC<{ product?: Product; ingredients: Ingredient[], onSave: () => void; onCancel: () => void }> = ({ product, ingredients, onSave, onCancel }) => {
    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.price || 0);
    const [category, setCategory] = useState(product?.category || 'Lanche');
    const [status, setStatus] = useState(product?.status === 'deleted' ? 'active' : (product?.status || 'active'));
    const [recipe, setRecipe] = useState<RecipeItem[]>(product?.recipe || []);

    // State for the "add ingredient" form
    const [newRecipeIngredientId, setNewRecipeIngredientId] = useState('');
    const [newRecipeQuantity, setNewRecipeQuantity] = useState<number>(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const productData = { name, price: Number(price), category, status, recipe };
        await saveProduct(product ? { ...productData, id: product.id } : productData);
        onSave();
    };
    
    const handleAddRecipeItem = () => {
        if (newRecipeIngredientId && newRecipeQuantity > 0) {
            setRecipe([...recipe, { ingredientId: newRecipeIngredientId, quantity: newRecipeQuantity }]);
            setNewRecipeIngredientId('');
            setNewRecipeQuantity(0);
        }
    };

    const handleRemoveRecipeItem = (index: number) => {
        setRecipe(recipe.filter((_, i) => i !== index));
    };

    const availableIngredients = ingredients.filter(ing => !recipe.some(item => item.ingredientId === ing.id));

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-background dark:bg-dark-background rounded-lg space-y-4">
             <h3 className="text-lg font-semibold">{product ? 'Editar Produto' : 'Novo Produto'}</h3>
            <input type="text" placeholder="Nome do Produto" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border" />
            <input type="number" placeholder="Preço" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required min="0" step="0.01" className="w-full p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border" />
            <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border">
                <option value="Lanche">Lanche</option>
                <option value="Bebida">Bebida</option>
                <option value="Combo">Combo</option>
                <option value="Sobremesa">Sobremesa</option>
            </select>
             <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-2 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
            </select>

             {/* NEW RECIPE SECTION */}
            <div className="pt-4 mt-4 border-t border-border-color dark:border-dark-border">
                <h4 className="text-md font-semibold mb-2 text-text-primary dark:text-dark-text-primary">Receita / Composição do Produto</h4>
                <div className="space-y-2 mb-3">
                    {recipe.length === 0 && <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Nenhum ingrediente adicionado.</p>}
                    {recipe.map((item, index) => {
                        const ingredient = ingredients.find(i => i.id === item.ingredientId);
                        if (!ingredient) return null;
                        return (
                            <div key={index} className="flex items-center justify-between p-2 bg-surface dark:bg-dark-surface rounded-md">
                                <span className="font-medium text-text-primary dark:text-dark-text-primary">{ingredient.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-text-secondary dark:text-dark-text-secondary">{item.quantity} {ingredient.unit}</span>
                                    <button type="button" onClick={() => handleRemoveRecipeItem(index)}>
                                        <TrashIcon className="h-5 w-5 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="p-2 bg-surface dark:bg-dark-surface rounded-md border border-border-color dark:border-dark-border">
                    <p className="text-sm font-medium mb-2 text-text-primary dark:text-dark-text-primary">Adicionar Ingrediente</p>
                    <div className="flex items-stretch gap-2">
                        <select
                            value={newRecipeIngredientId}
                            onChange={(e) => setNewRecipeIngredientId(e.target.value)}
                            className="flex-grow p-2 rounded bg-background dark:bg-dark-background border border-border-color dark:border-dark-border"
                        >
                            <option value="" disabled>Selecione...</option>
                            {availableIngredients.map(ing => (
                                <option key={ing.id} value={ing.id}>{ing.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Qtd."
                            min="0"
                            step="any"
                            value={newRecipeQuantity || ''}
                            onChange={(e) => setNewRecipeQuantity(Number(e.target.value))}
                            className="w-24 p-2 rounded bg-background dark:bg-dark-background border border-border-color dark:border-dark-border"
                        />
                        <button
                            type="button"
                            onClick={handleAddRecipeItem}
                            disabled={!newRecipeIngredientId || newRecipeQuantity <= 0}
                            className="px-3 py-2 bg-accent text-white rounded-md hover:bg-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
                        >
                           <PlusIcon className="h-5 w-5"/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-dark-border dark:hover:bg-gray-600 text-text-primary dark:text-dark-text-primary">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-accent text-white hover:bg-blue-500">Salvar</button>
            </div>
        </form>
    );
};


const ProductManager: React.FC<ProductManagerProps> = ({ initialProducts, ingredients, onClose, onSave, showToast }) => {
    const [editingProduct, setEditingProduct] = useState<Product | null | 'new'>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

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
        setEditingProduct(null);
        onSave();
    };

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
    };

    const confirmDelete = async () => {
        if (productToDelete) {
            await softDeleteProduct(productToDelete.id);
            showToast(`✅ "${productToDelete.name}" movido para a lixeira.`);
            setProductToDelete(null);
            onSave();
        }
    };
    
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-surface text-text-primary dark:bg-dark-surface dark:text-dark-text-primary rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-border-color dark:border-dark-border">
                        <h2 className="text-xl font-bold">Gerenciador de Produtos</h2>
                        <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    
                    <div className="p-4 overflow-y-auto space-y-4">
                        {editingProduct && (
                            <ProductForm 
                                product={editingProduct === 'new' ? undefined : editingProduct} 
                                ingredients={ingredients}
                                onSave={handleSave} 
                                onCancel={() => setEditingProduct(null)} 
                            />
                        )}

                        <div className="flex justify-end">
                            <button onClick={() => setEditingProduct('new')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white hover:bg-blue-500 transition-colors">
                                <PlusIcon className="h-5 w-5" />
                                Adicionar Produto
                            </button>
                        </div>

                        <div className="space-y-2">
                            {initialProducts.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-background dark:bg-dark-background rounded-lg">
                                    <div>
                                        <p className="font-semibold">{p.name} <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-accent/20 text-accent' : 'bg-gray-500 text-gray-100 dark:bg-gray-600 dark:text-dark-text-secondary'}`}>{p.status === 'active' ? 'Ativo' : 'Inativo'}</span></p>
                                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{p.category} - {formatCurrencyBRL(p.price)}</p>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                                            {p.recipe && p.recipe.length > 0 ? `${p.recipe.length} ingrediente(s) na receita.` : 'Sem receita definida.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEditingProduct(p)} className="p-2 hover:bg-surface dark:hover:bg-dark-surface rounded-full"><PencilIcon className="h-5 w-5" /></button>
                                        <button onClick={() => handleDeleteClick(p)} className="p-2 hover:bg-surface dark:hover:bg-dark-surface rounded-full"><TrashIcon className="h-5 w-5 text-red-500" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 border-t border-border-color dark:border-dark-border mt-auto">
                        <button onClick={onClose} className="w-full px-4 py-2 rounded-lg bg-gray-200 dark:bg-dark-border hover:opacity-80 transition-opacity">Fechar</button>
                    </div>
                </div>
            </div>
            {productToDelete && (
                <ConfirmationModal
                    isOpen={!!productToDelete}
                    onClose={() => setProductToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Mover para a Lixeira"
                    message={`Tem certeza que deseja excluir o produto "${productToDelete.name}"? Essa ação pode ser desfeita.`}
                />
            )}
        </>
    );
};

export default ProductManager;

import React, { useState, useEffect, useMemo } from 'react';
import { Product, OrderItem, PaymentMethod } from '../types';
import { formatCurrencyBRL } from '../utils/formatters';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface RegisterSaleProps {
    products: Product[];
    onGenerateNote: (items: OrderItem[], paymentMethod: PaymentMethod, attendantName: string, notes: string, amountReceived?: number, changeGiven?: number) => void;
    isLoading: boolean;
}

const CATEGORIES: Product['category'][] = ['Lanche', 'Bebida', 'Combo', 'Sobremesa'];

const PaymentMethodButton: React.FC<{ method: PaymentMethod; label: string; current: PaymentMethod; set: (method: PaymentMethod) => void }> = ({ method, label, current, set }) => (
    <button 
        onClick={() => set(method)}
        className={`flex-1 p-3 text-center font-semibold rounded-lg transition-all border-2 ${current === method ? 'bg-accent border-accent text-white' : 'bg-background dark:bg-dark-background border-transparent hover:border-accent text-text-primary dark:text-dark-text-primary'}`}
    >
        {label}
    </button>
);


const RegisterSale: React.FC<RegisterSaleProps> = ({ products, onGenerateNote, isLoading }) => {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'Todos' | Product['category']>('Todos');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
    const [attendantName, setAttendantName] = useState('');
    const [notes, setNotes] = useState('');
    const [amountReceived, setAmountReceived] = useState('');

    useEffect(() => {
        const savedName = localStorage.getItem('attendantName');
        if (savedName) {
            setAttendantName(savedName);
        }
    }, []);

    const handleAttendantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAttendantName(e.target.value);
        localStorage.setItem('attendantName', e.target.value);
    };

    const addToOrder = (product: Product) => {
        setOrderItems(prevItems => {
            const existingItem = prevItems.find(item => item.productId === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.price }];
        });
    };
    
    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setOrderItems(prev => prev.filter(item => item.productId !== productId));
        } else {
            setOrderItems(prev => prev.map(item => item.productId === productId ? {...item, quantity: newQuantity} : item));
        }
    };

    const total = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const changeGiven = useMemo(() => {
        if (paymentMethod !== 'dinheiro') return 0;
        const received = parseFloat(amountReceived);
        if (!isNaN(received) && received >= total) {
            return received - total;
        }
        return 0;
    }, [amountReceived, total, paymentMethod]);

    const filteredProducts = useMemo(() => {
        return products
            .filter(p => selectedCategory === 'Todos' || p.category === selectedCategory)
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, selectedCategory, searchTerm]);

    const handleGenerateNote = () => {
        const received = parseFloat(amountReceived);
        onGenerateNote(
            orderItems,
            paymentMethod,
            attendantName,
            notes,
            paymentMethod === 'dinheiro' && !isNaN(received) ? received : undefined,
            paymentMethod === 'dinheiro' ? changeGiven : undefined
        );
        setOrderItems([]);
        setNotes('');
        setSearchTerm('');
        setSelectedCategory('Todos');
        setAmountReceived('');
    };
    
    const isCashPaymentInvalid = paymentMethod === 'dinheiro' && (parseFloat(amountReceived) < total || amountReceived === '');

    return (
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-md h-full flex flex-col">
            <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Novo Pedido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[400px]">
                {/* Product List */}
                <div className="flex flex-col border border-border-color dark:border-dark-border rounded-lg p-2">
                     <input 
                        type="text" 
                        placeholder="Buscar produto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 mb-2 rounded bg-background dark:bg-dark-background border border-border-color dark:border-dark-border focus:ring-accent focus:border-accent"
                    />
                    <div className="flex flex-wrap gap-2 mb-2">
                        <button onClick={() => setSelectedCategory('Todos')} className={`px-3 py-1 text-sm rounded-full ${selectedCategory === 'Todos' ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-dark-border text-text-primary dark:text-dark-text-primary'}`}>Todos</button>
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 text-sm rounded-full ${selectedCategory === cat ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-dark-border text-text-primary dark:text-dark-text-primary'}`}>{cat}</button>
                        ))}
                    </div>
                    <div className="flex-grow overflow-y-auto pr-1 border-t border-border-color dark:border-dark-border pt-2">
                        {isLoading ? <p className="text-center p-4 text-text-secondary dark:text-dark-text-secondary">Carregando produtos...</p> : 
                            filteredProducts.map(product => (
                                <button key={product.id} onClick={() => addToOrder(product)} className="w-full text-left flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-md transition-colors">
                                    <div>
                                        <p className="font-semibold text-text-primary dark:text-dark-text-primary">{product.name}</p>
                                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{formatCurrencyBRL(product.price)}</p>
                                    </div>
                                    <PlusIcon className="h-5 w-5 text-accent" />
                                </button>
                            ))
                        }
                         {filteredProducts.length === 0 && !isLoading && <p className="text-center p-4 text-text-secondary dark:text-dark-text-secondary">Nenhum produto encontrado.</p>}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="flex flex-col border-2 border-dashed border-border-color dark:border-dark-border rounded-lg p-2">
                    <h4 className="font-bold text-text-primary dark:text-dark-text-primary mb-2">Resumo do Pedido</h4>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                        {orderItems.length === 0 ? <p className="text-center text-text-secondary dark:text-dark-text-secondary p-4">Adicione produtos ao pedido.</p> :
                            orderItems.map(item => (
                                <div key={item.productId} className="flex items-center justify-between bg-background dark:bg-dark-background p-2 rounded-md">
                                    <div>
                                        <p className="font-semibold text-text-primary dark:text-dark-text-primary">{item.productName}</p>
                                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{formatCurrencyBRL(item.unitPrice)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)} className="w-14 p-1 text-center rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border" />
                                        <button onClick={() => updateQuantity(item.productId, 0)}><TrashIcon className="h-5 w-5 text-text-secondary dark:text-dark-text-secondary hover:text-red-500" /></button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div className="mt-auto pt-2">
                        <div className="space-y-2 mt-4">
                             <input type="text" placeholder="* Nome do Atendente" value={attendantName} onChange={handleAttendantNameChange} required className="w-full p-2 rounded bg-background dark:bg-dark-background border border-border-color dark:border-dark-border" />
                             <textarea placeholder="Observações (ex: sem cebola)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full p-2 rounded bg-background dark:bg-dark-background border border-border-color dark:border-dark-border"></textarea>
                             
                            {paymentMethod === 'dinheiro' && orderItems.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 p-2 bg-background dark:bg-dark-background rounded-lg">
                                    <div>
                                        <label htmlFor="amount-received" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">Valor Recebido</label>
                                        <input 
                                            type="number"
                                            id="amount-received"
                                            value={amountReceived}
                                            onChange={(e) => setAmountReceived(e.target.value)}
                                            placeholder="0,00"
                                            min={total}
                                            step="0.01"
                                            className="w-full p-2 mt-1 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">Troco</label>
                                        <div className="w-full p-2 mt-1 rounded bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border font-bold text-accent h-[42px] flex items-center">
                                            {formatCurrencyBRL(changeGiven)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium mb-2 block text-text-primary dark:text-dark-text-primary">Forma de Pagamento</label>
                                <div className="flex gap-2">
                                    <PaymentMethodButton method="dinheiro" label="Dinheiro" current={paymentMethod} set={setPaymentMethod} />
                                    <PaymentMethodButton method="pix" label="Pix" current={paymentMethod} set={setPaymentMethod} />
                                    <PaymentMethodButton method="cartao" label="Cartão" current={paymentMethod} set={setPaymentMethod} />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-bold my-3 text-text-primary dark:text-dark-text-primary">
                            <span>Total:</span>
                            <span>{formatCurrencyBRL(total)}</span>
                        </div>
                        <button onClick={handleGenerateNote} disabled={orderItems.length === 0 || !attendantName.trim() || isCashPaymentInvalid} className="w-full p-3 rounded-lg bg-accent text-white font-bold text-lg hover:bg-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                            Gerar Nota
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterSale;
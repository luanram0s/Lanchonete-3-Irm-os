import React, { useState, useEffect, useCallback } from 'react';
import { Sale, Receipt } from '../types';
import { formatCurrencyBRL, formatDateTimeLocal } from '../utils/formatters';
import { XMarkIcon } from './icons/XMarkIcon';
import { saveReceipt, getReceipt, softDeleteReceipt } from '../services/api';
import { CameraIcon } from './icons/CameraIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { ArrowUpTrayIcon } from './icons/ArrowUpTrayIcon';

interface OrderSlipProps {
    sale: Sale;
    onClose: () => void;
    onReceiptUpdate: () => void;
    showToast: (message: string) => void;
}

const ReceiptUploader: React.FC<{ sale: Sale, onUploadSuccess: () => void, showToast: (message: string) => void }> = ({ sale, onUploadSuccess, showToast }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [existingReceipt, setExistingReceipt] = useState<Receipt | null>(null);

    const fetchReceipt = useCallback(async () => {
        const receipt = await getReceipt(sale.id);
        setExistingReceipt(receipt);
    }, [sale.id]);

    useEffect(() => {
        fetchReceipt();
    }, [fetchReceipt]);

    const handleFileChange = (selectedFile: File | null) => {
        if (!selectedFile) return;

        setError('');
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('Arquivo muito grande. Limite de 5MB.');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Formato inválido. Use JPG, PNG ou PDF.');
            return;
        }

        setFile(selectedFile);
        if (selectedFile.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview('pdf');
        }
    };

    const handleSave = async () => {
        if (!file) return;
        setIsUploading(true);
        setError('');
        try {
            await saveReceipt(sale.id, file);
            setFile(null);
            setPreview(null);
            await fetchReceipt(); // Refetch to show the saved receipt
            onUploadSuccess();
        } catch (e) {
            setError('Falha no upload. Tente novamente.');
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleRemoveSaved = async () => {
        if (window.confirm("Tem certeza que quer mover este comprovante para a lixeira?")) {
            await softDeleteReceipt(sale.id);
            showToast(`✅ Comprovante "${existingReceipt?.fileName}" movido para a lixeira.`);
            setExistingReceipt(null);
            onUploadSuccess();
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };
    
    if (existingReceipt) {
        return (
             <div className="mt-4 text-center p-3 rounded-lg bg-dark-background border border-dark-border">
                <p className="text-sm font-semibold text-green-400 mb-2">Comprovante Salvo!</p>
                <p className="text-xs text-dark-text-secondary truncate">{existingReceipt.fileName}</p>
                 <button onClick={handleRemoveSaved} className="text-xs text-red-500 hover:underline mt-2">Mover para lixeira</button>
            </div>
        )
    }

    return (
        <div className="mt-4 space-y-3">
            <div 
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                onDrop={handleDrop}
                onClick={() => document.getElementById(`file-upload-${sale.id}`)?.click()}
                className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragOver ? 'border-accent bg-dark-primary/20' : 'border-dark-border hover:border-accent'}`}
            >
                <input type="file" id={`file-upload-${sale.id}`} className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                <ArrowUpTrayIcon className="h-8 w-8 mx-auto text-dark-text-secondary mb-1" />
                <p className="text-sm font-semibold text-dark-text-primary">Arraste ou clique para enviar</p>
                <p className="text-xs text-dark-text-secondary">JPG, PNG, PDF - Máx 5MB</p>
            </div>

            {preview && file && (
                <div className="flex items-center justify-between p-2 bg-dark-background rounded-md">
                    <div className="flex items-center gap-3">
                        {preview === 'pdf' ? <DocumentIcon className="h-8 w-8 text-accent"/> : <img src={preview} alt="Preview" className="h-10 w-10 rounded object-cover" />}
                        <span className="text-sm text-dark-text-primary truncate max-w-[150px]">{file.name}</span>
                    </div>
                    <button onClick={() => { setFile(null); setPreview(null); }}><XMarkIcon className="h-5 w-5 text-red-500"/></button>
                </div>
            )}
            
            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
                onClick={handleSave}
                disabled={!file || isUploading}
                className="w-full px-4 py-2 rounded-lg bg-accent text-white font-semibold transition-colors hover:bg-blue-500 disabled:bg-gray-600"
            >
                {isUploading ? 'Salvando...' : 'Salvar Comprovante'}
            </button>
        </div>
    );
};

const OrderSlip: React.FC<OrderSlipProps> = ({ sale, onClose, onReceiptUpdate, showToast }) => {
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

    const paymentMethodLabels: Record<Sale['paymentMethod'], string> = {
        dinheiro: 'Dinheiro',
        pix: 'Pix',
        cartao: 'Cartão'
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-2xl w-full max-w-sm flex flex-col no-print text-text-primary dark:text-dark-text-primary">
                 <div className="flex justify-between items-center p-4 border-b border-border-color dark:border-dark-border">
                    <h2 className="text-xl font-bold">Nota do Pedido</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {/* This is the printable content */}
                    <div id="printable-area" className="bg-white text-black p-4 font-sans">
                         <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold" style={{ color: '#003366' }}>Lanchonete 3 Irmãos</h1>
                            <p className="text-sm">Nota de Pedido</p>
                        </div>
                        <div className="flex justify-between border-b pb-2 mb-2 text-sm">
                            <span>Pedido: <span className="font-bold">{sale.orderNumber}</span></span>
                            <span>{formatDateTimeLocal(sale.timestamp)}</span>
                        </div>
                        {sale.attendantName && <p className="text-sm mb-4">Atendente: {sale.attendantName}</p>}
                        
                        <table className="w-full text-sm mb-4">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-1">Item</th>
                                    <th className="text-center py-1">Qtd</th>
                                    <th className="text-right py-1">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.items.map(item => (
                                    <tr key={item.productId}>
                                        <td className="py-1">{item.productName}</td>
                                        <td className="text-center py-1">{item.quantity}</td>
                                        <td className="text-right py-1">{formatCurrencyBRL(item.unitPrice * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="border-t-2 border-dashed pt-2 space-y-1">
                             <div className="flex justify-between font-bold text-lg">
                                <span>TOTAL</span>
                                <span>{formatCurrencyBRL(sale.totalAmount)}</span>
                            </div>
                            {sale.paymentMethod === 'dinheiro' && sale.amountReceived != null && sale.changeGiven != null && (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span>Valor Recebido</span>
                                        <span>{formatCurrencyBRL(sale.amountReceived)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span>Troco</span>
                                        <span>{formatCurrencyBRL(sale.changeGiven)}</span>
                                    </div>
                                </>
                            )}
                            <p className="text-sm pt-1">Pagamento: {paymentMethodLabels[sale.paymentMethod]}</p>
                        </div>

                        {sale.notes && (
                            <div className="mt-4 border-t pt-2">
                                <p className="font-bold text-sm">Observações:</p>
                                <p className="text-sm whitespace-pre-wrap">{sale.notes}</p>
                            </div>
                        )}
                        
                        <div className="text-center mt-8 text-sm">
                            <p>🧡 Obrigado por comprar na Lanchonete 3 Irmãos! Volte sempre!</p>
                        </div>
                    </div>

                    {/* Receipt Uploader Section */}
                    <div className="mt-4 pt-4 border-t border-dark-border">
                        <h3 className="font-bold text-lg text-center text-dark-text-primary mb-2">Anexar Comprovante</h3>
                        <ReceiptUploader sale={sale} onUploadSuccess={onReceiptUpdate} showToast={showToast} />
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

export default OrderSlip;

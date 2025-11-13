import React, { useState, useEffect } from 'react';
import { Sale, Receipt } from '../types';
import { getReceipt } from '../services/api';
import { XMarkIcon } from './icons/XMarkIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';

interface ReceiptViewerProps {
    sale: Sale;
    onClose: () => void;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ sale, onClose }) => {
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        const fetchReceipt = async () => {
            setIsLoading(true);
            try {
                const data = await getReceipt(sale.id);
                setReceipt(data);
            } catch (error) {
                console.error("Failed to fetch receipt:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReceipt();
    }, [sale.id]);
    
    const handleDownload = () => {
        if (!receipt) return;
        const link = document.createElement('a');
        link.href = receipt.fileData;
        link.download = `comprovante_${sale.orderNumber}_${new Date(receipt.uploadedAt).toISOString().split('T')[0]}.${receipt.fileName.split('.').pop()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-dark-surface rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col text-dark-text-primary" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h2 className="text-xl font-bold">Comprovante: {sale.orderNumber}</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>

                <div className="p-4 flex-grow overflow-y-auto flex items-center justify-center">
                    {isLoading && <p>Carregando...</p>}
                    {!isLoading && !receipt && <p>Comprovante não encontrado.</p>}
                    {!isLoading && receipt && (
                        receipt.fileType.startsWith('image/') ? (
                            <img src={receipt.fileData} alt={`Comprovante para ${sale.orderNumber}`} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="text-center">
                                <DocumentArrowDownIcon className="h-24 w-24 mx-auto text-accent" />
                                <p className="mt-4 font-semibold">{receipt.fileName}</p>
                                <p className="text-sm text-dark-text-secondary">Pronto para download.</p>
                            </div>
                        )
                    )}
                </div>

                <div className="p-4 border-t border-dark-border mt-auto flex gap-4">
                    <button onClick={onClose} className="w-full px-4 py-3 rounded-lg bg-dark-border hover:bg-opacity-80 font-semibold transition-opacity">Fechar</button>
                     {!isLoading && receipt && (
                        <button onClick={handleDownload} className="w-full px-4 py-3 rounded-lg bg-accent text-white hover:bg-blue-500 font-semibold transition-colors flex items-center justify-center gap-2">
                           <DocumentArrowDownIcon className="h-5 w-5" /> Download
                        </button>
                     )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptViewer;

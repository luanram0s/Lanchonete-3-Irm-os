
import React from 'react';
import { Bid } from '../types';
import { formatCurrencyBRL, formatDateTimeLocal } from '../utils/formatters';

interface BidsTableProps {
  bids: Bid[];
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
  totalBids: number;
  bidsPerPage: number;
}

const BidsTable: React.FC<BidsTableProps> = ({ bids, isLoading, page, setPage, totalBids, bidsPerPage }) => {
    const totalPages = Math.ceil(totalBids / bidsPerPage);
    
    if (isLoading && bids.length === 0) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-gray-200 dark:bg-gray-700 h-12 rounded-md animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (!isLoading && bids.length === 0) {
        return (
            <div className="text-center py-10 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Nenhum lance encontrado para o período selecionado.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuário</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor do Lance</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data e Hora</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {bids.map((bid) => (
                        <tr key={bid.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{bid.userId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrencyBRL(bid.amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDateTimeLocal(bid.timestamp)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 px-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Página {page} de {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    );
};

export default BidsTable;

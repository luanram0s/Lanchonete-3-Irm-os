
import React from 'react';
import { AuctionWithMetrics } from '../types';
import { formatCurrencyBRL } from '../utils/formatters';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface AuctionCardProps {
  auction: AuctionWithMetrics;
  onViewDetails: (id: string) => void;
}

const statusClasses: Record<AuctionWithMetrics['status'], string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    upcoming: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
};

const statusText: Record<AuctionWithMetrics['status'], string> = {
    active: 'Ativo',
    closed: 'Fechado',
    upcoming: 'Em Breve'
};

const AuctionCard: React.FC<AuctionCardProps> = ({ auction, onViewDetails }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{auction.title}</h3>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[auction.status]}`}>
                {statusText[auction.status]}
            </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">{auction.metrics.totalBids.toLocaleString('pt-BR')}</p>
                    <p>Lances</p>
                </div>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
                 <span className="text-lg font-bold mr-2 text-indigo-500">R$</span>
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrencyBRL(auction.metrics.totalRevenue)}</p>
                    <p>Receita</p>
                </div>
            </div>
        </div>

        {auction.metrics.lastBid && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md text-sm mb-6">
                <p className="text-gray-500 dark:text-gray-400">Último Lance:</p>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {formatCurrencyBRL(auction.metrics.lastBid.amount)} por <span className="text-indigo-600 dark:text-indigo-400">{auction.metrics.lastBid.user}</span>
                </p>
            </div>
        )}

        <button
          onClick={() => onViewDetails(auction.id)}
          className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Ver Histórico
        </button>
      </div>
    </div>
  );
};

export default AuctionCard;

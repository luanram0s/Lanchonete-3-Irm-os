
import React, { useState, useEffect, useCallback } from 'react';
import { getAuctionDetails, getBidsForAuction } from '../services/api';
import { Auction, Bid, TimeFilter } from '../types';
import { exportBidsToCSV } from '../utils/formatters';
import BidsChart from './BidsChart';
import BidsTable from './BidsTable';
import FilterButtons from './FilterButtons';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';

interface AuctionDetailProps {
  auctionId: string;
  onBack: () => void;
}

const BIDS_PER_PAGE = 10;

const AuctionDetail: React.FC<AuctionDetailProps> = ({ auctionId, onBack }) => {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [totalBids, setTotalBids] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TimeFilter>(TimeFilter.Last7Days);
  const [page, setPage] = useState(1);

  const fetchBids = useCallback(async (currentAuctionId: string, currentFilter: TimeFilter, currentPage: number) => {
    try {
      setIsLoading(true);
      const [auctionDetails, bidsData] = await Promise.all([
          getAuctionDetails(currentAuctionId),
          getBidsForAuction(currentAuctionId, currentFilter, currentPage, BIDS_PER_PAGE)
      ]);

      if (auctionDetails) setAuction(auctionDetails);
      setBids(bidsData.bids);
      setTotalBids(bidsData.total);
    } catch (error) {
      console.error("Failed to fetch auction data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBids(auctionId, filter, page);
  }, [auctionId, filter, page, fetchBids]);

  const handleFilterChange = (newFilter: TimeFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page on filter change
  };
  
  const handleExport = async () => {
    try {
        // Fetch all bids for the current filter to export
        const { bids: allBids } = await getBidsForAuction(auctionId, filter, 1, 10000); // A large limit to get all
        if (auction) {
            exportBidsToCSV(allBids, auction.title);
        }
    } catch (error) {
        console.error("Failed to export data:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Voltar para todos os leilões
          </button>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{auction?.title || 'Carregando...'}</h2>
        </div>
        <div className="flex items-center gap-4">
            <FilterButtons activeFilter={filter} onFilterChange={handleFilterChange} />
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Exportar CSV
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Lances por Hora</h3>
        <BidsChart bids={bids} isLoading={isLoading} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Histórico de Lances</h3>
        <BidsTable 
            bids={bids} 
            isLoading={isLoading} 
            page={page} 
            setPage={setPage} 
            totalBids={totalBids}
            bidsPerPage={BIDS_PER_PAGE} 
        />
      </div>
    </div>
  );
};

export default AuctionDetail;

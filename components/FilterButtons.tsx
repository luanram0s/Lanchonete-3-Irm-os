
import React from 'react';
import { TimeFilter } from '../types';

interface FilterButtonsProps {
  activeFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { key: TimeFilter.Today, label: 'Hoje' },
    { key: TimeFilter.Last7Days, label: '7 Dias' },
    { key: TimeFilter.Last30Days, label: '30 Dias' },
  ];

  return (
    <div className="flex space-x-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
      {filters.map(filter => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none ${
            activeFilter === filter.key
              ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;

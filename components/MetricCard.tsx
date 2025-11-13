import React from 'react';
import { formatCurrencyBRL } from '../utils/formatters';

interface MetricCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    isCurrency?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, isCurrency = false }) => {
    const displayValue = isCurrency ? formatCurrencyBRL(value) : value.toLocaleString('pt-BR');

    return (
        <div className="bg-surface dark:bg-dark-surface p-3 rounded-lg shadow-md flex items-center">
            <div className="p-2 bg-primary/10 dark:bg-dark-primary/20 rounded-full mr-3">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">{title}</p>
                <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">{displayValue}</p>
            </div>
        </div>
    );
};

export default MetricCard;
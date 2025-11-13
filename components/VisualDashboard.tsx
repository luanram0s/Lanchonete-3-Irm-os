import React, { useMemo } from 'react';
import { Ingredient, DailyUsageReport } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { formatCurrencyBRL } from '../utils/formatters';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface VisualDashboardProps {
    ingredients: Ingredient[];
    reports: DailyUsageReport[];
}

const COLORS = ['#003366', '#1E90FF', '#4682B4', '#87CEEB', '#B0C4DE']; // Blue-themed colors

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 text-sm bg-gray-800 text-white rounded-md shadow-lg border border-gray-700">
                <p className="font-bold">{label}</p>
                <p>{`${payload[0].name}: ${formatCurrencyBRL(payload[0].value)}`}</p>
            </div>
        );
    }
    return null;
};

const VisualDashboard: React.FC<VisualDashboardProps> = ({ ingredients, reports }) => {
    // 1. Low Stock Alerts
    const lowStockItems = useMemo(() => {
        return ingredients.filter(i => (i.minStock ?? 0) > 0 && i.stock <= (i.minStock ?? 0));
    }, [ingredients]);

    // 2. Cost by Category Data
    const costByCategory = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        reports.forEach(report => {
            report.usages.forEach(usage => {
                const ingredient = ingredients.find(i => i.id === usage.ingredientId);
                const category = ingredient?.category || 'Sem Categoria';
                categoryMap[category] = (categoryMap[category] || 0) + usage.cost;
            });
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    }, [reports, ingredients]);

    // 3. Daily Cost Data (Last 7 days)
    const dailyCostLast7Days = useMemo(() => {
        const last7Reports = [...reports].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
        return last7Reports.map(report => ({
            name: new Date(report.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            'Custo Total': report.totalCost,
        })).reverse(); // Reverse to show chronologically
    }, [reports]);

    // 4. Top 5 Most Expensive Ingredients (by total cost in reports)
    const topExpensiveIngredients = useMemo(() => {
        const ingredientCostMap: { [key: string]: { name: string, totalCost: number } } = {};
        reports.forEach(report => {
            report.usages.forEach(usage => {
                if (!ingredientCostMap[usage.ingredientId]) {
                    ingredientCostMap[usage.ingredientId] = { name: usage.ingredientName, totalCost: 0 };
                }
                ingredientCostMap[usage.ingredientId].totalCost += usage.cost;
            });
        });
        return Object.values(ingredientCostMap).sort((a,b) => b.totalCost - a.totalCost).slice(0, 5);
    }, [reports]);
    
    return (
        <div className="space-y-4">
            {/* Stock Alerts */}
            <div className="bg-surface dark:bg-dark-surface p-3 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-3 text-text-primary dark:text-dark-text-primary">Alertas de Estoque</h3>
                {lowStockItems.length > 0 ? (
                    <div className="space-y-2">
                        {lowStockItems.map(item => (
                            <div key={item.id} className="flex items-center p-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-md text-sm">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                                <p><span className="font-bold">{item.name}</span> está com estoque baixo ({item.stock} {item.unit}). Mínimo: {item.minStock} {item.unit}.</p>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="flex items-center p-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-md text-sm">
                        <CheckCircleIcon className="h-5 w-5 mr-3" />
                        <p className="font-semibold">Estoque estável. Nenhum item abaixo do mínimo.</p>
                    </div>
                )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface dark:bg-dark-surface p-3 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4 text-text-primary dark:text-dark-text-primary">Custo por Categoria</h3>
                    {costByCategory.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={costByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {costByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <div className="text-center text-text-secondary dark:text-dark-text-secondary h-[300px] flex items-center justify-center">Sem dados de custo para exibir.</div>}
                </div>

                <div className="bg-surface dark:bg-dark-surface p-3 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4 text-text-primary dark:text-dark-text-primary">Custo Diário (Últimos 7 dias)</h3>
                     {dailyCostLast7Days.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={dailyCostLast7Days} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                    <XAxis dataKey="name" tick={{ fill: 'rgb(107 114 128)', fontSize: 12 }} />
                                    <YAxis tickFormatter={(value) => formatCurrencyBRL(value as number)} tick={{ fill: 'rgb(107 114 128)', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="Custo Total" fill="#1E90FF" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                     ): <div className="text-center text-text-secondary dark:text-dark-text-secondary h-[300px] flex items-center justify-center">Sem dados dos últimos 7 dias.</div>}
                </div>
            </div>
            
             <div className="bg-surface dark:bg-dark-surface p-3 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4 text-text-primary dark:text-dark-text-primary">Top 5 Ingredientes por Custo Total</h3>
                {topExpensiveIngredients.length > 0 ? (
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={topExpensiveIngredients.slice().reverse()}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis type="number" tickFormatter={(value) => formatCurrencyBRL(value as number)} tick={{ fill: 'rgb(107 114 128)', fontSize: 12 }} />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'rgb(107 114 128)', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="totalCost" name="Custo Total" fill="#003366" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : <div className="text-center text-text-secondary dark:text-dark-text-secondary h-[250px] flex items-center justify-center">Sem dados de custo para exibir.</div>}
            </div>
        </div>
    );
};

export default VisualDashboard;
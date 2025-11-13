
import { Sale, Bid, DailyUsageReport } from '../types';

export const formatCurrencyBRL = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatDateTimeLocal = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

export const formatDateLocal = (isoDateString: string): string => {
    const date = new Date(isoDateString);
     // Add time zone offset to prevent date from changing
    const offset = date.getTimezoneOffset();
    const correctedDate = new Date(date.getTime() + (offset * 60 * 1000));
    return correctedDate.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const exportSalesToCSV = (sales: Sale[], timeFilter: string) => {
  const headers = ['Nº Pedido', 'Data', 'Atendente', 'Itens', 'Observações', 'Forma de Pagamento', 'Valor Total'];
  const rows = sales.map(sale => [
    sale.orderNumber,
    new Date(sale.timestamp).toLocaleString('pt-BR'),
    sale.attendantName || 'N/A',
    sale.items.map(item => `${item.quantity}x ${item.productName}`).join('; '),
    sale.notes || '',
    sale.paymentMethod,
    formatCurrencyBRL(sale.totalAmount)
  ]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => `"${e.join('","')}"`).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `relatorio_vendas_${timeFilter}.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
};

export const exportInventoryToCSV = (reports: DailyUsageReport[]) => {
  const headers = ['Data', 'Ingrediente', 'Quantidade Usada', 'Unidade', 'Custo', 'Observações do Dia'];
  const rows = reports.flatMap(report => 
      report.usages.map(usage => [
          report.date,
          usage.ingredientName,
          usage.quantityUsed,
          usage.unit,
          formatCurrencyBRL(usage.cost),
          report.notes || ''
      ])
  );

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => `"${e.join('","')}"`).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `relatorio_inventario.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
};


// FIX: Added exportBidsToCSV function to handle exporting bid history as a CSV file.
export const exportBidsToCSV = (bids: Bid[], auctionTitle: string) => {
  const headers = ['ID do Lance', 'Usuário', 'Valor', 'Data e Hora'];
  const rows = bids.map(bid => [
    bid.id,
    bid.userId,
    formatCurrencyBRL(bid.amount),
    new Date(bid.timestamp).toLocaleString('pt-BR'),
  ]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => `"${e.join('","')}"`).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `historico_lances_${auctionTitle.replace(/\s+/g, '_').toLowerCase()}.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
};

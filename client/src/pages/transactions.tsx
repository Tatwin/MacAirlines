import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { IndianRupee, Receipt, Clock, Download, Eye, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Transaction } from '@shared/schema';

export default function TransactionsPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate]);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: () => apiClient.getUserTransactions(),
    enabled: isAuthenticated && user?.role === 'customer',
  });

  const filteredTransactions = transactions?.filter((transaction: Transaction) => {
    if (statusFilter !== 'all' && transaction.status !== statusFilter) {
      return false;
    }
    
    if (timeRange !== 'all') {
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();
      const daysAgo = parseInt(timeRange);
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      return transactionDate >= cutoffDate;
    }
    
    return true;
  }) || [];

  const getSummaryStats = () => {
    if (!transactions) return { totalSpent: 0, totalBookings: 0, pending: 0 };
    
    const totalSpent = transactions
      .filter((t: Transaction) => t.status === 'completed')
      .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0);
    
    const totalBookings = transactions.length;
    
    const pending = transactions
      .filter((t: Transaction) => t.status === 'pending')
      .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0);
    
    return { totalSpent, totalBookings, pending };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadReceipt = (transactionId: string) => {
    // Create download link for receipt
    const transaction = transactions?.find((t: Transaction) => t.id === transactionId);
    if (transaction) {
      const receiptData = {
        transactionId: transaction.id,
        bookingRef: transaction.bookingReference,
        amount: transaction.amount,
        date: new Date(transaction.createdAt).toLocaleDateString('en-IN'),
        paymentMethod: transaction.paymentMethod,
        status: transaction.status
      };
      
      const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MacAirlines_Receipt_${transaction.bookingReference}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleViewTransaction = (transactionId: string) => {
    // Implement transaction details view
    console.log('View transaction:', transactionId);
  };

  if (!isAuthenticated || user?.role !== 'customer') {
    return null;
  }

  const summaryStats = getSummaryStats();

  return (
    <div className="min-h-screen bg-gray-50" data-testid="transactions-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
            <p className="text-gray-600">View all your booking payments and refunds</p>
          </div>
          
          {/* Filters */}
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40" data-testid="time-range-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 flex items-center" data-testid="total-spent">
                    <IndianRupee className="h-5 w-5 mr-1" />
                    {new Intl.NumberFormat('en-IN').format(summaryStats.totalSpent)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="total-bookings">
                    {summaryStats.totalBookings}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 flex items-center" data-testid="pending-amount">
                    <IndianRupee className="h-5 w-5 mr-1" />
                    {new Intl.NumberFormat('en-IN').format(summaryStats.pending)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading transactions...</span>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction: Transaction) => (
                      <tr key={transaction.id} data-testid={`transaction-row-${transaction.transactionNumber}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-medium text-gray-900">
                            {transaction.transactionNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.bookingReference}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            transaction.status === 'refunded' ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            <div className="flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {transaction.status === 'refunded' ? '+' : ''}{new Intl.NumberFormat('en-IN').format(parseFloat(transaction.amount))}
                            </div>
                          </div>
                          {transaction.status === 'refunded' && (
                            <div className="text-xs text-gray-500">Refund</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {transaction.paymentMethod === 'card' ? (
                              <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                            ) : (
                              <span className="text-blue-600 mr-2">PayPal</span>
                            )}
                            <span className="text-sm text-gray-900">{transaction.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReceipt(transaction.id)}
                              data-testid={`download-receipt-${transaction.transactionNumber}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTransaction(transaction.id)}
                              data-testid={`view-transaction-${transaction.transactionNumber}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16" data-testid="empty-transactions-state">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Receipt className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600 mb-8">Your transaction history will appear here once you make your first booking.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

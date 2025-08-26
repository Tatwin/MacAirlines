import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { TicketCard } from '@/components/ticket-card';
import { Plane, Ticket as TicketIcon, Plus } from 'lucide-react';
import type { Ticket, Flight, Passenger } from '@shared/schema';
import { useEffect } from 'react';

export default function TicketsPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate]);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['/api/tickets'],
    queryFn: () => apiClient.getUserTickets(),
    enabled: isAuthenticated && user?.role === 'customer',
  });

  // Ticket action mutations
  const checkInMutation = useMutation({
    mutationFn: (ticketId: string) => apiClient.checkInTicket(ticketId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Checked in successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelTicketMutation = useMutation({
    mutationFn: (ticketId: string) => apiClient.cancelTicket(ticketId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ticket cancelled successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ticket action handlers
  const handleCheckIn = (ticketId: string) => {
    checkInMutation.mutate(ticketId);
  };

  const handleCancelBooking = (ticketId: string) => {
    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      cancelTicketMutation.mutate(ticketId);
    }
  };

  const handleChangeSeat = (ticketId: string) => {
    // Navigate to seat selection page with ticket ID
    navigate(`/change-seat/${ticketId}`);
  };

  const handleViewDetails = (ticketId: string) => {
    // Navigate to ticket details page
    navigate(`/ticket/${ticketId}`);
  };

  const handleBookNewFlight = () => {
    navigate('/');
  };

  if (!isAuthenticated || user?.role !== 'customer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="tickets-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
            <p className="text-gray-600">View and manage your flight bookings</p>
          </div>
          <Button
            onClick={handleBookNewFlight}
            className="mt-4 md:mt-0 flex items-center space-x-2"
            data-testid="book-new-flight-button"
          >
            <Plus className="h-4 w-4" />
            <span>Book New Flight</span>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Loading tickets...</span>
          </div>
        )}

        {/* Tickets List */}
        {tickets && tickets.length > 0 ? (
          <div className="space-y-6">
            {tickets.map((ticket: Ticket & { flight: Flight; passenger: Passenger }) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onCheckIn={() => handleCheckIn(ticket.id)}
                onCancelBooking={() => handleCancelBooking(ticket.id)}
                onChangeSeat={() => handleChangeSeat(ticket.id)}
                onViewDetails={() => handleViewDetails(ticket.id)}
              />
            ))}
          </div>
        ) : !isLoading && (
          /* Empty State */
          <div className="text-center py-16" data-testid="empty-tickets-state">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <TicketIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-8">You haven't booked any flights yet. Start planning your next adventure!</p>
            <Button onClick={handleBookNewFlight} data-testid="book-first-flight-button">
              Book Your First Flight
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
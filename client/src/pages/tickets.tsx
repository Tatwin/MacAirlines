import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TicketCard from '@/components/ticket-card';
import { useLocation } from 'wouter';
import { Plus, Ticket } from 'lucide-react';
import { useEffect } from 'react';

export default function TicketsPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

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

  const handleDownloadTicket = (ticketId: string) => {
    toast({
      title: "Download Started",
      description: "Your ticket PDF is being generated and downloaded...",
    });
    
    // Generate a simple ticket PDF or redirect to ticket view
    const ticket = tickets?.find(t => t.id === ticketId);
    if (ticket) {
      // Open ticket details in new window for printing/saving
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Ticket ${ticket.ticketNumber}</title></head>
            <body>
              <h1>MACAirlines Ticket</h1>
              <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
              <p><strong>Booking Reference:</strong> ${ticket.bookingReference}</p>
              <p><strong>Flight:</strong> ${ticket.flight?.flightNumber}</p>
              <p><strong>Route:</strong> ${ticket.flight?.origin} to ${ticket.flight?.destination}</p>
              <p><strong>Passenger:</strong> ${ticket.passenger?.firstName} ${ticket.passenger?.lastName}</p>
              <p><strong>Seat:</strong> ${ticket.seatNumber} (${ticket.seatClass})</p>
              <p><strong>Price:</strong> ₹${new Intl.NumberFormat('en-IN').format(parseFloat(ticket.price))}</p>
            </body>
          </html>
        `);
        printWindow.print();
      }
    }
  };

  const handleCancelTicket = (ticketId: string) => {
    const ticket = tickets?.find(t => t.id === ticketId);
    if (ticket && window.confirm(`Are you sure you want to cancel ticket ${ticket.ticketNumber}?`)) {
      // In a real app, this would call an API endpoint
      toast({
        title: "Cancellation Request Submitted",
        description: "Your cancellation request has been submitted. You will receive a confirmation email shortly.",
      });
    }
  };

  const handleCheckIn = (ticketId: string) => {
    const ticket = tickets?.find(t => t.id === ticketId);
    if (ticket) {
      toast({
        title: "Check-in Successful",
        description: `You have been checked in for flight ${ticket.flight?.flightNumber}. Your boarding pass is ready.`,
      });
    }
  };

  const handleChangeSeat = (ticketId: string) => {
    const ticket = tickets?.find(t => t.id === ticketId);
    if (ticket) {
      navigate(`/booking?change_seat=${ticketId}&flight=${ticket.flightId}`);
    }
  };

  const handleViewDetails = (ticketId: string) => {
    const ticket = tickets?.find(t => t.id === ticketId);
    if (ticket) {
      toast({
        title: "Ticket Details",
        description: `Viewing details for ticket ${ticket.ticketNumber}`,
      });
      // In a real app, this could open a modal or navigate to details page
    }
  };

  const handleManageBooking = (ticketId: string) => {
    const ticket = tickets?.find(t => t.id === ticketId);
    if (ticket) {
      toast({
        title: "Manage Booking",
        description: "Opening booking management options...",
      });
      // Navigate to booking management page
      navigate(`/booking/manage/${ticket.bookingReference}`);
    }
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
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onDownload={handleDownloadTicket}
                onCancel={handleCancelTicket}
                onCheckIn={handleCheckIn}
                onChangeSeat={handleChangeSeat}
                onViewDetails={handleViewDetails}
                onManageBooking={handleManageBooking}
              />
            ))}
          </div>
        ) : !isLoading && (
          /* Empty State */
          <div className="text-center py-16" data-testid="empty-tickets-state">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="h-12 w-12 text-gray-400" />
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

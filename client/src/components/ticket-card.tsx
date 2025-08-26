import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plane, Calendar, Clock, MapPin, User, Download, AlertCircle } from 'lucide-react';
import type { Ticket, Flight, Passenger } from '@shared/schema';

interface TicketCardProps {
  ticket: Ticket & { flight: Flight; passenger: Passenger };
  onDownload?: (ticketId: string) => void;
  onCancel?: (ticketId: string) => void;
}

export default function TicketCard({ ticket, onDownload, onCancel }: TicketCardProps) {
  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getAirportCode = (location: string) => {
    const match = location.match(/\(([^)]+)\)/);
    return match ? match[1] : location.slice(0, 3).toUpperCase();
  };

  const isActiveTicket = ticket.status === 'confirmed' || ticket.status === 'checked_in';
  const isPastTicket = ticket.status === 'completed' || new Date(ticket.flight.departureTime) < new Date();

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 ${isPastTicket ? 'opacity-75' : 'hover:shadow-lg'}`}
      data-testid={`ticket-card-${ticket.ticketNumber}`}
    >
      {/* Ticket Header */}
      <div className={`p-6 text-white ${isPastTicket ? 'bg-gradient-to-r from-gray-500 to-gray-600' : 'bg-gradient-to-r from-primary to-blue-600'}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <Plane className="mr-2 h-5 w-5" />
              {ticket.flight.airline}
            </h3>
            <p className="text-blue-100 mt-1">Electronic Ticket</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{ticket.ticketNumber}</div>
            <div className="text-blue-100 text-sm">Ticket Number</div>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Flight Route */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Flight Information */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Plane className="mr-2 h-4 w-4" />
              Flight Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Flight:</span>
                <span className="font-medium">{ticket.flight.flightNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(ticket.flight.departureTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Departure:</span>
                <span className="font-medium">
                  {formatTime(ticket.flight.departureTime)} {getAirportCode(ticket.flight.origin)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Arrival:</span>
                <span className="font-medium">
                  {formatTime(ticket.flight.arrivalTime)} {getAirportCode(ticket.flight.destination)}
                </span>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="mr-2 h-4 w-4" />
              Passenger Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {ticket.passenger.firstName} {ticket.passenger.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seat:</span>
                <span className="font-medium">{ticket.seatNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Class:</span>
                <span className="font-medium capitalize">{ticket.seatClass}</span>
              </div>
              {ticket.flight.gate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Gate:</span>
                  <span className="font-medium">{ticket.flight.gate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Status */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Booking Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Ref:</span>
                <span className="font-medium font-mono">{ticket.bookingReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${parseFloat(ticket.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booked:</span>
                <span className="font-medium">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center pt-6 border-t space-y-3 sm:space-y-0">
          <div className="flex flex-wrap gap-3">
            {isActiveTicket && !ticket.checkedIn && (
              <Button variant="outline" size="sm" className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Check In
              </Button>
            )}
            {isActiveTicket && (
              <>
                <Button variant="outline" size="sm" className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Change Seats
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Manage Booking
                </Button>
              </>
            )}
          </div>

          <div className="flex space-x-3">
            {onDownload && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDownload(ticket.id)}
                className="flex items-center"
                data-testid={`download-ticket-${ticket.ticketNumber}`}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            
            {isActiveTicket && onCancel && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onCancel(ticket.id)}
                className="flex items-center"
                data-testid={`cancel-ticket-${ticket.ticketNumber}`}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}

            <Button 
              size="sm"
              className="flex items-center"
              data-testid={`view-details-${ticket.ticketNumber}`}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

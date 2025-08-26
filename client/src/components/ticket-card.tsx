import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plane, Calendar, Clock, MapPin, User, Download, AlertCircle, IndianRupee, Settings, UserCheck, CreditCard, Eye, CheckCircle, Users, FileText } from 'lucide-react';
import type { Ticket, Flight, Passenger } from '@shared/schema';

interface TicketCardProps {
  ticket: Ticket & { flight: Flight; passenger: Passenger };
  onDownload: (ticketId: string) => void;
  onCancel: (ticketId: string) => void;
  onCheckIn?: (ticketId: string) => void;
  onChangeSeat?: (ticketId: string) => void;
  onViewDetails?: (ticketId: string) => void;
  onManageBooking?: (ticketId: string) => void;
}

export function TicketCard({ 
  ticket, 
  onDownload, 
  onCancel, 
  onCheckIn, 
  onChangeSeat, 
  onViewDetails, 
  onManageBooking 
}: TicketCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getAirportCode = (city: string) => {
    const airportCodes: { [key: string]: string } = {
      'Chennai': 'MAA',
      'Coimbatore': 'CJB',
      'Madurai': 'IXM',
      'Tiruchirappalli': 'TRZ',
      'Salem': 'SXV',
      'Tuticorin': 'TCR'
    };
    return airportCodes[city] || city.substring(0, 3).toUpperCase();
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

  const canCheckIn = () => {
    const departureTime = new Date(ticket.flight?.departureTime);
    const now = new Date();
    const hoursDiff = (departureTime.getTime() - now.getTime()) / (1000 * 3600);
    return hoursDiff <= 24 && hoursDiff > 2 && ticket.status === 'confirmed';
  };

  const canChangeSeat = () => {
    const departureTime = new Date(ticket.flight?.departureTime);
    const now = new Date();
    const hoursDiff = (departureTime.getTime() - now.getTime()) / (1000 * 3600);
    return hoursDiff > 2 && ticket.status !== 'cancelled';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold">MACAirlines</h3>
            <p className="text-sm opacity-90">Flight {ticket.flight?.flightNumber}</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Booking Reference</div>
            <div className="font-mono font-bold">{ticket.bookingReference}</div>
          </div>
        </div>
        <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
          {ticket.status.replace('_', ' ').toUpperCase()}
        </Badge>
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
                <span className="font-medium">{ticket.flight?.flightNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(ticket.flight?.departureTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Departure:</span>
                <span className="font-medium">
                  {formatTime(ticket.flight?.departureTime)} {getAirportCode(ticket.flight?.origin)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Arrival:</span>
                <span className="font-medium">
                  {formatTime(ticket.flight?.arrivalTime)} {getAirportCode(ticket.flight?.destination)}
                </span>
              </div>
            </div>
          </div>

          {/* Route Visualization */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{getAirportCode(ticket.flight?.origin)}</div>
                <div className="text-sm text-gray-600">{ticket.flight?.origin}</div>
                <div className="text-xs text-gray-500">{formatTime(ticket.flight?.departureTime)}</div>
              </div>
              <div className="flex-1 px-4 relative">
                <div className="h-px bg-gray-300 relative">
                  <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-primary px-1 h-4 w-4" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{getAirportCode(ticket.flight?.destination)}</div>
                <div className="text-sm text-gray-600">{ticket.flight?.destination}</div>
                <div className="text-xs text-gray-500">{formatTime(ticket.flight?.arrivalTime)}</div>
              </div>
            </div>
          </div>

          {/* Passenger & Seat Information */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="mr-2 h-4 w-4" />
              Passenger Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {ticket.passenger?.firstName} {ticket.passenger?.lastName}
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
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket No:</span>
                <span className="font-mono text-xs">{ticket.ticketNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Amount Paid</span>
            <div className="flex items-center text-xl font-bold text-primary">
              <IndianRupee className="h-5 w-5 mr-1" />
              {new Intl.NumberFormat('en-IN').format(parseFloat(ticket.price))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Check-in Button */}
          <Button 
            variant={canCheckIn() ? "default" : "secondary"}
            className="flex items-center justify-center"
            onClick={() => onCheckIn?.(ticket.id)}
            disabled={!canCheckIn()}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            {ticket.checkedIn ? 'Checked In' : 'Check In'}
          </Button>

          {/* Change Seat Button */}
          <Button 
            variant="outline"
            className="flex items-center justify-center"
            onClick={() => onChangeSeat?.(ticket.id)}
            disabled={!canChangeSeat()}
          >
            <Settings className="mr-2 h-4 w-4" />
            Change Seat
          </Button>

          {/* Manage Booking Button */}
          <Button 
            variant="outline"
            className="flex items-center justify-center"
            onClick={() => onManageBooking?.(ticket.id)}
            disabled={ticket.status === 'cancelled'}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Booking
          </Button>

          {/* View Details Button */}
          <Button 
            variant="outline"
            className="flex items-center justify-center"
            onClick={() => onViewDetails?.(ticket.id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDownload(ticket.id)}
            className="text-primary hover:text-primary/80"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Ticket
          </Button>

          {ticket.status !== 'cancelled' && ticket.status !== 'completed' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onCancel(ticket.id)}
              className="text-red-600 hover:text-red-700"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Cancel Ticket
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {ticket.status === 'cancelled' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-800">
              <AlertCircle className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">This ticket has been cancelled</span>
            </div>
          </div>
        )}

        {canCheckIn() && !ticket.checkedIn && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center text-blue-800">
              <Clock className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Online check-in is now available!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TicketCard;
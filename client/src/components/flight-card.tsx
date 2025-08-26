import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Clock, Users } from 'lucide-react';
import type { Flight } from '@shared/schema';

interface FlightCardProps {
  flight: Flight;
  onSelect: (flight: Flight) => void;
  isSelected?: boolean;
}

export default function FlightCard({ flight, onSelect, isSelected = false }: FlightCardProps) {
  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDuration = () => {
    const hours = Math.floor(flight.duration / 60);
    const minutes = flight.duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const getAirportCode = (location: string) => {
    // Extract airport code from location string (assuming format "City Name (CODE)")
    const match = location.match(/\(([^)]+)\)/);
    return match ? match[1] : location.slice(0, 3).toUpperCase();
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'border-gray-200'
      }`}
      data-testid={`flight-card-${flight.flightNumber}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          {/* Flight Info Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{flight.airline}</div>
              <div className="text-sm text-gray-500">{flight.flightNumber}</div>
            </div>
          </div>

          {/* Status Badge */}
          <Badge variant={flight.status === 'scheduled' ? 'default' : 'secondary'}>
            {flight.status}
          </Badge>
        </div>

        {/* Flight Route and Times */}
        <div className="flex items-center justify-between mb-4">
          {/* Departure */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(flight.departureTime)}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {getAirportCode(flight.origin)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(flight.departureTime)}
            </div>
          </div>

          {/* Flight Path */}
          <div className="flex-1 mx-4">
            <div className="relative flex items-center">
              <div className="flex-1 border-t-2 border-gray-300"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white px-2">
                  <Plane className="h-4 w-4 text-primary transform rotate-90" />
                </div>
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Clock className="h-3 w-3 mr-1" />
                {getDuration()}
              </div>
              <div className="text-xs text-gray-500">Non-stop</div>
            </div>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(flight.arrivalTime)}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {getAirportCode(flight.destination)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(flight.arrivalTime)}
            </div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <span>{flight.aircraft}</span>
            {flight.gate && <span>Gate {flight.gate}</span>}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{flight.availableSeats}/{flight.totalSeats} available</span>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-left">
            <div className="text-2xl font-bold text-primary">
              ${parseFloat(flight.basePrice).toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">per person</div>
          </div>
          <Button 
            onClick={() => onSelect(flight)}
            variant={isSelected ? "secondary" : "default"}
            data-testid={`select-flight-${flight.flightNumber}`}
          >
            {isSelected ? 'Selected' : 'Select Flight'}
          </Button>
        </div>
      </div>
    </div>
  );
}

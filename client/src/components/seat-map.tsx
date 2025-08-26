import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Seat } from '@shared/schema';

interface SeatMapProps {
  flightId: string;
  seats: Seat[];
  selectedSeats: string[];
  onSeatSelect: (seatNumber: string) => void;
  maxSeats?: number;
}

interface SeatButtonProps {
  seat: Seat;
  isSelected: boolean;
  onClick: () => void;
}

function SeatButton({ seat, isSelected, onClick }: SeatButtonProps) {
  const getSeatColor = () => {
    if (!seat.isAvailable) return 'bg-red-500 cursor-not-allowed text-white';
    if (isSelected) return 'bg-primary text-white';
    
    switch (seat.seatClass) {
      case 'first':
        return 'bg-purple-200 hover:bg-purple-300 border-purple-400';
      case 'business':
        return 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400';
      case 'premium':
        return 'bg-blue-200 hover:bg-blue-300 border-blue-400';
      default:
        return 'bg-green-200 hover:bg-green-300 border-green-400';
    }
  };

  return (
    <button
      className={`w-8 h-8 text-xs font-medium rounded border transition-colors ${getSeatColor()}`}
      onClick={onClick}
      disabled={!seat.isAvailable}
      data-testid={`seat-${seat.seatNumber}`}
    >
      {seat.seatNumber.slice(-1)}
    </button>
  );
}

export default function SeatMap({ 
  flightId, 
  seats, 
  selectedSeats, 
  onSeatSelect, 
  maxSeats = 1 
}: SeatMapProps) {
  const [groupedSeats, setGroupedSeats] = useState<{ [key: string]: Seat[] }>({});

  useEffect(() => {
    // Group seats by row
    const grouped = seats.reduce((acc, seat) => {
      const row = seat.seatNumber.replace(/[A-F]$/, '');
      if (!acc[row]) acc[row] = [];
      acc[row].push(seat);
      return acc;
    }, {} as { [key: string]: Seat[] });

    // Sort seats within each row
    Object.keys(grouped).forEach(row => {
      grouped[row].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
    });

    setGroupedSeats(grouped);
  }, [seats]);

  const handleSeatClick = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      // Deselect seat
      onSeatSelect(seatNumber);
    } else if (selectedSeats.length < maxSeats) {
      // Select seat if under limit
      onSeatSelect(seatNumber);
    }
  };

  const getSeatClassInfo = (seatClass: string) => {
    switch (seatClass) {
      case 'first':
        return { label: 'First Class', color: 'bg-purple-100 text-purple-800', price: '+$150' };
      case 'business':
        return { label: 'Business Class', color: 'bg-yellow-100 text-yellow-800', price: '+$100' };
      case 'premium':
        return { label: 'Premium Economy', color: 'bg-blue-100 text-blue-800', price: '+$50' };
      default:
        return { label: 'Economy Class', color: 'bg-green-100 text-green-800', price: 'Included' };
    }
  };

  const sortedRows = Object.keys(groupedSeats).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="bg-white rounded-lg p-6" data-testid="seat-map">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">✈️</span>
          Select Your Seats
        </h3>
        
        {/* Seat Legend */}
        <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
            <span>Premium (+$50)</span>
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="max-w-md mx-auto">
        {/* Front of Plane */}
        <div className="text-center mb-4">
          <div className="w-8 h-8 mx-auto bg-gray-200 rounded-t-full flex items-center justify-center">
            <span className="text-gray-600">✈️</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Front</div>
        </div>

        {/* Render seat sections by class */}
        {['first', 'business', 'premium', 'economy'].map((seatClass) => {
          const classRows = sortedRows.filter(row => 
            groupedSeats[row].some(seat => seat.seatClass === seatClass)
          );

          if (classRows.length === 0) return null;

          const classInfo = getSeatClassInfo(seatClass);

          return (
            <div key={seatClass} className="mb-6">
              <div className="text-center mb-3">
                <Badge className={classInfo.color}>{classInfo.label}</Badge>
              </div>
              
              <div className="space-y-2">
                {classRows.map((row) => {
                  const rowSeats = groupedSeats[row].filter(seat => seat.seatClass === seatClass);
                  const leftSeats = rowSeats.filter(seat => ['A', 'B', 'C'].includes(seat.seatNumber.slice(-1)));
                  const rightSeats = rowSeats.filter(seat => ['D', 'E', 'F'].includes(seat.seatNumber.slice(-1)));

                  return (
                    <div key={row} className="flex justify-center items-center space-x-2">
                      <span className="text-xs text-gray-500 w-6">{row}</span>
                      
                      {/* Left side seats */}
                      <div className="flex space-x-1">
                        {leftSeats.map((seat) => (
                          <SeatButton
                            key={seat.seatNumber}
                            seat={seat}
                            isSelected={selectedSeats.includes(seat.seatNumber)}
                            onClick={() => handleSeatClick(seat.seatNumber)}
                          />
                        ))}
                      </div>

                      {/* Aisle */}
                      <div className="w-4"></div>

                      {/* Right side seats */}
                      <div className="flex space-x-1">
                        {rightSeats.map((seat) => (
                          <SeatButton
                            key={seat.seatNumber}
                            seat={seat}
                            isSelected={selectedSeats.includes(seat.seatNumber)}
                            onClick={() => handleSeatClick(seat.seatNumber)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="border-t pt-4 mt-6">
          <h4 className="font-medium mb-2">Selected Seats:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seatNumber) => {
              const seat = seats.find(s => s.seatNumber === seatNumber);
              const classInfo = getSeatClassInfo(seat?.seatClass || 'economy');
              
              return (
                <div 
                  key={seatNumber} 
                  className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  data-testid={`selected-seat-${seatNumber}`}
                >
                  <span>{seatNumber}</span>
                  {seat && parseFloat(seat.price) > 0 && (
                    <span className="text-xs">+${seat.price}</span>
                  )}
                  <button
                    onClick={() => handleSeatClick(seatNumber)}
                    className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-1"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

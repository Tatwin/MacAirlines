import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import FlightCard from '@/components/flight-card';
import SeatMap from '@/components/seat-map';
import { Loader2, CreditCard, Check } from 'lucide-react';
import type { Flight, Seat, InsertPassenger } from '@shared/schema';

export default function BookingPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    departureDate: '',
    passengers: '1'
  });
  
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerData, setPassengerData] = useState<InsertPassenger>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: null,
    nationality: '',
    passportNumber: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Parse URL search params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSearchParams({
      from: urlParams.get('from') || '',
      to: urlParams.get('to') || '',
      departureDate: urlParams.get('departureDate') || '',
      passengers: urlParams.get('passengers') || '1'
    });
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Search flights query
  const { data: flights, isLoading: flightsLoading } = useQuery({
    queryKey: ['/api/flights/search', searchParams],
    queryFn: () => apiClient.searchFlights({
      from: searchParams.from,
      to: searchParams.to,
      departureDate: searchParams.departureDate
    }),
    enabled: !!(searchParams.from && searchParams.to),
  });

  // Get flight seats query
  const { data: seats } = useQuery({
    queryKey: ['/api/flights', selectedFlight?.id, 'seats'],
    queryFn: () => apiClient.getFlightSeats(selectedFlight!.id),
    enabled: !!selectedFlight,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (bookingData: any) => apiClient.createBooking(bookingData),
    onSuccess: (data) => {
      toast({
        title: "Booking Confirmed!",
        description: `Your ticket ${data.ticket.ticketNumber} has been booked successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      navigate('/tickets');
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setSelectedSeats([]);
  };

  const handleSeatSelect = (seatNumber: string) => {
    const maxSeats = parseInt(searchParams.passengers);
    
    if (selectedSeats.includes(seatNumber)) {
      // Remove seat
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
    } else if (selectedSeats.length < maxSeats) {
      // Add seat
      setSelectedSeats(prev => [...prev, seatNumber]);
    }
  };

  const handleBookingConfirm = () => {
    if (!selectedFlight || selectedSeats.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a flight and seat(s) before booking.",
        variant: "destructive",
      });
      return;
    }

    if (!passengerData.firstName || !passengerData.lastName || !passengerData.email) {
      toast({
        title: "Passenger Information Required",
        description: "Please fill in all required passenger details.",
        variant: "destructive",
      });
      return;
    }

    // For simplicity, we'll book the first selected seat
    const primarySeat = selectedSeats[0];
    
    createBookingMutation.mutate({
      flightId: selectedFlight.id,
      passengerData: {
        ...passengerData,
        userId: user?.id
      },
      seatNumber: primarySeat,
      paymentMethod
    });
  };

  const getTotalPrice = () => {
    if (!selectedFlight || !seats || selectedSeats.length === 0) return 0;
    
    const basePrice = parseFloat(selectedFlight.basePrice);
    let seatPrices = 0;
    
    selectedSeats.forEach(seatNumber => {
      const seat = seats.find((s: Seat) => s.seatNumber === seatNumber);
      if (seat) {
        seatPrices += parseFloat(seat.price);
      }
    });
    
    return basePrice + seatPrices;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="booking-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Your Flight</h1>
          {searchParams.from && searchParams.to && (
            <p className="text-gray-600 mt-2">
              Search results for <span className="font-medium">{searchParams.from} → {searchParams.to}</span>
              {searchParams.departureDate && (
                <span className="ml-2">on {new Date(searchParams.departureDate).toLocaleDateString()}</span>
              )}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Results */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Flights</h2>
            
            {flightsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Searching flights...</span>
              </div>
            ) : flights && flights.length > 0 ? (
              <div className="space-y-4">
                {flights.map((flight: Flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    onSelect={handleFlightSelect}
                    isSelected={selectedFlight?.id === flight.id}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No flights found for your search criteria.</p>
                  <Button onClick={() => navigate('/')} className="mt-4">
                    Search Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Seat Selection */}
            {selectedFlight && seats && (
              <div className="mt-8">
                <SeatMap
                  flightId={selectedFlight.id}
                  seats={seats}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                  maxSeats={parseInt(searchParams.passengers)}
                />
              </div>
            )}

            {/* Passenger Information */}
            {selectedFlight && selectedSeats.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Passenger Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={passengerData.firstName}
                        onChange={(e) => setPassengerData(prev => ({ ...prev, firstName: e.target.value }))}
                        data-testid="passenger-firstname-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={passengerData.lastName}
                        onChange={(e) => setPassengerData(prev => ({ ...prev, lastName: e.target.value }))}
                        data-testid="passenger-lastname-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={passengerData.email}
                        onChange={(e) => setPassengerData(prev => ({ ...prev, email: e.target.value }))}
                        data-testid="passenger-email-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={passengerData.phone}
                        onChange={(e) => setPassengerData(prev => ({ ...prev, phone: e.target.value }))}
                        data-testid="passenger-phone-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={passengerData.dateOfBirth ? new Date(passengerData.dateOfBirth).toISOString().split('T')[0] : ''}
                        onChange={(e) => setPassengerData(prev => ({ ...prev, dateOfBirth: e.target.value ? new Date(e.target.value) : null }))}
                        data-testid="passenger-dob-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Select value={passengerData.nationality || ''} onValueChange={(value) => setPassengerData(prev => ({ ...prev, nationality: value }))}>
                        <SelectTrigger data-testid="passenger-nationality-select">
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedFlight ? (
                  <p className="text-gray-500 text-center py-8">Select a flight to view booking summary</p>
                ) : (
                  <>
                    {/* Flight Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Flight:</span>
                        <span className="font-medium">{selectedFlight.flightNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Route:</span>
                        <span className="font-medium">{selectedFlight.origin} → {selectedFlight.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Date(selectedFlight.departureTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">
                          {new Date(selectedFlight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(selectedFlight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {selectedSeats.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seats:</span>
                          <span className="font-medium">{selectedSeats.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Price Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base fare:</span>
                          <span>${parseFloat(selectedFlight.basePrice).toFixed(2)}</span>
                        </div>
                        {seats && selectedSeats.map(seatNumber => {
                          const seat = seats.find((s: Seat) => s.seatNumber === seatNumber);
                          if (seat && parseFloat(seat.price) > 0) {
                            return (
                              <div key={seatNumber} className="flex justify-between">
                                <span>Seat {seatNumber} ({seat.seatClass}):</span>
                                <span>+${parseFloat(seat.price).toFixed(2)}</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="text-primary">${getTotalPrice().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Payment Method</h4>
                      <div className="space-y-3">
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentMethod === 'card' ? 'border-primary bg-blue-50' : 'border-gray-300'}`}
                          onClick={() => setPaymentMethod('card')}
                        >
                          <div className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4 text-primary" />
                            <span>Credit/Debit Card</span>
                            {paymentMethod === 'card' && <Check className="ml-auto h-4 w-4 text-primary" />}
                          </div>
                        </div>
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentMethod === 'paypal' ? 'border-primary bg-blue-50' : 'border-gray-300'}`}
                          onClick={() => setPaymentMethod('paypal')}
                        >
                          <div className="flex items-center">
                            <span className="mr-2 text-blue-600">PayPal</span>
                            {paymentMethod === 'paypal' && <Check className="ml-auto h-4 w-4 text-primary" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Confirm Booking Button */}
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 mt-6"
                      onClick={handleBookingConfirm}
                      disabled={!selectedFlight || selectedSeats.length === 0 || createBookingMutation.isPending}
                      data-testid="confirm-booking-button"
                    >
                      {createBookingMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Confirm Booking
                        </>
                      )}
                    </Button>

                    {/* Security Notice */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <div className="text-sm text-primary">
                          <p className="font-medium">Secure Payment</p>
                          <p className="text-xs">Your payment information is encrypted and secure.</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

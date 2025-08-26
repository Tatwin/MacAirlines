import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Search, Clock, Shield, IndianRupee, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import type { Flight } from '@shared/schema';

export default function HomePage() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: '1',
    tripType: 'round-trip'
  });

  // Fetch upcoming flights
  const { data: flights, isLoading } = useQuery({
    queryKey: ['/api/flights'],
    queryFn: () => apiClient.getAllFlights(),
  });

  const handleInputChange = (field: string, value: string) => {
    setSearchForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchForm.from || !searchForm.to || !searchForm.departureDate) {
      return;
    }

    const searchParams = new URLSearchParams({
      from: searchForm.from,
      to: searchForm.to,
      departureDate: searchForm.departureDate,
      passengers: searchForm.passengers
    });

    if (searchForm.tripType === 'round-trip' && searchForm.returnDate) {
      searchParams.set('returnDate', searchForm.returnDate);
    }

    navigate(`/booking?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(30, 64, 175, 0.7), rgba(30, 64, 175, 0.7)), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">TamilSky Airways - Connecting Tamil Nadu</h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Your trusted partner for domestic flights across Tamil Nadu and India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Search Form */}
      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
        <Card className="shadow-2xl">
          <CardContent className="p-6 md:p-8">
            {/* Trip Type Selection */}
            <div className="flex flex-col md:flex-row mb-6">
              <Button
                type="button"
                variant={searchForm.tripType === 'round-trip' ? 'default' : 'outline'}
                onClick={() => handleInputChange('tripType', 'round-trip')}
                className="mb-2 md:mb-0 md:mr-4"
                data-testid="round-trip-button"
              >
                <Plane className="mr-2 h-4 w-4" />
                Round Trip
              </Button>
              <Button
                type="button"
                variant={searchForm.tripType === 'one-way' ? 'default' : 'outline'}
                onClick={() => handleInputChange('tripType', 'one-way')}
                data-testid="one-way-button"
              >
                <Plane className="mr-2 h-4 w-4" />
                One Way
              </Button>
            </div>

            <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
              {/* From Location */}
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Select value={searchForm.from} onValueChange={(value) => handleInputChange('from', value)}>
                  <SelectTrigger data-testid="from-select">
                    <div className="flex items-center">
                      <Plane className="mr-2 h-4 w-4 text-gray-400" />
                      <SelectValue placeholder="Select departure city" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mumbai (BOM)">Mumbai (BOM)</SelectItem>
                    <SelectItem value="Delhi (DEL)">Delhi (DEL)</SelectItem>
                    <SelectItem value="Bangalore (BLR)">Bangalore (BLR)</SelectItem>
                    <SelectItem value="Chennai (MAA)">Chennai (MAA)</SelectItem>
                    <SelectItem value="Hyderabad (HYD)">Hyderabad (HYD)</SelectItem>
                    <SelectItem value="Pune (PNQ)">Pune (PNQ)</SelectItem>
                    <SelectItem value="Kochi (COK)">Kochi (COK)</SelectItem>
                    <SelectItem value="Ahmedabad (AMD)">Ahmedabad (AMD)</SelectItem>
                    <SelectItem value="Kolkata (CCU)">Kolkata (CCU)</SelectItem>
                    <SelectItem value="Goa (GOI)">Goa (GOI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* To Location */}
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Select value={searchForm.to} onValueChange={(value) => handleInputChange('to', value)}>
                  <SelectTrigger data-testid="to-select">
                    <div className="flex items-center">
                      <Plane className="mr-2 h-4 w-4 text-gray-400" />
                      <SelectValue placeholder="Select destination city" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mumbai (BOM)">Mumbai (BOM)</SelectItem>
                    <SelectItem value="Delhi (DEL)">Delhi (DEL)</SelectItem>
                    <SelectItem value="Bangalore (BLR)">Bangalore (BLR)</SelectItem>
                    <SelectItem value="Chennai (MAA)">Chennai (MAA)</SelectItem>
                    <SelectItem value="Hyderabad (HYD)">Hyderabad (HYD)</SelectItem>
                    <SelectItem value="Pune (PNQ)">Pune (PNQ)</SelectItem>
                    <SelectItem value="Kochi (COK)">Kochi (COK)</SelectItem>
                    <SelectItem value="Ahmedabad (AMD)">Ahmedabad (AMD)</SelectItem>
                    <SelectItem value="Kolkata (CCU)">Kolkata (CCU)</SelectItem>
                    <SelectItem value="Goa (GOI)">Goa (GOI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Departure Date */}
              <div className="space-y-2">
                <Label htmlFor="departureDate">Departure</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={searchForm.departureDate}
                  onChange={(e) => handleInputChange('departureDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="departure-date-input"
                />
              </div>

              {/* Return Date */}
              {searchForm.tripType === 'round-trip' && (
                <div className="space-y-2">
                  <Label htmlFor="returnDate">Return</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    value={searchForm.returnDate}
                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                    min={searchForm.departureDate || new Date().toISOString().split('T')[0]}
                    data-testid="return-date-input"
                  />
                </div>
              )}

              {/* Passengers */}
              <div className="space-y-2">
                <Label htmlFor="passengers">Passengers</Label>
                <Select value={searchForm.passengers} onValueChange={(value) => handleInputChange('passengers', value)}>
                  <SelectTrigger data-testid="passengers-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Passenger</SelectItem>
                    <SelectItem value="2">2 Passengers</SelectItem>
                    <SelectItem value="3">3 Passengers</SelectItem>
                    <SelectItem value="4">4+ Passengers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className={`pt-4 ${searchForm.tripType === 'round-trip' ? 'md:col-span-2 lg:col-span-4' : 'md:col-span-2 lg:col-span-3'}`}>
                <Button 
                  type="submit" 
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  data-testid="search-flights-button"
                >
                  <Search className="h-5 w-5" />
                  <span>Search Flights</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose MacAirlines?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience seamless booking with India's premier airline service
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white text-2xl h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
            <p className="text-gray-600">Your transactions are protected with enterprise-grade security</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-white text-2xl h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">Round-the-clock customer service for all your travel needs</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <IndianRupee className="text-white text-2xl h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-600">Competitive rates in Indian Rupees with exclusive deals</p>
          </div>
        </div>
      </div>

      {/* Next Flights Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Routes Today
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Check out our most popular flights and book your journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse shadow-lg">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              flights?.slice(0, 6).map((flight: Flight) => (
                <Card key={flight.id} className="card-hover shadow-lg transition-all duration-300 cursor-pointer border border-gray-200" onClick={() => {
                  if (isAuthenticated) {
                    navigate(`/booking?from=${encodeURIComponent(flight.origin)}&to=${encodeURIComponent(flight.destination)}&departureDate=${flight.departureTime.toString().split('T')[0]}`);
                  } else {
                    navigate('/auth');
                  }
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Plane className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-lg">{flight.flightNumber}</span>
                      </div>
                      <span className="text-sm text-gray-500">{flight.airline}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{flight.origin}</span>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-px bg-gray-300 mb-1"></div>
                        <Plane className="h-4 w-4 text-gray-400 mx-auto" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{flight.destination}</span>
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {new Date(flight.departureTime).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-green-600">
                        {flight.availableSeats} seats available
                      </div>
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="h-4 w-4 text-primary" />
                        <span className="text-lg font-bold text-primary">
                          {new Intl.NumberFormat('en-IN').format(parseFloat(flight.basePrice))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          {!isAuthenticated && (
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">Sign in to book flights and manage your bookings</p>
              <Button onClick={() => navigate('/auth')} size="lg">
                Sign In to Book
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

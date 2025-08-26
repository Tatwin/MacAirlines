import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plane, Search, Clock, Shield, DollarSign } from 'lucide-react';
import { useAuth } from '@/lib/auth';

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
              <h1 className="text-4xl md:text-6xl font-bold mb-4">MACAirlines - Book Your Perfect Flight</h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Discover amazing destinations and book with confidence
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
                    <SelectItem value="New York (JFK)">New York (JFK)</SelectItem>
                    <SelectItem value="Los Angeles (LAX)">Los Angeles (LAX)</SelectItem>
                    <SelectItem value="Chicago (ORD)">Chicago (ORD)</SelectItem>
                    <SelectItem value="Miami (MIA)">Miami (MIA)</SelectItem>
                    <SelectItem value="London (LHR)">London (LHR)</SelectItem>
                    <SelectItem value="Paris (CDG)">Paris (CDG)</SelectItem>
                    <SelectItem value="Tokyo (NRT)">Tokyo (NRT)</SelectItem>
                    <SelectItem value="Dubai (DXB)">Dubai (DXB)</SelectItem>
                    <SelectItem value="Singapore (SIN)">Singapore (SIN)</SelectItem>
                    <SelectItem value="Sydney (SYD)">Sydney (SYD)</SelectItem>
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
                    <SelectItem value="New York (JFK)">New York (JFK)</SelectItem>
                    <SelectItem value="Los Angeles (LAX)">Los Angeles (LAX)</SelectItem>
                    <SelectItem value="Chicago (ORD)">Chicago (ORD)</SelectItem>
                    <SelectItem value="Miami (MIA)">Miami (MIA)</SelectItem>
                    <SelectItem value="London (LHR)">London (LHR)</SelectItem>
                    <SelectItem value="Paris (CDG)">Paris (CDG)</SelectItem>
                    <SelectItem value="Tokyo (NRT)">Tokyo (NRT)</SelectItem>
                    <SelectItem value="Dubai (DXB)">Dubai (DXB)</SelectItem>
                    <SelectItem value="Singapore (SIN)">Singapore (SIN)</SelectItem>
                    <SelectItem value="Sydney (SYD)">Sydney (SYD)</SelectItem>
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
            Why Choose MACAirlines?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience seamless booking with our advanced reservation system
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
              <DollarSign className="text-white text-2xl h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-600">Competitive rates and exclusive deals for our customers</p>
          </div>
        </div>
      </div>
    </div>
  );
}

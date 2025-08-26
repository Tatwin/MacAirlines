import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Users, 
  Ticket, 
  Plane, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  IndianRupee,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertPassengerSchema, insertFlightSchema, type InsertPassenger, type InsertFlight, type Passenger, type Ticket as TicketType, type Flight } from '@shared/schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function EmployeeDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('passengers');
  const [passengerSearch, setPassengerSearch] = useState('');
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  
  // Flight management states
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [viewingFlight, setViewingFlight] = useState<Flight | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'employee') {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate]);

  // Passenger form
  const passengerForm = useForm<InsertPassenger>({
    resolver: zodResolver(insertPassengerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      nationality: '',
      passportNumber: ''
    },
  });

  // Flight form
  const flightForm = useForm<InsertFlight>({
    resolver: zodResolver(insertFlightSchema),
    defaultValues: {
      flightNumber: '',
      airline: '',
      aircraft: '',
      origin: '',
      destination: '',
      departureTime: new Date(),
      arrivalTime: new Date(),
      duration: 0,
      basePrice: '',
      totalSeats: 180,
      availableSeats: 180,
      gate: '',
      status: 'scheduled'
    },
  });

  // Queries
  const { data: passengers, isLoading: passengersLoading } = useQuery({
    queryKey: ['/api/employee/passengers', passengerSearch],
    queryFn: () => apiClient.getPassengers(passengerSearch || undefined),
    enabled: isAuthenticated && user?.role === 'employee',
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['/api/employee/tickets'],
    queryFn: () => apiClient.getAllTickets(),
    enabled: isAuthenticated && user?.role === 'employee' && activeTab === 'tickets',
  });

  const { data: flights } = useQuery({
    queryKey: ['/api/flights'],
    queryFn: () => apiClient.getAllFlights(),
    enabled: isAuthenticated && user?.role === 'employee' && activeTab === 'flights',
  });

  // Mutations
  const createPassengerMutation = useMutation({
    mutationFn: (data: InsertPassenger) => apiClient.createPassenger(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Passenger created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employee/passengers'] });
      passengerForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePassengerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertPassenger> }) => 
      apiClient.updatePassenger(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Passenger updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employee/passengers'] });
      setEditingPassenger(null);
      passengerForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePassengerMutation = useMutation({
    mutationFn: (id: string) => apiClient.deletePassenger(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Passenger deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employee/passengers'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteTicket(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ticket cancelled successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employee/tickets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Flight mutations
  const createFlightMutation = useMutation({
    mutationFn: (data: InsertFlight) => apiClient.createFlight(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Flight created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/flights'] });
      setIsFlightModalOpen(false);
      flightForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFlightMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertFlight> }) => 
      apiClient.updateFlight(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Flight updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/flights'] });
      setIsFlightModalOpen(false);
      setEditingFlight(null);
      flightForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFlightMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteFlight(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Flight deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/flights'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handlePassengerSubmit = (data: InsertPassenger) => {
    if (editingPassenger) {
      updatePassengerMutation.mutate({ id: editingPassenger.id, data });
    } else {
      createPassengerMutation.mutate(data);
    }
  };

  const handleEditPassenger = (passenger: Passenger) => {
    setEditingPassenger(passenger);
    passengerForm.reset({
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      email: passenger.email,
      phone: passenger.phone || '',
      dateOfBirth: passenger.dateOfBirth,
      nationality: passenger.nationality || '',
      passportNumber: passenger.passportNumber || ''
    });
  };

  const handleClearForm = () => {
    setEditingPassenger(null);
    passengerForm.reset();
  };

  const handleDeletePassenger = (id: string) => {
    if (confirm('Are you sure you want to delete this passenger?')) {
      deletePassengerMutation.mutate(id);
    }
  };

  const handleCancelTicket = (id: string) => {
    if (confirm('Are you sure you want to cancel this ticket?')) {
      deleteTicketMutation.mutate(id);
    }
  };

  // Flight handlers
  const handleFlightSubmit = (data: InsertFlight) => {
    if (editingFlight) {
      updateFlightMutation.mutate({ id: editingFlight.id, data });
    } else {
      createFlightMutation.mutate(data);
    }
  };

  const handleAddFlight = () => {
    setEditingFlight(null);
    flightForm.reset();
    setIsFlightModalOpen(true);
  };

  const handleEditFlight = (flight: Flight) => {
    setEditingFlight(flight);
    flightForm.reset({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      aircraft: flight.aircraft,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: new Date(flight.departureTime),
      arrivalTime: new Date(flight.arrivalTime),
      duration: flight.duration,
      basePrice: flight.basePrice,
      totalSeats: flight.totalSeats,
      availableSeats: flight.availableSeats,
      gate: flight.gate || '',
      status: flight.status
    });
    setIsFlightModalOpen(true);
  };

  const handleViewFlight = (flight: Flight) => {
    setViewingFlight(flight);
  };

  const handleDeleteFlight = (id: string) => {
    if (confirm('Are you sure you want to delete this flight? This action cannot be undone.')) {
      deleteFlightMutation.mutate(id);
    }
  };

  const handleCloseFlightModal = () => {
    setIsFlightModalOpen(false);
    setEditingFlight(null);
    flightForm.reset();
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

  const getDashboardStats = () => {
    return {
      totalPassengers: passengers?.length || 0,
      activeTickets: tickets?.filter((t: any) => t.status === 'confirmed' || t.status === 'checked_in').length || 0,
      todaysFlights: flights?.filter((f: Flight) => {
        const today = new Date();
        const flightDate = new Date(f.departureTime);
        return flightDate.toDateString() === today.toDateString();
      }).length || 0,
      todayRevenue: tickets?.filter((t: any) => {
        const today = new Date();
        const ticketDate = new Date(t.createdAt);
        return ticketDate.toDateString() === today.toDateString();
      }).reduce((sum: number, t: any) => sum + parseFloat(t.price), 0) || 0
    };
  };

  if (!isAuthenticated || user?.role !== 'employee') {
    return null;
  }

  const stats = getDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50" data-testid="employee-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Dashboard</h1>
            <p className="text-gray-600">Manage passengers, tickets, and flight operations</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-50 text-primary px-4 py-2 rounded-lg">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
            <Badge className="ml-2">Operations Manager</Badge>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Passengers</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="total-passengers">
                    {stats.totalPassengers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Tickets</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="active-tickets">
                    {stats.activeTickets}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Flights</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="todays-flights">
                    {stats.todaysFlights}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Plane className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Revenue Today</p>
                  <p className="text-2xl font-bold text-gray-900 flex items-center" data-testid="today-revenue">
                    <IndianRupee className="h-5 w-5 mr-1" />
                    {new Intl.NumberFormat('en-IN').format(stats.todayRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Card className="overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200">
              <TabsList className="w-full justify-start p-0 h-auto bg-transparent">
                <TabsTrigger 
                  value="passengers" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  data-testid="passengers-tab"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Passengers
                </TabsTrigger>
                <TabsTrigger 
                  value="tickets"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  data-testid="tickets-tab"
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  Tickets
                </TabsTrigger>
                <TabsTrigger 
                  value="flights"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  data-testid="flights-tab"
                >
                  <Plane className="mr-2 h-4 w-4" />
                  Flight Management
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Passengers Tab */}
            <TabsContent value="passengers" className="mt-0">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Add/Edit Passenger Form */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <UserPlus className="mr-2 h-5 w-5" />
                          {editingPassenger ? 'Edit Passenger' : 'Add Passenger'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...passengerForm}>
                          <form onSubmit={passengerForm.handleSubmit(handlePassengerSubmit)} className="space-y-4">
                            <FormField
                              control={passengerForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="passenger-firstname-input" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={passengerForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="passenger-lastname-input" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={passengerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" {...field} data-testid="passenger-email-input" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={passengerForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input type="tel" {...field} data-testid="passenger-phone-input" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={passengerForm.control}
                              name="dateOfBirth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of Birth</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date" 
                                      {...field} 
                                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                      data-testid="passenger-dob-input"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex space-x-2">
                              <Button 
                                type="submit" 
                                className="flex-1"
                                disabled={createPassengerMutation.isPending || updatePassengerMutation.isPending}
                                data-testid="save-passenger-button"
                              >
                                {editingPassenger ? 'Update' : 'Save'}
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1"
                                onClick={handleClearForm}
                                data-testid="clear-form-button"
                              >
                                Clear
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Passenger List */}
                  <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Passenger List</h3>
                      <div className="flex space-x-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search passengers..."
                            className="pl-10"
                            value={passengerSearch}
                            onChange={(e) => setPassengerSearch(e.target.value)}
                            data-testid="passenger-search-input"
                          />
                        </div>
                      </div>
                    </div>

                    {passengersLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-gray-600">Loading passengers...</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {passengers?.map((passenger: Passenger) => (
                              <tr key={passenger.id} data-testid={`passenger-row-${passenger.id}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                        <span className="text-white font-medium text-sm">
                                          {passenger.firstName[0]}{passenger.lastName[0]}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {passenger.firstName} {passenger.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {passenger.dateOfBirth && `DOB: ${new Date(passenger.dateOfBirth).toLocaleDateString()}`}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {passenger.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {passenger.phone || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditPassenger(passenger)}
                                      data-testid={`edit-passenger-${passenger.id}`}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeletePassenger(passenger.id)}
                                      className="text-red-600 hover:text-red-700"
                                      data-testid={`delete-passenger-${passenger.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets" className="mt-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Ticket Management</h3>
                </div>

                {ticketsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-gray-600">Loading tickets...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ticket Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Passenger
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Flight Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Seat & Class
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
                        {tickets?.map((ticket: any) => (
                          <tr key={ticket.id} data-testid={`ticket-row-${ticket.ticketNumber}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono font-medium text-gray-900">
                                {ticket.ticketNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                Booking: {ticket.bookingReference}
                              </div>
                              <div className="text-xs text-gray-400">
                                Issued: {new Date(ticket.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {ticket.passenger?.firstName} {ticket.passenger?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {ticket.passenger?.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {ticket.flight?.flightNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {ticket.flight?.origin} → {ticket.flight?.destination}
                              </div>
                              <div className="text-xs text-gray-400">
                                {ticket.flight?.departureTime && new Date(ticket.flight.departureTime).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {ticket.seatNumber}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {ticket.seatClass}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  data-testid={`view-ticket-${ticket.ticketNumber}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelTicket(ticket.id)}
                                  className="text-red-600 hover:text-red-700"
                                  data-testid={`cancel-ticket-${ticket.ticketNumber}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </TabsContent>

            {/* Flights Tab */}
            <TabsContent value="flights" className="mt-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Flight Management</h3>
                  <Button onClick={handleAddFlight} data-testid="add-flight-button">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flight
                  </Button>
                </div>

                {flights && flights.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flights.map((flight: Flight) => (
                      <Card key={flight.id} className="hover:shadow-md transition-shadow" data-testid={`flight-card-${flight.flightNumber}`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-lg font-semibold text-gray-900">
                              {flight.flightNumber}
                            </div>
                            <Badge className={flight.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {flight.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-gray-500">From</div>
                                <div className="font-medium">{flight.origin}</div>
                                <div className="text-sm text-gray-600">
                                  {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              <div className="flex-1 px-4">
                                <div className="h-px bg-gray-300 relative">
                                  <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-primary px-1 h-4 w-4" />
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">To</div>
                                <div className="font-medium">{flight.destination}</div>
                                <div className="text-sm text-gray-600">
                                  {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                            <div>
                              <div className="text-gray-500">Aircraft</div>
                              <div className="font-medium">{flight.aircraft}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Gate</div>
                              <div className="font-medium">{flight.gate || 'TBA'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Passengers</div>
                              <div className="font-medium">
                                {flight.totalSeats - flight.availableSeats}/{flight.totalSeats}
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t flex justify-between">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditFlight(flight)}
                              data-testid={`edit-flight-${flight.flightNumber}`}
                            >
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewFlight(flight)}
                              data-testid={`view-flight-${flight.flightNumber}`}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              Details
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700" 
                              onClick={() => handleDeleteFlight(flight.id)}
                              data-testid={`cancel-flight-${flight.flightNumber}`}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Plane className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No flights scheduled</h3>
                    <p className="text-gray-500">Add flights to start managing the schedule.</p>
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Flight Management Modal */}
        <Dialog open={isFlightModalOpen} onOpenChange={setIsFlightModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFlight ? 'Edit Flight' : 'Add New Flight'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...flightForm}>
              <form onSubmit={flightForm.handleSubmit(handleFlightSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={flightForm.control}
                    name="flightNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flight Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="AI841" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={flightForm.control}
                    name="airline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Airline</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Air India" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={flightForm.control}
                    name="aircraft"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aircraft</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Airbus A320" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={flightForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="boarding">Boarding</SelectItem>
                            <SelectItem value="departed">Departed</SelectItem>
                            <SelectItem value="arrived">Arrived</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="delayed">Delayed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={flightForm.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Chennai (MAA)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={flightForm.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Delhi (DEL)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={flightForm.control}
                    name="departureTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departure Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={flightForm.control}
                    name="arrivalTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arrival Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={flightForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={flightForm.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (₹)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="5000.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={flightForm.control}
                    name="gate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gate</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="A3" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={flightForm.control}
                    name="totalSeats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Seats</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={flightForm.control}
                    name="availableSeats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Seats</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseFlightModal}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createFlightMutation.isPending || updateFlightMutation.isPending}
                  >
                    {editingFlight ? 'Update Flight' : 'Create Flight'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Flight Details Modal */}
        <Dialog open={!!viewingFlight} onOpenChange={() => setViewingFlight(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Flight Details - {viewingFlight?.flightNumber}
                <Button variant="ghost" size="sm" onClick={() => setViewingFlight(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            {viewingFlight && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Flight Information</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Airline:</span>
                          <span className="font-medium">{viewingFlight.airline}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Aircraft:</span>
                          <span className="font-medium">{viewingFlight.aircraft}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={viewingFlight.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {viewingFlight.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gate:</span>
                          <span className="font-medium">{viewingFlight.gate || 'TBA'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Route & Timing</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Origin:</span>
                          <span className="font-medium">{viewingFlight.origin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Destination:</span>
                          <span className="font-medium">{viewingFlight.destination}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Departure:</span>
                          <span className="font-medium">{new Date(viewingFlight.departureTime).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Arrival:</span>
                          <span className="font-medium">{new Date(viewingFlight.arrivalTime).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{Math.floor(viewingFlight.duration / 60)}h {viewingFlight.duration % 60}m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary flex items-center justify-center">
                      <IndianRupee className="h-5 w-5 mr-1" />
                      {new Intl.NumberFormat('en-IN').format(parseFloat(viewingFlight.basePrice))}
                    </div>
                    <div className="text-sm text-gray-500">Base Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{viewingFlight.totalSeats}</div>
                    <div className="text-sm text-gray-500">Total Seats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{viewingFlight.availableSeats}</div>
                    <div className="text-sm text-gray-500">Available Seats</div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

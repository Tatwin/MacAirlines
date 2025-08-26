import { apiRequest } from "./queryClient";
import type { SignupData, LoginData, User, Flight, Ticket, Transaction, Passenger, InsertPassenger } from "@shared/schema";

export interface AuthResponse {
  user: User;
  token: string;
}

export class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(method: string, url: string, data?: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async signup(data: SignupData): Promise<AuthResponse> {
    return this.request('POST', '/api/auth/signup', data);
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request('POST', '/api/auth/login', data);
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('GET', '/api/auth/me');
  }

  // Flight methods
  async getAllFlights(): Promise<Flight[]> {
    return this.request('GET', '/api/flights');
  }

  async searchFlights(params: { from: string; to: string; departureDate?: string }): Promise<Flight[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('from', params.from);
    searchParams.set('to', params.to);
    if (params.departureDate) {
      searchParams.set('departureDate', params.departureDate);
    }
    
    return this.request('GET', `/api/flights/search?${searchParams.toString()}`);
  }

  async getFlight(id: string): Promise<Flight> {
    return this.request('GET', `/api/flights/${id}`);
  }

  async getFlightSeats(flightId: string) {
    return this.request('GET', `/api/flights/${flightId}/seats`);
  }

  // Booking methods
  async createBooking(data: {
    flightId: string;
    passengerData: InsertPassenger;
    seatNumber: string;
    paymentMethod: string;
  }) {
    return this.request('POST', '/api/bookings/create', data);
  }

  async getBooking(id: string) {
    return this.request('GET', `/api/bookings/${id}`);
  }

  // User tickets and transactions
  async getUserTickets(): Promise<(Ticket & { flight: Flight; passenger: Passenger })[]> {
    return this.request('GET', '/api/tickets');
  }

  async getUserTransactions(): Promise<Transaction[]> {
    return this.request('GET', '/api/transactions');
  }

  // Employee methods - Passengers
  async getPassengers(search?: string): Promise<Passenger[]> {
    const searchParams = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request('GET', `/api/employee/passengers${searchParams}`);
  }

  async createPassenger(data: InsertPassenger): Promise<Passenger> {
    return this.request('POST', '/api/employee/passengers', data);
  }

  async updatePassenger(id: string, data: Partial<InsertPassenger>): Promise<Passenger> {
    return this.request('PUT', `/api/employee/passengers/${id}`, data);
  }

  async deletePassenger(id: string): Promise<{ message: string }> {
    return this.request('DELETE', `/api/employee/passengers/${id}`);
  }

  // Employee methods - Tickets
  async getAllTickets() {
    return this.request('GET', '/api/employee/tickets');
  }

  async updateTicket(id: string, data: any) {
    return this.request('PUT', `/api/employee/tickets/${id}`, data);
  }

  async deleteTicket(id: string): Promise<{ message: string }> {
    return this.request('DELETE', `/api/employee/tickets/${id}`);
  }

  // Employee methods - Flights
  async createFlight(data: any) {
    return this.request('POST', '/api/employee/flights', data);
  }

  async updateFlight(id: string, data: any) {
    return this.request('PUT', `/api/employee/flights/${id}`, data);
  }

  async deleteFlight(id: string): Promise<{ message: string }> {
    return this.request('DELETE', `/api/employee/flights/${id}`);
  }
}

export const apiClient = new ApiClient();

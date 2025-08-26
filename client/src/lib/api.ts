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

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
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

  async createPassenger(data: any) {
    const response = await fetch('/api/employee/passengers', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create passenger');
    }

    return response.json();
  }

  async updatePassenger(id: string, data: any) {
    const response = await fetch(`/api/employee/passengers/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update passenger');
    }

    return response.json();
  }

  async deletePassenger(id: string) {
    const response = await fetch(`/api/employee/passengers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete passenger');
    }

    return response.json();
  }

  // Employee methods - Tickets
  async getAllTickets() {
    const response = await fetch('/api/employee/tickets', {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }

    return response.json();
  }

  async updateTicket(id: string, data: any) {
    return this.request('PUT', `/api/employee/tickets/${id}`, data);
  }

  async deleteTicket(id: string) {
    const response = await fetch(`/api/employee/tickets/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel ticket');
    }

    return response.json();
  }

  // Employee methods - Flights
  async createFlight(data: any) {
    const response = await fetch('/api/employee/flights', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create flight');
    }

    return response.json();
  }

  async updateFlight(id: string, data: any) {
    const response = await fetch(`/api/employee/flights/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update flight');
    }

    return response.json();
  }

  async deleteFlight(id: string) {
    const response = await fetch(`/api/employee/flights/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete flight');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
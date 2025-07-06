import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface DashboardStats {
  totalFlights: number;
  totalBookings: number;
  totalCustomers: number;
  totalRevenue: number;
  availableSeats: number;
  totalSeats: number;
  occupancyRate: number;
}

export interface ReportData {
  airlineName: string;
  ticketsSold: number; // This represents number of flights
  totalRevenue: number;
  averagePrice: number;
  seatsBooked?: number; // Additional field for seats booked
}

export interface RevenueAnalysis {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  revenueByAirline: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard`).pipe(
      catchError(error => {
        console.error('Error loading dashboard stats:', error);
        return throwError(() => new Error('Failed to load dashboard statistics'));
      })
    );
  }

  getBookingTrends(startDate: string, endDate: string): Observable<ReportData[]> {
    return this.http.get<ReportData[]>(`${this.baseUrl}/booking-trends?startDate=${startDate}&endDate=${endDate}`).pipe(
      catchError(error => {
        console.error('Error loading booking trends:', error);
        return throwError(() => new Error('Failed to load booking trends'));
      })
    );
  }

  getAirlinePerformance(): Observable<ReportData[]> {
    return this.http.get<ReportData[]>(`${this.baseUrl}/airline-performance`).pipe(
      catchError(error => {
        console.error('Error loading airline performance:', error);
        return throwError(() => new Error('Failed to load airline performance'));
      })
    );
  }

  getRevenueAnalysis(startDate: string, endDate: string): Observable<RevenueAnalysis> {
    return this.http.get<RevenueAnalysis>(`${this.baseUrl}/revenue-analysis?startDate=${startDate}&endDate=${endDate}`).pipe(
      catchError(error => {
        console.error('Error loading revenue analysis:', error);
        return throwError(() => new Error('Failed to load revenue analysis'));
      })
    );
  }

  getRevenueByAirline(airline: string, startDate: string, endDate: string): Observable<ReportData[]> {
    return this.http.get<ReportData[]>(`${this.baseUrl}/revenue?airline=${airline}&startDate=${startDate}&endDate=${endDate}`).pipe(
      catchError(error => {
        console.error('Error loading revenue by airline:', error);
        return throwError(() => new Error('Failed to load revenue by airline'));
      })
    );
  }
} 
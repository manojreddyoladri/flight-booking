export interface Booking {
  id: number;
  flightId: number;
  customerId: number;
  price: number;
  bookingDate: string;
}

export interface BookingRequest {
  flightId: number;
  customerId: number;
  price: number;
} 
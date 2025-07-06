export interface Flight {
    id: number;
    airlineName: string;
    totalSeats: number;
    availableSeats: number;
    flightDate: string; // ISO date string
    price: number;
}
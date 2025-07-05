package com.springboot.common.model;

import jakarta.persistence.*;

@Entity
@Table(name = "flights")
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String airlineName;

    @Column(nullable = false)
    private int totalSeats;

    @Column(nullable = false)
    private int bookedSeats = 0;

    // Constructors, getters, setters
    public Flight() {}
    public Flight(String airlineName, int totalSeats) {
        this.airlineName = airlineName;
        this.totalSeats = totalSeats;
        this.bookedSeats = 0;
    }
    
    public Long getId() { return id; }
    public String getAirlineName() { return airlineName; }
    public void setAirlineName(String airlineName) { this.airlineName = airlineName; }
    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }
    public int getBookedSeats() { return bookedSeats; }
    public void setBookedSeats(int bookedSeats) { this.bookedSeats = bookedSeats; }
    
    public int getAvailableSeats() {
        return totalSeats - bookedSeats;
    }
    
    public void bookSeat() {
        if (bookedSeats < totalSeats) {
            bookedSeats++;
        } else {
            throw new RuntimeException("No seats available");
        }
    }
    
    public void cancelSeat() {
        if (bookedSeats > 0) {
            bookedSeats--;
        } else {
            // Don't throw exception, just log a warning since this might happen with old bookings
            System.out.println("Warning: Attempting to cancel seat on flight " + id + " but no seats are currently booked");
        }
    }
}

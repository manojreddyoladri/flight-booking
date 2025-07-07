package com.springboot.common.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

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

    @Column(nullable = false)
    private LocalDate flightDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // Constructors, getters, setters
    public Flight() {}
    
    public Flight(String airlineName, int totalSeats, LocalDate flightDate, BigDecimal price) {
        this.airlineName = airlineName;
        this.totalSeats = totalSeats;
        this.bookedSeats = 0;
        this.flightDate = flightDate;
        this.price = price;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAirlineName() { return airlineName; }
    public void setAirlineName(String airlineName) { this.airlineName = airlineName; }
    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }
    public int getBookedSeats() { return bookedSeats; }
    public void setBookedSeats(int bookedSeats) { this.bookedSeats = bookedSeats; }
    public LocalDate getFlightDate() { return flightDate; }
    public void setFlightDate(LocalDate flightDate) { this.flightDate = flightDate; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public int getAvailableSeats() {
        return totalSeats - bookedSeats;
    }
    
    public void setAvailableSeats(int availableSeats) {
        this.bookedSeats = totalSeats - availableSeats;
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

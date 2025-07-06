package com.springboot.common.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FlightDTO {
    private Long id;
    private String airlineName;
    private int totalSeats;
    private int availableSeats;
    private LocalDate flightDate;
    private BigDecimal price;

    // Constructors, getters, setters
    public FlightDTO() {}
    
    public FlightDTO(Long id, String airlineName, int totalSeats, int availableSeats, LocalDate flightDate, BigDecimal price) {
        this.id = id;
        this.airlineName = airlineName;
        this.totalSeats = totalSeats;
        this.availableSeats = availableSeats;
        this.flightDate = flightDate;
        this.price = price;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAirlineName() { return airlineName; }
    public void setAirlineName(String airlineName) { this.airlineName = airlineName; }
    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }
    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }
    public LocalDate getFlightDate() { return flightDate; }
    public void setFlightDate(LocalDate flightDate) { this.flightDate = flightDate; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}


package com.springboot.common.dto;

public class FlightDTO {
    private Long id;
    private String airlineName;
    private int totalSeats;
    private int availableSeats;

    // Constructors, getters, setters
    public FlightDTO() {}
    public FlightDTO(Long id, String airlineName, int totalSeats, int availableSeats) {
        this.id = id;
        this.airlineName = airlineName;
        this.totalSeats = totalSeats;
        this.availableSeats = availableSeats;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAirlineName() { return airlineName; }
    public void setAirlineName(String airlineName) { this.airlineName = airlineName; }
    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }
    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }
}


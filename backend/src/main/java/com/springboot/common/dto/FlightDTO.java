package com.springboot.common.dto;

public class FlightDTO {
    private Long id;
    private String airlineName;
    private int totalSeats;

    // Constructors, getters, setters
    public FlightDTO() {}
    public FlightDTO(Long id, String airlineName, int totalSeats) {
        this.id = id;
        this.airlineName = airlineName;
        this.totalSeats = totalSeats;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAirlineName() { return airlineName; }
    public void setAirlineName(String airlineName) { this.airlineName = airlineName; }
    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }
}


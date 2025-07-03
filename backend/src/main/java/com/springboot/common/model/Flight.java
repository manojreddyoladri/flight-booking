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

    // Constructors, getters, setters
    public Flight() {}
    public Flight(String airlineName, int totalSeats) {
        this.airlineName = airlineName;
        this.totalSeats = totalSeats;
    }
    public Long getId() { return id; }
    public String getAirlineName() { return airlineName; }
    public void setAirlineName(String airlineName) { this.airlineName = airlineName; }
    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }
}

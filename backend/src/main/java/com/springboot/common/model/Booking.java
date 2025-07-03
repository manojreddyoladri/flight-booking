package com.springboot.common.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "flight_id")
    private Flight flight;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private LocalDateTime bookingDate;

    // Constructors, getters, setters
    public Booking() {}
    public Booking(Flight flight, Customer customer, BigDecimal price) {
        this.flight = flight;
        this.customer = customer;
        this.price = price;
        this.bookingDate = LocalDateTime.now();
    }
    public Long getId() { return id; }
    public Flight getFlight() { return flight; }
    public Customer getCustomer() { return customer; }
    public BigDecimal getPrice() { return price; }
    public LocalDateTime getBookingDate() { return bookingDate; }
}
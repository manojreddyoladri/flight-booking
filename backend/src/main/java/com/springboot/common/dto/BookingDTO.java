package com.springboot.common.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.springboot.common.model.Customer;
import com.springboot.common.model.Flight;

public class BookingDTO {
    private Long id;
    private Long flightId;
    private Long customerId;
    private BigDecimal price;
    private LocalDateTime bookingDate;

    // Constructors, getters, setters
    public BookingDTO() {}
    public BookingDTO(Long id, Long flightId, Long customerId, BigDecimal price, LocalDateTime bookingDate) {
        this.id = id;
        this.flightId = flightId;
        this.customerId = customerId;
        this.price = price;
        this.bookingDate = bookingDate;
    }
    // getters/setters omitted for brevity
    public Long getId() { return id; }
    public Long getFlightId() { return flightId; }
    public Long getCustomerId() { return customerId; }
    public BigDecimal getPrice() { return price; }
    public LocalDateTime getBookingDate() { return bookingDate; }
}

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
    public void setId(Long id) { this.id = id; }
    public Long getFlightId() { return flightId; }
    public void setFlightId(Long flightId) { this.flightId = flightId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
}

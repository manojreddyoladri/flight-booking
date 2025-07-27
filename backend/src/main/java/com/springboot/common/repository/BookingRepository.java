package com.springboot.common.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.common.model.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByFlightAirlineNameAndBookingDateBetween(
            String airlineName, LocalDateTime start, LocalDateTime end);

    void deleteAll();
}

package com.springboot.common.service;

import java.util.List;

import com.springboot.common.dto.BookingDTO;
import com.springboot.common.dto.BookingRequestDTO;
import com.springboot.common.model.Booking;

public interface BookingService {
    BookingDTO createBooking(BookingRequestDTO request);
    List<BookingDTO> getBookingsByCustomer(Long customerId);
    void cancelBooking(Long bookingId);
    List<Booking> findAllBookings();
}
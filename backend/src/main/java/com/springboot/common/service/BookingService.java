package com.springboot.common.service;

import java.util.List;

import com.springboot.common.dto.BookingDTO;
import com.springboot.common.dto.BookingRequestDTO;

public interface BookingService {
    BookingDTO createBooking(BookingRequestDTO request);
    List<BookingDTO> getBookingsByCustomer(Long customerId);
    void cancelBooking(Long bookingId);
    List<BookingDTO> findAllBookings();
}
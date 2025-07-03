package com.springboot.common.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.springboot.common.dto.BookingDTO;
import com.springboot.common.dto.BookingRequestDTO;
import com.springboot.common.model.Booking;
import com.springboot.common.model.Customer;
import com.springboot.common.model.Flight;
import com.springboot.common.repository.BookingRepository;
import com.springboot.common.repository.CustomerRepository;
import com.springboot.common.repository.FlightRepository;

@Service
public class BookingServiceImpl implements BookingService {
    private final BookingRepository bookingRepo;
    private final FlightRepository flightRepo;
    private final CustomerRepository customerRepo;

    public BookingServiceImpl(BookingRepository bookingRepo,
                              FlightRepository flightRepo,
                              CustomerRepository customerRepo) {
        this.bookingRepo = bookingRepo;
        this.flightRepo = flightRepo;
        this.customerRepo = customerRepo;
    }

    @Override
    public BookingDTO createBooking(BookingRequestDTO req) {
        Flight f = flightRepo.findById(req.getFlightId())
            .orElseThrow(() -> new RuntimeException("Flight not found"));
        Customer c = customerRepo.findById(req.getCustomerId())
            .orElseThrow(() -> new RuntimeException("Customer not found"));
        Booking b = new Booking(f, c, req.getPrice());
        b = bookingRepo.save(b);
        return new BookingDTO(b.getId(), f.getId(), c.getId(), b.getPrice(), b.getBookingDate());
    }

    @Override
    public List<BookingDTO> getBookingsByCustomer(Long customerId) {
        return bookingRepo.findByCustomerId(customerId).stream()
            .map(b -> new BookingDTO(b.getId(), b.getFlight().getId(), b.getCustomer().getId(),
                                     b.getPrice(), b.getBookingDate()))
            .collect(Collectors.toList());
    }

    @Override
    public void cancelBooking(Long bookingId) {
        bookingRepo.deleteById(bookingId);
    }
}
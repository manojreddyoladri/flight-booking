package com.springboot.common.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public BookingDTO createBooking(BookingRequestDTO req) {
        Flight f = flightRepo.findById(req.getFlightId())
            .orElseThrow(() -> new RuntimeException("Flight not found"));
        
        // Check if seats are available
        if (f.getAvailableSeats() <= 0) {
            throw new RuntimeException("No seats available for this flight");
        }
        
        Customer c = customerRepo.findById(req.getCustomerId())
            .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        // Book a seat on the flight
        f.bookSeat();
        flightRepo.save(f);
        
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
    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Cancel a seat on the flight (this will handle the case where bookedSeats is 0)
        Flight flight = booking.getFlight();
        flight.cancelSeat();
        flightRepo.save(flight);
        
        bookingRepo.deleteById(bookingId);
    }
    
    @Override
    public List<BookingDTO> findAllBookings() {
        return bookingRepo.findAll().stream()
            .map(b -> new BookingDTO(b.getId(), b.getFlight().getId(), b.getCustomer().getId(),
                                     b.getPrice(), b.getBookingDate()))
            .collect(Collectors.toList());
    }
}
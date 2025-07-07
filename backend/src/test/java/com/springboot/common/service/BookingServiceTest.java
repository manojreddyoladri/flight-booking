package com.springboot.common.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.springboot.common.dto.BookingDTO;
import com.springboot.common.dto.BookingRequestDTO;
import com.springboot.common.model.Booking;
import com.springboot.common.model.Customer;
import com.springboot.common.model.Flight;
import com.springboot.common.repository.BookingRepository;
import com.springboot.common.repository.CustomerRepository;
import com.springboot.common.repository.FlightRepository;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private FlightRepository flightRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private Booking testBooking;
    private BookingRequestDTO testBookingRequest;
    private Customer testCustomer;
    private Flight testFlight;

    @BeforeEach
    void setUp() {
        // Setup test customer
        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setName("John Doe");
        testCustomer.setEmail("john.doe@email.com");

        // Setup test flight
        testFlight = new Flight();
        testFlight.setId(1L);
        testFlight.setAirlineName("Test Airlines");
        testFlight.setTotalSeats(150);
        testFlight.setAvailableSeats(150);
        testFlight.setBookedSeats(0);
        testFlight.setFlightDate(java.time.LocalDate.of(2025, 8, 15));
        testFlight.setPrice(new BigDecimal("299.99"));

        // Setup test booking
        testBooking = new Booking();
        testBooking.setId(1L);
        testBooking.setCustomer(testCustomer);
        testBooking.setFlight(testFlight);
        testBooking.setPrice(new BigDecimal("299.99"));
        testBooking.setBookingDate(LocalDateTime.now());

        // Setup test booking request
        testBookingRequest = new BookingRequestDTO();
        testBookingRequest.setCustomerId(1L);
        testBookingRequest.setFlightId(1L);
        testBookingRequest.setPrice(new BigDecimal("299.99"));
    }

    @Test
    void testCreateBooking_Success() {
        // Arrange
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(testFlight));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);
        when(flightRepository.save(any(Flight.class))).thenReturn(testFlight);

        // Act
        BookingDTO result = bookingService.createBooking(testBookingRequest);

        // Assert
        assertNotNull(result);
        assertEquals(testBooking.getId(), result.getId());
        assertEquals(testBooking.getPrice(), result.getPrice());
        assertEquals(testCustomer.getId(), result.getCustomerId());
        assertEquals(testFlight.getId(), result.getFlightId());

        verify(customerRepository).findById(1L);
        verify(flightRepository).findById(1L);
        verify(bookingRepository).save(any(Booking.class));
        verify(flightRepository).save(any(Flight.class));
    }

    @Test
    void testCreateBooking_CustomerNotFound() {
        // Arrange
        when(customerRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(testBookingRequest);
        });

        verify(customerRepository).findById(1L);
        verify(flightRepository, never()).findById(anyLong());
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_FlightNotFound() {
        // Arrange
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(flightRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(testBookingRequest);
        });

        verify(customerRepository).findById(1L);
        verify(flightRepository).findById(1L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_FlightFull() {
        // Arrange
        testFlight.setAvailableSeats(0);
        testFlight.setBookedSeats(150);
        
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(testFlight));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(testBookingRequest);
        });

        verify(customerRepository).findById(1L);
        verify(flightRepository).findById(1L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testGetBookingsByCustomer_Success() {
        // Arrange
        List<Booking> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findByCustomerId(1L)).thenReturn(bookings);

        // Act
        List<BookingDTO> result = bookingService.getBookingsByCustomer(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testBooking.getId(), result.get(0).getId());
        assertEquals(testBooking.getPrice(), result.get(0).getPrice());

        verify(bookingRepository).findByCustomerId(1L);
    }

    @Test
    void testGetBookingsByCustomer_EmptyList() {
        // Arrange
        when(bookingRepository.findByCustomerId(1L)).thenReturn(Arrays.asList());

        // Act
        List<BookingDTO> result = bookingService.getBookingsByCustomer(1L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(bookingRepository).findByCustomerId(1L);
    }

    @Test
    void testCancelBooking_Success() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(flightRepository.save(any(Flight.class))).thenReturn(testFlight);

        // Act
        bookingService.cancelBooking(1L);

        // Assert
        verify(bookingRepository).findById(1L);
        verify(bookingRepository).deleteById(1L);
        verify(flightRepository).save(any(Flight.class));
    }

    @Test
    void testCancelBooking_BookingNotFound() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            bookingService.cancelBooking(1L);
        });

        verify(bookingRepository).findById(1L);
        verify(bookingRepository, never()).deleteById(anyLong());
        verify(flightRepository, never()).save(any(Flight.class));
    }

    @Test
    void testFindAllBookings_Success() {
        // Arrange
        Booking booking1 = new Booking();
        booking1.setId(1L);
        booking1.setCustomer(testCustomer);
        booking1.setFlight(testFlight);
        booking1.setPrice(new BigDecimal("299.99"));

        Booking booking2 = new Booking();
        booking2.setId(2L);
        booking2.setCustomer(testCustomer);
        booking2.setFlight(testFlight);
        booking2.setPrice(new BigDecimal("399.99"));

        List<Booking> bookings = Arrays.asList(booking1, booking2);
        when(bookingRepository.findAll()).thenReturn(bookings);

        // Act
        List<BookingDTO> result = bookingService.findAllBookings();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(booking1.getId(), result.get(0).getId());
        assertEquals(booking2.getId(), result.get(1).getId());

        verify(bookingRepository).findAll();
    }

    @Test
    void testFindAllBookings_EmptyList() {
        // Arrange
        when(bookingRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<BookingDTO> result = bookingService.findAllBookings();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(bookingRepository).findAll();
    }

    @Test
    void testCreateBooking_UpdatesFlightSeats() {
        // Arrange
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(testFlight));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);
        when(flightRepository.save(any(Flight.class))).thenReturn(testFlight);

        // Act
        bookingService.createBooking(testBookingRequest);

        // Assert
        verify(flightRepository).save(argThat(flight -> 
            flight.getAvailableSeats() == 149 && 
            flight.getBookedSeats() == 1
        ));
    }

    @Test
    void testCancelBooking_UpdatesFlightSeats() {
        // Arrange
        testFlight.setAvailableSeats(149);
        testFlight.setBookedSeats(1);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(flightRepository.save(any(Flight.class))).thenReturn(testFlight);

        // Act
        bookingService.cancelBooking(1L);

        // Assert
        verify(flightRepository).save(argThat(flight -> 
            flight.getAvailableSeats() == 150 && 
            flight.getBookedSeats() == 0
        ));
    }
} 
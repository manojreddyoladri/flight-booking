package com.springboot.common.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.springboot.common.dto.ReportDTO;
import com.springboot.common.model.Booking;
import com.springboot.common.model.Customer;
import com.springboot.common.model.Flight;
import com.springboot.common.repository.BookingRepository;
import com.springboot.common.repository.CustomerRepository;
import com.springboot.common.repository.FlightRepository;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private FlightRepository flightRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    private Booking testBooking;
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
        testFlight.setAvailableSeats(149);
        testFlight.setBookedSeats(1);
        testFlight.setFlightDate(LocalDate.of(2025, 8, 15));
        testFlight.setPrice(new BigDecimal("299.99"));

        // Setup test booking
        testBooking = new Booking();
        testBooking.setId(1L);
        testBooking.setCustomer(testCustomer);
        testBooking.setFlight(testFlight);
        testBooking.setPrice(new BigDecimal("299.99"));
        testBooking.setBookingDate(LocalDateTime.now());
    }

    @Test
    void testRevenueByAirline_Success() {
        // Arrange
        String airlineName = "Test Airlines";
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now().plusDays(7);
        
        List<Booking> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findByFlightAirlineNameAndBookingDateBetween(airlineName, start, end))
            .thenReturn(bookings);

        // Act
        List<ReportDTO> result = reportService.revenueByAirline(airlineName, start, end);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(airlineName, result.get(0).getAirlineName());
        assertEquals(1, result.get(0).getTicketsSold());
        assertEquals(new BigDecimal("299.99"), result.get(0).getTotalRevenue());

        verify(bookingRepository).findByFlightAirlineNameAndBookingDateBetween(airlineName, start, end);
    }

    @Test
    void testRevenueByAirline_EmptyResult() {
        // Arrange
        String airlineName = "NonExistent Airlines";
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now().plusDays(7);
        
        when(bookingRepository.findByFlightAirlineNameAndBookingDateBetween(airlineName, start, end))
            .thenReturn(Arrays.asList());

        // Act
        List<ReportDTO> result = reportService.revenueByAirline(airlineName, start, end);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(bookingRepository).findByFlightAirlineNameAndBookingDateBetween(airlineName, start, end);
    }

    @Test
    void testGetDashboardStats_Success() {
        // Arrange
        List<Flight> futureFlights = Arrays.asList(testFlight);
        List<Flight> allFlights = Arrays.asList(testFlight);
        List<Booking> bookings = Arrays.asList(testBooking);
        List<Customer> customers = Arrays.asList(testCustomer);

        when(flightRepository.findByFlightDateGreaterThanEqual(any(LocalDate.class)))
            .thenReturn(futureFlights);
        when(flightRepository.findAll()).thenReturn(allFlights);
        when(bookingRepository.findAll()).thenReturn(bookings);
        when(customerRepository.findAll()).thenReturn(customers);

        // Act
        Map<String, Object> result = reportService.getDashboardStats();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.get("totalFlights"));
        assertEquals(1, result.get("totalBookings"));
        assertEquals(1, result.get("totalCustomers"));
        assertEquals(new BigDecimal("299.99"), result.get("totalRevenue"));
        assertEquals(149, result.get("availableSeats"));
        assertEquals(150, result.get("totalSeats"));
        assertNotNull(result.get("occupancyRate"));

        verify(flightRepository).findByFlightDateGreaterThanEqual(any(LocalDate.class));
        verify(flightRepository).findAll();
        verify(bookingRepository).findAll();
        verify(customerRepository).findAll();
    }

    @Test
    void testGetDashboardStats_EmptyData() {
        // Arrange
        when(flightRepository.findByFlightDateGreaterThanEqual(any(LocalDate.class)))
            .thenReturn(Arrays.asList());
        when(flightRepository.findAll()).thenReturn(Arrays.asList());
        when(bookingRepository.findAll()).thenReturn(Arrays.asList());
        when(customerRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        Map<String, Object> result = reportService.getDashboardStats();

        // Assert
        assertNotNull(result);
        assertEquals(0, result.get("totalFlights"));
        assertEquals(0, result.get("totalBookings"));
        assertEquals(0, result.get("totalCustomers"));
        assertEquals(BigDecimal.ZERO, result.get("totalRevenue"));
        assertEquals(0, result.get("availableSeats"));
        assertEquals(0, result.get("totalSeats"));
        assertEquals(0.0, result.get("occupancyRate"));
    }

    @Test
    void testGetBookingTrends_Success() {
        // Arrange
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now().plusDays(7);
        
        List<Booking> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findAll()).thenReturn(bookings);

        // Act
        List<ReportDTO> result = reportService.getBookingTrends(startDate, endDate);

        // Assert
        assertNotNull(result);
        // The result should contain booking trends grouped by date
        verify(bookingRepository).findAll();
    }

    @Test
    void testGetBookingTrends_EmptyData() {
        // Arrange
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now().plusDays(7);
        
        when(bookingRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<ReportDTO> result = reportService.getBookingTrends(startDate, endDate);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(bookingRepository).findAll();
    }

    @Test
    void testGetAirlinePerformance_Success() {
        // Arrange
        List<Flight> futureFlights = Arrays.asList(testFlight);
        when(flightRepository.findByFlightDateGreaterThanEqual(any(LocalDate.class)))
            .thenReturn(futureFlights);

        // Act
        List<ReportDTO> result = reportService.getAirlinePerformance();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Airlines", result.get(0).getAirlineName());
        assertEquals(1, result.get(0).getTicketsSold()); // bookedSeats

        verify(flightRepository).findByFlightDateGreaterThanEqual(any(LocalDate.class));
    }

    @Test
    void testGetAirlinePerformance_EmptyData() {
        // Arrange
        when(flightRepository.findByFlightDateGreaterThanEqual(any(LocalDate.class)))
            .thenReturn(Arrays.asList());

        // Act
        List<ReportDTO> result = reportService.getAirlinePerformance();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(flightRepository).findByFlightDateGreaterThanEqual(any(LocalDate.class));
    }

    @Test
    void testGetRevenueAnalysis_Success() {
        // Arrange
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now().plusDays(7);
        
        List<Booking> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findAll()).thenReturn(bookings);

        // Act
        Map<String, Object> result = reportService.getRevenueAnalysis(startDate, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("299.99"), result.get("totalRevenue"));
        assertEquals(1, result.get("totalBookings"));
        assertEquals(new BigDecimal("299.99"), result.get("averageBookingValue"));
        assertNotNull(result.get("revenueByAirline"));

        verify(bookingRepository).findAll();
    }

    @Test
    void testGetRevenueAnalysis_EmptyData() {
        // Arrange
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now().plusDays(7);
        
        when(bookingRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        Map<String, Object> result = reportService.getRevenueAnalysis(startDate, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result.get("totalRevenue"));
        assertEquals(0, result.get("totalBookings"));
        assertEquals(BigDecimal.ZERO, result.get("averageBookingValue"));
        assertNotNull(result.get("revenueByAirline"));

        verify(bookingRepository).findAll();
    }

    @Test
    void testGetDashboardStats_MultipleFlights() {
        // Arrange
        Flight flight1 = new Flight();
        flight1.setId(1L);
        flight1.setAirlineName("Airline 1");
        flight1.setTotalSeats(100);
        flight1.setAvailableSeats(80);
        flight1.setBookedSeats(20);
        flight1.setFlightDate(LocalDate.of(2025, 8, 15));
        flight1.setPrice(new BigDecimal("199.99"));

        Flight flight2 = new Flight();
        flight2.setId(2L);
        flight2.setAirlineName("Airline 2");
        flight2.setTotalSeats(200);
        flight2.setAvailableSeats(150);
        flight2.setBookedSeats(50);
        flight2.setFlightDate(LocalDate.of(2025, 8, 16));
        flight2.setPrice(new BigDecimal("299.99"));

        List<Flight> futureFlights = Arrays.asList(flight1, flight2);
        List<Flight> allFlights = Arrays.asList(flight1, flight2);
        List<Booking> bookings = Arrays.asList(testBooking);
        List<Customer> customers = Arrays.asList(testCustomer);

        when(flightRepository.findByFlightDateGreaterThanEqual(any(LocalDate.class)))
            .thenReturn(futureFlights);
        when(flightRepository.findAll()).thenReturn(allFlights);
        when(bookingRepository.findAll()).thenReturn(bookings);
        when(customerRepository.findAll()).thenReturn(customers);

        // Act
        Map<String, Object> result = reportService.getDashboardStats();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.get("totalFlights"));
        assertEquals(1, result.get("totalBookings"));
        assertEquals(1, result.get("totalCustomers"));
        assertEquals(new BigDecimal("299.99"), result.get("totalRevenue"));
        assertEquals(230, result.get("availableSeats")); // 80 + 150
        assertEquals(300, result.get("totalSeats")); // 100 + 200
        assertEquals(23.33, (Double) result.get("occupancyRate"), 0.01); // (70/300) * 100
    }

    @Test
    void testRevenueByAirline_MultipleBookings() {
        // Arrange
        String airlineName = "Test Airlines";
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now().plusDays(7);
        
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
        when(bookingRepository.findByFlightAirlineNameAndBookingDateBetween(airlineName, start, end))
            .thenReturn(bookings);

        // Act
        List<ReportDTO> result = reportService.revenueByAirline(airlineName, start, end);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(airlineName, result.get(0).getAirlineName());
        assertEquals(1, result.get(0).getTicketsSold()); // unique flights
        assertEquals(new BigDecimal("699.98"), result.get(0).getTotalRevenue()); // 299.99 + 399.99
        assertEquals(new BigDecimal("349.99"), result.get(0).getAveragePrice()); // (699.98 / 2)
    }
} 
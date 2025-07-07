package com.springboot.common.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.springboot.common.dto.FlightDTO;
import com.springboot.common.model.Flight;
import com.springboot.common.repository.FlightRepository;

@ExtendWith(MockitoExtension.class)
class FlightServiceTest {

    @Mock
    private FlightRepository flightRepository;

    @InjectMocks
    private FlightServiceImpl flightService;

    private Flight testFlight;
    private FlightDTO testFlightDTO;

    @BeforeEach
    void setUp() {
        testFlight = new Flight();
        testFlight.setId(1L);
        testFlight.setAirlineName("Test Airlines");
        testFlight.setTotalSeats(150);
        testFlight.setAvailableSeats(150);
        testFlight.setFlightDate(LocalDate.of(2025, 8, 15));
        testFlight.setPrice(new BigDecimal("299.99"));

        testFlightDTO = new FlightDTO();
        testFlightDTO.setAirlineName("Test Airlines");
        testFlightDTO.setTotalSeats(150);
        testFlightDTO.setFlightDate(LocalDate.of(2025, 8, 15));
        testFlightDTO.setPrice(new BigDecimal("299.99"));
    }

    @Test
    void testAddFlight_Success() {
        // Arrange
        when(flightRepository.save(any(Flight.class))).thenReturn(testFlight);

        // Act
        FlightDTO result = flightService.addFlight(testFlightDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testFlight.getId(), result.getId());
        assertEquals(testFlight.getAirlineName(), result.getAirlineName());
        assertEquals(testFlight.getTotalSeats(), result.getTotalSeats());
        assertEquals(testFlight.getAvailableSeats(), result.getAvailableSeats());
        assertEquals(testFlight.getFlightDate(), result.getFlightDate());
        assertEquals(testFlight.getPrice(), result.getPrice());

        verify(flightRepository).save(any(Flight.class));
    }

    @Test
    void testListAll_Success() {
        // Arrange
        Flight flight1 = new Flight();
        flight1.setId(1L);
        flight1.setAirlineName("Airline 1");
        flight1.setTotalSeats(100);
        flight1.setAvailableSeats(100);
        flight1.setFlightDate(LocalDate.of(2025, 8, 15));
        flight1.setPrice(new BigDecimal("199.99"));

        Flight flight2 = new Flight();
        flight2.setId(2L);
        flight2.setAirlineName("Airline 2");
        flight2.setTotalSeats(200);
        flight2.setAvailableSeats(200);
        flight2.setFlightDate(LocalDate.of(2025, 8, 16));
        flight2.setPrice(new BigDecimal("299.99"));

        List<Flight> flights = Arrays.asList(flight1, flight2);
        when(flightRepository.findAll()).thenReturn(flights);

        // Act
        List<FlightDTO> result = flightService.listAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Airline 1", result.get(0).getAirlineName());
        assertEquals("Airline 2", result.get(1).getAirlineName());

        verify(flightRepository).findAll();
    }

    @Test
    void testGetFlightsByDate_Success() {
        // Arrange
        LocalDate targetDate = LocalDate.of(2025, 8, 15);
        List<Flight> flights = Arrays.asList(testFlight);
        when(flightRepository.findByFlightDate(targetDate)).thenReturn(flights);

        // Act
        List<FlightDTO> result = flightService.getFlightsByDate(targetDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testFlight.getAirlineName(), result.get(0).getAirlineName());
        assertEquals(testFlight.getFlightDate(), result.get(0).getFlightDate());

        verify(flightRepository).findByFlightDate(targetDate);
    }

    @Test
    void testGetFutureFlights_Success() {
        // Arrange
        LocalDate fromDate = LocalDate.of(2025, 8, 15);
        List<Flight> flights = Arrays.asList(testFlight);
        when(flightRepository.findByFlightDateGreaterThanEqual(fromDate)).thenReturn(flights);

        // Act
        List<FlightDTO> result = flightService.getFutureFlights(fromDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testFlight.getAirlineName(), result.get(0).getAirlineName());

        verify(flightRepository).findByFlightDateGreaterThanEqual(fromDate);
    }

    @Test
    void testUpdateFlight_Success() {
        // Arrange
        Long flightId = 1L;
        when(flightRepository.findById(flightId)).thenReturn(Optional.of(testFlight));
        when(flightRepository.save(any(Flight.class))).thenReturn(testFlight);

        FlightDTO updateDTO = new FlightDTO();
        updateDTO.setAirlineName("Updated Airlines");
        updateDTO.setTotalSeats(200);
        updateDTO.setFlightDate(LocalDate.of(2025, 9, 15));
        updateDTO.setPrice(new BigDecimal("399.99"));

        // Act
        FlightDTO result = flightService.updateFlight(flightId, updateDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testFlight.getId(), result.getId());

        verify(flightRepository).findById(flightId);
        verify(flightRepository).save(any(Flight.class));
    }

    @Test
    void testUpdateFlight_FlightNotFound() {
        // Arrange
        Long flightId = 999L;
        when(flightRepository.findById(flightId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            flightService.updateFlight(flightId, testFlightDTO);
        });

        verify(flightRepository).findById(flightId);
        verify(flightRepository, never()).save(any(Flight.class));
    }

    @Test
    void testDeleteFlight_Success() {
        // Arrange
        Long flightId = 1L;
        when(flightRepository.existsById(flightId)).thenReturn(true);

        // Act
        flightService.deleteFlight(flightId);

        // Assert
        verify(flightRepository).existsById(flightId);
        verify(flightRepository).deleteById(flightId);
    }

    @Test
    void testDeleteFlight_FlightNotFound() {
        // Arrange
        Long flightId = 999L;
        when(flightRepository.existsById(flightId)).thenReturn(false);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            flightService.deleteFlight(flightId);
        });

        verify(flightRepository).existsById(flightId);
        verify(flightRepository, never()).deleteById(anyLong());
    }

    @Test
    void testCheckAvailability_Success() {
        // Arrange
        Long flightId = 1L;
        when(flightRepository.findById(flightId)).thenReturn(Optional.of(testFlight));

        // Act
        int result = flightService.checkAvailability(flightId);

        // Assert
        assertEquals(testFlight.getAvailableSeats(), result);
        verify(flightRepository).findById(flightId);
    }

    @Test
    void testCheckAvailability_FlightNotFound() {
        // Arrange
        Long flightId = 999L;
        when(flightRepository.findById(flightId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            flightService.checkAvailability(flightId);
        });

        verify(flightRepository).findById(flightId);
    }

    @Test
    void testListAll_EmptyList() {
        // Arrange
        when(flightRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<FlightDTO> result = flightService.listAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(flightRepository).findAll();
    }

    @Test
    void testGetFlightsByDate_EmptyList() {
        // Arrange
        LocalDate targetDate = LocalDate.of(2025, 8, 15);
        when(flightRepository.findByFlightDate(targetDate)).thenReturn(Arrays.asList());

        // Act
        List<FlightDTO> result = flightService.getFlightsByDate(targetDate);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(flightRepository).findByFlightDate(targetDate);
    }

    @Test
    void testGetFutureFlights_EmptyList() {
        // Arrange
        LocalDate fromDate = LocalDate.of(2025, 8, 15);
        when(flightRepository.findByFlightDateGreaterThanEqual(fromDate)).thenReturn(Arrays.asList());

        // Act
        List<FlightDTO> result = flightService.getFutureFlights(fromDate);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(flightRepository).findByFlightDateGreaterThanEqual(fromDate);
    }
} 
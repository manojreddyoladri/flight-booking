package com.springboot.common.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.springboot.common.dto.FlightDTO;
import com.springboot.common.model.Flight;
import com.springboot.common.service.FlightService;

@ExtendWith(MockitoExtension.class)
class FlightControllerTest {

    @Mock
    private FlightService flightService;

    @InjectMocks
    private FlightController flightController;

    private FlightDTO testFlightDTO;
    private Flight testFlight;

    @BeforeEach
    void setUp() {
        testFlightDTO = new FlightDTO();
        testFlightDTO.setAirlineName("Test Airlines");
        testFlightDTO.setTotalSeats(150);
        testFlightDTO.setFlightDate(LocalDate.of(2025, 8, 15));
        testFlightDTO.setPrice(new BigDecimal("299.99"));

        testFlight = new Flight();
        testFlight.setId(1L);
        testFlight.setAirlineName("Test Airlines");
        testFlight.setTotalSeats(150);
        testFlight.setAvailableSeats(150);
        testFlight.setBookedSeats(0);
        testFlight.setFlightDate(LocalDate.of(2025, 8, 15));
        testFlight.setPrice(new BigDecimal("299.99"));
    }

    @Test
    void testAdd_Success() {
        when(flightService.addFlight(any(FlightDTO.class))).thenReturn(testFlightDTO);
        ResponseEntity<FlightDTO> response = flightController.add(testFlightDTO);
        assert response.getStatusCode() == HttpStatus.OK;
        assert response.getBody() != null;
        assert response.getBody().getAirlineName().equals("Test Airlines");
        assert response.getBody().getTotalSeats() == 150;
        assert response.getBody().getPrice().equals(new BigDecimal("299.99"));
        verify(flightService).addFlight(any(FlightDTO.class));
    }

    @Test
    void testAll_Success() {
        FlightDTO flight1 = new FlightDTO();
        flight1.setId(1L);
        flight1.setAirlineName("Airline 1");
        flight1.setTotalSeats(100);
        flight1.setAvailableSeats(100);
        flight1.setFlightDate(LocalDate.of(2025, 8, 15));
        flight1.setPrice(new BigDecimal("199.99"));

        FlightDTO flight2 = new FlightDTO();
        flight2.setId(2L);
        flight2.setAirlineName("Airline 2");
        flight2.setTotalSeats(200);
        flight2.setAvailableSeats(200);
        flight2.setFlightDate(LocalDate.of(2025, 8, 16));
        flight2.setPrice(new BigDecimal("299.99"));

        List<FlightDTO> flights = Arrays.asList(flight1, flight2);
        when(flightService.listAll()).thenReturn(flights);
        ResponseEntity<List<FlightDTO>> response = flightController.all();
        assert response.getStatusCode() == HttpStatus.OK;
        assert response.getBody() != null;
        assert response.getBody().size() == 2;
        verify(flightService).listAll();
    }

    @Test
    void testGetByDate_Success() {
        LocalDate targetDate = LocalDate.of(2025, 8, 15);
        List<FlightDTO> flights = Arrays.asList(testFlightDTO);
        when(flightService.getFlightsByDate(targetDate)).thenReturn(flights);
        ResponseEntity<List<FlightDTO>> response = flightController.getByDate(targetDate);
        assert response.getStatusCode() == HttpStatus.OK;
        assert response.getBody() != null;
        assert response.getBody().size() == 1;
        verify(flightService).getFlightsByDate(targetDate);
    }

    @Test
    void testGetFutureFlights_Success() {
        LocalDate fromDate = LocalDate.of(2025, 8, 15);
        List<FlightDTO> flights = Arrays.asList(testFlightDTO);
        when(flightService.getFutureFlights(fromDate)).thenReturn(flights);
        ResponseEntity<List<FlightDTO>> response = flightController.getFutureFlights(fromDate);
        assert response.getStatusCode() == HttpStatus.OK;
        assert response.getBody() != null;
        assert response.getBody().size() == 1;
        verify(flightService).getFutureFlights(fromDate);
    }

    @Test
    void testUpdate_Success() {
        Long flightId = 1L;
        when(flightService.updateFlight(eq(flightId), any(FlightDTO.class))).thenReturn(testFlightDTO);
        ResponseEntity<FlightDTO> response = flightController.update(flightId, testFlightDTO);
        assert response.getStatusCode() == HttpStatus.OK;
        assert response.getBody() != null;
        assert response.getBody().getAirlineName().equals("Test Airlines");
        verify(flightService).updateFlight(eq(flightId), any(FlightDTO.class));
    }

    @Test
    void testDelete_Success() {
        Long flightId = 1L;
        doNothing().when(flightService).deleteFlight(flightId);
        ResponseEntity<Void> response = flightController.delete(flightId);
        assert response.getStatusCode() == HttpStatus.NO_CONTENT;
        verify(flightService).deleteFlight(flightId);
    }

    @Test
    void testAvailability_Success() {
        Long flightId = 1L;
        when(flightService.checkAvailability(flightId)).thenReturn(150);
        ResponseEntity<Integer> response = flightController.availability(flightId);
        assert response.getStatusCode() == HttpStatus.OK;
        assert response.getBody() != null;
        assert response.getBody() == 150;
        verify(flightService).checkAvailability(flightId);
    }

    @Test
    void testGetFutureFlightsToday_Success() {
        List<FlightDTO> flights = Arrays.asList(testFlightDTO);
        when(flightService.getFutureFlights(any(LocalDate.class))).thenReturn(flights);
        ResponseEntity<List<FlightDTO>> response = flightController.getFutureFlightsToday();
        assert response.getStatusCode() == HttpStatus.OK;
        assert response.getBody() != null;
        assert response.getBody().size() == 1;
        verify(flightService).getFutureFlights(any(LocalDate.class));
    }
} 
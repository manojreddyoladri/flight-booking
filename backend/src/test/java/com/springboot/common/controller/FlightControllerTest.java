package com.springboot.common.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.common.dto.FlightDTO;
import com.springboot.common.model.Flight;
import com.springboot.common.service.FlightService;

@WebMvcTest(FlightController.class)
class FlightControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FlightService flightService;

    @Autowired
    private ObjectMapper objectMapper;

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
    void testAddFlight_Success() throws Exception {
        // Arrange
        when(flightService.addFlight(any(FlightDTO.class))).thenReturn(testFlightDTO);

        // Act & Assert
        mockMvc.perform(post("/api/flights")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testFlightDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.airlineName").value("Test Airlines"))
                .andExpect(jsonPath("$.totalSeats").value(150))
                .andExpect(jsonPath("$.price").value(299.99));

        verify(flightService).addFlight(any(FlightDTO.class));
    }

    @Test
    void testAddFlight_BadRequest() throws Exception {
        // Arrange
        FlightDTO invalidFlightDTO = new FlightDTO();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/api/flights")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidFlightDTO)))
                .andExpect(status().isBadRequest());

        verify(flightService, never()).addFlight(any(FlightDTO.class));
    }

    @Test
    void testListAllFlights_Success() throws Exception {
        // Arrange
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

        when(flightService.listAll()).thenReturn(Arrays.asList(flight1, flight2));

        // Act & Assert
        mockMvc.perform(get("/api/flights"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].airlineName").value("Airline 1"))
                .andExpect(jsonPath("$[1].airlineName").value("Airline 2"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        verify(flightService).listAll();
    }

    @Test
    void testListAllFlights_EmptyList() throws Exception {
        // Arrange
        when(flightService.listAll()).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/flights"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(flightService).listAll();
    }

    @Test
    void testGetFlightsByDate_Success() throws Exception {
        // Arrange
        LocalDate targetDate = LocalDate.of(2025, 8, 15);
        when(flightService.getFlightsByDate(targetDate)).thenReturn(Arrays.asList(testFlightDTO));

        // Act & Assert
        mockMvc.perform(get("/api/flights/date")
                .param("date", "2025-08-15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].airlineName").value("Test Airlines"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(flightService).getFlightsByDate(targetDate);
    }

    @Test
    void testGetFlightsByDate_InvalidDate() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/flights/date")
                .param("date", "invalid-date"))
                .andExpect(status().isBadRequest());

        verify(flightService, never()).getFlightsByDate(any(LocalDate.class));
    }

    @Test
    void testGetFutureFlights_Success() throws Exception {
        // Arrange
        LocalDate fromDate = LocalDate.of(2025, 8, 15);
        when(flightService.getFutureFlights(fromDate)).thenReturn(Arrays.asList(testFlightDTO));

        // Act & Assert
        mockMvc.perform(get("/api/flights/future")
                .param("fromDate", "2025-08-15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].airlineName").value("Test Airlines"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(flightService).getFutureFlights(fromDate);
    }

    @Test
    void testGetFutureFlights_InvalidDate() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/flights/future")
                .param("fromDate", "invalid-date"))
                .andExpect(status().isBadRequest());

        verify(flightService, never()).getFutureFlights(any(LocalDate.class));
    }

    @Test
    void testUpdateFlight_Success() throws Exception {
        // Arrange
        Long flightId = 1L;
        when(flightService.updateFlight(eq(flightId), any(FlightDTO.class))).thenReturn(testFlightDTO);

        // Act & Assert
        mockMvc.perform(put("/api/flights/{id}", flightId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testFlightDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.airlineName").value("Test Airlines"));

        verify(flightService).updateFlight(eq(flightId), any(FlightDTO.class));
    }

    @Test
    void testUpdateFlight_NotFound() throws Exception {
        // Arrange
        Long flightId = 999L;
        when(flightService.updateFlight(eq(flightId), any(FlightDTO.class)))
                .thenThrow(new RuntimeException("Flight not found"));

        // Act & Assert
        mockMvc.perform(put("/api/flights/{id}", flightId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testFlightDTO)))
                .andExpect(status().isInternalServerError());

        verify(flightService).updateFlight(eq(flightId), any(FlightDTO.class));
    }

    @Test
    void testDeleteFlight_Success() throws Exception {
        // Arrange
        Long flightId = 1L;
        doNothing().when(flightService).deleteFlight(flightId);

        // Act & Assert
        mockMvc.perform(delete("/api/flights/{id}", flightId))
                .andExpect(status().isNoContent());

        verify(flightService).deleteFlight(flightId);
    }

    @Test
    void testDeleteFlight_NotFound() throws Exception {
        // Arrange
        Long flightId = 999L;
        doThrow(new RuntimeException("Flight not found")).when(flightService).deleteFlight(flightId);

        // Act & Assert
        mockMvc.perform(delete("/api/flights/{id}", flightId))
                .andExpect(status().isInternalServerError());

        verify(flightService).deleteFlight(flightId);
    }

    @Test
    void testCheckAvailability_Success() throws Exception {
        // Arrange
        Long flightId = 1L;
        when(flightService.checkAvailability(flightId)).thenReturn(150);

        // Act & Assert
        mockMvc.perform(get("/api/flights/{id}/availability", flightId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(150));

        verify(flightService).checkAvailability(flightId);
    }

    @Test
    void testCheckAvailability_NotFound() throws Exception {
        // Arrange
        Long flightId = 999L;
        when(flightService.checkAvailability(flightId))
                .thenThrow(new RuntimeException("Flight not found"));

        // Act & Assert
        mockMvc.perform(get("/api/flights/{id}/availability", flightId))
                .andExpect(status().isInternalServerError());

        verify(flightService).checkAvailability(flightId);
    }

    @Test
    void testGetFutureFlightsToday_Success() throws Exception {
        // Arrange
        when(flightService.getFutureFlights(any(LocalDate.class))).thenReturn(Arrays.asList(testFlightDTO));

        // Act & Assert
        mockMvc.perform(get("/api/flights/future-today"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].airlineName").value("Test Airlines"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(flightService).getFutureFlights(any(LocalDate.class));
    }

    @Test
    void testAddFlight_ValidationError() throws Exception {
        // Arrange
        FlightDTO invalidFlightDTO = new FlightDTO();
        invalidFlightDTO.setAirlineName(""); // Empty airline name
        invalidFlightDTO.setTotalSeats(-1); // Invalid seats
        invalidFlightDTO.setPrice(new BigDecimal("-100")); // Negative price

        // Act & Assert
        mockMvc.perform(post("/api/flights")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidFlightDTO)))
                .andExpect(status().isBadRequest());

        verify(flightService, never()).addFlight(any(FlightDTO.class));
    }

    @Test
    void testUpdateFlight_ValidationError() throws Exception {
        // Arrange
        Long flightId = 1L;
        FlightDTO invalidFlightDTO = new FlightDTO();
        invalidFlightDTO.setAirlineName(""); // Empty airline name

        // Act & Assert
        mockMvc.perform(put("/api/flights/{id}", flightId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidFlightDTO)))
                .andExpect(status().isBadRequest());

        verify(flightService, never()).updateFlight(anyLong(), any(FlightDTO.class));
    }
} 
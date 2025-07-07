package com.springboot.common.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.common.dto.BookingDTO;
import com.springboot.common.dto.BookingRequestDTO;
import com.springboot.common.service.BookingService;

@WebMvcTest(BookingController.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

    @Autowired
    private ObjectMapper objectMapper;

    private BookingRequestDTO testBookingRequest;
    private BookingDTO testBookingDTO;

    @BeforeEach
    void setUp() {
        testBookingRequest = new BookingRequestDTO();
        testBookingRequest.setCustomerId(1L);
        testBookingRequest.setFlightId(1L);
        testBookingRequest.setPrice(new BigDecimal("299.99"));

        testBookingDTO = new BookingDTO();
        testBookingDTO.setId(1L);
        testBookingDTO.setCustomerId(1L);
        testBookingDTO.setFlightId(1L);
        testBookingDTO.setPrice(new BigDecimal("299.99"));
        testBookingDTO.setBookingDate(LocalDateTime.now());
    }

    @Test
    void testCreateBooking_Success() throws Exception {
        // Arrange
        when(bookingService.createBooking(any(BookingRequestDTO.class))).thenReturn(testBookingDTO);

        // Act & Assert
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBookingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.customerId").value(1))
                .andExpect(jsonPath("$.flightId").value(1))
                .andExpect(jsonPath("$.price").value(299.99));

        verify(bookingService).createBooking(any(BookingRequestDTO.class));
    }

    @Test
    void testCreateBooking_BadRequest() throws Exception {
        // Arrange
        BookingRequestDTO invalidRequest = new BookingRequestDTO();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(bookingService, never()).createBooking(any(BookingRequestDTO.class));
    }

    @Test
    void testCreateBooking_ServiceException() throws Exception {
        // Arrange
        when(bookingService.createBooking(any(BookingRequestDTO.class)))
                .thenThrow(new RuntimeException("Customer not found"));

        // Act & Assert
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBookingRequest)))
                .andExpect(status().isInternalServerError());

        verify(bookingService).createBooking(any(BookingRequestDTO.class));
    }

    @Test
    void testGetBookingsByCustomer_Success() throws Exception {
        // Arrange
        BookingDTO booking1 = new BookingDTO();
        booking1.setId(1L);
        booking1.setCustomerId(1L);
        booking1.setFlightId(1L);
        booking1.setPrice(new BigDecimal("299.99"));

        BookingDTO booking2 = new BookingDTO();
        booking2.setId(2L);
        booking2.setCustomerId(1L);
        booking2.setFlightId(2L);
        booking2.setPrice(new BigDecimal("399.99"));

        when(bookingService.getBookingsByCustomer(1L)).thenReturn(Arrays.asList(booking1, booking2));

        // Act & Assert
        mockMvc.perform(get("/api/bookings/customer/{customerId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        verify(bookingService).getBookingsByCustomer(1L);
    }

    @Test
    void testGetBookingsByCustomer_EmptyList() throws Exception {
        // Arrange
        when(bookingService.getBookingsByCustomer(1L)).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/bookings/customer/{customerId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(bookingService).getBookingsByCustomer(1L);
    }

    @Test
    void testGetBookingsByCustomer_InvalidCustomerId() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/bookings/customer/{customerId}", "invalid"))
                .andExpect(status().isBadRequest());

        verify(bookingService, never()).getBookingsByCustomer(anyLong());
    }

    @Test
    void testCancelBooking_Success() throws Exception {
        // Arrange
        Long bookingId = 1L;
        doNothing().when(bookingService).cancelBooking(bookingId);

        // Act & Assert
        mockMvc.perform(delete("/api/bookings/{id}", bookingId))
                .andExpect(status().isNoContent());

        verify(bookingService).cancelBooking(bookingId);
    }

    @Test
    void testCancelBooking_NotFound() throws Exception {
        // Arrange
        Long bookingId = 999L;
        doThrow(new RuntimeException("Booking not found")).when(bookingService).cancelBooking(bookingId);

        // Act & Assert
        mockMvc.perform(delete("/api/bookings/{id}", bookingId))
                .andExpect(status().isInternalServerError());

        verify(bookingService).cancelBooking(bookingId);
    }

    @Test
    void testCancelBooking_InvalidBookingId() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/bookings/{id}", "invalid"))
                .andExpect(status().isBadRequest());

        verify(bookingService, never()).cancelBooking(anyLong());
    }

    @Test
    void testFindAllBookings_Success() throws Exception {
        // Arrange
        BookingDTO booking1 = new BookingDTO();
        booking1.setId(1L);
        booking1.setCustomerId(1L);
        booking1.setFlightId(1L);
        booking1.setPrice(new BigDecimal("299.99"));

        BookingDTO booking2 = new BookingDTO();
        booking2.setId(2L);
        booking2.setCustomerId(2L);
        booking2.setFlightId(2L);
        booking2.setPrice(new BigDecimal("399.99"));

        when(bookingService.findAllBookings()).thenReturn(Arrays.asList(booking1, booking2));

        // Act & Assert
        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        verify(bookingService).findAllBookings();
    }

    @Test
    void testFindAllBookings_EmptyList() throws Exception {
        // Arrange
        when(bookingService.findAllBookings()).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(bookingService).findAllBookings();
    }

    @Test
    void testCreateBooking_ValidationError_NegativePrice() throws Exception {
        // Arrange
        BookingRequestDTO invalidRequest = new BookingRequestDTO();
        invalidRequest.setCustomerId(1L);
        invalidRequest.setFlightId(1L);
        invalidRequest.setPrice(new BigDecimal("-100")); // Negative price

        // Act & Assert
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(bookingService, never()).createBooking(any(BookingRequestDTO.class));
    }

    @Test
    void testCreateBooking_ValidationError_NullCustomerId() throws Exception {
        // Arrange
        BookingRequestDTO invalidRequest = new BookingRequestDTO();
        invalidRequest.setCustomerId(null); // Null customer ID
        invalidRequest.setFlightId(1L);
        invalidRequest.setPrice(new BigDecimal("299.99"));

        // Act & Assert
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(bookingService, never()).createBooking(any(BookingRequestDTO.class));
    }

    @Test
    void testCreateBooking_ValidationError_NullFlightId() throws Exception {
        // Arrange
        BookingRequestDTO invalidRequest = new BookingRequestDTO();
        invalidRequest.setCustomerId(1L);
        invalidRequest.setFlightId(null); // Null flight ID
        invalidRequest.setPrice(new BigDecimal("299.99"));

        // Act & Assert
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(bookingService, never()).createBooking(any(BookingRequestDTO.class));
    }

    @Test
    void testCreateBooking_ValidationError_ZeroPrice() throws Exception {
        // Arrange
        BookingRequestDTO invalidRequest = new BookingRequestDTO();
        invalidRequest.setCustomerId(1L);
        invalidRequest.setFlightId(1L);
        invalidRequest.setPrice(BigDecimal.ZERO); // Zero price

        // Act & Assert
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(bookingService, never()).createBooking(any(BookingRequestDTO.class));
    }

    @Test
    void testCreateBooking_ValidationError_InvalidJson() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content("invalid json"))
                .andExpect(status().isBadRequest());

        verify(bookingService, never()).createBooking(any(BookingRequestDTO.class));
    }

    @Test
    void testCreateBooking_ValidationError_MissingContentType() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/bookings")
                .content(objectMapper.writeValueAsString(testBookingRequest)))
                .andExpect(status().isUnsupportedMediaType());

        verify(bookingService, never()).createBooking(any(BookingRequestDTO.class));
    }
} 
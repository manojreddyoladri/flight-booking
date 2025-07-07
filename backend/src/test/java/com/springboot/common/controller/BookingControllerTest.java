package com.springboot.common.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.springboot.common.dto.BookingDTO;
import com.springboot.common.dto.BookingRequestDTO;
import com.springboot.common.service.BookingService;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

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
    void testBook_Success() {
        when(bookingService.createBooking(any(BookingRequestDTO.class))).thenReturn(testBookingDTO);
        ResponseEntity<BookingDTO> response = bookingController.book(testBookingRequest);
        assert response.getStatusCode().is2xxSuccessful();
        assert response.getBody() != null;
        assert response.getBody().getId() == 1L;
        verify(bookingService).createBooking(any(BookingRequestDTO.class));
    }

    @Test
    void testByCustomer_Success() {
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
        ResponseEntity<java.util.List<BookingDTO>> response = bookingController.byCustomer(1L);
        assert response.getStatusCode().is2xxSuccessful();
        assert response.getBody() != null;
        verify(bookingService).getBookingsByCustomer(1L);
    }

    @Test
    void testCancel_Success() {
        Long bookingId = 1L;
        doNothing().when(bookingService).cancelBooking(bookingId);
        ResponseEntity<Void> response = bookingController.cancel(bookingId);
        assert response.getStatusCode().is2xxSuccessful();
        verify(bookingService).cancelBooking(bookingId);
    }

    @Test
    void testGetAllBookings_Success() {
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
        ResponseEntity<java.util.List<BookingDTO>> response = bookingController.getAllBookings();
        assert response.getStatusCode().is2xxSuccessful();
        assert response.getBody() != null;
        verify(bookingService).findAllBookings();
    }
} 
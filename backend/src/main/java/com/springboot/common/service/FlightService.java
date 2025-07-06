package com.springboot.common.service;

import java.time.LocalDate;
import java.util.List;

import com.springboot.common.dto.FlightDTO;

public interface FlightService {
    FlightDTO addFlight(FlightDTO dto);
    List<FlightDTO> listAll();
    List<FlightDTO> getFlightsByDate(LocalDate date);
    List<FlightDTO> getFutureFlights(LocalDate fromDate);
    FlightDTO updateFlight(Long id, FlightDTO dto);
    void deleteFlight(Long id);
    int checkAvailability(Long flightId);
}
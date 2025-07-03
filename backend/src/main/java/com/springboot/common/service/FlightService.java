package com.springboot.common.service;

import java.util.List;

import com.springboot.common.dto.FlightDTO;

public interface FlightService {
    FlightDTO addFlight(FlightDTO dto);
    List<FlightDTO> listAll();
    int checkAvailability(Long flightId);
}
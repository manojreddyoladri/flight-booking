package com.springboot.common.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.springboot.common.dto.FlightDTO;
import com.springboot.common.model.Flight;
import com.springboot.common.repository.FlightRepository;

@Service
public class FlightServiceImpl implements FlightService {
    private final FlightRepository repo;
    public FlightServiceImpl(FlightRepository repo) { this.repo = repo; }

    @Override
    public FlightDTO addFlight(FlightDTO dto) {
        Flight f = new Flight(dto.getAirlineName(), dto.getTotalSeats());
        f = repo.save(f);
        return new FlightDTO(f.getId(), f.getAirlineName(), f.getTotalSeats());
    }

    @Override
    public List<FlightDTO> listAll() {
        return repo.findAll().stream()
            .map(f -> new FlightDTO(f.getId(), f.getAirlineName(), f.getTotalSeats()))
            .collect(Collectors.toList());
    }

    @Override
    public int checkAvailability(Long flightId) {
        Flight f = repo.findById(flightId)
            .orElseThrow(() -> new RuntimeException("Flight not found"));
        return f.getTotalSeats(); // adjust if tracking booked seats
    }
}

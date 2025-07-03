package com.springboot.common.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.common.model.Flight;

public interface FlightRepository extends JpaRepository<Flight, Long> {
}

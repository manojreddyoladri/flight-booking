package com.springboot.common.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.springboot.common.model.Flight;

public interface FlightRepository extends JpaRepository<Flight, Long> {
    List<Flight> findByFlightDate(LocalDate date);
    
    @Query("SELECT f FROM Flight f WHERE f.flightDate >= :date ORDER BY f.flightDate ASC")
    List<Flight> findByFlightDateGreaterThanEqual(@Param("date") LocalDate date);
}

package com.springboot.common.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.common.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}

package com.springboot.common.service;

import java.util.Optional;

import com.springboot.common.dto.CustomerDTO;

public interface CustomerService {
    CustomerDTO addCustomer(CustomerDTO dto);
    Optional<CustomerDTO> getCustomerById(Long id);
}

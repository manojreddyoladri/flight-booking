package com.springboot.common.service;

import java.util.List;
import java.util.Optional;

import com.springboot.common.dto.CustomerDTO;

public interface CustomerService {
    CustomerDTO addCustomer(CustomerDTO dto);

    List<CustomerDTO> getAllCustomers();

    Optional<CustomerDTO> getCustomerById(Long id);

    void deleteCustomer(Long id);
}

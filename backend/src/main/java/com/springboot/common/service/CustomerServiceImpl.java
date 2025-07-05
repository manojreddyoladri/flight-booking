package com.springboot.common.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.springboot.common.dto.CustomerDTO;
import com.springboot.common.model.Customer;
import com.springboot.common.repository.CustomerRepository;

@Service
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository repo;
    public CustomerServiceImpl(CustomerRepository repo) { this.repo = repo; }

    @Override
    public CustomerDTO addCustomer(CustomerDTO dto) {
        Customer c = new Customer(dto.getName(), dto.getEmail());
        c = repo.save(c);
        return new CustomerDTO(c.getId(), c.getName(), c.getEmail());
    }

    @Override
    public List<CustomerDTO> getAllCustomers() {
        return repo.findAll().stream()
            .map(c -> new CustomerDTO(c.getId(), c.getName(), c.getEmail()))
            .collect(Collectors.toList());
    }

    @Override
    public Optional<CustomerDTO> getCustomerById(Long id) {
        return repo.findById(id)
                   .map(c -> new CustomerDTO(c.getId(), c.getName(), c.getEmail()));
    }
}

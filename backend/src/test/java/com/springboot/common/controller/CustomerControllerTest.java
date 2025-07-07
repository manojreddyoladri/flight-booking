package com.springboot.common.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.springboot.common.dto.CustomerDTO;
import com.springboot.common.service.CustomerService;

@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {

    @Mock
    private CustomerService customerService;

    @InjectMocks
    private CustomerController customerController;

    private CustomerDTO testCustomerDTO;

    @BeforeEach
    void setUp() {
        testCustomerDTO = new CustomerDTO();
        testCustomerDTO.setId(1L);
        testCustomerDTO.setName("John Doe");
        testCustomerDTO.setEmail("john.doe@example.com");
    }

    @Test
    void testAdd_Success() {
        when(customerService.addCustomer(any(CustomerDTO.class))).thenReturn(testCustomerDTO);
        ResponseEntity<CustomerDTO> response = customerController.add(testCustomerDTO);
        assert response.getStatusCode().is2xxSuccessful();
        assert response.getBody() != null;
        assert response.getBody().getName().equals("John Doe");
        verify(customerService).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testGetById_Success() {
        Long customerId = 1L;
        when(customerService.getCustomerById(customerId)).thenReturn(Optional.of(testCustomerDTO));
        ResponseEntity<CustomerDTO> response = customerController.getById(customerId);
        assert response.getStatusCode().is2xxSuccessful();
        assert response.getBody() != null;
        verify(customerService).getCustomerById(customerId);
    }

    @Test
    void testGetAllCustomers_Success() {
        CustomerDTO customer1 = new CustomerDTO();
        customer1.setId(1L);
        customer1.setName("John Doe");
        customer1.setEmail("john.doe@example.com");
        CustomerDTO customer2 = new CustomerDTO();
        customer2.setId(2L);
        customer2.setName("Jane Smith");
        customer2.setEmail("jane.smith@example.com");
        when(customerService.getAllCustomers()).thenReturn(Arrays.asList(customer1, customer2));
        ResponseEntity<java.util.List<CustomerDTO>> response = customerController.getAllCustomers();
        assert response.getStatusCode().is2xxSuccessful();
        assert response.getBody() != null;
        verify(customerService).getAllCustomers();
    }
} 
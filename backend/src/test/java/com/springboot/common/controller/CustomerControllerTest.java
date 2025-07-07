package com.springboot.common.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.common.dto.CustomerDTO;
import com.springboot.common.service.CustomerService;

@WebMvcTest(CustomerController.class)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CustomerService customerService;

    @Autowired
    private ObjectMapper objectMapper;

    private CustomerDTO testCustomerDTO;

    @BeforeEach
    void setUp() {
        testCustomerDTO = new CustomerDTO();
        testCustomerDTO.setId(1L);
        testCustomerDTO.setName("John Doe");
        testCustomerDTO.setEmail("john.doe@email.com");
    }

    @Test
    void testAddCustomer_Success() throws Exception {
        // Arrange
        CustomerDTO inputDTO = new CustomerDTO();
        inputDTO.setName("John Doe");
        inputDTO.setEmail("john.doe@email.com");

        when(customerService.addCustomer(any(CustomerDTO.class))).thenReturn(testCustomerDTO);

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@email.com"));

        verify(customerService).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testAddCustomer_BadRequest() throws Exception {
        // Arrange
        CustomerDTO invalidCustomerDTO = new CustomerDTO();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCustomerDTO)))
                .andExpect(status().isBadRequest());

        verify(customerService, never()).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testAddCustomer_ValidationError_EmptyName() throws Exception {
        // Arrange
        CustomerDTO invalidCustomerDTO = new CustomerDTO();
        invalidCustomerDTO.setName(""); // Empty name
        invalidCustomerDTO.setEmail("john.doe@email.com");

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCustomerDTO)))
                .andExpect(status().isBadRequest());

        verify(customerService, never()).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testAddCustomer_ValidationError_InvalidEmail() throws Exception {
        // Arrange
        CustomerDTO invalidCustomerDTO = new CustomerDTO();
        invalidCustomerDTO.setName("John Doe");
        invalidCustomerDTO.setEmail("invalid-email"); // Invalid email format

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCustomerDTO)))
                .andExpect(status().isBadRequest());

        verify(customerService, never()).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testAddCustomer_ValidationError_NullName() throws Exception {
        // Arrange
        CustomerDTO invalidCustomerDTO = new CustomerDTO();
        invalidCustomerDTO.setName(null); // Null name
        invalidCustomerDTO.setEmail("john.doe@email.com");

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCustomerDTO)))
                .andExpect(status().isBadRequest());

        verify(customerService, never()).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testAddCustomer_ValidationError_NullEmail() throws Exception {
        // Arrange
        CustomerDTO invalidCustomerDTO = new CustomerDTO();
        invalidCustomerDTO.setName("John Doe");
        invalidCustomerDTO.setEmail(null); // Null email

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCustomerDTO)))
                .andExpect(status().isBadRequest());

        verify(customerService, never()).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testAddCustomer_ServiceException() throws Exception {
        // Arrange
        CustomerDTO inputDTO = new CustomerDTO();
        inputDTO.setName("John Doe");
        inputDTO.setEmail("john.doe@email.com");

        when(customerService.addCustomer(any(CustomerDTO.class)))
                .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputDTO)))
                .andExpect(status().isInternalServerError());

        verify(customerService).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testGetAllCustomers_Success() throws Exception {
        // Arrange
        CustomerDTO customer1 = new CustomerDTO();
        customer1.setId(1L);
        customer1.setName("John Doe");
        customer1.setEmail("john.doe@email.com");

        CustomerDTO customer2 = new CustomerDTO();
        customer2.setId(2L);
        customer2.setName("Jane Smith");
        customer2.setEmail("jane.smith@email.com");

        when(customerService.getAllCustomers()).thenReturn(Arrays.asList(customer1, customer2));

        // Act & Assert
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("John Doe"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Jane Smith"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        verify(customerService).getAllCustomers();
    }

    @Test
    void testGetAllCustomers_EmptyList() throws Exception {
        // Arrange
        when(customerService.getAllCustomers()).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(customerService).getAllCustomers();
    }

    @Test
    void testGetAllCustomers_ServiceException() throws Exception {
        // Arrange
        when(customerService.getAllCustomers())
                .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isInternalServerError());

        verify(customerService).getAllCustomers();
    }

    @Test
    void testGetCustomerById_Success() throws Exception {
        // Arrange
        Long customerId = 1L;
        when(customerService.getCustomerById(customerId)).thenReturn(Optional.of(testCustomerDTO));

        // Act & Assert
        mockMvc.perform(get("/api/customers/{id}", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@email.com"));

        verify(customerService).getCustomerById(customerId);
    }

    @Test
    void testGetCustomerById_NotFound() throws Exception {
        // Arrange
        Long customerId = 999L;
        when(customerService.getCustomerById(customerId)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/customers/{id}", customerId))
                .andExpect(status().isNotFound());

        verify(customerService).getCustomerById(customerId);
    }

    @Test
    void testGetCustomerById_InvalidId() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/customers/{id}", "invalid"))
                .andExpect(status().isBadRequest());

        verify(customerService, never()).getCustomerById(anyLong());
    }

    @Test
    void testGetCustomerById_ServiceException() throws Exception {
        // Arrange
        Long customerId = 1L;
        when(customerService.getCustomerById(customerId))
                .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        mockMvc.perform(get("/api/customers/{id}", customerId))
                .andExpect(status().isInternalServerError());

        verify(customerService).getCustomerById(customerId);
    }

    @Test
    void testAddCustomer_WithSpecialCharacters() throws Exception {
        // Arrange
        CustomerDTO specialCustomerDTO = new CustomerDTO();
        specialCustomerDTO.setName("José María O'Connor-Smith");
        specialCustomerDTO.setEmail("jose.maria@test-domain.co.uk");

        CustomerDTO savedCustomerDTO = new CustomerDTO();
        savedCustomerDTO.setId(1L);
        savedCustomerDTO.setName("José María O'Connor-Smith");
        savedCustomerDTO.setEmail("jose.maria@test-domain.co.uk");

        when(customerService.addCustomer(any(CustomerDTO.class))).thenReturn(savedCustomerDTO);

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(specialCustomerDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("José María O'Connor-Smith"))
                .andExpect(jsonPath("$.email").value("jose.maria@test-domain.co.uk"));

        verify(customerService).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testAddCustomer_WithLongName() throws Exception {
        // Arrange
        String longName = "A".repeat(100);
        CustomerDTO longNameCustomerDTO = new CustomerDTO();
        longNameCustomerDTO.setName(longName);
        longNameCustomerDTO.setEmail("longname@email.com");

        CustomerDTO savedCustomerDTO = new CustomerDTO();
        savedCustomerDTO.setId(1L);
        savedCustomerDTO.setName(longName);
        savedCustomerDTO.setEmail("longname@email.com");

        when(customerService.addCustomer(any(CustomerDTO.class))).thenReturn(savedCustomerDTO);

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(longNameCustomerDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(longName))
                .andExpect(jsonPath("$.email").value("longname@email.com"));

        verify(customerService).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testAddCustomer_ValidationError_InvalidJson() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content("invalid json"))
                .andExpect(status().isBadRequest());

        verify(customerService, never()).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testAddCustomer_ValidationError_MissingContentType() throws Exception {
        // Arrange
        CustomerDTO inputDTO = new CustomerDTO();
        inputDTO.setName("John Doe");
        inputDTO.setEmail("john.doe@email.com");

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .content(objectMapper.writeValueAsString(inputDTO)))
                .andExpect(status().isUnsupportedMediaType());

        verify(customerService, never()).addCustomer(any(CustomerDTO.class));
    }

    @Test
    void testGetAllCustomers_LargeDataset() throws Exception {
        // Arrange
        CustomerDTO[] customers = new CustomerDTO[100];
        for (int i = 0; i < 100; i++) {
            CustomerDTO customer = new CustomerDTO();
            customer.setId((long) (i + 1));
            customer.setName("Customer " + (i + 1));
            customer.setEmail("customer" + (i + 1) + "@email.com");
            customers[i] = customer;
        }

        when(customerService.getAllCustomers()).thenReturn(Arrays.asList(customers));

        // Act & Assert
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(100));

        verify(customerService).getAllCustomers();
    }

    @Test
    void testAddCustomer_ValidationError_EmailTooLong() throws Exception {
        // Arrange
        String longEmail = "a".repeat(300) + "@email.com";
        CustomerDTO invalidCustomerDTO = new CustomerDTO();
        invalidCustomerDTO.setName("John Doe");
        invalidCustomerDTO.setEmail(longEmail);

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCustomerDTO)))
                .andExpect(status().isBadRequest());

        verify(customerService, never()).addCustomer(any(CustomerDTO.class));
    }
} 
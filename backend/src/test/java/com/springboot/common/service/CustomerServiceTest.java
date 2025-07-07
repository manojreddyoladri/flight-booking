package com.springboot.common.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.springboot.common.dto.CustomerDTO;
import com.springboot.common.model.Customer;
import com.springboot.common.repository.CustomerRepository;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private Customer testCustomer;
    private CustomerDTO testCustomerDTO;

    @BeforeEach
    void setUp() {
        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setName("John Doe");
        testCustomer.setEmail("john.doe@email.com");

        testCustomerDTO = new CustomerDTO();
        testCustomerDTO.setName("John Doe");
        testCustomerDTO.setEmail("john.doe@email.com");
    }

    @Test
    void testAddCustomer_Success() {
        // Arrange
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        // Act
        CustomerDTO result = customerService.addCustomer(testCustomerDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testCustomer.getId(), result.getId());
        assertEquals(testCustomer.getName(), result.getName());
        assertEquals(testCustomer.getEmail(), result.getEmail());

        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void testAddCustomer_WithNullId() {
        // Arrange
        testCustomer.setId(null);
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        // Act
        CustomerDTO result = customerService.addCustomer(testCustomerDTO);

        // Assert
        assertNotNull(result);
        assertNull(result.getId());
        assertEquals(testCustomer.getName(), result.getName());
        assertEquals(testCustomer.getEmail(), result.getEmail());

        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void testGetAllCustomers_Success() {
        // Arrange
        Customer customer1 = new Customer();
        customer1.setId(1L);
        customer1.setName("John Doe");
        customer1.setEmail("john.doe@email.com");

        Customer customer2 = new Customer();
        customer2.setId(2L);
        customer2.setName("Jane Smith");
        customer2.setEmail("jane.smith@email.com");

        List<Customer> customers = Arrays.asList(customer1, customer2);
        when(customerRepository.findAll()).thenReturn(customers);

        // Act
        List<CustomerDTO> result = customerService.getAllCustomers();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("John Doe", result.get(0).getName());
        assertEquals("jane.smith@email.com", result.get(1).getEmail());

        verify(customerRepository).findAll();
    }

    @Test
    void testGetAllCustomers_EmptyList() {
        // Arrange
        when(customerRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<CustomerDTO> result = customerService.getAllCustomers();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(customerRepository).findAll();
    }

    @Test
    void testGetCustomerById_Success() {
        // Arrange
        Long customerId = 1L;
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));

        // Act
        Optional<CustomerDTO> result = customerService.getCustomerById(customerId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testCustomer.getId(), result.get().getId());
        assertEquals(testCustomer.getName(), result.get().getName());
        assertEquals(testCustomer.getEmail(), result.get().getEmail());

        verify(customerRepository).findById(customerId);
    }

    @Test
    void testGetCustomerById_NotFound() {
        // Arrange
        Long customerId = 999L;
        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        // Act
        Optional<CustomerDTO> result = customerService.getCustomerById(customerId);

        // Assert
        assertFalse(result.isPresent());

        verify(customerRepository).findById(customerId);
    }

    @Test
    void testGetCustomerById_NullId() {
        // Arrange
        when(customerRepository.findById(null)).thenReturn(Optional.empty());

        // Act
        Optional<CustomerDTO> result = customerService.getCustomerById(null);

        // Assert
        assertFalse(result.isPresent());

        verify(customerRepository).findById(null);
    }

    @Test
    void testAddCustomer_WithSpecialCharacters() {
        // Arrange
        CustomerDTO specialCustomerDTO = new CustomerDTO();
        specialCustomerDTO.setName("José María O'Connor-Smith");
        specialCustomerDTO.setEmail("jose.maria@test-domain.co.uk");

        Customer specialCustomer = new Customer();
        specialCustomer.setId(1L);
        specialCustomer.setName("José María O'Connor-Smith");
        specialCustomer.setEmail("jose.maria@test-domain.co.uk");

        when(customerRepository.save(any(Customer.class))).thenReturn(specialCustomer);

        // Act
        CustomerDTO result = customerService.addCustomer(specialCustomerDTO);

        // Assert
        assertNotNull(result);
        assertEquals("José María O'Connor-Smith", result.getName());
        assertEquals("jose.maria@test-domain.co.uk", result.getEmail());

        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void testAddCustomer_WithLongName() {
        // Arrange
        String longName = "A".repeat(100);
        CustomerDTO longNameCustomerDTO = new CustomerDTO();
        longNameCustomerDTO.setName(longName);
        longNameCustomerDTO.setEmail("longname@email.com");

        Customer longNameCustomer = new Customer();
        longNameCustomer.setId(1L);
        longNameCustomer.setName(longName);
        longNameCustomer.setEmail("longname@email.com");

        when(customerRepository.save(any(Customer.class))).thenReturn(longNameCustomer);

        // Act
        CustomerDTO result = customerService.addCustomer(longNameCustomerDTO);

        // Assert
        assertNotNull(result);
        assertEquals(longName, result.getName());
        assertEquals("longname@email.com", result.getEmail());

        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void testGetAllCustomers_LargeDataset() {
        // Arrange
        List<Customer> customers = Arrays.asList();
        for (int i = 1; i <= 100; i++) {
            Customer customer = new Customer();
            customer.setId((long) i);
            customer.setName("Customer " + i);
            customer.setEmail("customer" + i + "@email.com");
            customers = Arrays.asList(customers.toArray(new Customer[0]));
        }

        when(customerRepository.findAll()).thenReturn(customers);

        // Act
        List<CustomerDTO> result = customerService.getAllCustomers();

        // Assert
        assertNotNull(result);
        assertEquals(100, result.size());

        verify(customerRepository).findAll();
    }

    @Test
    void testAddCustomer_VerifyMapping() {
        // Arrange
        CustomerDTO inputDTO = new CustomerDTO();
        inputDTO.setName("Test Customer");
        inputDTO.setEmail("test@email.com");

        Customer savedCustomer = new Customer();
        savedCustomer.setId(1L);
        savedCustomer.setName("Test Customer");
        savedCustomer.setEmail("test@email.com");

        when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);

        // Act
        CustomerDTO result = customerService.addCustomer(inputDTO);

        // Assert
        verify(customerRepository).save(argThat(customer -> 
            customer.getName().equals("Test Customer") &&
            customer.getEmail().equals("test@email.com")
        ));
    }

    @Test
    void testGetCustomerById_VerifyRepositoryCall() {
        // Arrange
        Long customerId = 1L;
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));

        // Act
        customerService.getCustomerById(customerId);

        // Assert
        verify(customerRepository, times(1)).findById(customerId);
    }

    @Test
    void testGetAllCustomers_VerifyRepositoryCall() {
        // Arrange
        when(customerRepository.findAll()).thenReturn(Arrays.asList(testCustomer));

        // Act
        customerService.getAllCustomers();

        // Assert
        verify(customerRepository, times(1)).findAll();
    }
} 
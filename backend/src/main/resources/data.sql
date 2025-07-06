-- Initialize bookedSeats for existing flights
UPDATE flights SET booked_seats = 0 WHERE booked_seats IS NULL;

-- Fix existing flights that have bookings but show 0 booked seats
UPDATE flights f 
SET booked_seats = (
    SELECT COUNT(*) 
    FROM bookings b 
    WHERE b.flight_id = f.id
) 
WHERE f.id IN (
    SELECT DISTINCT flight_id 
    FROM bookings
); 

-- Initialize flights with date and price
INSERT INTO flights (airline_name, total_seats, booked_seats, flight_date, price) VALUES
('Delta Airlines', 150, 0, '2024-08-15', 299.99),
('American Airlines', 200, 0, '2024-08-15', 349.99),
('United Airlines', 180, 0, '2024-08-16', 279.99),
('Southwest Airlines', 175, 0, '2024-08-16', 199.99),
('JetBlue Airways', 160, 0, '2024-08-17', 249.99),
('Alaska Airlines', 140, 0, '2024-08-17', 229.99),
('Spirit Airlines', 200, 0, '2024-08-18', 159.99),
('Frontier Airlines', 180, 0, '2024-08-18', 179.99),
('Delta Airlines', 150, 0, '2024-08-19', 319.99),
('American Airlines', 200, 0, '2024-08-19', 379.99),
('United Airlines', 180, 0, '2024-08-20', 289.99),
('Southwest Airlines', 175, 0, '2024-08-20', 189.99),
('JetBlue Airways', 160, 0, '2024-08-21', 259.99),
('Alaska Airlines', 140, 0, '2024-08-21', 239.99),
('Spirit Airlines', 200, 0, '2024-08-22', 169.99);

-- Initialize some customers
INSERT INTO customers (name, email, phone) VALUES
('John Doe', 'john.doe@email.com', '555-0101'),
('Jane Smith', 'jane.smith@email.com', '555-0102'),
('Bob Johnson', 'bob.johnson@email.com', '555-0103'),
('Alice Brown', 'alice.brown@email.com', '555-0104'),
('Charlie Wilson', 'charlie.wilson@email.com', '555-0105'); 
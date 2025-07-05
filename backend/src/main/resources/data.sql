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
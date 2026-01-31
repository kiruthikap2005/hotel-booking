.

🏨 Hotel Booking Website

A full-stack Hotel Booking System that allows users to search and book hotels in Tamil Nadu, while administrators manage hotel listings, room pricing, and bookings. The system is designed with real-world booking logic, transparent pricing, and role-based access control.

📌 Project Overview

This project simulates a real-world hotel reservation platform where:

Users can register, log in, search for hotels, select room types, and make bookings.

Admins can manage hotels, room pricing, guest limits, and booking records.

Prices are displayed in Indian Rupees (₹).

The system uses room-type–based booking instead of assigning room numbers at booking time.

🎯 Objectives

To design a role-based hotel booking platform

To implement dynamic pricing based on room type, guests, and stay duration

To provide an admin-controlled hotel and pricing management system

To simulate real-world hotel booking and check-in processes

👤 User Features

Users of the system can:

Register and log in securely

View and update their profile

Search hotels by Tamil Nadu cities (Chennai, Madurai, Ooty, Kodaikanal, etc.)

View hotel details including room types and pricing

Select:

Room type (Single, Double, Deluxe, Suite)

Number of guests

Check-in and check-out dates

View total booking price before confirming

Book hotel rooms

View their booking history and status

🛏️ Room Booking Logic

Users book room types, not specific room numbers

Price depends on:

Room type

Price per night

Number of guests

Number of nights

Extra guest charges apply if guest count exceeds room capacity

Room numbers are assigned by the admin during check-in

💰 Pricing Features

The system includes:

Room-type–based pricing

Extra guest charge calculation

Stay duration (number of nights) calculation

Transparent price breakdown before booking

Seasonal / festival pricing (optional advanced feature)

🛠️ Admin Features

Administrators can:

Log in securely

Add, update, and delete hotels

Define room types for each hotel

Set:

Price per night

Maximum guests per room

Extra guest charges

Room availability

View all user bookings

Update booking status (Booked, Checked-In, Checked-Out, Cancelled)

Manage registered users

🔐 System Roles
Role	Permissions
User	Search hotels, book rooms, view bookings
Admin	Manage hotels, pricing, rooms, and bookings
🧠 Unique Features

Room type–based booking instead of room number booking

Admin-controlled pricing system

Guest-limit pricing logic

Booking status tracking

Transparent price calculation before confirmation

🖥️ Technology Stack

Frontend

HTML

CSS

JavaScript

Bootstrap

Backend

Node.js

Express.js

Database

MongoDB

Authentication

JWT (JSON Web Token)

Password encryption

🔄 Booking Workflow

User registers or logs in

User searches for hotels

User selects room type, guests, and dates

System calculates total price

User confirms booking

Admin assigns room number during check-in

Booking status is updated

📈 Future Enhancements

Online payment integration

Hotel reviews and ratings

Email/SMS booking confirmation

Advanced analytics dashboard for admin

Mobile responsive design improvements

🎓 Academic Relevance

This project demonstrates:

Full-stack web development

Role-based access control

Business logic implementation

Real-world booking system design

Database-driven application architecture

👩‍💻 Developed By

Kiruthika P

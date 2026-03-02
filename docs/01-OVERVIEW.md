# FOMO - Ticket Marketplace Platform

## Project Overview

FOMO is a ticket marketplace platform that connects event organizers (vendors), administrators, and users (buyers) in a unified ecosystem for buying and selling event tickets.

## Core Objectives

- Provide a seamless ticket marketplace experience
- Enable vendors to manage and sell tickets
- Enable users to discover and purchase tickets
- Provide administrative oversight and platform management

## Key Features

### For Buyers (Users)
- Browse upcoming events and tickets
- Search and filter tickets by category, price, date
- Purchase tickets securely
- Manage ticket purchases and bookings
- View ticket history
- Track order status

### For Vendors
- Create and manage events
- Set ticket pricing and availability
- Monitor sales and revenue
- Manage inventory
- Access sales analytics
- Manage vendor profile and settings

### For Administrators
- Platform oversight and management
- User and vendor account management
- Transaction monitoring
- Dispute resolution
- Platform analytics and reporting
- System configuration

## Architecture Overview

The platform consists of:
- **Frontend**: Angular-based responsive web application
- **Backend**: Hono RESTful API service
- **Database**: PostgreSQL with Drizzle ORM

## User Roles

| Role | Responsibilities | Key Permissions |
|------|------------------|-----------------|
| **Admin** | Platform management, moderation, reporting | Full system access, user management, dispute resolution |
| **Vendor** | Event and ticket management, sales operations | Create/edit events, manage inventory, view sales analytics |
| **User (Buyer)** | Browse and purchase tickets | Search events, purchase tickets, view orders |

## Project Structure

```
fomo/
├── frontend/        # Angular web application
├── backend/         # API server
├── docs/           # Project documentation
└── README.md       # Project root documentation
```

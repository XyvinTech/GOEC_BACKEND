# Electric Vehicle Charging Project - Microservice Architecture - Backend

## Table of Contents

- [Electric Vehicle Charging Project - Microservice Architecture - Backend](#electric-vehicle-charging-project---microservice-architecture---backend)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Project Structure](#project-structure)
  - [Coding Conventions](#coding-conventions)


## Introduction

Welcome to the Electric Vehicle Charging Project, a microservice-based architecture for electric vehicle charging. This README provides guidelines on the project's folder structure and coding conventions to ensure consistency and maintainability.

## Project Structure

Our project follows a strict folder structure to keep the code organized and easy to navigate. Here's an overview of the key directories:

- `src/`:

  - `controllers/`: Contains request handling logic.
  - `utils/`: Houses utility functions that can be reused across the project.
  - `middlewares/`: Defines custom middleware functions.
  - `routes/`: Defines API routes and route handlers.
  - `services/`: Includes the business logic and interaction with external services (optional).
  - `models/`: MongoDB models
  - `db/`: Mongo connection
  - `validations/`: Joi validations


- `other_directories/`:
  - (Add any additional directories specific to your project here.)

## Coding Conventions

To maintain code consistency and readability, we follow these coding conventions:

- **Naming Conventions**:

    - Use meaningful variable and function names.

    ```
        // Good
        const userCount = 10;

        // Avoid
        const x = 10;

    ```   
    - Use camelCase for variable and function names.

    ```

        // Good
        const myVariableName = 'value';
        function calculateTotalAmount() { /_ ... _/ }

        // Avoid
        const my_variable_name = 'value';
        function calculate_total_amount() { /_ ... _/ }

    ```
    - Use PascalCase for class names.

    ```
        // Good
        class CarModel { /* ... */ }

        // Avoid
        class car_model { /* ... */ }
        
    ```
- **Code Formatting**:

  - Use a consistent coding style.
  - Use 2 or 4 spaces for indentation (choose one and stick with it).
  - Ensure proper code alignment for better readability.
  


- **Comments**:

  - Add comments for complex or non-obvious code sections.
    ```
        // Calculate the total price
        function calculateTotalPrice() {
            // ...
        }
    ```
  - Use JSDoc comments for documenting functions and their parameters.

     ```
        /**
         * Calculate the total price.
         *
         * @param {number} quantity - The quantity of items.
         * @param {number} unitPrice - The price per unit.
         * @returns {number} The total price.
         */

        function calculateTotalPrice(quantity, unitPrice) {
            // ...
        }

    ```



- **Testing**:
  - Write unit tests for each service, controller, and middleware.
  - Utilize testing frameworks (e.g., Mocha, Chai) for test suites.


- **Service-Ports**:
  - vehicle-service - 5689
  - user-service - 5688
  - transaction-service - 5687
  - rfid-service - 5102
  - review-service - 5685
  - payment-gatewway-service - 5684
  - occp-service - 6500
  - occp-websocket - 5500
  - notification-service - 5682
  - log-service - 5570
  - evMachine-service - 5691
  - config-service - 5101
  - chargingStation-service - 5100





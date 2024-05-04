# Wallet and RFID Tag Payment Gateway Server

This Node.js Express server implements a micro-service for a wallet system and RFID tag payment gateway, using Razorpay as a third-party payment service.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Endpoints](#endpoints)


## Prerequisites

Before you start, ensure you have the following software and dependencies installed:

- Node.js 18^
- npm (Node Package Manager)
- MongoDB  database for data storage
- Razorpay API keys (sandbox or production)

## Getting Started

1. Clone this repository to your local machine:

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

2. Install the project dependencies:

```bash
npm install
```

3. Run the server:

```bash
npm start
```

## Configuration

Before running the server, make sure to configure the necessary environment variables. You can create a .env file in the project's root directory and define the following variables:

```bash

PORT=3000
DB_URI=mongodb://localhost:27017/your-database-name
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
NODE_ENV = development

```

Make sure to replace the values with your specific configuration details.

## Endpoints

The server provides the following endpoints:

`/api/payment-order` - Order creation by RazorPay for the checkput payment process
`/api/payment-verify` - Callback function after successfull checkput payment. A cross check is done to verify the whether the payment is genuine or not

You can find detailed documentation for each endpoint in the source code or by accessing  /swagger .

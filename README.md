# Actual Account API

This project exposes a simple API to retrieve account values from an [Actual](https://actualbudget.org/) server.

## Features
- Connects to an Actual server using the official `@actual-app/api` package
- Exposes a `/accounts` endpoint to retrieve account balances
- Returns account names and balances in JSON format

## Requirements
- Node.js 20+
- Access to an Actual server and a valid budget ID
- Docker (optional, for containerized deployment)

## Environment Variables
Set the following environment variables to configure the API:

- `BUDGET_ID` - The Actual budget ID to use
- `SERVER_URL` - The URL of your Actual server (e.g., `https://finance.lacher.io`)
- `SERVER_PASSWORD` - The password for your Actual server
- `DATA_DIR` - Path to the data directory (default: `data`)

You can set these in your shell or in a `.env` file (if using a tool like [dotenv](https://www.npmjs.com/package/dotenv)).

## Usage

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set environment variables (see above).
3. Start the server:
   ```bash
   node app.js
   ```
4. Access the API at [http://localhost:3000/accounts](http://localhost:3000/accounts)

### Docker
1. Build the Docker image:
   ```bash
   docker build -t actual-account-api .
   ```
2. Run the container with environment variables:
   ```bash
   docker run -p 3000:3000 \
     -e BUDGET_ID=your-budget-id \
     -e SERVER_URL=https://your-actual-server \
     -e SERVER_PASSWORD=your-password \
     -e DATA_DIR=data \
     actual-account-api
   ```

## API

### `GET /accounts`
Returns a list of accounts with their names and balances.

**Example response:**
```json
[
  {
    "name": "Checking",
    "balance": "1234.56"
  },
  {
    "name": "Savings",
    "balance": "7890.12"
  }
]
```

## License
MIT

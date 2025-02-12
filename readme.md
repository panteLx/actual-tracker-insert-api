# Actual Budget Tracker Insert API

This project is a Node.js application that integrates with the [Actual Budget API](https://actualbudget.org/docs/api/). It provides a web interface (using Express) to add new budget transactions via a modern, responsive, mobile-first form with dark mode support. The form also features dropdown menus that are pre-populated with payees and categories from your Actual Budget instance, allows you to select the date (defaulting to the current day), and even gives you the option to add a new payee if needed. After a transaction is successfully submitted, the app sends a Discord notification via a webhook.

## Features

- **Connect to Actual Budget Server:**  
  The application uses the official `@actual-app/api` package to connect to your Actual Budget server, download your budget, and perform transaction imports.

- **Modern Web Interface:**  
  A responsive, mobile-first web form built with Express that supports dark mode based on the user’s system preferences.

- **Dynamic Dropdowns:**  
  The form fetches available payees and categories from your Actual instance and displays them in dropdown menus. Users can also choose to add a new payee if needed.

- **Pre-filled Date Picker:**  
  The date input is pre-filled with the current date but remains editable.

- **Euro Amount Input:**  
  An input group for the transaction amount allows the user to enter a value in Euros (both positive and negative), complete with a € prefix. The value is later converted to cents (as required by Actual).

- **Discord Notification:**  
  Once a transaction is imported, the application sends a notification message to a specified Discord channel via a webhook.

- **Post-Redirect-Get Pattern:**  
  After form submission, the user is redirected to avoid duplicate submissions on page reload.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20.12.1 or later recommended)
- npm (comes with Node.js)
- An instance of the Actual Budget server running
- A Discord webhook URL (optional; set up a webhook in your Discord channel if you want notifications)

> **Note:** The project uses `node-fetch` (v3 or later) which is an ES Module. This project uses dynamic import to load it in a CommonJS context.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/pantelx/actual-tracker-insert-api.git
   cd actual-tracker-insert-api
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Environment Variables

Create a `.env.local` file in the project root and add the following variables (adjust the values according to your setup):

```env
# Path where Actual Budget data will be cached locally
ACTUAL_DATA_DIR=data

# URL of your running Actual Budget server
ACTUAL_URL=http://localhost:5006

# Password for the Actual Budget server
ACTUAL_PW=your_actual_password

# The Sync/Budget ID from your Actual Budget settings
ACTUAL_BUDGET_ID=your_budget_sync_id

# Account ID to which transactions will be imported
ACTUAL_ACCOUNT_ID=your_account_id

# Default Category ID for transactions
ACTUAL_CATEGORY_ID=your_default_category_id

# Discord webhook URL for notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_id/your_webhook_token
```

## Running the Server

To start the application, run:

```bash
node index.js
```

The Express server will start on port `3000`. You should see a message like:

```
Server läuft unter http://localhost:3000
```

## Using the Application

1. **Access the Form:**
   Open your web browser and navigate to [http://localhost:3000/](http://localhost:3000/).

   - The form will display a date picker (pre-filled with today’s date), an amount field (with a € prefix and accepting decimal numbers), dropdowns for Categories and Payees, and an additional field to add a new Payee if required.
   - Required fields are marked with a red asterisk (\*).

2. **Submit a Transaction:**
   Fill in the form with the desired data and click "Eintrag hinzufügen".

   - The form data will be processed, the transaction will be imported via the Actual Budget API, and a Discord message will be sent (if a webhook URL is set).
   - After a successful submission, you will be redirected back to the form page with a success message.

3. **Check Discord:**
   If you have configured the Discord webhook, you will receive a notification in your specified Discord channel containing details of the new transaction.

## Code Explanation

- **API Initialization:**  
  The app uses `@actual-app/api` to initialize a connection with the Actual Budget server. It reads configuration values (data directory, server URL, password, etc.) from environment variables.

- **Express Routes:**

  - **GET `/`:**  
    Fetches payees and categories via `api.getPayees()` and `api.getCategories()`, then renders an HTML form. The form is designed responsively with CSS, includes a date picker pre-filled with the current date, and uses modern styling with dark mode support.
  - **POST `/`:**  
    Processes the form submission:
    - Checks if a new payee is being added.
    - Converts the Euro amount entered by the user (as a float) into cents (an integer) as required by Actual.
    - Uses `api.importTransactions` to import the new transaction.
    - Sends a Discord notification using a dynamic import of `node-fetch`.
    - Redirects back to the GET route to avoid form re-submission.

- **Shutdown Handler:**  
  The process listens for a SIGINT signal (e.g., Ctrl+C) and gracefully shuts down the Actual API connection.

## Troubleshooting

- **node-fetch Error:**  
  If you encounter errors related to `node-fetch` (e.g., ERR_REQUIRE_ESM), ensure you are using dynamic import as shown in the code, or consider switching your project to use ES Modules by adding `"type": "module"` in your package.json.
- **Server Issues:**  
  Verify that the Actual Budget server is running and that the port (default is 5006) is not blocked or in use by another process.
- **Environment Variables:**  
  Double-check your `.env.local` file for any typos or missing values.

## License

This project is licensed under the MIT License.

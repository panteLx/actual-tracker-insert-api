# Actual Budget Transaction API

A simple Node.js application that integrates with the Actual API to manage transactions. It features a modern, responsive, and mobile-first user interface, complete with automatic cache busting for JavaScript and CSS assets.

## Features

- Transaction Management: Easily add new transactions with date, amount, category, and notes into two seperate budgets.
- Actual API Integration: Initializes the Actual API, downloads budget data, and imports transactions of both budgets.
- Responsive UI: Uses a mobile-first design with modern CSS (including dark mode support) and a clean layout.
- Dynamic Asset Versioning: Automatically appends a version query parameter based on each asset's last modified timestamp.
- User Feedback: Displays success and debug messages that disappear after 5 seconds (unless in debug mode).
- Discord Notifications: Sends a Discord webhook notification when a new transaction is added, including user attribution.
- Security: Uses Helmet for basic security enhancements and OIDC authentication.
- DEBUG Mode: Provides detailed debug information via frontend and Discord webhook when enabled.
- User Attribution: All transactions are tagged with the user's email for accountability.
- Rate Limiting: Limits the number of requests and transactions per minute to prevent abuse.
- Admin Panel: A panel to view logs and system settings.
- User Panel: A panel to view settings and preferences.
- Date Formatting: Formats the date and time of the transactions and logs to the configured locale and timezone.
- Schedules: Show schedules for subscriptions and when they need to be payed.

## Security

This application uses:

- Helmet for basic security headers
- OIDC for authentication
- Input sanitization for all user inputs
- Environment-based configuration
- Rate Limiting: Limits the number of requests and transactions per minute to prevent abuse.

## Debug Mode

When DEBUG=true:

- Success messages and debug information persist on screen
- Detailed transaction information is shown in the UI
- Extended debug information is sent to Discord (if DISCORD_DEBUG=true)
- Auto refresh is disabled on the transaction tracker page

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v12 or higher)
- pnpm

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/pantelx/actual-tracker-insert-api.git
   cd actual-tracker-insert-api
   ```

2. **Install Dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**

   Change the existing variables provided in the `.env.example` file to your desired values.

## Running the Application

Start the production server by running:

```bash
pnpm run start
```

Start the development server by running:

```bash
pnpm run dev
```

Open your browser and navigate to [http://<host>:<port>](http://<host>:<port>) to view the application.

## How It Works

1. **Authentication**

   - Uses OIDC for user authentication (session cookie)
   - Development mode uses a mock email for testing
   - Production mode uses the user's actual email
   - User groups are checked to determine access to the admin panel

2. **Transaction Flow**

   - User selects tracker type (Coffee or Money)
   - Fills in transaction details (amount, payee, notes)
   - System validates input and converts amount to cents
   - Transaction is tagged with user email for accountability
   - Data is sent to Actual Budget via API
   - If the category is a subscription, the transaction is not added to Actual Budget but a message is sent to Discord (can be toggled in the admin panel)
     - Otherwise the transaction won't be added to the schedule if the date doesn't match the schedule

3. **Budget Management**

   - Maintains separate budgets for coffee and money tracking
   - Automatically switches between budgets based on tracker type
   - Uses Actual's API for all budget operations

4. **Notifications**

   - Sends detailed Discord notifications for each transaction
   - Includes user attribution and debug information when enabled
   - Configurable debug mode for extended information

5. **Security & Error Handling**

   - Input sanitization for all user data
   - Environment-based configuration
   - Comprehensive error handling with user feedback
   - Secure authentication via OIDC (session cookie)
   - Rate Limiting: Limits the number of requests and transactions per minute to prevent abuse.

6. **Admin Panel (WIP)**

   - View, filter, search trought and clear logs
   - Toggle debug mode
   - Toggle Discord debug mode
   - Toggle direct add subscriptions
   - Update Discord webhook URL
   - Update locale (currently only for logs)
   - Update timezone (currently only for logs)
   - View system information

7. **User Panel (WIP)**

   - Settings Not implemented yet

8. **Schedules (WIP)**

   - Show schedules for subscriptions and when they need to be payed

## TODO / Future Enhancements

1. **Dynamic Tracker Types**

   - Move away from hardcoded coffee/money tracker types
   - Implement configurable tracker types via environment or database
   - Allow dynamic addition of new tracker types

2. **Enhanced Authentication**

   - ~~Implement full JWT verification for Cloudflare Access (now implemented with OIDC)~~
   - ~~Add role-based access control~~
   - Add user preferences and settings

3. **UI Improvements**

   - ~~Add dark/light theme toggle~~
   - Implement transaction history view (without beeing able to edit them - otherwise you can just use the actual tracker itself)

4. **Data Management**

   - Add transaction/schedule search functionality and filtering
   - Add basic reporting and statistics
   - Add batch transaction import

5. **System Enhancements**

   - ~~Add request rate limiting~~
   - ~~Implement proper error logging system~~
   - ~~Add transaction validation rules per tracker type~~

6. **Integration Improvements**

   - Add support for multiple Discord channels (and recreate discord service - currently it's a mess)
   - Add optional email notifications
   - Add webhook support for other platforms

7. **Performance**

   - ~~Optimize budget switching logic~~
   - Add performance monitoring

8. **Security**

   - ~~Add CSRF protection~~
   - ~~Add audit logging for all actions~~

## Contributing

Contributions are welcome! If you find any bugs or have ideas for improvements, please open an issue or submit a pull request.

## License

[MIT License](LICENSE)

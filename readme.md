# Actual Budget Transaction API

A Node.js application that integrates with the Actual Budget API to manage transactions across multiple budgets. Features a modern, responsive, and mobile-first user interface with automatic cache busting for assets, containerized with Docker for easy deployment and development.

## Features

- **Transaction Management**: Add transactions with date, amount, category, and notes into separate budgets
- **Actual API Integration**: Automatic initialization, budget data synchronization, and transaction imports
- **Modern UI**:
  - Mobile-first responsive design
  - Dark mode support
  - Dynamic asset versioning with cache busting
- **User Experience**:
  - Real-time feedback with auto-dismissing notifications
  - Discord notifications for transaction events
  - User attribution for all actions
- **Security**:
  - Helmet security headers
  - OIDC authentication
  - Rate limiting
  - Input sanitization
- **Administration**:
  - Admin panel for logs and system settings
  - User panel for preferences
  - Schedule management for subscriptions
  - Transaction filtering and viewing
- **Developer Features**:
  - Debug mode with enhanced logging
  - Docker-based development and production environments
  - Environment-specific configurations

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/pantelx/actual-tracker-insert-api.git
   cd actual-tracker-insert-api
   ```

2. **Configure Environment:**

   - Copy `.env.example` to `.env.development` and `.env.production`
   - Modify the environment variables as needed

3. **Start the Application:**

   Development mode:

   ```bash
   ENV_FILE=.env.development NODE_ENV=development docker compose up --build
   ```

   Production mode:

   ```bash
   docker compose up --build
   ```

   The application will be available at http://localhost:3000 (or your configured port)

## Environment Configuration

The application supports different environments through Docker:

- **Development**: Uses `.env.development` with hot-reloading and debug features
- **Production**: Uses `.env.production` with optimized settings

### Environment Variables

Key variables to configure in your `.env` files:

```env
NODE_ENV=development|production
PORT=3000
DEBUG=true|false
DISCORD_DEBUG=true|false
# Add other variables from .env.example
```

## Debug Mode

When `DEBUG=true`:

- Success messages and debug information persist on screen
- Detailed transaction information is shown in UI
- Extended debug information sent to Discord (if `DISCORD_DEBUG=true`)
- Auto refresh disabled on transaction tracker page

## Application Architecture

### Authentication Flow

- OIDC authentication with session cookies
- Development: Mock email for testing
- Production: Real user email
- Role-based admin panel access

### Transaction Processing

1. User selects tracker type (Coffee/Money)
2. Enters transaction details (amount, payee, notes)
3. System:
   - Validates input
   - Converts amount to cents
   - Tags with user email
   - Sends to Actual Budget API
   - For subscriptions:
     - Optionally skips Actual Budget
     - Sends Discord notification
     - Checks schedule dates

### Core Components

1. **Budget Management**

   - Separate coffee and money budgets
   - Automatic budget switching
   - Actual API integration

2. **Notification System**

   - Discord webhooks for transactions
   - User attribution
   - Configurable debug information

3. **Admin Features**

   - Log management (view, filter, search, clear)
   - Debug controls
   - Discord integration settings
   - System settings (locale, timezone)
   - System status monitoring

4. **User Features**
   - Transaction management
   - Schedule viewing
   - Basic filtering
   - Settings panel (WIP)

## Development

### Local Development

1. **Setup Environment:**

   ```bash
   cp .env.example .env.development
   ```

2. **Start Development Server:**

   ```bash
   ENV_FILE=.env.development NODE_ENV=development docker compose up --build
   ```

3. **Access Development Tools:**
   - Application: http://localhost:3000
   - Debug mode enabled
   - Hot-reloading active

### Production Deployment

1. **Setup Environment:**

   ```bash
   cp .env.example .env.production
   ```

2. **Start Production Server:**

   ```bash
   docker compose up --build
   ```

3. **Production Features:**
   - Optimized builds
   - Debug mode disabled
   - Production-level logging

## Roadmap

### Planned Features

1. **Dynamic Tracker Types**

   - Configurable via environment/database
   - Dynamic tracker addition

2. **User Experience**

   - User preferences and settings
   - Batch transaction import
   - Enhanced filtering and sorting

3. **Integration Enhancements**

   - Multi-channel Discord support
   - Email notifications
   - Additional platform webhooks

4. **Performance & Monitoring**
   - Performance monitoring
   - Enhanced statistics
   - System health checks

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

[MIT License](LICENSE)

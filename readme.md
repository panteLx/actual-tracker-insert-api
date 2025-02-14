```markdown
# Actual Transaction Manager

A simple Node.js application that integrates with the Actual API to manage transactions. It features a modern, responsive, and mobile-first user interface, complete with automatic cache busting for JavaScript and CSS assets.

## Features

- **Transaction Management:** Easily add new transactions with date, amount, category, and notes.
- **Actual API Integration:** Initializes the Actual API, downloads budget data, and imports transactions.
- **Responsive UI:** Uses a mobile-first design with modern CSS (including dark mode support) and a clean layout.
- **Dynamic Asset Versioning:** Automatically appends a version query parameter based on each asset's last modified timestamp to ensure users always receive the latest updates.
- **User Feedback:** Displays success and debug messages that disappear after 10 seconds, with the URL automatically cleaned up.
- **Discord Notifications:** Sends a Discord webhook notification when a new transaction is added.
- **Security:** Uses Helmet for basic security enhancements.

## Folder Structure
```

/project-root
├── index.js # Main server file (Express & API integration)
├── views
│ └── index.ejs # EJS template for the main UI
├── public
│ ├── css
│ │ └── style.css # Main CSS file with modern, responsive styling
│ └── js
│ └── main.js # JavaScript file for client-side interactivity and cache busting
└── .env # Environment configuration file

````

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v12 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/pantelx/actual-tracker-insert-api.git
   cd actual-tracker-insert-api
````

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the project root and set the following variables:

   ```env
   ACTUAL_DATA_DIR=your_actual_data_directory
   ACTUAL_URL=https://your-actual-api-url
   ACTUAL_PW=your_actual_password
   ACTUAL_BUDGET_ID=your_budget_id
   ACTUAL_ACCOUNT_ID=your_account_id
   DISCORD_WEBHOOK_URL=your_discord_webhook_url
   ```

## Running the Application

Start the server by running:

```bash
node index.js
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## How It Works

- **Server Setup:**  
  The `index.js` file initializes Express, sets up static file serving, configures the EJS template engine, and connects to the Actual API. It also includes routes for rendering the form and handling form submissions.

- **Dynamic Asset Versioning:**  
  A helper function in `index.js` calculates the last modified time of `main.js` and `style.css` and appends this as a version parameter to the asset URLs. This ensures that when you update these files, users receive the latest versions rather than cached ones.

- **User Interface:**  
  The UI (built in `views/index.ejs` and styled in `public/css/style.css`) is designed to be responsive and modern, following a mobile-first approach. JavaScript in `public/js/main.js` handles UI interactivity, such as toggling additional fields and providing visual feedback during form submission.

## Contributing

Contributions are welcome! If you find any bugs or have ideas for improvements, please open an issue or submit a pull request.

## License

[MIT License](LICENSE)

```

This README provides an overview of your project's features, structure, and setup instructions, ensuring that other developers can quickly understand and work with your code.
```

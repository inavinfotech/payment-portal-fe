# SVARP Frontend

This is the frontend application for SVARP, built with **React** and **Vite**, styled using **TailwindCSS**.

## Tech Stack

- **Framework**: React (Vite)
- **Styling**: TailwindCSS
- **Routing**: React Router
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Prerequisites

- Node.js (v16+)
- npm

## Setup & Installation

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the `frontend/` directory to configure environment variables (e.g., API base URL).
    ```env
    VITE_API_BASE_URL=http://localhost:8000
    ```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Linting

Run ESLint to check for code quality issues:

```bash
npm run lint
```

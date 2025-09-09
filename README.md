# TT-Watchlist

A Svelte/SvelteKit application for creating, editing, and monitoring lists of trading symbols using the tastytrade API.

## Environment Setup

The following variables must be set in your `.env` file for the app to work:

```
# TastyTrade API credentials
TASTYTRADE_API_URL=
TASTYTRADE_CLIENT_ID=
TASTYTRADE_CLIENT_SECRET=

```

## Development

To run the app in development mode:

```bash
yarn run dev --open
```

This will start the development server and open the application in your default browser.

## Testing

To run unit tests:

```bash
yarn test:unit
```

## Building

To build the project for production:

```bash
yarn build
```

## Tech Stack

- Svelte/SvelteKit
- TypeScript
- TailwindCSS
- Vite
- Vitest
- ESLint
- Prettier

## Features

- Create and manage watchlists of trading symbols
- Monitor real-time pricing data
- Search for trading symbols
- View detailed market data
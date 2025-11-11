# B3 Stock Tracker

A modern, real-time stock monitoring application for the Brazilian Stock Exchange (B3). Track your favorite stocks with live price updates, interactive charts, and a beautiful dark/light theme interface.

![B3 Stock Tracker](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## ✨ Features

- 📊 **Real-time Stock Monitoring** - Track multiple B3 stocks with live price updates
- 🔄 **Auto-refresh** - Automatic price updates with configurable intervals and countdown timer
- 📈 **Interactive Charts** - Historical price charts with multiple time ranges (1w, 1mo, 3mo, 6mo, 1y, 5y)
- 🎨 **Beautiful UI** - Modern interface built with shadcn/ui components and Tailwind CSS
- 🌓 **Dark/Light Theme** - Seamless theme switching with system preference support
- 🔍 **Smart Search** - Quick stock search with autocomplete for popular B3 stocks
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- 💾 **Persistent Storage** - Your stock list is saved locally in your browser
- 🎯 **Drag & Drop** - Reorder stocks manually with intuitive drag and drop
- 🔀 **Flexible Sorting** - Sort by price, change percentage, or symbol (A-Z/Z-A)
- 📋 **Stock Details** - View detailed information including:
  - Current price and change percentage
  - Market cap, volume, and P/E ratio
  - 52-week high/low ranges
  - Daily price ranges
  - Company logos

## 🚀 Technologies

This project is built with modern web technologies:

- **[React](https://react.dev/)** (18.3) - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** (5.8) - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** (5.4) - Fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** (3.4) - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[Recharts](https://recharts.org/)** (2.15) - Composable charting library
- **[TanStack Query](https://tanstack.com/query)** (5.83) - Data fetching and caching
- **[React Router](https://reactrouter.com/)** (6.30) - Client-side routing
- **[@dnd-kit](https://dndkit.com/)** - Drag and drop functionality
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** - Form validation
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[Lucide React](https://lucide.dev/)** - Beautiful icons

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/b3-tracker.git
cd b3-tracker
```

Install dependencies using your preferred package manager:

**Using npm:**
```bash
npm install
```

**Using yarn:**
```bash
yarn install
```

**Using bun:**
```bash
bun install
```

## 🏃 Running the Project

Start the development server:

**Using npm:**
```bash
npm run dev
```

**Using yarn:**
```bash
yarn dev
```

**Using bun:**
```bash
bun run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 🔨 Build for Production

Build the application:

**Using npm:**
```bash
npm run build
```

**Using yarn:**
```bash
yarn build
```

**Using bun:**
```bash
bun run build
```

Preview the production build:

```bash
npm run preview
# or
yarn preview
# or
bun run preview
```

## ⚙️ Configuration

### API Token (Optional)

The application fetches stock data from two sources:

1. **Yahoo Finance** (default) - Free, no token required
2. **brapi.dev** - Fallback option, optional token for higher rate limits

To configure a brapi.dev API token:

1. Get your free token at [brapi.dev](https://brapi.dev/)
2. Click the "⚙️ Configurar Token" button in the app
3. Enter your token and save

The token is stored locally in your browser and is only used for API requests to brapi.dev.

## 🎯 Usage

1. **Add Stocks**: Click the "+ Adicionar Ação" button and search for B3 stocks (e.g., PETR4, VALE3, ITUB4)
2. **View Details**: Click on any stock card to view detailed information and historical charts
3. **Update Prices**: Click "Atualizar Preços" to manually refresh or enable "Auto-atualização" for automatic updates
4. **Reorder Stocks**: Drag and drop stock cards to reorder them manually
5. **Sort Stocks**: Use the "Ordenar" button to sort by price, change, or symbol
6. **Save Changes**: Click "Salvar Lista" to persist your stock list and order
7. **Toggle Theme**: Use the theme toggle button to switch between light and dark modes

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Sources

The application uses multiple data sources for reliability:

- **Primary**: Yahoo Finance API (free, no authentication required)
- **Fallback**: brapi.dev API (Brazilian financial data aggregator)
- **Logos**: Fetched from brapi.dev when available

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📧 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ for Brazilian stock investors

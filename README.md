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
- 💾 **Smart Storage** - Stock list saved locally; prices always fetched fresh from API
- 🎯 **Drag & Drop** - Reorder stocks manually with smooth drag and drop animations
- 🔀 **Flexible Sorting** - Sort by price, change percentage, or symbol (A-Z/Z-A)
- ⚡ **No Stale Data** - Prices are always up-to-date, never cached
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

### 💡 How Data Storage Works

- **Stock List**: Only stock symbols and names are saved in localStorage
- **Prices**: Always fetched fresh from the API (never cached)
- **Page Load**: Automatically fetches current prices for all saved stocks
- **Auto-refresh**: Keeps prices updated at your chosen interval
- **Historical Data**: Chart data is cached temporarily for better performance

This ensures you always see up-to-date market prices without stale cached data!

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages (manual method)

## 🚀 Deploy to GitHub Pages

### Method 1: Automatic Deploy with GitHub Actions (Recommended)

This project is configured for automatic deployment using GitHub Actions. Every push to the `main` branch will automatically build and deploy to GitHub Pages.

**Setup Steps:**

1. **FIRST: Enable GitHub Pages in your repository (IMPORTANT!)**
   - Go to your repository on GitHub
   - Click on **Settings** → **Pages** (left sidebar)
   - Under **Source**, select **GitHub Actions** from the dropdown
   - Click **Save** if prompted
   - This MUST be done before pushing the code, or you'll get a "Not Found" error

2. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

3. **Wait for the deployment:**
   - Go to the **Actions** tab in your repository
   - You'll see the "Deploy to GitHub Pages" workflow running
   - Once complete (green checkmark ✓), your site will be live at: `https://yourusername.github.io/b3-tracker/`
   - First deployment takes about 1-2 minutes

4. **If you get "Not Found" error:**
   - Make sure you completed step 1 (Enable GitHub Pages)
   - Go to **Settings** → **Actions** → **General**
   - Scroll to **Workflow permissions**
   - Select **Read and write permissions**
   - Check **Allow GitHub Actions to create and approve pull requests**
   - Click **Save**
   - Re-run the workflow in the Actions tab

5. **Update the base path (if needed):**
   - If your repository name is different from `b3-tracker`, update the `base` in `vite.config.ts`:
   ```typescript
   base: mode === 'production' ? '/your-repo-name/' : '/',
   ```
   - If using a custom domain or `username.github.io` repository, use `base: '/'`

### Method 2: Manual Deploy

If you prefer to deploy manually:

1. **Install gh-pages:**
   ```bash
   npm install -D gh-pages
   ```

2. **Deploy:**
   ```bash
   npm run deploy
   ```

3. **Configure GitHub Pages:**
   - Go to repository **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Select the `gh-pages` branch

Your site will be available at `https://yourusername.github.io/b3-tracker/`

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file in the `public` folder with your domain
2. Configure your DNS records to point to GitHub Pages
3. Update `base: '/'` in `vite.config.ts`
4. Enable custom domain in repository Settings → Pages

## 🌐 API Sources

The application uses multiple data sources for reliability:

- **Primary**: Yahoo Finance API (free, no authentication required)
  - Uses [corsproxy.io](https://corsproxy.io) public CORS proxy
- **Fallback**: brapi.dev API (Brazilian financial data aggregator)
- **Logos**: Fetched from brapi.dev when available

### Why CORS Proxy?

Yahoo Finance doesn't allow direct browser requests due to CORS restrictions. We use corsproxy.io, a free public CORS proxy service, to make requests to Yahoo Finance API. The brapi.dev API has CORS enabled by default and doesn't require a proxy.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📧 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ for Brazilian stock investors

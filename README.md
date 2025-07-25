# Dairy Processor Environmental Dashboard

A comprehensive TNFD-compliant environmental monitoring system for dairy processors, tracking water usage, biodiversity, and nutrient management across 270+ farms.

## Features

- **Water Management**: Monitor water usage, quality, and conservation efforts
- **Biodiversity Tracking**: Track species, habitats, and conservation initiatives
- **Nutrient Management**: Monitor nitrogen/phosphorus efficiency and compliance
- **TNFD Reporting**: Generate nature-related financial disclosure reports
- **Risk Assessment**: Real-time environmental risk monitoring
- **Data Verification**: Multi-level verification system (Bronze, Silver, Gold)

## Tech Stack

- **Frontend**: React 18 with hooks
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/17871787/tfnd.git
cd tfnd
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`.

## Deployment

### Deploy to Vercel

1. **Automatic Deployment (Recommended)**:
   - Connect your GitHub repository to Vercel
   - Push to main branch triggers automatic deployment

2. **Manual Deployment**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

### Deploy to Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to Netlify

### Deploy to GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to package.json:
   ```json
   {
     "homepage": "https://17871787.github.io/tfnd",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

## Environment Variables

Create a `.env` file in the root directory for any environment-specific variables:

```
REACT_APP_API_URL=your_api_url_here
REACT_APP_ENVIRONMENT=production
```

## Project Structure

```
dairy-dashboard/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── App.js          # Main dashboard component
│   ├── index.js        # React entry point
│   └── index.css       # Global styles with Tailwind
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Key Components

- **Dashboard Overview**: Key metrics and regional performance
- **Water Management**: Usage tracking, quality monitoring, efficiency metrics
- **Biodiversity Module**: Species monitoring, habitat tracking, conservation efforts
- **Nutrient Management**: N/P efficiency, NVZ compliance, field-level planning
- **TNFD Reporting**: Compliance dashboard with governance, strategy, risks, and metrics

## Data Management

The dashboard currently uses mock data for demonstration. In production, you would:

1. Connect to a real database (PostgreSQL, MongoDB, etc.)
2. Implement API endpoints for data fetching
3. Add authentication and authorization
4. Implement real-time data updates

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact the development team

## Performance Optimization

The dashboard includes several performance optimizations:

- React.memo for component memoization
- useMemo for expensive calculations
- Lazy loading for charts and data
- Optimized bundle size with code splitting

## Security Considerations

- All data transmission should use HTTPS
- Implement proper authentication
- Sanitize user inputs
- Regular security audits of dependencies

---

Built with ❤️ for sustainable dairy farming
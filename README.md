# Open Source Visualizations

Professional visualization platform for teaching, learning, and professional development analytics. Built with rigorous statistical methods and modern web technologies.

## Overview

This platform provides data-driven insights for:
- **Corporate Training**: Track employee skill development and competency gaps
- **Educational Institutions**: Monitor student progress and learning outcomes
- **Small Teams**: Visualize team capabilities and development needs
- **Individual Development**: Personal skill tracking and goal management

## Core Principles

- **Technical Precision**: No fluffy metaphors, just rigorous analytics
- **Statistical Rigor**: Basic statistical methods with documented assumptions and limitations
- **Professional Quality**: Clean, functional visualizations (export features pending)
- **Honest Limitations**: MVP state - see Known Limitations section below

## Key Features

### 1. Skill Matrix Heat Map
Interactive heat map visualization showing competency levels across users and skills.

**Features:**
- Color-coded proficiency levels
- Drill-down capabilities
- Confidence interval display
- Multiple color schemes (sequential, diverging)
- Interactive tooltips

**Use Cases:**
- Team capability assessment
- Skill gap identification
- Training needs analysis
- Hiring decisions

### 2. Time-Series Progress Tracking
Longitudinal analysis of skill development with statistical trend detection.

**Features:**
- Multi-cohort comparison
- Linear regression trend lines
- 95% confidence intervals
- Change point detection
- Statistical summaries (mean, median, std dev)

**Use Cases:**
- Track learning progress over time
- Compare training program effectiveness
- Identify acceleration/plateau periods
- Forecast future development

### 3. Gap Analysis Dashboard
Identify and prioritize competency development opportunities.

**Features:**
- Current vs. target level comparison
- Priority-based sorting (high/medium/low)
- Recommended action plans
- Category-based analysis
- Interactive exploration

**Use Cases:**
- Individual development planning
- Resource allocation
- Career pathway planning
- Performance review preparation

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualizations**: D3.js
- **Database**: Prisma ORM with PostgreSQL
- **Deployment**: Vercel-ready (see DEPLOYMENT.md)
- **Data Import**: CSV parsing with validation (PapaParse)
- **Export**: PNG, SVG, CSV (html-to-image, file-saver)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up database
npm run db:generate
npm run db:push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm run start
```

## Deployment

This application is production-ready and optimized for Vercel deployment.

**Quick Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/open-source-visualizations)

**For detailed deployment instructions including:**
- Database setup (Vercel Postgres, Supabase, Neon)
- Environment variable configuration
- Domain setup
- Monitoring and scaling

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.**

### Key Features for Production

- ✅ CSV data import with validation
- ✅ Export to PNG, SVG, CSV
- ✅ Embed code generation
- ✅ PostgreSQL database support
- ✅ Serverless-ready architecture
- ✅ Type-safe APIs with Prisma

## Project Structure

```
.
├── app/                    # Next.js app router pages
│   ├── skills/            # Skill matrix visualization
│   ├── progress/          # Time-series tracking
│   ├── gaps/              # Gap analysis
│   ├── dashboard/         # Overview dashboard
│   ├── data/              # Data import interface
│   └── export/            # Export functionality
├── components/            # React components
│   ├── SkillMatrixHeatmap.tsx
│   ├── TimeSeriesChart.tsx
│   └── GapAnalysisChart.tsx
├── lib/                   # Utilities and core logic
│   ├── db.ts             # Prisma client
│   ├── types.ts          # TypeScript types
│   ├── stats.ts          # Statistical functions
│   └── sampleData.ts     # Demo data generators
├── prisma/               # Database schema
│   └── schema.prisma
└── public/               # Static assets
```

## Data Models

### Core Entities

- **Organization**: Corporate or educational institution
- **User**: Individual learner/employee/student
- **Skill**: Competency or skill definition
- **Assessment**: Measurement of skill proficiency
- **Goal**: Learning/development objective
- **Progress Entry**: Time-stamped progress record
- **Cohort**: Group for comparative analysis

See `prisma/schema.prisma` for complete data model.

### Data Validation Limitations (MVP)

**Current MVP does not include:**
- Runtime data validation (no Zod or similar)
- Score range constraints (could accept values < 0 or > 100)
- Database constraints beyond basic types
- Input sanitization for user-provided data
- Error boundaries for visualization failures

**All current data is generated via sample data generators** - no real data import yet.

## Statistical Methods

### Implemented Functions

- **Descriptive Statistics**: Mean, median, mode, std dev, variance
- **Distribution Analysis**: Quartiles, IQR, percentile ranks
- **Confidence Intervals**: 95% CI for means
- **Outlier Detection**: IQR-based outlier identification
- **Correlation**: Pearson correlation coefficient
- **Regression**: Simple linear regression with R²
- **Normalization**: Min-max scaling

All statistical functions are available in `lib/stats.ts`.

### Important Statistical Limitations

**See `lib/stats.ts` file header for complete documentation of assumptions and limitations.**

Key limitations:
- Confidence intervals assume normal distribution or n ≥ 30 (Central Limit Theorem)
- Linear regression does NOT check assumptions (linearity, homoscedasticity, normality of residuals)
- No hypothesis testing (p-values, t-tests, ANOVA, etc.)
- No non-parametric alternatives for small or skewed datasets
- No handling of missing data or outlier treatment options
- Correlation sensitive to outliers, only detects linear relationships
- Small sample sizes (n < 10-30) trigger console warnings but still compute

**For production use with real statistical inference, consider validated libraries like:**
- R with tidyverse/stats packages
- Python scipy.stats, statsmodels, or pingouin
- Julia Statistics.jl

## Visualization Features

### Interactive Elements

- **Tooltips**: Hover for detailed information
- **Click-through**: Drill down into specific data points
- **Filtering**: Dynamic data filtering and sorting
- **Zooming**: Time-range selection (planned)
- **Exporting**: SVG, PNG, CSV, PDF (in development)

### Color Schemes

- Sequential: Viridis (perceptually uniform, colorblind-friendly)
- Diverging: Red-Yellow-Green (intuitive but NOT colorblind-friendly - needs improvement)
- Categorical: D3 Category10 (distinct hues for series)

### Accessibility Limitations (MVP)

**Current accessibility issues that need improvement:**
- Tooltips are mouse-only (no keyboard navigation)
- No ARIA labels or semantic HTML in D3 visualizations
- No screen reader support for charts
- Gap analysis uses red-green color scheme (problematic for ~8% of males with colorblindness)
- No alternative text descriptions for visualizations
- Focus indicators may not be visible in all contexts

**Planned improvements:**
- Keyboard navigation for all interactive elements
- ARIA live regions for dynamic updates
- Alternative color schemes (blue-orange diverging)
- Text alternatives and data tables for screen readers

## Roadmap

### MVP (Current Phase)
- [x] Core visualization components
- [x] Statistical calculation library
- [x] Database schema and models
- [x] Sample data generators
- [ ] CSV data import
- [ ] Export functionality (SVG, PNG, CSV)
- [ ] Embed system

### Phase 2
- [ ] Real-time collaboration
- [ ] Advanced filtering and querying
- [ ] Custom dashboard builder
- [ ] API endpoints for integrations
- [ ] Authentication and authorization

### Phase 3
- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Mobile responsive design
- [ ] Multi-language support
- [ ] Advanced export formats (interactive HTML, video)

## Contributing

This is an open-source project. Contributions are welcome!

### Development Guidelines

1. **Code Quality**: TypeScript strict mode, ESLint compliance
2. **Testing**: Write tests for statistical functions
3. **Accessibility**: Follow WCAG AA guidelines
4. **Documentation**: Document complex algorithms and visualizations
5. **Performance**: Profile and optimize for large datasets

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- GitHub Issues: [Report bugs or request features]
- Documentation: See `/docs` folder for detailed guides
- Examples: Check `/examples` for usage patterns

## Acknowledgments

Built with modern web technologies and inspired by rigorous data visualization principles from Edward Tufte, Stephen Few, and the D3.js community.

---

**Note**: This is an MVP. Some features are still in development. See the roadmap above for planned enhancements.

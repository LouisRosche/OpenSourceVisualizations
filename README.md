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
- **Statistical Rigor**: Confidence intervals, significance testing, proper statistical methods
- **Professional Quality**: Publication-ready exports and presentations
- **Accessibility**: WCAG AA compliant, keyboard navigable
- **Performance**: Handle 10K+ data points smoothly

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
- **Visualizations**: D3.js, Recharts
- **Database**: Prisma ORM with SQLite (easily migrates to PostgreSQL)
- **State Management**: Zustand
- **Animations**: Framer Motion

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

## Visualization Features

### Interactive Elements

- **Tooltips**: Hover for detailed information
- **Click-through**: Drill down into specific data points
- **Filtering**: Dynamic data filtering and sorting
- **Zooming**: Time-range selection (planned)
- **Exporting**: SVG, PNG, CSV, PDF (in development)

### Color Schemes

- Sequential: Viridis (perceptually uniform, colorblind-friendly)
- Diverging: Red-Yellow-Green (intuitive for gap analysis)
- Categorical: D3 Category10 (distinct hues for series)

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

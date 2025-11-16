# Deployment Guide

## Deploy to Vercel (Recommended)

### Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **PostgreSQL Database** - Choose one:
   - Vercel Postgres (easiest, integrated)
   - Supabase (free tier available)
   - Neon (free tier available)

### Step 1: Set Up Database

#### Option A: Vercel Postgres

1. Go to your Vercel project → Storage tab
2. Create a new Postgres database
3. Vercel will automatically set `DATABASE_URL` and `POSTGRES_URL` environment variables

#### Option B: Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to Project Settings → Database
3. Copy the connection string (Transaction mode for `DATABASE_URL`, Session mode for `DIRECT_DATABASE_URL`)

#### Option C: Neon

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string from dashboard
3. Use it for both `DATABASE_URL` and `DIRECT_DATABASE_URL`

### Step 2: Deploy to Vercel

**Method 1: Via Vercel Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js configuration
4. Add environment variables (see below)
5. Click Deploy

**Method 2: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 3: Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Database (from your database provider)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_DATABASE_URL="postgresql://user:password@host:5432/database"

# Application URL (Vercel will provide this)
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# Next Auth (optional, for future features)
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-random-32-char-string"
```

### Step 4: Run Database Migrations

After first deployment:

```bash
# Install dependencies locally
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations (production)
npx prisma migrate deploy
```

**Or via Vercel CLI:**

```bash
# Set environment variables locally
vercel env pull .env.local

# Run migrations
npx prisma db push
```

### Step 5: Verify Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Test CSV upload at `/data`
3. Check visualizations work
4. Test export functionality

## Deploy to Other Platforms

### Netlify

```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Railway

1. Connect GitHub repo
2. Add PostgreSQL service
3. Set environment variables
4. Deploy

### Self-Hosted (Docker)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/visualizations
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: visualizations
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Post-Deployment Setup

### 1. Set Up Custom Domain (Optional)

In Vercel:
1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### 2. Configure Analytics (Optional)

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 3. Set Up Monitoring

- Enable Vercel Logs
- Set up error tracking (Sentry, LogRocket)
- Monitor database performance

## Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
```bash
# Add to package.json scripts
"postinstall": "prisma generate"
```

**Error: Database connection failed**
- Check DATABASE_URL format
- Verify database is accessible from Vercel IPs
- Check if SSL is required (`?sslmode=require`)

### Runtime Errors

**Prisma timeout errors**
- Increase connection pool size
- Use connection pooling (PgBouncer)
- Check DIRECT_DATABASE_URL is set

**Large CSV upload fails**
- Increase Vercel function timeout (Pro plan)
- Or implement chunked upload

## Performance Optimization

### 1. Enable Caching

```typescript
// app/layout.tsx
export const revalidate = 3600; // Revalidate every hour
```

### 2. Optimize Images

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### 3. Database Connection Pooling

Use Prisma Data Proxy or PgBouncer for serverless environments.

## Security Checklist

- [ ] Environment variables not committed to Git
- [ ] Database credentials rotated
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CORS configured if needed
- [ ] Rate limiting implemented (optional)
- [ ] Input validation on all uploads
- [ ] SQL injection protection (Prisma handles this)

## Monitoring & Maintenance

### Regular Tasks

1. Monitor database size and performance
2. Check error logs weekly
3. Update dependencies monthly
4. Review and rotate secrets quarterly
5. Backup database regularly

### Scaling Considerations

- Database: Upgrade plan or use read replicas
- Compute: Upgrade Vercel plan for more bandwidth
- Storage: Use S3/R2 for large file uploads

---

**Need Help?** Open an issue on GitHub or check [Vercel Documentation](https://vercel.com/docs)

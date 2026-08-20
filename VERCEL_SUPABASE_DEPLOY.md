# Vercel & Supabase Deployment Guide

## 📋 Overview
This guide covers deploying the ASAS ERP application to Vercel (Frontend) and Supabase (Backend/Database).

## Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Vercel CLI: `npm i -g vercel`
- Supabase account (supabase.com)
- GitHub account with repository access

## 1. Supabase Setup

### Create Supabase Project
```bash
# Visit https://supabase.com and create a new project
# Note down your:
# - Project URL
# - Anon Key
# - Service Role Key
```

### Environment Variables (Supabase)
Create `.env.local`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup
```bash
# Run migrations
npm run migrate:db

# Seed initial data (optional)
npm run seed:db
```

## 2. Vercel Deployment

### Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the project directory (if monorepo)

### Environment Variables (Vercel)
Add in Vercel Dashboard > Settings > Environment Variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=your_api_url
NODE_ENV=production
```

### Deploy
```bash
# Via Vercel CLI
vercel --prod

# Or automatic via GitHub push
git push origin main
```

## 3. Post-Deployment

### Verify Deployment
- Check Vercel dashboard for deployment status
- Test API endpoints
- Verify database connections
- Monitor error logs

### Domain Configuration
1. Go to Vercel > Settings > Domains
2. Add your custom domain
3. Update DNS records at your registrar
4. Wait for DNS propagation

### SSL/TLS
- Vercel automatically provides SSL certificates
- Verify HTTPS is working correctly

## 4. Monitoring & Logging

### Vercel Analytics
- Monitor performance metrics
- Track deployment history
- View error reports

### Supabase Monitoring
- Check database performance
- Monitor real-time activity
- Review audit logs

## 5. Rollback Procedure

### Quick Rollback
```bash
# On Vercel
vercel rollback

# Or redeploy previous commit
git revert <commit-hash>
git push origin main
```

## 6. Common Issues & Troubleshooting

### Issue: Build Fails on Vercel
**Solution:**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure Node version compatibility

### Issue: Database Connection Error
**Solution:**
- Verify Supabase URL and keys
- Check firewall/IP whitelist
- Test connection locally first

### Issue: Slow Performance
**Solution:**
- Optimize images and assets
- Enable caching headers
- Use Vercel Edge Functions
- Optimize database queries

## 7. Security Checklist

- [ ] Secrets never committed to git
- [ ] Environment variables configured in Vercel
- [ ] Database backups enabled in Supabase
- [ ] SSL/TLS certificates valid
- [ ] Rate limiting configured
- [ ] CORS properly configured

## 8. Useful Commands

```bash
# Local development
npm run dev

# Build
npm run build

# Test
npm run test

# Deploy to staging
vercel --scope=team-name

# View logs
vercel logs

# Pull Supabase schema locally
npx supabase db pull
```

## References
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/learn/basics/deploying-nextjs-app)

---

**Last Updated:** 2024
**Maintained By:** DevOps Team

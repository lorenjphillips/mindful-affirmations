# Render + Vercel + Supabase Deployment Guide

This guide covers deploying your meditation app with:
- **Supabase**: Database (PostgreSQL)
- **Render**: Backend API
- **Vercel**: Frontend

## 📋 Prerequisites

- [ ] Supabase project created with DATABASE_URL
- [ ] ElevenLabs API key
- [ ] GitHub repository
- [ ] Render account
- [ ] Vercel account

---

## 🗄️ Step 1: Database Setup (Supabase)

Follow the [setup-supabase.md](./setup-supabase.md) guide first.

Once complete, you should have:
- ✅ Supabase project running
- ✅ DATABASE_URL working locally
- ✅ Tables created with `npm run db:push`

---

## 🖥️ Step 2: Backend Deployment (Render)

### 2.1: Create Render Service

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `mindful-affirmations-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2.2: Set Environment Variables

In Render dashboard → Environment:

```env
NODE_ENV=production
DATABASE_URL=your_supabase_connection_string
ELEVENLABS_API_KEY=your_elevenlabs_key
SESSION_SECRET=generate_random_64_char_string
PORT=10000
```

### 2.3: Deploy and Test

1. Click "Deploy"
2. Wait for build to complete
3. Test your API endpoint: `https://your-app-name.onrender.com/api/meditations`
4. Should return JSON (even if empty/auth error)

**Save your Render URL** - you'll need it for frontend setup!

---

## 🌐 Step 3: Frontend Deployment (Vercel)

### 3.1: Update API Base URL

First, update your frontend to point to Render backend:

```typescript
// client/src/lib/api.ts (create if doesn't exist)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-render-app-name.onrender.com'
  : 'http://localhost:5000';

export const api = {
  baseUrl: API_BASE_URL
};
```

### 3.2: Update Vercel Config

Edit `vercel.json` and replace `your-render-backend-url` with your actual Render URL:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-actual-render-url.onrender.com/api/$1"
    }
  ]
}
```

### 3.3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

### 3.4: Test Full Stack

After deployment:
1. Visit your Vercel URL
2. Try creating a meditation session
3. Check if audio generation works
4. Verify database saves data

---

## 🔧 Step 4: CORS Configuration

Add CORS to your backend for Vercel domain:

```typescript
// server/index.ts - add this before routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-vercel-app.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

---

## 🧪 Step 5: Testing Checklist

### Backend (Render) Tests
- [ ] `GET /api/meditations` returns JSON
- [ ] Database connection works
- [ ] ElevenLabs API generates audio
- [ ] CORS headers present

### Frontend (Vercel) Tests  
- [ ] Homepage loads
- [ ] Can create meditation form
- [ ] API calls reach backend
- [ ] Audio player works
- [ ] No console errors

### Full Integration Tests
- [ ] Create meditation session end-to-end
- [ ] Audio generation completes
- [ ] Session saves to database
- [ ] Can replay saved sessions

---

## 🚀 Step 6: Environment-Specific Configs

### For Development
```bash
# .env.local (for local development)
VITE_API_URL=http://localhost:5000
```

### For Production
Vercel automatically sets `NODE_ENV=production`, so your API calls will use the Render URL.

---

## 📊 Step 7: Monitoring & Maintenance

### Render Monitoring
- Check logs: Render Dashboard → Logs
- Monitor metrics: CPU, Memory usage
- Set up alerts for downtime

### Vercel Monitoring  
- View analytics: Vercel Dashboard → Analytics
- Check function logs for API proxying
- Monitor Core Web Vitals

### Supabase Monitoring
- Database usage: Supabase Dashboard → Database
- Connection pooling status
- Query performance

---

## 🔄 Step 8: Update Workflow

### Code Updates
```bash
# Push to main branch triggers auto-deployment on both platforms
git add .
git commit -m "Update meditation features"
git push origin main
```

### Database Schema Updates
```bash
# Run locally first
npm run db:push

# Then commit schema changes
git add shared/schema.ts
git commit -m "Update database schema"  
git push origin main
```

---

## 🐛 Troubleshooting

### Backend Issues (Render)
- **Build fails**: Check build logs, ensure all dependencies in package.json
- **Database connection**: Verify Supabase URL and permissions
- **API timeouts**: Check ElevenLabs API key and rate limits

### Frontend Issues (Vercel)
- **API calls fail**: Check CORS configuration and Render URL
- **Build fails**: Ensure TypeScript compiles locally first
- **Routes not working**: Verify vercel.json rewrites

### Database Issues (Supabase)
- **Connection errors**: Check IP restrictions and connection pooling
- **Schema mismatches**: Run `npm run db:push` to sync
- **Performance**: Monitor connection count and queries

---

## 🎯 Success Criteria

Your deployment is complete when:

- [ ] Backend API responds at `https://your-app.onrender.com/api/meditations`
- [ ] Frontend loads at `https://your-app.vercel.app`
- [ ] Can create full meditation sessions with audio
- [ ] Database stores and retrieves sessions
- [ ] No CORS errors in browser console
- [ ] Audio generation works end-to-end

---

## 💡 Next Steps

After successful deployment:
1. Set up custom domain on Vercel
2. Add monitoring/analytics
3. Set up automated backups for Supabase
4. Configure CDN for audio files
5. Add error tracking (Sentry)

**You're all set!** 🎉 
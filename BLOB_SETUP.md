# Boss Tracker - Vercel Blob Setup

## Setup Vercel Blob Storage (100% FREE)

### 1. Install dependencies
```bash
npm install
```

### 2. Create Blob storage in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** → **Create Database**
4. Select **Blob** → **Continue**
5. Name it "boss-tracker" → **Create**

### 3. Get environment variable
After creating the blob storage, Vercel will show:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

Copy this token.

### 4. Add to local .env.local
Create `.env.local` in project root:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_YOUR_TOKEN_HERE
```

### 5. Deploy
```bash
git add .
git commit -m "Add Blob storage"
git push
```

The environment variable is automatically added to production!

## How It Works

**Admin (You):**
- Upload `.txt` files via "Upload Data" button
- Data saves to Vercel Blob (shared cloud storage)

**Users:**
- Visit the site
- See the data you uploaded
- No upload needed

## Testing Locally

```bash
npm run dev
```

Upload a file → It saves to Blob → All users see it!

## Free Tier Limits
- 500GB bandwidth/month (plenty for JSON data)
- Unlimited storage
- No credit card needed

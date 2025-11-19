# RubinOT Boss Tracker - Deployment Guide

## Option 1: Deploy via GitHub (Recommended)

1. Create a new GitHub repository
2. Push this code:
   ```bash
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin master
   ```
3. Go to [vercel.com/new](https://vercel.com/new)
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and deploy

## Option 2: Deploy via Vercel CLI (Local)

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel` (from project directory)
4. Follow the prompts

## Option 3: Direct Upload

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Deploy" → "Import Project"
3. Upload this directory as a zip

## Project Structure

```
boss-tracker/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Global dashboard
│   ├── world/[worldName]/ # Dynamic world pages
│   └── globals.css
├── components/            # React components
├── context/              # State management
├── utils/                # Parser utilities
├── types/                # TypeScript types
└── package.json

```

## How to Use

1. Upload `.txt` files using the "Upload Data" button
2. Files are stored in browser's localStorage
3. Navigate between Global Stats and individual worlds
4. Search and sort bosses as needed

## File Formats Expected

- Single world: `RubinOT_Kills_[WorldName].txt`
- Combined stats: `RubinOT_Kills_ALL_WORLDS_COMBINED.txt`

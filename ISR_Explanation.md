# Why Adding `revalidate = 3600` Helps (and doesn't hurt)

You asked: *"we are adding export const revalidate = 3600; but we didnt have it before right? wouldnt this just increase the IRS?"*

This is a very logical question. Here is the explanation:

## 1. You weren't at "0 Writes" before
Since you hit the **200,000 writes limit**, your application was definitely generating writes.
- If your pages were truly Static (generated once at build), you would have had **0 writes**.
- The fact that you had 200k+ writes means Vercel was treating your pages as "revalidatable" likely due to:
    - **Implicit Caching:** `fetch` calls defaulting to cache.
    - **Dynamic Routes:** The `[worldName]` route might have been trying to cache SSR responses.
    - **Unstable Defaults:** Without explicit config, the revalidation behavior can be unpredictable (e.g., revalidating on every request).

## 2. We are "Capping" the Writes
By adding `revalidate = 3600`, we are taking control.
- We are telling Vercel: "Even if you receive 10,000 requests, **only regenerate this page ONCE per hour**."
- This serves as a **Safety Cap**.

## 3. The Math
With this configuration (1 hour revalidation):
- **Maximum Writes Per Page:** 24 per day (1 per hour).
- **Total:** 5 pages * 24 writes * 30 days = **3,600 writes/month**.
- **Impact:** This is **~1.8%** of the 200,000 free tier limit.

## Summary
You are correct that we are "adding" a revalidation rule, but effectively we are replacing "uncontrolled/frequent revalidation" (which caused the issue) with "strictly limited revalidation" (which solves it).

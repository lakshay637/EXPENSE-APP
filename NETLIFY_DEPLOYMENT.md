# Netlify Deployment Guide for Expense App Frontend

This repository is configured with a `netlify.toml` file for automatic deployment on [Netlify](https://www.netlify.com/).

---

## ❓ Why did Netlify show "Page not found" (404)?

1. **Subfolder Structure**: The frontend code lives inside the `frontend/` subfolder (not at the repository root). Without configuration, Netlify looks for build files in the root folder.
2. **SPA Routing**: React Router requires all sub-path URL requests to rewrite to `/index.html`.

We have added a [`netlify.toml`](file:///e:/expense-app/netlify.toml) file at the root of the project to solve both issues automatically.

---

## 🚀 How to Deploy on Netlify

### Option 1: Automatic Setup via `netlify.toml` (Recommended)

1. Go to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** -> **Import an existing project**.
3. Connect your GitHub/GitLab account and select your **Expense App** repository.
4. Netlify will automatically detect the settings from `netlify.toml`:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Before clicking Deploy, go to **Environment Variables** (or **Site configuration** -> **Environment variables**):
   - Add Key: `VITE_BASE_URL`
   - Value: `https://your-backend-api-url.onrender.com` (Your live backend service URL)
6. Click **Deploy site**.

---

### Option 2: Manual Dashboard Configuration

If you configure the settings manually in Netlify:

| Setting Field | Value |
| :--- | :--- |
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/dist` (or `dist` if Base is set to `frontend`) |

#### Environment Variables:
| Key | Value |
| :--- | :--- |
| `VITE_BASE_URL` | Your live Backend API URL (e.g. `https://expense-tracker-backend.onrender.com`) |

---

## ⚡ Post-Deployment Checklist

1. **Trigger a Re-deploy**: If you previously had a broken deployment, push the updated codebase to GitHub, or click **Deploys** -> **Trigger deploy** -> **Clear cache and deploy site** in Netlify.
2. **CORS on Backend**: Ensure your backend CORS configuration (`DOMAIN` environment variable on your backend host) allows requests from your Netlify URL (e.g. `https://expensmanage.netlify.app`).

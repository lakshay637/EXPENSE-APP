# ⚡ Netlify Deployment Guide for Expense App

This project is fully configured for seamless deployment on **Netlify**.

---

## 🎯 Overview & Architecture Options

You can deploy this application on Netlify using either of the 2 methods below:

| Deployment Method | Frontend | Backend API | Ideal For |
| :--- | :--- | :--- | :--- |
| **Option A: Netlify + Render Backend (Recommended)** | Hosted on Netlify | Hosted on Render / Railway | Production apps requiring long-lived Node servers |
| **Option B: 100% Netlify Serverless (All-in-One)** | Hosted on Netlify | Hosted via Netlify Serverless Functions (`/api/*`) | Zero extra backend services required |

---

## 🚀 Step-by-Step Netlify Deployment Instructions

### 1️⃣ Push Code to GitHub / GitLab
Ensure all latest files (including `netlify.toml`, `package.json`, and `frontend/`) are committed and pushed to your Git repository.

---

### 2️⃣ Import Repository into Netlify

1. Log into your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** ➔ **Import an existing project**.
3. Select **GitHub** (or your git provider) and choose your **Expense App** repository.

---

### 3️⃣ Configure Build Settings

Netlify will automatically detect settings from [`netlify.toml`](file:///e:/expense-app/netlify.toml). Verify that the fields match:

| Setting | Value |
| :--- | :--- |
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/dist` (or `dist` if Base is set to `frontend`) |

---

### 4️⃣ Set Environment Variables in Netlify

Go to **Site Configuration** ➔ **Environment Variables** (or **Add variables** before deploying):

#### Required Environment Variables:

| Variable Name | Value / Description | Example |
| :--- | :--- | :--- |
| `VITE_BASE_URL` | Live Backend API URL (or empty `""` if using Netlify Functions) | `https://expense-backend.onrender.com` |
| `DB_URL` | MongoDB Atlas Connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker` |
| `AUTH_SECRET` | Secret key for signing JWT user tokens | `your_random_jwt_secret_key` |
| `FORGOT_TOKEN_SECRET` | Secret key for password reset tokens | `your_random_forgot_secret_key` |
| `DOMAIN` | Your Netlify site domain for CORS | `https://your-app-name.netlify.app` |
| `Sender_EMAIL` | *(Optional)* Email address for sending OTPs | `your_email@gmail.com` |
| `Sender_PASSWORD` | *(Optional)* Gmail App Password for SMTP | `xxxx xxxx xxxx xxxx` |

---

### 5️⃣ Trigger Deploy

Click **Deploy Site**. Netlify will build your React application, output the assets, and publish your live app URL (e.g. `https://your-expense-app.netlify.app`).

---

## ⚡ Post-Deployment & Troubleshooting Checklist

1. **MongoDB Atlas Network Access**: Ensure MongoDB Atlas allows connections from anywhere (`0.0.0.0/0` IP access list) so cloud instances can authenticate.
2. **CORS Configuration**: On your backend environment settings, set `DOMAIN` to your Netlify site URL (e.g., `https://your-expense-app.netlify.app`).
3. **SPA Routing**: The included `netlify.toml` automatically handles single-page app fallback redirects (`/*` ➔ `/index.html`), so direct page reloads on routes like `/dashboard` will render cleanly.

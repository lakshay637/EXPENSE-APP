# Render Deployment Guide for Expense App

This repository is pre-configured with a `render.yaml` Blueprint specification for seamless, one-click deployment on [Render](https://render.com).

---

## 📋 Pre-requisites

1. **MongoDB Atlas Database**:
   Since Render hosted apps cannot access local `mongodb://127.0.0.1`, you need a cloud MongoDB URI:
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Get your MongoDB Connection String (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/expense-tracker?retryWrites=true&w=all`).
   - In Atlas network settings, allow access from anywhere (`0.0.0.0/0`).

2. **GitHub Repository**:
   - Push this codebase to your GitHub account (`git push origin main`).

---

## 🚀 Deployment Method 1: Using Render Blueprint (Recommended)

1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** top right and select **Blueprint**.
3. Connect your GitHub repository containing this project.
4. Render will automatically detect the `render.yaml` file and set up:
   - `expense-tracker-backend` (Node Web Service)
   - `expense-tracker-frontend` (Static Site)
5. Fill in the required **Environment Variables** in the prompt:

### Backend Environment Variables:
| Variable Key | Description / Example |
| :--- | :--- |
| `DB_URL` | Your MongoDB Atlas connection string |
| `AUTH_SECRET` | Secret key for JWT tokens (e.g. random hash) |
| `FORGOT_TOKEN_SECRET` | Secret key for forgot password tokens |
| `DOMAIN` | The live URL of your deployed Frontend (e.g., `https://expense-tracker-frontend.onrender.com`) |
| `Sender_EMAIL` | Gmail/Email used for sending emails (Nodemailer) |
| `Sender_PASSWORD` | App password for email sender |

### Frontend Environment Variable:
| Variable Key | Description / Example |
| :--- | :--- |
| `VITE_BASE_URL` | The live URL of your deployed Backend Web Service (e.g., `https://expense-backend.onrender.com`) |

6. Click **Apply**. Render will automatically build and launch both services!

---

## 🛠️ Deployment Method 2: Manual Dashboard Setup

If you prefer setting up the services manually in Render:

### Step 1: Deploy Backend (Web Service)
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your repo.
3. Set the following settings:
   - **Name**: `expense-tracker-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `DB_URL` = `<your_mongodb_atlas_uri>`
   - `AUTH_SECRET` = `<your_auth_secret>`
   - `FORGOT_TOKEN_SECRET` = `<your_forgot_token_secret>`
   - `DOMAIN` = `https://<your-frontend-name>.onrender.com`
   - `Sender_EMAIL` = `<your_email>`
   - `Sender_PASSWORD` = `<your_email_app_password>`
5. Click **Create Web Service**. Copy your Backend URL (e.g., `https://expense-tracker-backend.onrender.com`).

---

### Step 2: Deploy Frontend (Static Site)
1. Click **New +** -> **Static Site**.
2. Connect your repo.
3. Set the following settings:
   - **Name**: `expense-tracker-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `./dist`
4. Under **Environment Variables**, add:
   - `VITE_BASE_URL` = `https://expense-tracker-backend.onrender.com` (Your backend URL from Step 1)
5. Under **Redirects/Rewrites**:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

## 💡 Notes & Troubleshooting

- **CORS Errors**: Ensure `DOMAIN` environment variable on backend matches the exact URL of your deployed frontend (including `https://`).
- **SPA 404 on Refresh**: Render SPA routing is handled automatically via `frontend/public/_redirects` and `render.yaml` rewrite rules.
- **Cold Starts**: On Render's Free Plan, web services spin down after 15 minutes of inactivity. The first request after sleep may take 30-50 seconds to respond.

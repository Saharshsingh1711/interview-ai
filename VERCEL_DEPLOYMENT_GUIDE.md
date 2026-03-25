# Complete Vercel Deployment Guide

This guide covers everything you need to successfully deploy both your **Frontend** and **Backend** on Vercel from start to finish.

---

## 🚀 Phase 1: Push Project to GitHub
Vercel connects directly to GitHub. Your first step ensures your code is safely online.

1. Go to [GitHub](https://github.com/new) and click **New Repository**.
2. Name it `interview-ai`, leave it **Public/Private** (your choice), and do **NOT** check "Add a README". Click *Create Repository*.
3. Open a terminal on your computer in the `d:\Main\interview-ai` directory and run:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/interview-ai.git
   git push -u origin main
   ```
*(Replace `YOUR_USERNAME` with your actual GitHub username).*

---

## ⚙️ Phase 2: Deploy the Backend to Vercel
Now that your code is on GitHub, let's deploy the backend first so we can get its web address.

1. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Click **Import** next to your `interview-ai` GitHub repository.
3. Once the configuration page opens, look for **Root Directory**. Click **Edit** and select the `/Backend` folder.
4. Open the **Environment Variables** section and meticulously add these 3 variables:
   - **Name:** `MONGO_URI`
     **Value:** `mongodb+srv://proxjersey:proxjersey@interviewai.nxptbld.mongodb.net/`
   - **Name:** `GROQ_API_KEY` (or `GEMINI_API_KEY`, whichever you use)
     **Value:** *(Your API Key)*
   - **Name:** `JWT_SECRET`
     **Value:** *(The long secret from your local .env file)*
5. Click **Deploy**.
6. Once it succeeds, Vercel will give you a live URL for your backend (e.g., `https://interview-ai-backend.vercel.app`). **Copy this URL**, you need it for Phase 3!

---

## 🌐 Phase 3: Deploy the Frontend to Vercel
The backend is live, now your frontend template needs to connect to it.

1. Go back to your main Vercel Dashboard and click **Add New > Project** again.
2. Click **Import** on the SAME `interview-ai` GitHub repository.
3. This time, for **Root Directory**, click Edit and select the **`/Frontend`** folder.
4. Under **Framework Preset**, ensure it says **Vite**.
5. Open the **Environment Variables** section and add this exact variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://interview-ai-backend.vercel.app` *(Paste the exact URL of your Backend you gathered in Phase 2. Ensure there is NO trailing slash `/` at the end)*
6. Click **Deploy**.
7. Once this finishes, Vercel gives you your frontend URL (e.g., `https://interview-ai-frontend.vercel.app`). **Copy this URL**, you need it for the final step!

---

## 🔒 Phase 4: Fix Backend CORS (Final Step)
Right now, your Backend is alive but strictly blocking requests because it doesn't recognize your new Frontend URL. We must tell it to explicitly allow your Vercel Frontend.

1. Go to your **Vercel Dashboard** and click on your **Backend** project.
2. Go to **Settings > Environment Variables**.
3. Add a brand new environment variable:
   - **Name:** `FRONTEND_URL`
   - **Value:** `https://interview-ai-frontend.vercel.app` *(Paste the exact URL of your Frontend from Phase 3. Ensure there is NO trailing slash `/`)*
4. Click **Save**.
5. Go to the **Deployments** tab under your Backend project, find your most recent deployment, click the 3 dots (`...`), and hit **Redeploy**. This forces the backend to wake up and read your new `FRONTEND_URL` variable.

***

🎉 **Congratulations!** If you visit your Frontend URL, the app should now be fully functional! Both the client and server are deployed entirely via Vercel.

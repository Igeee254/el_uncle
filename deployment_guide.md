# Deployment Guide: KweliStore Web App

Follow these steps to host your Expo Web application on Netlify or Vercel.

## 1. Prerequisites
- Ensure you have replaced `public/KweliStore.apk` with your real APK.
- Ensure your project is pushed to a GitHub, GitLab, or Bitbucket repository.

## 2. Deploy to Netlify (Recommended)
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** -> **Import an existing project**.
3. Connect your Git provider and select the `el_uncle` repository.
4. Configure the build settings:
   - **Build command**: `npm run build:web`
   - **Publish directory**: `dist`
5. Click **Deploy site**.

## 3. Deploy to Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import the `el_uncle` repository.
4. In **Build and Output Settings**:
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `dist`
5. Click **Deploy**.

## 4. Setting Up Your Backend URL (CRITICAL)
For your website to talk to your database, you must provide your Render URL:
1. Go to your site's dashboard in **Netlify** or **Vercel**.
2. Find the **Environment Variables** section (under Site Settings).
3. Add a new variable:
   - **Key**: `EXPO_PUBLIC_API_URL`
   - **Value**: `https://your-render-backend-url.onrender.com` (Replace with your actual Render URL).

## 5. APK Access
When you deploy, your site will be at something like `https://your-site.netlify.app`. 
The "Get the App" button will automatically point to `https://your-site.netlify.app/KweliStore.apk`.

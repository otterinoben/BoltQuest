# 🚀 Step-by-Step: Deploy BuzzBolt to Azure Static Web Apps

## 📋 **Prerequisites Checklist**
- [ ] Azure account (free tier available)
- [ ] GitHub account
- [ ] Your BuzzBolt code pushed to GitHub
- [ ] Node.js installed locally

## 🎯 **Step 1: Prepare Your App**

### **1.1 Build Your App Locally**
```bash
# In your project directory
npm run build

# Test the build works
npm install -g serve
serve -s dist
# Visit http://localhost:3000 to verify it works
```

### **1.2 Update Vite Config (if needed)**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Important: keep this as '/'
  build: {
    outDir: 'dist',
    sourcemap: false // Disable sourcemaps for production
  }
})
```

### **1.3 Push to GitHub**
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Azure deployment"
git push origin main
```

## 🌐 **Step 2: Create Azure Static Web App**

### **2.1 Go to Azure Portal**
1. Visit [portal.azure.com](https://portal.azure.com)
2. Sign in with your Microsoft account
3. Click "Create a resource"

### **2.2 Search for Static Web Apps**
1. In the search bar, type "Static Web Apps"
2. Click on "Static Web Apps" from Microsoft
3. Click "Create"

### **2.3 Fill in the Details**
```
Subscription: [Your Azure subscription]
Resource Group: [Create new] → Name: "buzzbolt-rg"
Name: "buzzbolt-app" (must be globally unique)
Plan type: Free
Region: [Choose closest to your users]
Source: GitHub
```

### **2.4 GitHub Integration**
1. Click "Sign in with GitHub"
2. Authorize Azure to access your GitHub
3. Select your GitHub account
4. Repository: Select your BuzzBolt repository
5. Branch: "main" (or "master" if that's your default)

### **2.5 Build Configuration**
```
Build Presets: React
App location: "/" (root directory)
Output location: "dist"
API location: (leave empty)
```

### **2.6 Review and Create**
1. Click "Review + create"
2. Verify all settings
3. Click "Create"

## ⚙️ **Step 3: Configure GitHub Actions**

### **3.1 Azure Will Create GitHub Action**
- Azure automatically creates `.github/workflows/azure-static-web-apps-[random].yml`
- This file handles automatic deployments

### **3.2 Verify the Workflow File**
The file should look like this:
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "dist"
```

## 🚀 **Step 4: Deploy**

### **4.1 Trigger Deployment**
1. Go to your GitHub repository
2. Make a small change (like updating README)
3. Commit and push:
```bash
git add .
git commit -m "Trigger Azure deployment"
git push origin main
```

### **4.2 Monitor Deployment**
1. Go to your GitHub repository
2. Click "Actions" tab
3. Watch the "Azure Static Web Apps CI/CD" workflow
4. Wait for it to complete (usually 2-5 minutes)

### **4.3 Get Your App URL**
1. Go back to Azure Portal
2. Navigate to your Static Web App
3. Copy the "URL" (looks like: `https://buzzbolt-app.azurestaticapps.net`)

## ✅ **Step 5: Verify Deployment**

### **5.1 Test Your App**
1. Visit your Azure Static Web App URL
2. Test all functionality:
   - [ ] App loads correctly
   - [ ] Navigation works
   - [ ] Game functionality works
   - [ ] Profile features work
   - [ ] Shop works

### **5.2 Check Console for Errors**
1. Open browser developer tools (F12)
2. Check Console tab for any errors
3. Fix any issues and redeploy

## 🔧 **Step 6: Custom Domain (Optional)**

### **6.1 Add Custom Domain**
1. In Azure Portal, go to your Static Web App
2. Click "Custom domains" in the left menu
3. Click "Add"
4. Enter your domain name (e.g., `buzzbolt.com`)
5. Follow the DNS configuration instructions

### **6.2 DNS Configuration**
```
Type: CNAME
Name: www
Value: buzzbolt-app.azurestaticapps.net

Type: A
Name: @
Value: [IP provided by Azure]
```

## 📊 **Step 7: Monitor and Maintain**

### **7.1 Set Up Monitoring**
1. In Azure Portal, go to your Static Web App
2. Click "Application Insights" (if available)
3. Enable monitoring for performance tracking

### **7.2 Automatic Updates**
- Every time you push to `main` branch, your app automatically deploys
- No manual intervention needed
- GitHub Actions handles everything

## 🎉 **Success! Your App is Live**

### **Your BuzzBolt app is now:**
- ✅ **Live on Azure**: Professional hosting
- ✅ **Global CDN**: Fast worldwide access
- ✅ **HTTPS**: Secure connections
- ✅ **Auto-deploy**: Updates on every push
- ✅ **Free**: No cost for basic usage
- ✅ **Scalable**: Handles traffic spikes

## 🔄 **Future Updates**

### **To update your app:**
1. Make changes locally
2. Test with `npm run build && serve -s dist`
3. Commit and push to GitHub:
```bash
git add .
git commit -m "Update: [describe your changes]"
git push origin main
```
4. Azure automatically deploys the update!

## 🆘 **Troubleshooting**

### **Common Issues:**

**Build Fails:**
- Check your `package.json` scripts
- Ensure `npm run build` works locally
- Check GitHub Actions logs

**App Doesn't Load:**
- Verify `base: '/'` in `vite.config.ts`
- Check browser console for errors
- Ensure all assets are in `dist` folder

**Routing Issues:**
- Add `_redirects` file in `public` folder:
```
/*    /index.html   200
```

**Need Help?**
- Check Azure Static Web Apps documentation
- GitHub Actions logs for build errors
- Browser developer tools for runtime errors

## 🎯 **Next Steps**
- [ ] Set up custom domain
- [ ] Configure analytics
- [ ] Set up staging environment
- [ ] Add performance monitoring

**Your BuzzBolt app is now live on Azure! 🚀✨**

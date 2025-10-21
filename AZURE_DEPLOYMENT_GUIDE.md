# 🚀 Deploying BuzzBolt to Azure

## 🎯 **Overview**
Multiple options for hosting your React app on Azure, from simple static hosting to full containerized deployments.

## ✅ **Option 1: Azure Static Web Apps (Recommended)**

### **Why This is Best:**
- ✅ **Free Tier**: Generous free hosting
- ✅ **Built-in CI/CD**: Automatic deployments from GitHub
- ✅ **Global CDN**: Fast worldwide performance
- ✅ **Custom Domains**: Easy to add your own domain
- ✅ **HTTPS**: Automatic SSL certificates

### **Steps:**

**1. Prepare Your App for Production**
```bash
# Build the production version
npm run build

# Test the build locally
npm install -g serve
serve -s dist
```

**2. Create Azure Static Web App**
- Go to [Azure Portal](https://portal.azure.com)
- Search for "Static Web Apps"
- Click "Create"
- Fill in:
  - **Subscription**: Your Azure subscription
  - **Resource Group**: Create new or use existing
  - **Name**: `buzzbolt-app`
  - **Plan**: Free
  - **Source**: GitHub
  - **GitHub Account**: Connect your account
  - **Repository**: Select your BuzzBolt repo
  - **Branch**: `main` or `master`
  - **Build Presets**: React
  - **App Location**: `/` (root)
  - **Output Location**: `/dist`

**3. Configure Build Settings**
```yaml
# .github/workflows/azure-static-web-apps.yml (auto-generated)
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

## ✅ **Option 2: Azure App Service**

### **For More Control:**

**1. Create App Service**
```bash
# Install Azure CLI
az login
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name buzzbolt-app --runtime "NODE|18-lts"
```

**2. Configure Deployment**
```bash
# Deploy from local build
npm run build
az webapp deployment source config-zip --resource-group myResourceGroup --name buzzbolt-app --src dist.zip
```

**3. Custom Deployment Script**
```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && az webapp deployment source config-zip --resource-group myResourceGroup --name buzzbolt-app --src dist.zip"
  }
}
```

## ✅ **Option 3: Azure Container Instances**

### **For Containerized Deployment:**

**1. Create Dockerfile**
```dockerfile
# Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**2. Create nginx.conf**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

**3. Build and Deploy**
```bash
# Build Docker image
docker build -t buzzbolt-app .

# Tag for Azure Container Registry
docker tag buzzbolt-app buzzboltregistry.azurecr.io/buzzbolt-app:latest

# Push to registry
docker push buzzboltregistry.azurecr.io/buzzbolt-app:latest

# Deploy to Container Instance
az container create --resource-group myResourceGroup --name buzzbolt-container --image buzzboltregistry.azurecr.io/buzzbolt-app:latest --ports 80 --dns-name-label buzzbolt-app
```

## 🔧 **Pre-Deployment Checklist**

### **1. Environment Configuration**
```typescript
// src/config/environment.ts
export const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-api.azurewebsites.net' 
    : 'http://localhost:3000',
  environment: process.env.NODE_ENV || 'development'
};
```

### **2. Update Vite Config**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // or '/buzzbolt/' if deploying to subdirectory
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})
```

### **3. Update Package.json**
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && az staticwebapp deploy --name buzzbolt-app --source ."
  }
}
```

## 🌐 **Custom Domain Setup**

### **1. Add Custom Domain**
```bash
# Add custom domain to Static Web App
az staticwebapp hostname set --name buzzbolt-app --hostname yourdomain.com
```

### **2. DNS Configuration**
```
# Add CNAME record in your DNS provider
Type: CNAME
Name: www
Value: buzzbolt-app.azurestaticapps.net

# Add A record for apex domain
Type: A
Name: @
Value: [IP from Azure Static Web App]
```

## 📊 **Monitoring & Analytics**

### **1. Application Insights**
```typescript
// src/lib/analytics.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

const appInsights = new ApplicationInsights({
  config: {
    connectionString: 'your-connection-string',
    enableAutoRouteTracking: true
  }
})

appInsights.loadAppInsights()
appInsights.trackPageView()
```

### **2. Performance Monitoring**
```typescript
// Add to main.tsx
if (process.env.NODE_ENV === 'production') {
  // Initialize monitoring
  import('./lib/analytics').then(module => {
    module.initializeAnalytics()
  })
}
```

## 💰 **Cost Estimation**

### **Azure Static Web Apps (Free Tier)**
- ✅ **Free**: 100GB bandwidth/month
- ✅ **Free**: 2GB storage
- ✅ **Free**: Custom domains
- ✅ **Free**: SSL certificates

### **Azure App Service (Basic)**
- 💰 **~$13/month**: B1 Basic plan
- 💰 **~$55/month**: S1 Standard plan

### **Azure Container Instances**
- 💰 **Pay-per-use**: ~$0.000012/second
- 💰 **~$30/month**: For continuous running

## 🚀 **Quick Start (Recommended)**

**1. Use Azure Static Web Apps:**
```bash
# Install Azure CLI
npm install -g @azure/static-web-apps-cli

# Login to Azure
az login

# Deploy directly
swa deploy --name buzzbolt-app --source . --env production
```

**2. Or use GitHub Actions:**
- Push your code to GitHub
- Create Azure Static Web App in portal
- Connect to GitHub repository
- Automatic deployments on every push!

## 🎉 **Result**

**Your BuzzBolt app will be:**
- ✅ **Live on Azure**: Professional hosting
- ✅ **Global CDN**: Fast worldwide access
- ✅ **HTTPS**: Secure connections
- ✅ **Auto-deploy**: Updates on every push
- ✅ **Custom Domain**: Your own domain name
- ✅ **Monitoring**: Performance tracking

**Choose Azure Static Web Apps for the easiest and most cost-effective deployment!** 🚀✨

#!/bin/bash

# Thermal Printer POS - Deployment Script
echo "🖨️  Thermal Printer POS - Deployment Script"
echo "============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Thermal Printer POS system"
fi

# Check if we're connected to a remote repository
if ! git remote | grep -q origin; then
    echo "⚠️  No remote repository found."
    echo "Please create a GitHub repository and add it as origin:"
    echo "git remote add origin https://github.com/yourusername/thermal-printer-pos.git"
    echo ""
    echo "Or run: git remote add origin <your-repo-url>"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Commit and push changes
echo "📤 Committing and pushing changes..."
git add .
git commit -m "Deploy: Update POS system $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Go to https://vercel.com"
    echo "2. Import your GitHub repository"
    echo "3. Deploy to Vercel"
    echo ""
    echo "🌐 Your POS system will be available at:"
    echo "https://your-project-name.vercel.app"
else
    echo "❌ Failed to push to GitHub. Please check your connection and try again."
    exit 1
fi

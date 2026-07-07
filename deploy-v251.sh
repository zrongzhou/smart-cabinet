#!/bin/bash
# v251 Deployment Script - Trapezoidal Wave Breathing

set -e

cd /var/www/smart-cabinet

echo "=== v251 Deployment Started ==="
echo "Time: $(date)"

# Step 1: Extract file (if not already done)
if [ -f /tmp/v251-trapezoid-breathing.tar.gz ]; then
    echo "Extracting v251 file..."
    tar xzf /tmp/v251-trapezoid-breathing.tar.gz
    echo "✓ File extracted"
fi

# Step 2: Check file content
echo "Checking OceanHeader.tsx..."
head -15 src/components/OceanHeader.tsx

# Step 3: Clean cache
echo "Cleaning .next and .cache..."
rm -rf .next .cache
echo "✓ Cache cleaned"

# Step 4: Build
echo "Starting npm run build..."
npm run build 2>&1 | tee /tmp/v251-build.log

# Step 5: Check build result
if [ $? -eq 0 ]; then
    echo "✓ Build succeeded"
    
    # Step 6: Restart PM2
    echo "Restarting PM2..."
    pm2 restart smart-cabinet
    sleep 3
    pm2 logs smart-cabinet --lines 10 --nostream
    
    echo "=== v251 Deployment Completed Successfully ==="
else
    echo "✗ Build failed"
    echo "Check /tmp/v251-build.log for details"
    exit 1
fi

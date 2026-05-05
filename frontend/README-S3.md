# 🚀 Build & Deploy to AWS S3

## 1. Install dependencies

```bash
yarn install
```

## 2. Build static files

```bash
yarn build
```

After the build, the `dist/` folder will contain:

```
dist/
├── index.html          ← must be at root level ✅
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── manifest.json
```

## 3. Create & configure S3 bucket

```bash
# Create bucket (replace YOUR-BUCKET-NAME with your real name)
aws s3api create-bucket \
  --bucket YOUR-BUCKET-NAME \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1

# Enable static website hosting
aws s3 website s3://YOUR-BUCKET-NAME/ \
  --index-document index.html \
  --error-document index.html

# Allow public read access
aws s3api put-bucket-policy --bucket YOUR-BUCKET-NAME --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}'
```

## 4. Upload `dist/` to S3

```bash
# Sync all build output (index.html at root level, assets in /assets/)
aws s3 sync dist/ s3://YOUR-BUCKET-NAME/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

# Upload index.html separately with no-cache so users always get the latest version
aws s3 cp dist/index.html s3://YOUR-BUCKET-NAME/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

## 5. Access the site

Your static site is now available at:

```
http://YOUR-BUCKET-NAME.s3-website-ap-southeast-1.amazonaws.com
```

> **Tip:** For HTTPS + custom domain, put **CloudFront** in front of the S3 bucket.

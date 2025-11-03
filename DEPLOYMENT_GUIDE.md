# 🚀 Complete Deployment Guide

This guide walks you through deploying the Serverless Polling Application step-by-step.

## Prerequisites Checklist

- [ ] AWS Account created
- [ ] AWS CLI installed and configured
- [ ] AWS SAM CLI installed
- [ ] Node.js 18+ installed
- [ ] Git installed (optional)

## Step-by-Step Deployment

### 1. Verify AWS CLI Configuration

```bash
aws sts get-caller-identity
```

This should return your AWS account information. If not, run:

```bash
aws configure
```

### 2. Navigate to Project Directory

```bash
cd /path/to/polling-app
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Build the SAM Application

```bash
sam build
```

You should see output like:
```
Build Succeeded

Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml
```

### 5. Deploy to AWS

**First-time deployment:**

```bash
sam deploy --guided
```

Answer the prompts:

```
Stack Name [sam-app]: polling-app
AWS Region [us-east-1]: us-east-1
#Shows you resources changes to be deployed and require a 'Y' to initiate deploy
Confirm changes before deploy [y/N]: y
#SAM needs permission to be able to create roles to connect to the resources in your template
Allow SAM CLI IAM role creation [Y/n]: Y
#Preserves the state of previously provisioned resources when an operation fails
Disable rollback [y/N]: N
Save arguments to configuration file [Y/n]: Y
SAM configuration file [samconfig.toml]: 
SAM configuration environment [default]: 
```

Wait for deployment (5-10 minutes).

**Subsequent deployments:**

```bash
sam deploy
```

### 6. Get Your API URL

After successful deployment, look for the Outputs section:

```
CloudFormation outputs from deployed stack
----------------------------------------------------------------------
Outputs
----------------------------------------------------------------------
Key                 ApiUrl
Description         API Gateway endpoint URL
Value               https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/

Key                 WebsiteURL
Description         URL for the website hosted on S3
Value               http://polling-app-frontend-123456789012.s3-website-us-east-1.amazonaws.com

Key                 FrontendBucket
Description         S3 Bucket for frontend
Value               polling-app-frontend-123456789012
----------------------------------------------------------------------
```

**Save these values!**

### 7. Configure Frontend

Create `.env` file in the `frontend` directory:

```bash
cd frontend
echo "REACT_APP_API_URL=https://YOUR-API-URL.amazonaws.com/prod/" > .env
```

Replace `YOUR-API-URL` with your actual API URL from step 6.

### 8. Install Frontend Dependencies

```bash
npm install
```

### 9. Build Frontend

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### 10. Deploy Frontend to S3

```bash
aws s3 sync build/ s3://YOUR-BUCKET-NAME --delete
```

Replace `YOUR-BUCKET-NAME` with the bucket name from step 6.

### 11. Access Your Application

Open the `WebsiteURL` from step 6 in your browser!

Example: `http://polling-app-frontend-123456789012.s3-website-us-east-1.amazonaws.com`

## Verification Steps

### Test the Backend API

```bash
# List polls (should return empty array initially)
curl https://YOUR-API-URL.amazonaws.com/prod/polls

# Create a test poll
curl -X POST https://YOUR-API-URL.amazonaws.com/prod/polls \
  -H "Content-Type: application/json" \
  -d '{"question":"Test Poll?","options":["Yes","No"]}'
```

### Test the Frontend

1. Open the website URL
2. Click "Create New Poll"
3. Enter a question and options
4. Submit and verify it appears in the list
5. Click on the poll and vote
6. Verify results update

## Common Issues

### Issue: "Invalid credentials"

**Solution:**
```bash
aws configure
# Enter your Access Key ID and Secret Access Key
```

### Issue: "Unable to locate credentials"

**Solution:**
```bash
# Check if credentials file exists
cat ~/.aws/credentials

# If not, run:
aws configure
```

### Issue: "Stack already exists"

**Solution:**
```bash
# Update existing stack
sam deploy

# Or delete and redeploy
aws cloudformation delete-stack --stack-name polling-app
aws cloudformation wait stack-delete-complete --stack-name polling-app
sam deploy --guided
```

### Issue: "Access Denied" when uploading to S3

**Solution:**
Check your IAM user has S3 permissions:
- AmazonS3FullAccess (or more restricted policy)

### Issue: CORS errors in browser

**Solution:**
1. Clear browser cache
2. Verify API URL in frontend/.env is correct
3. Check API Gateway CORS settings in AWS Console

### Issue: Frontend shows "YOUR_API_GATEWAY_URL"

**Solution:**
You forgot to set the environment variable. Create `frontend/.env`:
```
REACT_APP_API_URL=https://your-actual-api-url.amazonaws.com/prod/
```
Then rebuild:
```bash
cd frontend
npm run build
aws s3 sync build/ s3://YOUR-BUCKET-NAME --delete
```

## Making Updates

### Update Backend (Lambda Functions)

1. Edit files in `backend/`
2. Run:
```bash
sam build
sam deploy
```

### Update Frontend

1. Edit files in `frontend/src/`
2. Run:
```bash
cd frontend
npm run build
aws s3 sync build/ s3://YOUR-BUCKET-NAME --delete
```

### Update Infrastructure

1. Edit `template.yaml`
2. Run:
```bash
sam build
sam deploy
```

## Monitoring

### View Lambda Logs

```bash
sam logs -n CreatePollFunction --tail
sam logs -n VoteFunction --tail
```

Or use AWS CloudWatch Console:
1. Go to CloudWatch
2. Click "Log groups"
3. Find `/aws/lambda/polling-app-*`

### Monitor Costs

1. AWS Console → Billing Dashboard
2. Check "AWS Free Tier" usage
3. Set up billing alerts

## Cleanup

When you're done, delete everything:

```bash
# Empty S3 bucket
aws s3 rm s3://YOUR-BUCKET-NAME --recursive

# Delete stack
aws cloudformation delete-stack --stack-name polling-app

# Verify deletion
aws cloudformation wait stack-delete-complete --stack-name polling-app
```

## Next Steps

- Customize the UI colors and styling
- Add new features (poll editing, deletion)
- Set up custom domain with Route 53
- Add authentication with Cognito
- Monitor with CloudWatch dashboards

---

Need help? Check the main README.md or AWS documentation!



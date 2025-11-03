# ⚡ Quick Start Guide

Get your polling app running in 15 minutes!

## 1️⃣ One-Time Setup (First Time Only)

### Install Required Tools

**Windows:**
1. Download and install [Node.js](https://nodejs.org/) (LTS version)
2. Download and install [AWS CLI](https://awscli.amazonaws.com/AWSCLIV2.msi)
3. Download and install [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

**Mac:**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install node
brew install awscli
brew tap aws/tap
brew install aws-sam-cli
```

**Linux:**
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# AWS SAM CLI
wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
sudo ./sam-installation/install
```

### Configure AWS Account

1. Create AWS account at [aws.amazon.com/free](https://aws.amazon.com/free)
2. Create IAM user with Admin access:
   - AWS Console → IAM → Users → Add User
   - Enable "Programmatic access"
   - Attach "AdministratorAccess" policy
   - Save Access Key ID and Secret Access Key

3. Configure AWS CLI:
```bash
aws configure
```

Enter:
- **AWS Access Key ID**: (from step 2)
- **AWS Secret Access Key**: (from step 2)
- **Default region**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

## 2️⃣ Deploy the Application

### Automated (Easiest)

**Windows PowerShell:**
```powershell
.\deploy.ps1
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

Follow the prompts and wait ~10 minutes.

### Manual (More Control)

```bash
# 1. Install backend dependencies
cd backend
npm install
cd ..

# 2. Build SAM app
sam build

# 3. Deploy
sam deploy --guided
```

When prompted:
- Stack Name: `polling-app`
- Region: `us-east-1` (or your choice)
- Confirm changes: `Y`
- Allow IAM creation: `Y`
- Disable rollback: `N`
- Save config: `Y`

```bash
# 4. Get API URL (look in outputs)
# It will look like: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/

# 5. Configure frontend
cd frontend
echo "REACT_APP_API_URL=YOUR_API_URL_HERE" > .env

# 6. Build frontend
npm install
npm run build

# 7. Upload to S3 (get bucket name from outputs)
aws s3 sync build/ s3://YOUR-BUCKET-NAME --delete

# 8. Get website URL from outputs and open it!
```

## 3️⃣ Test It Out

1. Open the Website URL in your browser
2. Click "Create New Poll"
3. Enter: "What's the best cloud provider?"
4. Add options: "AWS", "Azure", "GCP"
5. Click "Create Poll"
6. Vote on your poll
7. Watch results update in real-time!

## 4️⃣ Show It Off

Share your Website URL with friends and have them vote!

## 5️⃣ Make Changes

### Update the UI colors:

Edit `frontend/src/index.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Change to your favorite colors, then:
```bash
cd frontend
npm run build
aws s3 sync build/ s3://YOUR-BUCKET-NAME --delete
```

### Add a new API endpoint:

1. Create `backend/newFunction.js`
2. Add to `template.yaml`
3. Deploy:
```bash
sam build
sam deploy
```

## 🧹 When You're Done

**Important:** Delete everything to avoid charges:

```bash
# Get your bucket name first
aws cloudformation describe-stacks --stack-name polling-app \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucket'].OutputValue" \
  --output text

# Delete bucket contents
aws s3 rm s3://YOUR-BUCKET-NAME --recursive

# Delete stack
aws cloudformation delete-stack --stack-name polling-app
```

## ❓ Troubleshooting

### "Command not found"
- Make sure you installed all prerequisites
- Restart your terminal after installation

### "Access Denied"
- Run `aws configure` again
- Check your IAM user has necessary permissions

### "Stack already exists"
- Just run `sam deploy` (without --guided)
- Or delete the old stack first

### Website shows "YOUR_API_GATEWAY_URL"
- You forgot step 5 above
- Create the `.env` file with your actual API URL
- Rebuild and redeploy frontend

### Votes aren't saving
- Check browser console (F12) for errors
- Verify API URL is correct
- Check Lambda logs in CloudWatch

## 📚 Learn More

- Read the full [README.md](README.md)
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for details
- Explore AWS Console to see your resources

## 💡 Next Steps

- Customize the colors and styling
- Add poll deletion feature
- Set up a custom domain
- Add authentication
- Deploy a new feature you built!

---

Questions? Check the README or AWS documentation!



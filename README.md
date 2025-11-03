# 📊 Serverless Real-time Polling Application

A modern, serverless polling application built entirely on AWS Free Tier services. Perfect for cloud computing courses and learning serverless architecture.

## 🏗️ Architecture

This application uses a complete serverless architecture:

- **Frontend**: React SPA hosted on **Amazon S3** (static website hosting)
- **Backend**: **AWS Lambda** functions (Node.js 18.x)
- **Database**: **Amazon DynamoDB** (NoSQL)
- **API**: **Amazon API Gateway** (REST API)
- **Infrastructure**: AWS SAM (Serverless Application Model)

### Architecture Diagram

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   S3 Static │─────▶│  API Gateway │─────▶│   Lambda    │─────▶│  DynamoDB    │
│   Website   │      │  (REST API)  │      │  Functions  │      │   Tables     │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
```

## ✨ Features

- **Create Polls**: Easy-to-use interface for creating polls with multiple options
- **Real-time Voting**: Vote on polls and see results update in real-time
- **Live Results**: Results refresh automatically every 3 seconds
- **User Tracking**: Prevents duplicate votes using localStorage-based user IDs
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **100% Serverless**: No servers to manage, scales automatically
- **Free Tier Friendly**: Designed to run entirely within AWS Free Tier limits

## 🚀 Getting Started

### Prerequisites

1. **AWS Account** - [Sign up here](https://aws.amazon.com/free/)
2. **AWS CLI** - [Installation guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
3. **AWS SAM CLI** - [Installation guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
4. **Node.js 18+** - [Download here](https://nodejs.org/)
5. **Git** - [Download here](https://git-scm.com/)

### AWS Configuration

Configure your AWS credentials:

```bash
aws configure
```

You'll need:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format (e.g., `json`)

## 📦 Installation & Deployment

### Option 1: Automated Deployment (Recommended)

#### On Linux/Mac:

```bash
chmod +x deploy.sh
./deploy.sh
```

#### On Windows (PowerShell):

```powershell
.\deploy.ps1
```

### Option 2: Manual Deployment

#### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

#### Step 2: Build SAM Application

```bash
sam build
```

#### Step 3: Deploy to AWS

```bash
sam deploy --guided
```

Follow the prompts:
- Stack Name: `polling-app` (or your choice)
- AWS Region: Your preferred region
- Confirm changes before deploy: Y
- Allow SAM CLI IAM role creation: Y
- Disable rollback: N
- Save arguments to configuration file: Y

#### Step 4: Get API URL

After deployment, note the `ApiUrl` from the outputs. It will look like:
```
https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

#### Step 5: Configure Frontend

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
echo "REACT_APP_API_URL=https://your-api-url-here.amazonaws.com/prod/" > .env
```

#### Step 6: Build Frontend

```bash
npm install
npm run build
```

#### Step 7: Deploy Frontend to S3

```bash
aws s3 sync build/ s3://YOUR-BUCKET-NAME --delete
```

Replace `YOUR-BUCKET-NAME` with the bucket name from the CloudFormation outputs.

## 🎯 Usage

### Accessing the Application

After deployment, open the Website URL (from CloudFormation outputs) in your browser.

### Creating a Poll

1. Click "Create New Poll"
2. Enter your question
3. Add at least 2 options (up to 6)
4. Click "Create Poll"

### Voting

1. Click on any poll from the list
2. Select your preferred option
3. Results update automatically in real-time

### Viewing Results

- Results are displayed as percentages and vote counts
- Visual progress bars show relative popularity
- Polls refresh every 3 seconds for real-time updates

## 🗂️ Project Structure

```
.
├── backend/                  # Lambda function handlers
│   ├── createPoll.js        # Create new poll
│   ├── listPolls.js         # List all polls
│   ├── getPoll.js           # Get poll with results
│   ├── vote.js              # Record vote
│   └── package.json         # Backend dependencies
├── frontend/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── CreatePoll.js
│   │   │   ├── PollList.js
│   │   │   └── PollDetail.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json         # Frontend dependencies
├── template.yaml            # AWS SAM template
├── deploy.sh               # Linux/Mac deployment script
├── deploy.ps1              # Windows deployment script
└── README.md               # This file
```

## 🗄️ Database Schema

### Polls Table

```javascript
{
  pollId: String,        // Partition Key (UUID)
  question: String,      // Poll question
  options: [             // Array of options
    {
      id: Number,        // Option ID (0, 1, 2, ...)
      text: String       // Option text
    }
  ],
  createdAt: String      // ISO timestamp
}
```

### Votes Table

```javascript
{
  pollId: String,        // Partition Key (UUID)
  userId: String,        // Sort Key (generated client-side)
  optionId: Number,      // Selected option ID
  votedAt: String        // ISO timestamp
}
```

## 🔌 API Endpoints

### `POST /polls`
Create a new poll

**Request:**
```json
{
  "question": "What's your favorite programming language?",
  "options": ["JavaScript", "Python", "Java", "Go"]
}
```

### `GET /polls`
List all polls

**Response:**
```json
{
  "polls": [
    {
      "pollId": "uuid",
      "question": "...",
      "options": [...],
      "createdAt": "2025-10-10T12:00:00.000Z"
    }
  ]
}
```

### `GET /polls/{pollId}`
Get poll details with results

**Response:**
```json
{
  "pollId": "uuid",
  "question": "...",
  "options": [...],
  "results": [
    {
      "id": 0,
      "text": "JavaScript",
      "votes": 42,
      "percentage": 35
    }
  ],
  "totalVotes": 120,
  "createdAt": "2025-10-10T12:00:00.000Z"
}
```

### `POST /polls/{pollId}/vote`
Record a vote

**Request:**
```json
{
  "optionId": 0,
  "userId": "user-123456789"
}
```

## 💰 AWS Free Tier Limits

This application is designed to stay within AWS Free Tier:

- **S3**: 5GB storage, 20,000 GET requests, 2,000 PUT requests/month
- **Lambda**: 1M requests, 400,000 GB-seconds compute/month
- **DynamoDB**: 25GB storage, 25 read/write capacity units
- **API Gateway**: 1M API calls/month (12 months)

For a small class or personal use, you should stay well within these limits.

## 🧪 Local Development

### Testing Lambda Functions Locally

```bash
sam local start-api
```

The API will be available at `http://localhost:3000`

### Running Frontend Locally

```bash
cd frontend
npm start
```

Update `.env` to point to your local API:
```
REACT_APP_API_URL=http://localhost:3000/
```

## 🧹 Cleanup

To avoid charges, delete all resources when done:

```bash
# Delete S3 bucket contents
aws s3 rm s3://YOUR-BUCKET-NAME --recursive

# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name polling-app

# Verify deletion
aws cloudformation wait stack-delete-complete --stack-name polling-app
```

## 🎓 Learning Objectives

This project teaches:

1. **Serverless Architecture**: Understanding event-driven, serverless design
2. **AWS Services**: Hands-on experience with S3, Lambda, DynamoDB, API Gateway
3. **Infrastructure as Code**: Using AWS SAM/CloudFormation
4. **RESTful APIs**: Designing and implementing REST endpoints
5. **NoSQL Databases**: Working with DynamoDB's key-value model
6. **React Development**: Building modern SPAs
7. **CI/CD Concepts**: Automated deployment scripts

## 🔧 Troubleshooting

### CORS Errors

If you see CORS errors, ensure:
1. API Gateway has CORS enabled (already configured in template.yaml)
2. Lambda functions return proper CORS headers (already implemented)

### Poll Results Not Updating

1. Check browser console for errors
2. Verify API URL is correct in frontend/.env
3. Check Lambda function logs in CloudWatch

### Deployment Fails

1. Ensure AWS CLI is configured: `aws sts get-caller-identity`
2. Check you have necessary IAM permissions
3. Verify SAM CLI is installed: `sam --version`

## 📝 Future Enhancements

- Authentication with Amazon Cognito
- WebSocket support for instant updates
- Poll expiration dates
- Admin dashboard
- Analytics with Amazon QuickSight
- Social media sharing
- Export results to CSV

## 📄 License

MIT License - feel free to use this for learning and teaching!

## 🤝 Contributing

This is an educational project. Feel free to fork and modify for your own learning!

## 💡 Tips for Students

1. **Explore CloudWatch**: Check Lambda logs to understand execution
2. **Monitor Costs**: Use AWS Cost Explorer to track spending
3. **Experiment**: Try adding new features like poll editing or deletion
4. **Security**: Research AWS IAM best practices
5. **Optimization**: Learn about Lambda cold starts and DynamoDB indexes

---

Built with ❤️ for cloud computing education


# severless-realtime-poll

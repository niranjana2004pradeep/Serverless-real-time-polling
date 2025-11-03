#!/bin/bash

echo "========================================="
echo "Deploying Serverless Polling Application"
echo "========================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "Error: AWS SAM CLI is not installed. Please install it first."
    exit 1
fi

# Install backend dependencies
echo ""
echo "Step 1: Installing backend dependencies..."
cd backend
npm install
cd ..

# Build and deploy SAM application
echo ""
echo "Step 2: Building SAM application..."
sam build

echo ""
echo "Step 3: Deploying to AWS..."
sam deploy --guided

# Get the API URL from CloudFormation outputs
echo ""
echo "Step 4: Getting API Gateway URL..."
STACK_NAME=$(aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query "StackSummaries[?contains(StackName, 'sam-app')].StackName" --output text | head -1)

if [ -z "$STACK_NAME" ]; then
    echo "Warning: Could not find stack name. Please manually get the API URL from AWS Console."
else
    API_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)
    BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucket'].OutputValue" --output text)
    
    echo "API URL: $API_URL"
    echo "Frontend Bucket: $BUCKET_NAME"
    
    # Create .env file for frontend
    echo ""
    echo "Step 5: Configuring frontend..."
    echo "REACT_APP_API_URL=$API_URL" > frontend/.env
    
    # Build frontend
    echo ""
    echo "Step 6: Building frontend..."
    cd frontend
    npm install
    npm run build
    
    # Deploy to S3
    echo ""
    echo "Step 7: Deploying frontend to S3..."
    aws s3 sync build/ "s3://$BUCKET_NAME" --delete
    
    # Get website URL
    WEBSITE_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" --output text)
    
    cd ..
    
    echo ""
    echo "========================================="
    echo "Deployment Complete!"
    echo "========================================="
    echo "Website URL: $WEBSITE_URL"
    echo "API URL: $API_URL"
    echo ""
    echo "You can now access your polling application at: $WEBSITE_URL"
fi



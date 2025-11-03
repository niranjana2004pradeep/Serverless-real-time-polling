# PowerShell deployment script for Windows

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Deploying Serverless Polling Application" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if AWS CLI is installed
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "Error: AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if SAM CLI is installed
if (!(Get-Command sam -ErrorAction SilentlyContinue)) {
    Write-Host "Error: AWS SAM CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host ""
Write-Host "Step 1: Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Build and deploy SAM application
Write-Host ""
Write-Host "Step 2: Building SAM application..." -ForegroundColor Yellow
sam build

Write-Host ""
Write-Host "Step 3: Deploying to AWS..." -ForegroundColor Yellow
sam deploy --guided

# Get the API URL from CloudFormation outputs
Write-Host ""
Write-Host "Step 4: Getting API Gateway URL..." -ForegroundColor Yellow
$STACK_NAME = aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query "StackSummaries[?contains(StackName, 'sam-app')].StackName" --output text | Select-Object -First 1

if ([string]::IsNullOrEmpty($STACK_NAME)) {
    Write-Host "Warning: Could not find stack name. Please manually get the API URL from AWS Console." -ForegroundColor Yellow
} else {
    $API_URL = aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text
    $BUCKET_NAME = aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucket'].OutputValue" --output text
    
    Write-Host "API URL: $API_URL" -ForegroundColor Green
    Write-Host "Frontend Bucket: $BUCKET_NAME" -ForegroundColor Green
    
    # Create .env file for frontend
    Write-Host ""
    Write-Host "Step 5: Configuring frontend..." -ForegroundColor Yellow
    "REACT_APP_API_URL=$API_URL" | Out-File -FilePath frontend\.env -Encoding utf8
    
    # Build frontend
    Write-Host ""
    Write-Host "Step 6: Building frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    npm run build
    
    # Deploy to S3
    Write-Host ""
    Write-Host "Step 7: Deploying frontend to S3..." -ForegroundColor Yellow
    aws s3 sync build/ "s3://$BUCKET_NAME" --delete
    
    # Get website URL
    $WEBSITE_URL = aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" --output text
    
    Set-Location ..
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Deployment Complete!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Website URL: $WEBSITE_URL" -ForegroundColor Green
    Write-Host "API URL: $API_URL" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now access your polling application at: $WEBSITE_URL" -ForegroundColor Green
}



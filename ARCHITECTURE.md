# 🏗️ Architecture Documentation

## System Overview

This is a fully serverless, event-driven polling application built on AWS.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER'S BROWSER                            │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │             React SPA (Single Page Application)             │   │
│  │                                                              │   │
│  │  Components:                                                │   │
│  │  • PollList    - Display all polls                         │   │
│  │  • CreatePoll  - Create new polls                          │   │
│  │  • PollDetail  - Vote and view results                     │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        AMAZON S3 (Static Hosting)                   │
│                                                                     │
│  Hosts:                                                             │
│  • index.html                                                       │
│  • JavaScript bundles                                               │
│  • CSS files                                                        │
│                                                                     │
│  Features:                                                          │
│  • Website hosting enabled                                          │
│  • Public read access                                               │
│  • Free tier: 5GB storage, 20K GET requests/month                  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ REST API Calls
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AMAZON API GATEWAY (REST)                      │
│                                                                     │
│  Endpoints:                                                         │
│  • POST   /polls                - Create poll                      │
│  • GET    /polls                - List polls                       │
│  • GET    /polls/{id}           - Get poll details                 │
│  • POST   /polls/{id}/vote      - Record vote                      │
│                                                                     │
│  Features:                                                          │
│  • CORS enabled                                                     │
│  • Request validation                                               │
│  • Free tier: 1M API calls/month (12 months)                       │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Triggers
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          AWS LAMBDA FUNCTIONS                       │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │  createPoll    │  │  listPolls     │  │   getPoll      │       │
│  │                │  │                │  │                │       │
│  │  • Validates   │  │  • Scans all   │  │  • Gets poll   │       │
│  │    input       │  │    polls       │  │    details     │       │
│  │  • Generates   │  │  • Sorts by    │  │  • Counts      │       │
│  │    UUID        │  │    date        │  │    votes       │       │
│  │  • Stores in   │  │  • Returns     │  │  • Calculates  │       │
│  │    DynamoDB    │  │    list        │  │    percentages │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                     │
│  ┌────────────────┐                                                │
│  │     vote       │                                                │
│  │                │                                                │
│  │  • Validates   │                                                │
│  │    poll exists │                                                │
│  │  • Validates   │                                                │
│  │    option      │                                                │
│  │  • Records     │                                                │
│  │    vote        │                                                │
│  └────────────────┘                                                │
│                                                                     │
│  Runtime: Node.js 18.x                                              │
│  Free tier: 1M requests, 400K GB-seconds/month                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ SDK Calls
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        AMAZON DYNAMODB (NoSQL)                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                        Polls Table                            │  │
│  │                                                                │  │
│  │  Partition Key: pollId (String)                               │  │
│  │                                                                │  │
│  │  Attributes:                                                   │  │
│  │  • question (String)                                          │  │
│  │  • options (List of Maps)                                     │  │
│  │  • createdAt (String - ISO timestamp)                         │  │
│  │                                                                │  │
│  │  Billing: PAY_PER_REQUEST (no provisioned capacity)           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                        Votes Table                            │  │
│  │                                                                │  │
│  │  Partition Key: pollId (String)                               │  │
│  │  Sort Key: userId (String)                                    │  │
│  │                                                                │  │
│  │  Attributes:                                                   │  │
│  │  • optionId (Number)                                          │  │
│  │  • votedAt (String - ISO timestamp)                           │  │
│  │                                                                │  │
│  │  Composite key allows:                                         │  │
│  │  • One vote per user per poll                                 │  │
│  │  • Efficient querying of all votes for a poll                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Free tier: 25GB storage, 25 RCU/WCU                               │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Flow Examples

### Creating a Poll

```
1. User fills form in CreatePoll component
2. React app sends POST request to API Gateway
   POST /polls
   {
     "question": "Favorite color?",
     "options": ["Red", "Blue", "Green"]
   }

3. API Gateway triggers CreatePollFunction Lambda

4. Lambda:
   - Generates UUID for pollId
   - Validates input
   - Writes to Polls table in DynamoDB

5. DynamoDB stores:
   {
     pollId: "abc-123-xyz",
     question: "Favorite color?",
     options: [
       { id: 0, text: "Red" },
       { id: 1, text: "Blue" },
       { id: 2, text: "Green" }
     ],
     createdAt: "2025-10-10T12:00:00.000Z"
   }

6. Lambda returns success response

7. React app navigates to poll list
```

### Voting on a Poll

```
1. User clicks option in PollDetail component

2. React app sends POST request
   POST /polls/abc-123-xyz/vote
   {
     "optionId": 1,
     "userId": "user-1234567890"
   }

3. API Gateway triggers VoteFunction Lambda

4. Lambda:
   - Validates poll exists (reads from Polls table)
   - Validates option is valid
   - Writes/updates vote in Votes table

5. DynamoDB stores:
   {
     pollId: "abc-123-xyz",
     userId: "user-1234567890",
     optionId: 1,
     votedAt: "2025-10-10T12:05:00.000Z"
   }
   (Overwrites if user already voted)

6. React app immediately fetches updated results

7. GetPollFunction:
   - Reads poll from Polls table
   - Queries all votes for this poll from Votes table
   - Aggregates vote counts
   - Calculates percentages
   - Returns results

8. PollDetail component displays updated results
```

### Real-time Updates

```
1. PollDetail component sets interval (3 seconds)

2. Every 3 seconds:
   GET /polls/abc-123-xyz

3. Lambda queries DynamoDB for latest vote counts

4. Component updates UI with new results

5. Visual bars animate to new percentages
```

## Security Model

### Authentication
- Currently: Client-side userId (localStorage)
- Production: Add Amazon Cognito for proper auth

### Authorization
- Lambda functions have IAM roles
- Least privilege access to DynamoDB tables
- API Gateway has CORS configured

### Data Validation
- Lambda functions validate all input
- API Gateway can add request validation
- DynamoDB has schema enforcement via application logic

## Scalability

### Automatic Scaling
- **Lambda**: Scales automatically (0 to 1000s of concurrent executions)
- **API Gateway**: Handles 10,000 requests/second by default
- **DynamoDB**: Auto-scales with PAY_PER_REQUEST billing
- **S3**: Unlimited scalability

### Performance
- **Lambda cold start**: ~100-500ms first request
- **Lambda warm**: ~10-50ms subsequent requests
- **DynamoDB read**: <10ms single-digit latency
- **S3 static hosting**: CDN-like performance

### Cost at Scale

**100 users, 1000 votes/day:**
- Lambda: ~3,000 requests/day = 90K/month (FREE)
- DynamoDB: ~3K writes, 30K reads = Well within free tier
- API Gateway: 90K calls/month (FREE for 12 months)
- S3: Minimal storage, <1000 requests (FREE)

**Estimated cost after free tier expires: $0.10-0.50/month**

## Data Flow Patterns

### Write Pattern (Create Poll)
```
Client → API Gateway → Lambda → DynamoDB
                                    ↓
                                 Write
```

### Read Pattern (Get Results)
```
Client → API Gateway → Lambda → DynamoDB (Polls Table)
                          ↓       ↓
                          └────→ DynamoDB (Votes Table)
                                  ↓
                              Aggregate
                                  ↓
                           Return Results
```

### Update Pattern (Vote)
```
Client → API Gateway → Lambda → DynamoDB (Read Poll)
                          ↓
                       Validate
                          ↓
                    DynamoDB (Write/Update Vote)
```

## Deployment Pipeline

```
Local Development
      ↓
   sam build  ← Compiles Lambda functions, resolves dependencies
      ↓
  sam deploy  ← Creates CloudFormation stack
      ↓
┌─────────────────────────────────┐
│   CloudFormation Stack          │
│   • Creates DynamoDB tables     │
│   • Deploys Lambda functions    │
│   • Sets up API Gateway         │
│   • Creates S3 bucket           │
│   • Configures IAM roles        │
└─────────────────────────────────┘
      ↓
  npm build (frontend)
      ↓
  aws s3 sync
      ↓
  Application Live! 🎉
```

## Monitoring & Logging

### CloudWatch Logs
- Each Lambda function writes to its own log group
- Format: `/aws/lambda/polling-app-FunctionName`
- Retention: Configurable (default 7 days)

### CloudWatch Metrics
- Lambda invocations, errors, duration
- API Gateway requests, 4xx/5xx errors, latency
- DynamoDB read/write capacity, throttles

### Cost Monitoring
- AWS Cost Explorer
- Free Tier usage tracking
- Budget alerts

## Failure Modes & Recovery

### Lambda Failure
- API Gateway returns 500 error
- Client shows error message
- Automatic retry logic can be added

### DynamoDB Throttling
- Unlikely with PAY_PER_REQUEST
- Lambda retries automatically
- Consider provisioned capacity for high traffic

### S3 Unavailability
- Extremely rare (99.99% availability)
- Static site becomes unavailable
- No impact on existing user sessions

## Future Enhancements

### High Priority
1. WebSocket support (API Gateway WebSocket + Lambda)
2. Real-time updates without polling
3. Authentication (Cognito)
4. Poll expiration/closing

### Medium Priority
1. Poll editing/deletion
2. Image support in polls
3. Anonymous voting option
4. Result export (CSV)

### Low Priority
1. Custom domains (Route 53)
2. CloudFront CDN
3. Multi-region deployment
4. Advanced analytics (QuickSight)

## Cost Optimization Tips

1. **Use PAY_PER_REQUEST for DynamoDB** (already configured)
   - No wasted provisioned capacity
   - Better for sporadic traffic

2. **Optimize Lambda memory**
   - Currently 128MB (default)
   - Monitor and adjust if needed

3. **Enable S3 Intelligent-Tiering**
   - Auto-moves infrequent files to cheaper storage

4. **Set DynamoDB TTL**
   - Auto-delete old votes after N days
   - Reduces storage costs

5. **Use API Gateway caching**
   - Cache GET /polls for 30 seconds
   - Reduce Lambda invocations

## Compliance & Best Practices

✅ **Following AWS Well-Architected Framework:**
- **Operational Excellence**: IaC with SAM
- **Security**: IAM roles, CORS, input validation
- **Reliability**: Serverless = no servers to fail
- **Performance**: DynamoDB single-digit ms latency
- **Cost Optimization**: Pay only for what you use

✅ **12-Factor App Principles:**
- Configuration in environment variables
- Stateless processes (Lambda)
- Disposable components
- Dev/prod parity

---

This architecture provides a solid foundation for learning serverless development and can easily scale to production workloads with minimal modifications.



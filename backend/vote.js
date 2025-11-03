const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };

  try {
    const pollId = event.pathParameters.pollId;
    const body = JSON.parse(event.body);
    const { optionId, userId } = body;

    if (optionId === undefined || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'optionId and userId are required' }),
      };
    }

    // Verify poll exists
    const pollResult = await docClient.send(new GetCommand({
      TableName: process.env.POLLS_TABLE,
      Key: { pollId },
    }));

    if (!pollResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Poll not found' }),
      };
    }

    // Verify option exists
    const validOption = pollResult.Item.options.find(opt => opt.id === optionId);
    if (!validOption) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid option' }),
      };
    }

    // Record vote (overwrites if user votes again)
    const vote = {
      pollId,
      userId,
      optionId,
      votedAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: process.env.VOTES_TABLE,
      Item: vote,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Vote recorded', vote }),
    };
  } catch (error) {
    console.error('Error recording vote:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to record vote' }),
    };
  }
};



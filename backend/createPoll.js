const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
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
    const body = JSON.parse(event.body);
    const { question, options } = body;

    if (!question || !options || options.length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Poll must have a question and at least 2 options' 
        }),
      };
    }

    const pollId = randomUUID();
    const poll = {
      pollId,
      question,
      options: options.map((opt, idx) => ({
        id: idx,
        text: opt,
      })),
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: process.env.POLLS_TABLE,
      Item: poll,
    }));

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(poll),
    };
  } catch (error) {
    console.error('Error creating poll:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create poll' }),
    };
  }
};



const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
  };

  try {
    const pollId = event.pathParameters.pollId;

    // Get poll details
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

    // Get all votes for this poll
    const votesResult = await docClient.send(new QueryCommand({
      TableName: process.env.VOTES_TABLE,
      KeyConditionExpression: 'pollId = :pollId',
      ExpressionAttributeValues: {
        ':pollId': pollId,
      },
    }));

    // Count votes per option
    const voteCounts = {};
    pollResult.Item.options.forEach(opt => {
      voteCounts[opt.id] = 0;
    });

    votesResult.Items.forEach(vote => {
      voteCounts[vote.optionId] = (voteCounts[vote.optionId] || 0) + 1;
    });

    const totalVotes = votesResult.Items.length;

    const pollWithResults = {
      ...pollResult.Item,
      results: pollResult.Item.options.map(opt => ({
        ...opt,
        votes: voteCounts[opt.id] || 0,
        percentage: totalVotes > 0 
          ? Math.round((voteCounts[opt.id] / totalVotes) * 100) 
          : 0,
      })),
      totalVotes,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(pollWithResults),
    };
  } catch (error) {
    console.error('Error getting poll:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get poll' }),
    };
  }
};



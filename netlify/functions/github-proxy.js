/* ================================
   NETLIFY SERVERLESS FUNCTION
   Securely proxies GitHub API requests
   ================================ */

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { endpoint, isCommitSearch } = JSON.parse(event.body);

    // Security: validate endpoint starts with expected path
    if (!endpoint || !endpoint.startsWith('/')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid endpoint' })
      };
    }

    // Set appropriate Accept header for commit search
    const acceptHeader = isCommitSearch
      ? 'application/vnd.github.cloak-preview+json'
      : 'application/vnd.github.v3+json';

    // Make request to GitHub API with token from environment variable
    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': acceptHeader,
        'User-Agent': 'Portfolio-App'
      }
    });

    const data = await response.json();

    // Return the data with appropriate headers
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error fetching from GitHub:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from GitHub' })
    };
  }
};

const fetch = require('node-fetch');

const WEBHOOK_URL = 'https://hook.eu2.make.com/8xqjvc4pyrhei7f1nc3w6364sqahzkj5';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  console.log('[DEBUG] Webhook proxy received request:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    queryStringParameters: event.queryStringParameters,
    body: event.body ? JSON.parse(event.body) : null
  });

  try {
    // Extract path after /webhook to forward to Make
    const path = event.path.replace('/.netlify/functions/webhook', '');
    const url = path ? `${WEBHOOK_URL}${path}` : WEBHOOK_URL;
    
    console.log('[DEBUG] Forwarding to Make URL:', url);
    
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: event.httpMethod === 'POST' ? event.body : undefined
    });

    const data = await response.text();
    
    console.log('[DEBUG] Make response:', {
      status: response.status,
      headers: response.headers,
      data: data
    });

    return {
      statusCode: response.status,
      headers,
      body: data
    };
  } catch (error) {
    console.error('[DEBUG] Webhook proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to proxy request', details: error.message })
    };
  }
};
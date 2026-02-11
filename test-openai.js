// Test script to verify OpenAI API is working
// This tests the API key configured in Cursor settings

const https = require('https');

// Get API key from environment (Cursor should provide this)
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.log('❌ OPENAI_API_KEY not found in environment variables');
  console.log('Please check your Cursor settings -> Models -> API section');
  process.exit(1);
}

console.log('🔍 Testing OpenAI API connection...');
console.log('API Key found:', apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4));

// Test API call
const data = JSON.stringify({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'user',
      content: 'Say "Hello, API is working!" if you can read this.'
    }
  ],
  max_tokens: 50
});

const options = {
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const json = JSON.parse(responseData);
        console.log('\n✅ OpenAI API is working!');
        console.log('Response:', json.choices[0].message.content);
        console.log('\nModel used:', json.model);
        console.log('Tokens used:', json.usage.total_tokens);
      } catch (err) {
        console.log('\n❌ Error parsing response:', err.message);
        console.log('Raw response:', responseData);
      }
    } else {
      console.log('\n❌ API request failed');
      console.log('Status Code:', res.statusCode);
      console.log('Response:', responseData);
      
      if (res.statusCode === 401) {
        console.log('\n💡 This usually means:');
        console.log('   - Invalid API key');
        console.log('   - API key not properly configured in Cursor settings');
      } else if (res.statusCode === 429) {
        console.log('\n💡 This usually means:');
        console.log('   - Rate limit exceeded');
        console.log('   - Insufficient credits in your OpenAI account');
      }
    }
  });
});

req.on('error', (error) => {
  console.log('\n❌ Network error:', error.message);
  console.log('Please check your internet connection');
});

req.write(data);
req.end();




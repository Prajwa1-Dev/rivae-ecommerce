// Manual test script for OpenAI API
// You'll need to provide your API key when running this

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 OpenAI API Connection Test\n');
console.log('To test your API key:');
console.log('1. Copy your API key from Cursor Settings -> Models -> API Keys');
console.log('2. Paste it when prompted below\n');

rl.question('Enter your OpenAI API key (or press Enter to use OPENAI_API_KEY env var): ', (apiKey) => {
  // If no input, try environment variable
  const key = apiKey.trim() || process.env.OPENAI_API_KEY;
  
  if (!key) {
    console.log('\n❌ No API key provided');
    console.log('Please set OPENAI_API_KEY environment variable or enter it manually');
    rl.close();
    process.exit(1);
  }

  console.log('\n🔍 Testing connection...');
  console.log('API Key:', key.substring(0, 7) + '...' + key.substring(key.length - 4));

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
      'Authorization': `Bearer ${key}`,
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      rl.close();
      
      if (res.statusCode === 200) {
        try {
          const json = JSON.parse(responseData);
          console.log('\n✅ SUCCESS! OpenAI API is working correctly!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('Response:', json.choices[0].message.content);
          console.log('Model:', json.model);
          console.log('Tokens used:', json.usage.total_tokens);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } catch (err) {
          console.log('\n❌ Error parsing response:', err.message);
          console.log('Raw response:', responseData);
        }
      } else {
        console.log('\n❌ API request failed');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Status Code:', res.statusCode);
        
        try {
          const errorJson = JSON.parse(responseData);
          console.log('Error:', errorJson.error?.message || errorJson.error);
        } else {
          console.log('Response:', responseData);
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (res.statusCode === 401) {
          console.log('\n💡 This usually means:');
          console.log('   - Invalid or expired API key');
          console.log('   - API key format is incorrect');
          console.log('   - Check your Cursor settings -> Models -> API Keys');
        } else if (res.statusCode === 429) {
          console.log('\n💡 This usually means:');
          console.log('   - Rate limit exceeded');
          console.log('   - Insufficient credits in your OpenAI account');
          console.log('   - Check your OpenAI account billing at https://platform.openai.com/account/billing');
        } else if (res.statusCode === 500) {
          console.log('\n💡 This usually means:');
          console.log('   - OpenAI API server error (temporary)');
          console.log('   - Try again in a few moments');
        }
      }
    });
  });

  req.on('error', (error) => {
    rl.close();
    console.log('\n❌ Network error:', error.message);
    console.log('Please check your internet connection');
  });

  req.write(data);
  req.end();
});




# ElevenLabs API Integration Setup

This guide explains how to set up the ElevenLabs API integration for the custom chatbot.

## 🔑 Getting Your ElevenLabs API Key

1. **Sign up/Login** to [ElevenLabs](https://elevenlabs.io)
2. **Go to Settings** → [API Keys](https://elevenlabs.io/app/settings/api-keys)
3. **Create a new API key** or copy your existing one
4. **Copy the API key** (starts with `sk_...`)

## ⚙️ Configuration

### 1. Update `config.js`

Open `config.js` and replace the placeholder values:

```javascript
const ELEVENLABS_CONFIG = {
    // Replace with your actual API key
    API_KEY: 'sk_your_actual_api_key_here',
    
    // Choose your preferred voice (see available voices below)
    VOICE_ID: 'pNInz6obpgDQGcFmaJgB', // Adam voice
    
    // Your ElevenLabs Agent ID
    AGENT_ID: 'agent_1301k3zm8h2tfcbbt9qnm90ac35t',
    
    // ... rest of config
};
```

### 2. Available Voices

You can change the voice by updating `VOICE_ID` in `config.js`:

| Voice | ID | Description |
|-------|----|-----------| 
| Adam | `pNInz6obpgDQGcFmaJgB` | Default, natural male voice |
| Antoni | `ErXwobaYiN019PkySvjV` | Warm, friendly male voice |
| Bella | `EXAVITQu4vr4xnSDxMaL` | Clear, professional female voice |
| Domi | `AZnzlk1XvdvUeBnXmlld` | Confident female voice |
| Ethan | `g5CIjZEefAph4nQFvHAz` | Young, energetic male voice |
| Gigi | `jBpfuIE2acCO8z3wKNLl` | Soft, gentle female voice |
| Grace | `oWAxZDx7w5VEj9dCyTzz` | Professional female voice |
| James | `ZQe5CQoqhXKj2Q1zX7Pw` | Deep, authoritative male voice |
| Jeremy | `bVMeCsTHDK58qqDzK8yu` | Casual, friendly male voice |
| Jessie | `t0jbNlBVZ17f02VDIeMI` | Energetic female voice |
| Joseph | `Zlb1dXrM653N07WRdFW3` | Mature, wise male voice |
| Lily | `pFZP5JQG7iQjIQuC4Bku` | Sweet, young female voice |
| Matilda | `XrExE9yKIg1WjnnlVkGX` | Sophisticated female voice |
| Michael | `flq6f7yk4E4fJM5XTYuZ` | Professional male voice |
| Mimi | `zrHiDhphv9VkT0axDSWG` | Playful, cheerful female voice |
| Rachel | `21m00Tcm4TlvDq8ikWAM` | Clear, articulate female voice |
| Ryan | `wViXBPUzp2ZZixB1xQuM` | Friendly, approachable male voice |
| Sam | `yoZ06aMxZJJ28mfd3POQ` | Casual, conversational male voice |
| Serena | `pMsXgVXv3BLzUgSXRplM` | Professional, clear female voice |
| Thomas | `GBv7mTt0atIp3Br8iCZE` | Deep, resonant male voice |

## 🎯 Features

### ✅ What Works Now

- **Text Chat**: Send messages and get AI responses
- **Voice Input**: Click microphone to speak your message
- **Voice Output**: AI responses are spoken aloud
- **Fallback Mode**: Works without API key (simulated responses)
- **Context Awareness**: Remembers conversation history
- **Error Handling**: Graceful fallbacks if API fails

### 🔧 API Integration

- **ElevenLabs Conversation API**: Real AI responses from your agent
- **ElevenLabs Text-to-Speech**: High-quality voice synthesis
- **Browser Speech Recognition**: Voice input (no API needed)
- **Conversation History**: Maintains context across messages

## 🚀 Usage

1. **Open** `custom-chatbot.html` in your browser
2. **Type** a message or **click the microphone** for voice input
3. **Get AI responses** with voice output
4. **Chat naturally** about 3D printing, machines, software, etc.

## 🔒 Security Notes

- **Never commit** your API key to version control
- **Use environment variables** in production
- **Rotate API keys** regularly
- **Monitor usage** in your ElevenLabs dashboard

## 🐛 Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Update `API_KEY` in `config.js`
   - Make sure the key starts with `sk_`

2. **"ElevenLabs API error: 401"**
   - Check if your API key is valid
   - Verify you have sufficient credits

3. **"ElevenLabs API error: 429"**
   - You've hit the rate limit
   - Wait a moment and try again

4. **Voice not working**
   - Check browser permissions for microphone
   - Try a different browser (Chrome works best)

### Fallback Mode

If the ElevenLabs API fails, the chatbot automatically falls back to:
- **Simulated AI responses** (context-aware)
- **Browser text-to-speech** (instead of ElevenLabs TTS)

## 📊 API Usage

Monitor your usage at: [ElevenLabs Usage Dashboard](https://elevenlabs.io/app/usage)

### Typical Usage
- **Text-to-Speech**: ~1 character per request
- **Conversation API**: ~1 request per message
- **Free Tier**: 10,000 characters/month

## 🔄 Updates

To update the chatbot:
1. **Modify** `config.js` for new settings
2. **Update** voice IDs or API endpoints
3. **Test** with different voices
4. **Monitor** API usage and costs

---

**Need Help?** Check the [ElevenLabs Documentation](https://docs.elevenlabs.io/) or contact support.

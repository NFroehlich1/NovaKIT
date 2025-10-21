// ElevenLabs Conversational AI Configuration
// Configuration for WebSocket-based voice-to-voice communication

const ELEVENLABS_CONFIG = {
    // Your ElevenLabs Agent ID for conversations
    // This is a public agent, no API key required for frontend
    AGENT_ID: 'agent_1301k3zm8h2tfcbbt9qnm90ac35t',
    
    // WebSocket Configuration
    WEBSOCKET_URL: 'wss://api.elevenlabs.io/v1/conversation',
    
    // Audio Configuration
    AUDIO_CONFIG: {
        sampleRate: 16000,
        channels: 1,
        bitRate: 128000
    },
    
    // Conversation settings
    MAX_MESSAGES_HISTORY: 10, // Keep last 10 messages for context
    AUTO_RECONNECT: true, // Automatically reconnect on disconnect
    RECONNECT_DELAY: 3000, // Delay between reconnection attempts (ms)
    
    // Voice settings (for fallback TTS)
    VOICE_SETTINGS: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true
    },
    
    // Model settings (for fallback TTS)
    MODEL_ID: 'eleven_monolingual_v1',
    VOICE_ID: 'pNInz6obpgDQGcFmaJgB' // Adam voice for fallback
};

// Available ElevenLabs Voices (examples)
const ELEVENLABS_VOICES = {
    ADAM: 'pNInz6obpgDQGcFmaJgB',
    ANTONI: 'ErXwobaYiN019PkySvjV',
    ARNOLD: 'VR6AewLTigWG4xSOukaG',
    BELLA: 'EXAVITQu4vr4xnSDxMaL',
    DOMI: 'AZnzlk1XvdvUeBnXmlld',
    ELLI: 'MF3mGyEYCl7XYWbV9V6O',
    ETHAN: 'g5CIjZEefAph4nQFvHAz',
    GIGI: 'jBpfuIE2acCO8z3wKNLl',
    GLINDA: 'z9fAnlkpzviPz146aGWa',
    GRACE: 'oWAxZDx7w5VEj9dCyTzz',
    JAMES: 'ZQe5CQoqhXKj2Q1zX7Pw',
    JEREMY: 'bVMeCsTHDK58qqDzK8yu',
    JESSIE: 't0jbNlBVZ17f02VDIeMI',
    JOSEPH: 'Zlb1dXrM653N07WRdFW3',
    LILY: 'pFZP5JQG7iQjIQuC4Bku',
    MATILDA: 'XrExE9yKIg1WjnnlVkGX',
    MICHAEL: 'flq6f7yk4E4fJM5XTYuZ',
    MIMI: 'zrHiDhphv9VkT0axDSWG',
    RACHEL: '21m00Tcm4TlvDq8ikWAM',
    RYAN: 'wViXBPUzp2ZZixB1xQuM',
    SAM: 'yoZ06aMxZJJ28mfd3POQ',
    SERENA: 'pMsXgVXv3BLzUgSXRplM',
    THOMAS: 'GBv7mTt0atIp3Br8iCZE'
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ELEVENLABS_CONFIG, ELEVENLABS_VOICES };
}

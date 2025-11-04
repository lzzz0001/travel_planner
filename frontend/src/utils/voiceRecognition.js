// Voice recognition utility using Web Speech API
class VoiceRecognizer {
  constructor() {
    this.recognition = null;
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    if (this.isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'zh-CN'; // Default to Chinese, can be changed
    }
  }

  // Start listening for speech
  start(onResult, onError, onEnd) {
    if (!this.isSupported) {
      onError(new Error('Browser does not support speech recognition'));
      return;
    }

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      onError(event.error);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (error) {
      onError(error);
    }
  }

  // Stop listening
  stop() {
    if (this.recognition && this.isListening()) {
      this.recognition.stop();
    }
  }

  // Check if currently listening
  isListening() {
    return this.recognition && this.recognition.state === 'listening';
  }

  // Set language
  setLanguage(lang) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  // Check browser support
  getIsSupported() {
    return this.isSupported;
  }
}

export default VoiceRecognizer;
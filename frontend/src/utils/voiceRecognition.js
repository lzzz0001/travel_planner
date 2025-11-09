import IFlytekVoiceRecognizer from './iFlytekVoiceRecognition';

// Voice recognition utility using iFlytek API or Web Speech API as fallback
class VoiceRecognizer {
  constructor() {
    this.iFlytekRecognizer = null;
    this.webSpeechRecognizer = null;
    this.isUsingIFlytek = false;
    this.isSupported = false;
    this.initError = null;
    
    // Check if we have iFlytek API credentials
    const iflytekAppId = import.meta.env.VITE_IFLYTEK_APP_ID;
    const iflytekApiKey = import.meta.env.VITE_IFLYTEK_API_KEY;
    const iflytekApiSecret = import.meta.env.VITE_IFLYTEK_API_SECRET;
    
    // Prefer iFlytek if credentials are available
    if (iflytekAppId && iflytekApiKey && iflytekApiSecret) {
      try {
        this.iFlytekRecognizer = new IFlytekVoiceRecognizer();
        this.isUsingIFlytek = true;
        this.isSupported = this.iFlytekRecognizer.getIsSupported();
        console.log('Using iFlytek speech recognition');
      } catch (error) {
        console.warn('Failed to initialize iFlytek recognizer, falling back to Web Speech API:', error);
        this.initError = error.message;
        this.initWebSpeech();
      }
    } else {
      console.log('iFlytek credentials not found, using Web Speech API');
      this.initWebSpeech();
    }
  }
  
  // Initialize Web Speech API as fallback
  initWebSpeech() {
    this.isUsingIFlytek = false;
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    if (this.isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.webSpeechRecognizer = new SpeechRecognition();
      this.webSpeechRecognizer.continuous = false;
      this.webSpeechRecognizer.interimResults = false;
      this.webSpeechRecognizer.lang = 'zh-CN';
    }
  }

  // Start listening for speech
  start(onResult, onError, onEnd) {
    if (!this.isSupported) {
      onError(new Error('Speech recognition is not supported in your browser. Please try Chrome or Edge.'));
      return;
    }
    
    if (this.isUsingIFlytek && this.iFlytekRecognizer) {
      this.iFlytekRecognizer.start(onResult, onError, onEnd);
    } else if (this.webSpeechRecognizer) {
      this.startWebSpeech(onResult, onError, onEnd);
    } else {
      onError(new Error('No speech recognition engine available.'));
    }
  }

  // Start Web Speech API
  startWebSpeech(onResult, onError, onEnd) {
    this.webSpeechRecognizer.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.webSpeechRecognizer.onerror = (event) => {
      console.error('Web Speech recognition error:', event.error);
      console.error('Web Speech recognition error object:', event);
      
      // Provide more detailed error messages
      let errorMessage = 'Speech recognition failed';
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error: Please check your internet connection and try again.';
          break;
        case 'not-allowed':
          errorMessage = 'Permission denied: Please allow microphone access and try again.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed. Please check your browser settings.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition aborted.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone detected. Please check your audio input device.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again and speak clearly.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      onError(errorMessage);
    };

    this.webSpeechRecognizer.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.webSpeechRecognizer.start();
    } catch (error) {
      console.error('Web Speech recognition start error:', error);
      onError('Failed to start speech recognition. Please check your browser settings and try again.');
    }
  }

  // Stop listening
  stop() {
    if (this.isUsingIFlytek && this.iFlytekRecognizer) {
      this.iFlytekRecognizer.stop();
    } else if (this.webSpeechRecognizer) {
      if (this.webSpeechRecognizer.state === 'listening') {
        this.webSpeechRecognizer.stop();
      }
    }
  }

  // Check if currently listening
  isListening() {
    if (this.isUsingIFlytek && this.iFlytekRecognizer) {
      return this.iFlytekRecognizer.isListening();
    } else if (this.webSpeechRecognizer) {
      return this.webSpeechRecognizer.state === 'listening';
    }
    return false;
  }

  // Set language
  setLanguage(lang) {
    if (this.isUsingIFlytek && this.iFlytekRecognizer) {
      this.iFlytekRecognizer.setLanguage(lang);
    } else if (this.webSpeechRecognizer) {
      this.webSpeechRecognizer.lang = lang;
    }
  }

  // Check browser support
  getIsSupported() {
    return this.isSupported;
  }
  
  // Get initialization error
  getInitError() {
    return this.initError;
  }
}

export default VoiceRecognizer;
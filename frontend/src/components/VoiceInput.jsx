import React, { useState, useEffect, useRef } from 'react';
import VoiceRecognizer from '../utils/voiceRecognition';

const VoiceInput = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const voiceRecognizerRef = useRef(null);

  useEffect(() => {
    // Initialize voice recognizer
    voiceRecognizerRef.current = new VoiceRecognizer();
    setIsSupported(voiceRecognizerRef.current.getIsSupported());
  }, []);

  const startListening = () => {
    if (!isSupported) {
      setError('Your browser does not support speech recognition. Please try Chrome or Edge.');
      return;
    }

    setError('');
    setIsListening(true);
    
    voiceRecognizerRef.current.start(
      (result) => {
        setTranscript(result);
        if (onTranscript) {
          onTranscript(result);
        }
        setIsListening(false);
      },
      (err) => {
        setError(`Error: ${err}`);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const stopListening = () => {
    if (voiceRecognizerRef.current) {
      voiceRecognizerRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="voice-input">
      <div className="voice-controls">
        <button 
          onClick={isListening ? stopListening : startListening}
          className={`voice-button ${isListening ? 'listening' : ''}`}
          disabled={!isSupported && transcript !== ''}
        >
          {isListening ? '⏹️ Stop' : '🎤 Speak'}
        </button>
      </div>
      
      {transcript && (
        <div className="transcript-display">
          <h3>You said:</h3>
          <p>{transcript}</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {!isSupported && !transcript && (
        <div className="browser-support-note">
          <p>Browser speech recognition not supported. For best experience, use Chrome or Edge.</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
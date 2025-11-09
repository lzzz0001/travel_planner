import React, { useState, useEffect, useRef } from 'react';
import VoiceRecognizer from '../utils/voiceRecognition';

const VoiceInput = ({ onTranscript, onError, autoStart = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const [recognitionEngine, setRecognitionEngine] = useState(''); // Track which engine is being used
  const voiceRecognizerRef = useRef(null);

  useEffect(() => {
    // Initialize voice recognizer
    voiceRecognizerRef.current = new VoiceRecognizer();
    setIsSupported(voiceRecognizerRef.current.getIsSupported());
    
    // Check which engine is being used
    if (voiceRecognizerRef.current.isUsingIFlytek) {
      setRecognitionEngine('iFlytek');
    } else {
      setRecognitionEngine('Web Speech API');
    }
    
    // Check for initialization errors
    const initError = voiceRecognizerRef.current.getInitError();
    if (initError) {
      setError(`语音识别初始化错误: ${initError}`);
    }
  }, []);

  // Auto start listening if specified
  useEffect(() => {
    if (autoStart && isSupported && !isListening && !error) {
      // Start listening after a small delay to ensure the component is fully rendered
      setTimeout(() => startListening(), 500);
    }
  }, [autoStart, isSupported]);

  const startListening = () => {
    if (!isSupported) {
      setError('您的浏览器不支持语音识别，请尝试使用Chrome或Edge浏览器。');
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
          setError(err);
          setIsListening(false);
          if (onError) {
            onError(err);
          }
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
          {isListening ? '⏹️ 停止' : '🎤 说话'}
        </button>
      </div>
      
      {transcript && (
        <div className="transcript-display">
          <h3>您说：</h3>
          <p>{transcript}</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          {(error.includes('Network error') || error.includes('network') || error.includes('WebSocket')) && (
            <div className="error-suggestions">
              <p><strong>故障排除提示：</strong></p>
              <ul>
                <li>检查您的网络连接</li>
                <li>验证.env文件中的讯飞API凭证</li>
                <li>确保您有有效的讯飞API密钥</li>
                <li>尝试刷新页面</li>
                <li>检查麦克风是否正常工作且已启用</li>
                <li>如果问题仍然存在，请尝试直接输入您的旅行请求</li>
              </ul>
            </div>
          )}
          {error.includes('Permission denied') && (
            <div className="error-suggestions">
              <p><strong>解决方法：</strong></p>
              <ul>
                <li>点击浏览器地址栏中的麦克风图标</li>
                <li>选择"始终允许"麦克风访问</li>
                <li>刷新页面后重试</li>
              </ul>
            </div>
          )}
          {error.includes('Missing iFlytek API credentials') && (
            <div className="error-suggestions">
              <p><strong>解决方法：</strong></p>
              <ul>
                <li>在.env文件中更新有效的讯飞API凭证</li>
                <li>确保您已配置VITE_IFLYTEK_APP_ID、VITE_IFLYTEK_API_KEY和VITE_IFLYTEK_API_SECRET</li>
                <li>API密钥不应为"your_iflytek_api_secret"</li>
              </ul>
            </div>
          )}
        </div>
      )}
      
      {!isSupported && !transcript && (
        <div className="browser-support-note">
          <p>浏览器不支持语音识别。为获得最佳体验，请使用Chrome或Edge浏览器。</p>
          <p>您也可以在下方文本框中输入您的旅行请求。</p>
        </div>
      )}
      
      {isSupported && (
        <div className="voice-instructions">
          <p><small>点击"说话"并描述您的旅行计划。请用中文或英文清晰地说话。</small></p>
          <p><small>正在使用{recognitionEngine}进行语音识别。</small></p>
          <p><small>如果语音识别不工作，您可以在下方直接输入您的请求。</small></p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
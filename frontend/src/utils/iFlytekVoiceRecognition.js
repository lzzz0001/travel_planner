import CryptoJS from 'crypto-js';

// iFlytek Speech Recognition using WebSocket (Speech Recognition API)
// 严格按照官方示例实现
class IFlytekVoiceRecognizer {
  constructor() {
    this.websocket = null;
    this.audioContext = null;
    this.audioSource = null;
    this.audioProcessor = null;
    this.mediaStream = null;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    
    // Get credentials from environment variables
    this.appId = import.meta.env.VITE_IFLYTEK_APP_ID;
    this.apiKey = import.meta.env.VITE_IFLYTEK_API_KEY;
    this.apiSecret = import.meta.env.VITE_IFLYTEK_API_SECRET;
    
    // iFlytek WebSocket endpoint for speech recognition
    this.host = 'iat-api.xfyun.cn';
    this.path = '/v2/iat';
    this.url = `wss://${this.host}${this.path}`;
  }

  // Generate authorization URL for iFlytek WebSocket - 严格按照官方实现
  generateAuthUrl() {
    const date = new Date().toGMTString();
    const signatureOrigin = `host: ${this.host}\ndate: ${date}\nGET ${this.path} HTTP/1.1`;
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);
    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = btoa(authorizationOrigin);
    const authUrl = `${this.url}?authorization=${authorization}&date=${date}&host=${this.host}`;
    return authUrl;
  }

  // 将ArrayBuffer转换为base64 - 严格按照官方示例实现
  toBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // 初始化音频处理和发送
  initAudioProcessing(stream) {
    try {
      this.mediaStream = stream;
      
      // 创建音频上下文
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000 // 明确设置采样率为16kHz
      });
      
      // 创建音频源
      this.audioSource = this.audioContext.createMediaStreamSource(stream);
      
      // 创建音频处理器 - 使用合法的缓冲区大小（必须是2的幂）
      // 1024是最接近1280的2的幂值，符合浏览器要求
      this.audioProcessor = this.audioContext.createScriptProcessor(1024, 1, 1);
      
      // 连接音频处理管道
      this.audioSource.connect(this.audioProcessor);
      this.audioProcessor.connect(this.audioContext.destination);
      
      // 音频处理回调
      this.audioProcessor.onaudioprocess = (event) => {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
          // 获取输入音频数据
          const inputData = event.inputBuffer.getChannelData(0);
          
          // 转换为16位PCM
          const int16Array = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          // 转换为base64并发送
          const base64Data = this.toBase64(int16Array.buffer);
          
          // 音频数据帧，status=1
          const audioFrame = {
            "data": {
              "status": 1,
              "format": "audio/L16;rate=16000",
              "encoding": "raw",
              "audio": base64Data
            }
          };
          
          this.websocket.send(JSON.stringify(audioFrame));
        }
      };
    } catch (error) {
      console.error('Error initializing audio processing:', error);
      this.handleError('Failed to initialize audio processing: ' + (error.message || 'Unknown error'));
    }
  }

  // 清理资源
  cleanup() {
    try {
      // 停止音频处理
      if (this.audioProcessor) {
        this.audioProcessor.disconnect();
        this.audioProcessor = null;
      }
      
      if (this.audioSource) {
        this.audioSource.disconnect();
        this.audioSource = null;
      }
      
      // 关闭音频上下文
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
      
      // 停止媒体流
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
      
      // 关闭WebSocket连接
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Start recording and speech recognition - 完全按照官方示例流程
  async start(onResult, onError, onEnd) {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;

    try {
      // 检查凭证
      if (!this.appId || !this.apiKey || !this.apiSecret) {
        throw new Error('Missing iFlytek API credentials');
      }

      if (this.apiSecret === 'your_iflytek_api_secret') {
        throw new Error('Invalid iFlytek API secret');
      }

      // 获取麦克风访问权限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });
      
      // 创建WebSocket连接
      const authUrl = this.generateAuthUrl();
      this.websocket = new WebSocket(authUrl);
      
      // WebSocket连接建立后的回调 - 严格按照官方顺序
      this.websocket.onopen = () => {
        console.log('WebSocket connection established');
        
        // 1. 先初始化音频处理
        this.initAudioProcessing(stream);
        
        // 2. 然后发送首帧配置信息 (status=0)
        const firstFrame = {
          "common": {
            "app_id": this.appId
          },
          "business": {
            "language": "zh_cn",
            "domain": "iat",
            "accent": "mandarin",
            "vad_eos": 5000,
            "dwa": "wpgs" // 开启实时修正
          },
          "data": {
            "status": 0,
            "format": "audio/L16;rate=16000",
            "encoding": "raw"
            // 首帧不包含audio字段
          }
        };
        
        // 确保WebSocket连接仍然存在且处于打开状态
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
          this.websocket.send(JSON.stringify(firstFrame));
        } else {
          console.error('WebSocket not available for sending first frame');
        }
      };
      
      // 添加累积结果存储
      this.accumulatedResult = '';
      
      // 接收消息处理 - 改进为累积结果而非替换
      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // 错误处理
          if (data.code !== 0) {
            const errorMsg = `iFlytek API error: ${data.message || 'Unknown error'} (code: ${data.code})`;
            this.handleError(errorMsg);
            return;
          }
          
          // 处理识别结果
            if (data.data && data.data.result) {
              const resultData = data.data.result;
              let currentStr = "";
              
              // 构建当前识别的文本
              if (resultData.ws && Array.isArray(resultData.ws)) {
                for (let i = 0; i < resultData.ws.length; i++) {
                  currentStr += resultData.ws[i].cw[0].w;
                }
              }
              
              // 检查是否是识别完成的消息
              const isFinalResult = data.data.status === 2;
              
              // 检查是否是单独的句号（中文或英文）
              const isSinglePeriod = currentStr && (
                currentStr.trim() === '。' || // 中文句号
                currentStr.trim() === '.'     // 英文句号
              );
              
              // 对于最终结果中的单个句号，完全忽略，不更新累积结果
              if (isFinalResult && isSinglePeriod) {
                console.log('Ignoring final result with single period:', currentStr);
                // 直接通知回调使用现有的累积结果
                if (this.accumulatedResult && this.onResultCallback) {
                  this.onResultCallback(this.accumulatedResult);
                }
                this.websocket.close();
                return; // 跳过后续处理
              }
              
              // 处理正常的识别结果更新
              if (resultData.pgs) {
                // 完整结果 - 替换整个累积结果
                if (resultData.pgs === 'rpl' && resultData.rg) {
                  this.accumulatedResult = currentStr;
                } else {
                  // 部分结果 - 更新累积结果
                  this.accumulatedResult = currentStr;
                }
              } else {
                // 没有wpgs时，直接更新累积结果
                this.accumulatedResult = currentStr;
              }
              
              // 确保不为空字符串时才通知回调
              if (this.accumulatedResult && this.onResultCallback) {
                this.onResultCallback(this.accumulatedResult);
              }
              
              // 检查是否完成（非单个句号的情况）
              if (isFinalResult) {
                console.log('Speech recognition completed with final result:', this.accumulatedResult);
                this.websocket.close();
              }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      // WebSocket错误处理
      this.websocket.onerror = (error) => {
        this.handleError('WebSocket error: ' + (error.message || 'Unknown error'));
      };
      
      // WebSocket关闭处理
      this.websocket.onclose = (event) => {
        console.log('WebSocket connection closed');
        this.cleanup();
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.handleError(error.message || 'Failed to start speech recognition');
    }
  }

  // Stop recording and speech recognition
  stop() {
    console.log('Stopping speech recognition');
    
    // 发送结束帧 (status=2)
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      const endFrame = {
        "data": {
          "status": 2,
          "format": "audio/L16;rate=16000",
          "encoding": "raw",
          "audio": ""
        }
      };
      this.websocket.send(JSON.stringify(endFrame));
    }
    
    // 清理所有资源
    this.cleanup();
  }

  // Handle errors
  handleError(message) {
    console.error('iFlytek error:', message);
    
    if (this.onErrorCallback) {
      this.onErrorCallback(message);
    }
    
    // 清理资源
    this.cleanup();
  }

  // Check if currently listening
  isListening() {
    return this.websocket !== null && this.websocket.readyState === WebSocket.OPEN;
  }

  // Check browser support
  getIsSupported() {
    return (
      'mediaDevices' in navigator &&
      'getUserMedia' in navigator.mediaDevices &&
      'WebSocket' in window &&
      this.appId &&
      this.apiKey &&
      this.apiSecret &&
      this.apiSecret !== 'your_iflytek_api_secret'
    );
  }
}

export default IFlytekVoiceRecognizer;
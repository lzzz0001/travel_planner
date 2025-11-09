const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Test server is running on port 3002!'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
});
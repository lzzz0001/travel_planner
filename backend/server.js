const express = require('express');
const cors = require('cors');
require('dotenv').config();
// 添加fetch支持
const fetch = require('node-fetch');

// 导入Supabase客户端库
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
// 明确设置字符编码
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 配置DashScope大模型API（OpenAI兼容模式）
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;
const DASHSCOPE_API_ENDPOINT = process.env.DASHSCOPE_API_ENDPOINT || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

// 配置Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabaseClient = null;

// 初始化Supabase客户端
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Supabase client initialized successfully');
} else {
  console.warn('Supabase credentials not found, using in-memory storage (data will be lost on restart)');
}

// 生成DashScope API请求头（OpenAI兼容模式）
function generateApiHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
}

// 内存存储作为备份（当Supabase不可用时）
let travelPlans = [];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Travel Planner Backend is running!' });
});

// Generate travel plan using AI with Alibaba Cloud Bailian API
app.post('/api/generate-plan', async (req, res) => {
    try {
      // 现在req.body直接包含用户输入和apiKey
      const userRequest = req.body.apiKey ? req.body : req.body.request;
      const apiKey = req.body.apiKey;
      
      if (!userRequest) {
        return res.status(400).json({
          error: '请提供旅行需求内容'
        });
      }
      
      console.log(`收到生成旅行计划请求: ${typeof userRequest === 'string' ? userRequest : JSON.stringify(userRequest)}`);
      console.log(`收到API密钥(部分): ${apiKey ? '*'.repeat(Math.min(8, apiKey.length)) + apiKey.slice(-4) : '无'}`);
      
      // 构建提示词，明确要求AI返回完整的JSON格式，并严格按照用户指定的目的地
      const prompt = `请根据用户的旅行需求，严格按照用户指定的目的地生成一个详细的旅行计划JSON。用户需求：${typeof userRequest === 'string' ? userRequest : JSON.stringify(userRequest)}
      
      重要：无论如何，请确保生成的旅行计划目的地与用户明确指定的目的地完全一致。
      请严格按照以下格式输出，只返回JSON数据，不要包含任何其他文字说明或格式标记：
      {
        "destination": "具体的目的地名称",
        "duration": 具体的旅行天数,
        "budget": 具体的预算金额,
        "itinerary": [
          {
            "day": 1,
            "date": "2024-11-07",
            "activities": [
              {
                "time": "09:00",
                "activity": "具体活动",
                "location": "具体地点",
                "details": "详细描述",
                "estimated_cost": 具体金额
              }
            ]
          },
          {
            "day": 2,
            "date": "2024-11-08",
            "activities": []
          },
          {
            "day": 3,
            "date": "2024-11-09",
            "activities": []
          }
        ],
        "accommodations": [
          {
            "name": "酒店名称",
            "location": "位置",
            "price_range": "价格范围",
            "booking_link": "https://example.com"
          }
        ],
        "transportation": [
          {
            "type": "交通类型",
            "details": "详细说明",
            "estimated_cost": 具体金额
          }
        ],
        "restaurants": [
          {
            "name": "餐厅名称",
            "cuisine": "菜系",
            "location": "位置",
            "price_range": "价格范围",
            "recommendation": "推荐理由"
          }
        ],
        "total_estimated_cost": 具体金额,
        "tips": ["实用的旅行建议", "注意事项"]
      }
      
      重要：请确保返回有效的旅行计划数据，不要使用占位符或空值，JSON格式必须完整且可以被程序正确解析！`;

    // 使用请求中的API密钥或环境变量中的API密钥
    const effectiveApiKey = apiKey || DASHSCOPE_API_KEY;
    
    // 检查是否配置了有效的API密钥
    if (!effectiveApiKey) {
      console.warn('DashScope API key not configured (neither in request nor environment), using mock data');
      // 如果没有配置API密钥，使用模拟数据
      const sampleItinerary = {
        id: 'plan-' + Date.now(),
        destination: "日本",
        duration: "5天",
        budget: "10,000 RMB",
        itinerary: [
          {
            day: 1,
            date: "第1天",
            activities: [
              {
                time: "09:00",
                activity: "抵达东京站",
                location: "东京站",
                details: "与当地导游会面",
                estimated_cost: "0 RMB"
              },
              {
                time: "12:00",
                activity: "筑地市场午餐",
                location: "筑地市场",
                details: "新鲜寿司和海鲜",
                estimated_cost: "150 RMB"
              }
            ]
          }
        ],
        accommodations: [
          {
            name: "东京家庭酒店",
            location: "新宿",
            price_range: "800-1200 RMB/晚",
            booking_link: "https://example.com"
          }
        ],
        transportation: [
          {
            type: "机场接送",
            details: "从机场到酒店的私家车",
            estimated_cost: "800 RMB"
          }
        ],
        restaurants: [
          {
            name: "すきやばし次郎",
            cuisine: "寿司",
            location: "银座",
            price_range: "3000-5000 RMB",
            recommendation: "世界著名寿司餐厅（需预约）"
          }
        ],
        total_estimated_cost: "8000 RMB",
        tips: [
          "如果计划在城市间旅行，购买7天JR Pass",
          "下载Google翻译应用程序以获得语言帮助"
        ]
      };
      
      travelPlans.push(sampleItinerary);
      return res.json(sampleItinerary);
    }

    // 调用DashScope大模型API（OpenAI兼容模式）
    // 增加max_tokens值以确保生成完整的JSON数据
    const response = await fetch(DASHSCOPE_API_ENDPOINT, {
      method: 'POST',
      headers: generateApiHeaders(effectiveApiKey),
      body: JSON.stringify({
        model: 'qwen-plus', // 使用通义千问大模型
        messages: [
          { 
            role: "system", 
            content: "你是一个专业的旅行规划助手，能够根据用户需求生成详细的旅行计划。请严格按照要求的JSON格式输出，确保生成的内容完整且可以被JSON.parse正确解析。"
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 4096 // 增加token限制以生成更完整的响应
      })
    });

    if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(`DashScope API error: ${response.statusText}, ${JSON.stringify(errorData)}`);
        } catch (jsonError) {
          throw new Error(`DashScope API error: ${response.statusText}`);
        }
      }

    const data = await response.json();
    
    // 提取生成的内容（OpenAI兼容模式）
    let generatedContent = '';
    if (data.choices && data.choices.length > 0 && data.choices[0] && data.choices[0].message) {
      generatedContent = data.choices[0].message.content || '';
    }
    
    console.log('AI API返回原始内容:', generatedContent.substring(0, 100) + '...');
    
    // 清理和标准化AI返回的内容
      let cleanContent = generatedContent
        // 移除markdown代码块标记
        .replace(/^```json\n|\n```$/g, '')
        .replace(/^```\n|\n```$/g, '')
        // 移除控制字符
        .replace(/[\u0000-\u001F\u007F]/g, '')
        // 移除可能的首尾文字
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        // 确保有效的JSON格式（移除末尾多余的逗号等）
        .replace(/,\s*}/g, '}')
        .replace(/,\s*\]/g, ']')
        // 修复可能的格式问题
        .replace(/[\r\n]+/g, ' ')
        .trim();
      
      // 尝试修复不完整的JSON结构
      try {
        // 计算大括号的数量，尝试补全
        const openBraces = (cleanContent.match(/{/g) || []).length;
        const closeBraces = (cleanContent.match(/}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        
        if (missingBraces > 0) {
          cleanContent += '}'.repeat(missingBraces);
          console.log(`修复了${missingBraces}个缺失的大括号`);
        }
        
        // 计算中括号的数量，尝试补全
        const openBrackets = (cleanContent.match(/\[/g) || []).length;
        const closeBrackets = (cleanContent.match(/\]/g) || []).length;
        const missingBrackets = openBrackets - closeBrackets;
        
        if (missingBrackets > 0) {
          cleanContent = cleanContent.replace(/([^\]])$/, `$1${']'.repeat(missingBrackets)}`);
          console.log(`修复了${missingBrackets}个缺失的中括号`);
        }
      } catch (e) {
        console.warn('尝试修复JSON格式时出错:', e);
      }
    
    // 尝试解析JSON
    let travelPlan;
    try {
      travelPlan = JSON.parse(cleanContent);
    } catch (jsonError) {
      console.error('JSON解析错误:', jsonError);
      console.error('导致错误的内容:', cleanContent);
      return res.status(500).json({
        error: '生成旅行计划失败',
        details: 'AI返回的数据格式有误',
        rawError: jsonError.message
      });
    }
    
    // 验证解析结果是否为有效的旅行计划对象
    if (!travelPlan || typeof travelPlan !== 'object') {
      console.error('无效的旅行计划对象:', travelPlan);
      return res.status(500).json({
        error: '生成旅行计划失败',
        details: 'AI返回的数据格式不正确'
      });
    }
    
    // 添加ID和用户ID
    travelPlan.id = 'plan-' + Date.now();
    // 从请求头或请求体获取用户ID，如果没有则默认为anonymous
    const userId = req.headers['x-user-id'] || req.body.userId || 'anonymous';
    travelPlan.userId = userId;
    
    // 保存到历史记录
    if (typeof travelPlans !== 'undefined' && Array.isArray(travelPlans)) {
      travelPlans.push(travelPlan);
    }
    
    console.log(`成功生成旅行计划，ID: ${travelPlan.id}`);
    return res.json(travelPlan);
  } catch (error) {
    console.error('生成旅行计划过程中出错:', error);
    return res.status(500).json({
      error: '生成旅行计划失败，请稍后重试',
      details: error.message
    });
  }
});

// Get all travel plans for a specific user
app.get('/api/travel-plans', async (req, res) => {
  try {
    // 从请求头或查询参数中获取用户ID，优先使用请求头
    const userId = req.headers['x-user-id'] || req.query.userId || 'anonymous';
    console.log(`获取用户 ${userId} 的旅行计划`);
    
    // 如果Supabase可用，优先从Supabase获取用户的旅行计划
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('travel_plans')
        .select('*')
        .eq('userId', userId);
      
      if (error) {
        console.error('Error fetching user plans from Supabase:', error);
        // 如果Supabase失败，从内存中过滤
        const userPlans = travelPlans.filter(plan => plan.userId === userId);
        return res.json(userPlans);
      } else {
        console.log(`Successfully fetched user plans from Supabase: ${data.length} plans`);
        return res.json(data);
      }
    }
    
    // 如果Supabase不可用，从内存中过滤
    const userPlans = travelPlans.filter(plan => plan.userId === userId);
    res.json(userPlans);
  } catch (error) {
    console.error('Error fetching user travel plans:', error);
    // 错误情况下尝试从内存中获取用户的计划
    const userId = req.headers['x-user-id'] || req.query.userId || 'anonymous';
    const userPlans = travelPlans.filter(plan => plan.userId === userId);
    res.json(userPlans);
  }
});

// Get travel plans by user ID
app.get('/api/travel-plans/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 如果Supabase可用，优先从Supabase获取用户的旅行计划
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('travel_plans')
        .select('*')
        .eq('userId', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user plans from Supabase:', error);
        // 如果Supabase失败，从内存中过滤
        const userPlans = travelPlans.filter(plan => plan.userId === userId);
        return res.json(userPlans);
      } else {
        console.log('Successfully fetched user plans from Supabase:', data.length, 'plans');
        return res.json(data);
      }
    }
    
    // 如果Supabase不可用，从内存中过滤
    const userPlans = travelPlans.filter(plan => plan.userId === userId);
    res.json(userPlans);
  } catch (error) {
    console.error('Error fetching user travel plans:', error);
    const userPlans = travelPlans.filter(plan => plan.userId === req.params.userId);
    res.json(userPlans);
  }
});

// Get a specific travel plan
app.get('/api/travel-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 如果Supabase可用，优先从Supabase获取
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('travel_plans')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching single plan from Supabase:', error);
        // 如果Supabase失败，从内存中查找
        const plan = travelPlans.find(p => p.id === id);
        if (plan) {
          return res.json(plan);
        } else {
          return res.status(404).json({ error: 'Travel plan not found' });
        }
      } else {
        console.log('Successfully fetched single plan from Supabase');
        return res.json(data);
      }
    }
    
    // 如果Supabase不可用，从内存中查找
    const plan = travelPlans.find(p => p.id === id);
    if (plan) {
      res.json(plan);
    } else {
      res.status(404).json({ error: 'Travel plan not found' });
    }
  } catch (error) {
    console.error('Error fetching single travel plan:', error);
    const plan = travelPlans.find(p => p.id === req.params.id);
    if (plan) {
      res.json(plan);
    } else {
      res.status(404).json({ error: 'Travel plan not found' });
    }
  }
});

// Save a travel plan
app.post('/api/travel-plans', async (req, res) => {
  try {
    // 创建计划对象并添加时间戳
    const plan = req.body;
    console.log('收到保存旅行计划请求:', plan.id);
    
    // 创建严格匹配数据库表结构的对象
    const dbSafePlan = {
      id: plan.id || `plan-${Date.now()}`,
      userId: plan.userId || 'anonymous',
      destination: plan.destination || 'Unknown',
      duration: plan.duration ? String(plan.duration) : null,  // 确保是text类型
      budget: plan.budget ? String(plan.budget) : null,        // 确保是text类型
      itinerary: plan.itinerary || null,
      accommodations: plan.accommodations || null,
      transportation: plan.transportation || null,
      restaurants: plan.restaurants || null,
      total_estimated_cost: plan.total_estimated_cost ? String(plan.total_estimated_cost) : null, // 确保是text类型
      tips: plan.tips || null,
      notes: plan.notes || null,
      is_favorite: typeof plan.is_favorite === 'boolean' ? plan.is_favorite : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('保存到数据库的字段:', Object.keys(dbSafePlan));
    
    // 首先保存到内存作为备份
    travelPlans.push(dbSafePlan);
    
    // 如果Supabase可用，保存到Supabase
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('travel_plans')
        .insert(dbSafePlan)
        .select();
      
      if (error) {
        console.error('Error saving to Supabase:', error);
        // 返回内存中的数据，但添加标记
        return res.status(201).json({
          ...dbSafePlan,
          _localOnly: true
        });
      } else {
        console.log('Successfully saved to Supabase:', data[0].id);
        return res.status(201).json(data[0]);
      }
    }
    
    // 如果Supabase不可用，返回内存中的数据
    return res.status(201).json(dbSafePlan);
  } catch (error) {
    console.error('Error saving travel plan:', error);
    // 构建一个最小化的响应对象
    const fallbackPlan = {
      id: req.body?.id || `plan-${Date.now()}`,
      userId: req.body?.userId || 'anonymous',
      destination: req.body?.destination || 'Unknown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _localOnly: true
    };
    // 即使在错误情况下也保存到内存
    if (typeof travelPlans !== 'undefined' && Array.isArray(travelPlans)) {
      travelPlans.push(fallbackPlan);
    }
    return res.status(201).json(fallbackPlan);
  }
});

// Update a travel plan
app.put('/api/travel-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = travelPlans.findIndex(p => p.id === id);
    const updatedAt = new Date().toISOString();
    
    if (index !== -1) {
      // 构建符合数据库表结构的更新对象
      const updateData = { updated_at: updatedAt };
      
      // 严格匹配数据库表结构的字段，确保类型正确
      if (req.body.userId !== undefined) updateData.userId = req.body.userId;
      if (req.body.destination !== undefined) updateData.destination = req.body.destination;
      if (req.body.duration !== undefined) updateData.duration = String(req.body.duration); // 确保是text类型
      if (req.body.budget !== undefined) updateData.budget = String(req.body.budget); // 确保是text类型
      if (req.body.itinerary !== undefined) updateData.itinerary = req.body.itinerary;
      if (req.body.accommodations !== undefined) updateData.accommodations = req.body.accommodations;
      if (req.body.transportation !== undefined) updateData.transportation = req.body.transportation;
      if (req.body.restaurants !== undefined) updateData.restaurants = req.body.restaurants;
      if (req.body.total_estimated_cost !== undefined) updateData.total_estimated_cost = String(req.body.total_estimated_cost); // 确保是text类型
      if (req.body.tips !== undefined) updateData.tips = req.body.tips;
      if (req.body.notes !== undefined) updateData.notes = req.body.notes;
      if (req.body.is_favorite !== undefined) updateData.is_favorite = req.body.is_favorite;
      
      // 更新内存中的数据
      travelPlans[index] = { ...travelPlans[index], ...updateData };
      
      // 如果Supabase可用，更新Supabase中的数据
      if (supabaseClient) {
        const { data, error } = await supabaseClient
          .from('travel_plans')
          .update(updateData)
          .eq('id', id)
          .select();
        
        if (error) {
          console.error('Error updating in Supabase:', error);
          // 即使Supabase失败，也返回内存中更新后的数据，并添加标记
          return res.json({
            ...travelPlans[index],
            _localOnly: true
          });
        } else {
          console.log('Successfully updated in Supabase:', data[0].id);
          return res.json(data[0]);
        }
      }
      
      res.json(travelPlans[index]);
    } else {
      res.status(404).json({ error: 'Travel plan not found' });
    }
  } catch (error) {
    console.error('Error updating travel plan:', error);
    // 尝试找到并返回更新前的数据
    const plan = travelPlans.find(p => p.id === req.params.id);
    if (plan) {
      return res.json({
        ...plan,
        _localOnly: true
      });
    }
    res.status(404).json({ error: 'Travel plan not found' });
  }
});

// Delete a travel plan
app.delete('/api/travel-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = travelPlans.findIndex(p => p.id === id);
    
    if (index !== -1) {
      // 从内存中删除
      const deletedPlan = travelPlans.splice(index, 1);
      
      // 如果Supabase可用，从Supabase中删除
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('travel_plans')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting from Supabase:', error);
          // 返回成功，但添加标记表明云端可能未删除
          return res.json({ 
            message: 'Travel plan deleted from local memory',
            _cloudDeleteFailed: true
          });
        } else {
          console.log('Successfully deleted from Supabase:', id);
          return res.json({ message: 'Travel plan deleted' });
        }
      }
      
      res.json({ message: 'Travel plan deleted from local memory' });
    } else {
      res.status(404).json({ error: 'Travel plan not found' });
    }
  } catch (error) {
    console.error('Error deleting travel plan:', error);
    // 即使在错误情况下，也尝试从内存中删除
    const index = travelPlans.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      travelPlans.splice(index, 1);
      return res.json({ 
        message: 'Travel plan deleted from local memory',
        _errorOccurred: true
      });
    }
    res.status(404).json({ error: 'Travel plan not found' });
  }
});

// 启动服务器，使用端口3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
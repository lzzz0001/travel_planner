require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 配置Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// 初始化Supabase客户端
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabase() {
  try {
    console.log('开始测试Supabase连接和数据存储...');
    
    // 1. 创建一个示例旅行计划
    const testPlan = {
      id: 'test-plan-' + Date.now(),
      userId: 'test-user',
      destination: '北京',
      duration: '3天',
      budget: '2000元',
      itinerary: [
        {
          day: 1,
          date: '2024-12-20',
          activities: [
            {
              time: '09:00',
              activity: '参观故宫',
              location: '故宫博物院',
              details: '游览紫禁城',
              estimated_cost: 60
            }
          ]
        }
      ],
      accommodations: [
        {
          name: '北京饭店',
          location: '东城区',
          price_range: '800-1200元/晚',
          booking_link: 'https://example.com'
        }
      ],
      transportation: [],
      restaurants: [],
      total_estimated_cost: '2000元',
      tips: ['带好身份证', '提前预约景点'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 2. 插入数据到Supabase
    console.log('正在插入示例数据...');
    const { data: insertedData, error: insertError } = await supabaseClient
      .from('travel_plans')
      .insert(testPlan)
      .select();
    
    if (insertError) {
      console.error('插入数据失败:', insertError.message);
      console.log('详细错误:', insertError);
      throw insertError;
    }
    
    console.log('数据插入成功!');
    console.log('插入的数据ID:', insertedData[0].id);
    
    // 3. 验证数据是否能被读取
    console.log('\n验证数据读取...');
    const { data: retrievedData, error: retrieveError } = await supabaseClient
      .from('travel_plans')
      .select('*')
      .eq('id', insertedData[0].id)
      .single();
    
    if (retrieveError) {
      console.error('读取数据失败:', retrieveError.message);
      throw retrieveError;
    }
    
    console.log('数据读取成功!');
    console.log('读取到的目的地:', retrievedData.destination);
    console.log('读取到的行程天数:', retrievedData.duration);
    
    // 4. 获取所有旅行计划数量
    const { data: allPlans, error: allPlansError } = await supabaseClient
      .from('travel_plans')
      .select('id');
    
    if (allPlansError) {
      console.error('获取所有计划失败:', allPlansError.message);
    } else {
      console.log('\n数据库中当前有', allPlans.length, '个旅行计划');
    }
    
    console.log('\n🎉 Supabase测试成功完成!');
    console.log('您现在可以:');
    console.log('1. 在应用程序中创建和保存旅行计划');
    console.log('2. 通过Supabase控制台查看数据: https://app.supabase.com');
    console.log('3. 使用API端点操作数据');
    
  } catch (error) {
    console.error('\n❌ Supabase测试失败:', error.message);
    console.log('请检查:');
    console.log('1. Supabase配置是否正确');
    console.log('2. 表权限是否正确设置');
    console.log('3. 数据库连接是否正常');
  }
}

testSupabase();
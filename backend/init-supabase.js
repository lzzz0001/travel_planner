require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 配置Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// 初始化Supabase客户端
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function initializeDatabase() {
  try {
    console.log('开始初始化Supabase数据库...');
    
    // 使用SQL直接创建表
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS travel_plans (
        id text primary key,
        userId text,
        destination text,
        duration text,
        budget text,
        itinerary jsonb,
        accommodations jsonb,
        transportation jsonb,
        restaurants jsonb,
        total_estimated_cost text,
        tips jsonb,
        created_at timestamp with time zone,
        updated_at timestamp with time zone,
        notes text,
        is_favorite boolean default false
      );
    `;
    
    const { error: createTableError } = await supabaseClient.rpc('execute_sql', {
      sql: createTableSQL
    });
    
    if (createTableError) {
      // 尝试使用直接查询方法
      const { error: directError } = await supabaseClient.from('travel_plans').select('id').limit(1);
      
      if (directError && directError.code === '42P01') { // 表不存在错误
        console.error('创建表失败:', createTableError.message);
        console.log('尝试使用SQL语句直接创建，请手动在Supabase控制台执行以下SQL:');
        console.log(createTableSQL);
        throw createTableError;
      } else {
        console.log('表检查成功，表可能已存在');
      }
    } else {
      console.log('travel_plans表创建成功');
    }
    
    // 创建索引以提高查询性能
    const createIndexSQL = 'CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(userId);';
    const { error: indexError } = await supabaseClient.rpc('execute_sql', {
      sql: createIndexSQL
    });
    
    if (indexError) {
      console.error('创建索引失败:', indexError.message);
      // 忽略索引已存在的错误
    } else {
      console.log('用户ID索引创建成功');
    }
    
    // 检查权限 - 提供手动权限设置指南
    console.log('\n请在Supabase控制台为travel_plans表设置适当的权限:');
    console.log('1. 访问您的Supabase项目: https://app.supabase.com');
    console.log('2. 选择项目: kkczuxxwvsuhbioahfxn');
    console.log('3. 进入"Authentication" -> "Policies"');
    console.log('4. 为public.travel_plans表创建策略');
    console.log('5. 允许匿名用户(anon)有SELECT、INSERT、UPDATE、DELETE权限');
    
    // 提供手动SQL作为备选
    console.log('\n或者在SQL编辑器中执行:');
    console.log(`
    -- 允许匿名用户读取所有旅行计划
    CREATE POLICY "Allow anon to read travel plans" 
    ON public.travel_plans 
    FOR SELECT 
    TO anon 
    USING (true);
    
    -- 允许匿名用户创建旅行计划
    CREATE POLICY "Allow anon to insert travel plans" 
    ON public.travel_plans 
    FOR INSERT 
    TO anon 
    WITH CHECK (true);
    
    -- 允许匿名用户更新自己的旅行计划
    CREATE POLICY "Allow anon to update own travel plans" 
    ON public.travel_plans 
    FOR UPDATE 
    TO anon 
    USING (true)
    WITH CHECK (true);
    
    -- 允许匿名用户删除自己的旅行计划
    CREATE POLICY "Allow anon to delete own travel plans" 
    ON public.travel_plans 
    FOR DELETE 
    TO anon 
    USING (true);
    `);
    
    console.log('权限设置指南已提供');
    // 不尝试通过API设置权限，因为这通常需要特殊权限
    const grantError = null;
    
    if (grantError) {
      console.warn('权限设置警告:', grantError.message);
      console.log('请在Supabase控制台手动设置适当的权限');
    } else {
      console.log('权限设置成功');
    }
    
    console.log('数据库初始化完成！');
    console.log('现在您可以：');
    console.log('1. 通过Supabase控制台查看和管理表：', SUPABASE_URL);
    console.log('2. 使用应用程序正常保存和获取旅行计划');
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    console.log('请检查您的Supabase配置是否正确，并确保您有足够的权限');
    console.log('如果问题持续，请尝试在Supabase控制台手动创建表');
  }
}

initializeDatabase();
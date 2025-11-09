-- 创建旅行计划表SQL脚本

-- 1. 创建travel_plans表
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

-- 2. 创建用户ID索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(userId);

-- 3. 为匿名用户设置权限策略
-- 允许读取所有旅行计划
CREATE POLICY "Allow anon to read travel plans" 
ON public.travel_plans 
FOR SELECT 
TO anon 
USING (true);

-- 允许创建旅行计划
CREATE POLICY "Allow anon to insert travel plans" 
ON public.travel_plans 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- 允许更新旅行计划
CREATE POLICY "Allow anon to update travel plans" 
ON public.travel_plans 
FOR UPDATE 
TO anon 
USING (true)
WITH CHECK (true);

-- 允许删除旅行计划
CREATE POLICY "Allow anon to delete travel plans" 
ON public.travel_plans 
FOR DELETE 
TO anon 
USING (true);
import React, { useState, useEffect, useRef } from 'react';
import expenseTracker from '../utils/expenseTracker';
import VoiceRecognizer from '../utils/voiceRecognition';
import settingsManager from '../utils/settingsManager';

const ExpenseTracker = ({ itinerary }) => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '餐饮',
    date: new Date().toISOString().split('T')[0]
  });
  const [summary, setSummary] = useState({ total: 0, categories: [], categoryTotals: {} });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const voiceRecognizerRef = useRef(null);
  const [isSupported, setIsSupported] = useState(false);

  // 费用类别
  const categories = [
    '餐饮', '住宿', '交通', '景点', 
    '购物', '娱乐', '其他'
  ];

  // 从本地存储加载费用数据
  const loadExpensesFromStorage = () => {
    if (itinerary && itinerary.id) {
      const savedExpenses = localStorage.getItem(`expenses_${itinerary.id}`);
      if (savedExpenses) {
        try {
          const parsedExpenses = JSON.parse(savedExpenses);
          // 重置当前费用并加载保存的费用
          expenseTracker.expenses = [];
          parsedExpenses.forEach(exp => expenseTracker.addExpense(exp));
          console.log(`从本地存储加载了 ${parsedExpenses.length} 条费用记录`);
          return true;
        } catch (error) {
          console.error('Failed to load saved expenses:', error);
        }
      }
    }
    return false;
  };
  
  // Load expenses and summary on component mount
  useEffect(() => {
    // 首先尝试从本地存储加载数据
    const loaded = loadExpensesFromStorage();
    
    // 如果没有加载到数据或没有行程ID，至少更新状态
    updateExpenses();
    updateSummary();
    
    // Initialize voice recognizer for expense input
    voiceRecognizerRef.current = new VoiceRecognizer();
    setIsSupported(voiceRecognizerRef.current.getIsSupported());
    
    console.log('费用管理组件已挂载，数据加载状态:', loaded ? '已加载' : '无数据');
  }, []);
  
  // 当行程ID变化时重新加载对应的数据
  useEffect(() => {
    if (itinerary && itinerary.id) {
      loadExpensesFromStorage();
      updateExpenses();
      updateSummary();
    }
  }, [itinerary?.id]);
  
  // 保存费用到本地存储
  const saveExpensesToStorage = () => {
    if (itinerary && itinerary.id) {
      // 获取当前行程的费用（过滤掉其他行程的费用）
      const itineraryExpenses = expenseTracker.getExpensesByItinerary(itinerary.id);
      localStorage.setItem(`expenses_${itinerary.id}`, JSON.stringify(itineraryExpenses));
      console.log(`已保存 ${itineraryExpenses.length} 条费用记录到本地存储`);
    }
  };

  // Update expenses list
  const updateExpenses = () => {
    // 只获取当前行程的费用
    const expensesList = itinerary?.id ? 
      expenseTracker.getExpensesByItinerary(itinerary.id) : 
      expenseTracker.getExpenses();
    setExpenses(expensesList);
    saveExpensesToStorage();
  };

  // Update summary
  const updateSummary = () => {
    // 只计算当前行程的费用摘要
    const summaryData = expenseTracker.getSummary(itinerary?.id);
    setSummary(summaryData);
  };
  
  // 开始语音输入费用
  const startVoiceInput = () => {
    if (!isSupported) {
      setVoiceError('您的浏览器不支持语音识别，请尝试使用Chrome或Edge浏览器');
      return;
    }

    setVoiceError('');
    setIsListening(true);
    
    voiceRecognizerRef.current.start(
      (result) => {
        processVoiceExpense(result);
        setIsListening(false);
      },
      (err) => {
        setVoiceError(`语音识别错误: ${err}`);
        setIsListening(false);
      }
    );
  };
  
  // 处理语音输入的费用信息
  const processVoiceExpense = (transcript) => {
    // 尝试从语音文本中提取费用信息
    // 例如："午餐 85元" 或 "交通费 120元 地铁"
    const amountRegex = /(\d+(\.\d+)?)[元块]/;
    const categoryRegex = /(餐饮|住宿|交通|景点|购物|娱乐|其他)/;
    
    const amountMatch = transcript.match(amountRegex);
    const categoryMatch = transcript.match(categoryRegex);
    
    let description = transcript;
    let amount = '';
    let category = newExpense.category; // 默认使用当前选中的类别
    
    // 提取金额
    if (amountMatch) {
      amount = amountMatch[1];
      description = description.replace(amountMatch[0], '').trim();
    }
    
    // 提取类别
    if (categoryMatch) {
      const categoryMap = {
        '餐饮': '餐饮',
        '住宿': '住宿',
        '交通': '交通',
        '景点': '景点',
        '购物': '购物',
        '娱乐': '娱乐',
        '其他': '其他'
      };
      category = categoryMap[categoryMatch[1]] || category;
      description = description.replace(categoryMatch[0], '').trim();
    }
    
    // 更新表单
    setNewExpense(prev => ({
      ...prev,
      description: description || '语音添加的费用',
      amount: amount,
      category: category
    }));
  };
  
  // 停止语音输入
  const stopVoiceInput = () => {
    if (voiceRecognizerRef.current) {
      voiceRecognizerRef.current.stop();
      setIsListening(false);
    }
  };

  // 处理新费用的输入变更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  // 处理编辑表单的输入变更
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    });
  };

  // 添加新费用
  const handleAddExpense = (e) => {
    e.preventDefault();
    
    // 验证输入
    const amount = parseFloat(newExpense.amount);
    if (!newExpense.description || isNaN(amount) || amount <= 0) {
      setVoiceError('请输入有效的描述和金额');
      return;
    }
    
    try {
      expenseTracker.addExpense({
        ...newExpense,
        amount: amount,
        itineraryId: itinerary?.id // 关联到当前行程
      });
      
      // 重置表单
      setNewExpense({
        description: '',
        amount: '',
        category: '餐饮', // 修正为中文类别
        date: new Date().toISOString().split('T')[0]
      });
      setVoiceError('');
      
      // 更新状态和保存到本地存储
      updateExpenses();
      updateSummary();
      
      console.log('新费用已添加并保存');
    } catch (error) {
      setVoiceError('添加费用失败: ' + error.message);
    }
  };

  // Start editing an expense
  const startEditing = (expense) => {
    setEditingId(expense.id);
    setEditForm({ ...expense });
  };

  // Save edited expense
  const saveEdit = () => {
    if (editForm.description && editForm.amount > 0) {
      expenseTracker.updateExpense(editingId, editForm);
      setEditingId(null);
      setEditForm({});
      updateExpenses();
      updateSummary();
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Delete an expense
  const handleDelete = (id) => {
    expenseTracker.deleteExpense(id);
    updateExpenses();
    updateSummary();
  };

  // Get category color for visualization
  const getCategoryColor = (category) => {
    const colors = {
      'Food': '#FF6384',
      'Accommodation': '#36A2EB',
      'Transportation': '#FFCE56',
      'Attractions': '#4BC0C0',
      'Shopping': '#9966FF',
      'Entertainment': '#FF9F40',
      'Other': '#CCCCCC'
    };
    return colors[category] || '#888888';
  };

  // 计算预算使用百分比
  const calculateBudgetUsage = () => {
    if (!itinerary?.budget) return 0;
    // 确保budget是字符串类型后再调用replace方法
    const budgetStr = typeof itinerary.budget === 'string' ? itinerary.budget : itinerary.budget.toString();
    const plannedBudget = parseFloat(budgetStr.replace(/[^\d.]/g, ''));
    if (isNaN(plannedBudget) || plannedBudget <= 0) return 0;
    return Math.min(100, (summary.total / plannedBudget) * 100);
  };
  
  // 获取预算使用状态的颜色
  const getBudgetStatusColor = () => {
    const usage = calculateBudgetUsage();
    if (usage < 60) return '#28a745'; // 绿色
    if (usage < 80) return '#ffc107'; // 黄色
    return '#dc3545'; // 红色
  };

  return (
    <div className="expense-tracker">
      <h2>预算与费用管理</h2>
      
      {/* Budget Summary */}
      <div className="budget-summary">
        <div className="summary-card">
          <h3>总支出</h3>
          <p className="total-amount">¥{summary.total.toFixed(2)}</p>
        </div>
        
        {itinerary?.budget && (
          <div className="summary-card">
            <h3>计划预算</h3>
            <p className="budget-amount">{itinerary.budget}</p>
          </div>
        )}
        
        {itinerary?.budget && (
          <div className="summary-card">
            <h3>剩余预算</h3>
            <p className="remaining-amount" style={{ 
              color: calculateBudgetUsage() > 100 ? '#dc3545' : '#28a745' 
            }}>
              ¥{(parseFloat((typeof itinerary.budget === 'string' ? itinerary.budget : itinerary.budget.toString()).replace(/[^\d.]/g, '')) - summary.total).toFixed(2)}
            </p>
          </div>
        )}
      </div>
      
      {/* Budget Usage Progress Bar */}
      {itinerary?.budget && (
        <div className="budget-progress">
          <div className="progress-info">
            <span>预算使用情况: {calculateBudgetUsage().toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{
                width: `${calculateBudgetUsage()}%`,
                backgroundColor: getBudgetStatusColor()
              }}
            />
          </div>
        </div>
      )}
      
      {/* Voice Input Button */}
      {isSupported && (
        <button 
          className={`voice-input-button ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopVoiceInput : startVoiceInput}
        >
          {isListening ? '停止录音' : '语音添加费用'}
        </button>
      )}
      
      {voiceError && (
        <div className="error-message">
          {voiceError}
        </div>
      )}
      
      {/* Expense Breakdown */}
      {summary.categories.length > 0 && (
        <div className="expense-breakdown">
          <h3>Expense Breakdown</h3>
          <div className="category-breakdown">
            {summary.categories.map(category => (
              <div key={category} className="category-item">
                <div className="category-info">
                  <span 
                    className="category-color" 
                    style={{ backgroundColor: getCategoryColor(category) }}
                  ></span>
                  <span className="category-name">{category}</span>
                </div>
                <span className="category-amount">
                  ¥{summary.categoryTotals[category].toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add Expense Form */}
      <div className="add-expense-form">
        <h3>Add New Expense</h3>
        <form onSubmit={handleAddExpense}>
          <div className="form-row">
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={newExpense.description}
                onChange={handleInputChange}
                placeholder="What did you spend on?"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Amount (¥)</label>
              <input
                type="number"
                name="amount"
                value={newExpense.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={newExpense.category}
                onChange={handleInputChange}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={newExpense.date}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <button type="submit" className="add-expense-button">
            添加费用
          </button>
        </form>
      </div>
      
      {/* Expenses List */}
      {expenses.length > 0 && (
        <div className="expenses-list">
          <h3>费用历史</h3>
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>描述</th>
                <th>类别</th>
                <th>金额</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense.id}>
                  {editingId === expense.id ? (
                    <>
                      <td>
                        <input
                          type="date"
                          name="date"
                          value={editForm.date}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <select
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          name="amount"
                          value={editForm.amount}
                          onChange={handleEditChange}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <button onClick={saveEdit} className="save-button">保存</button>
                        <button onClick={cancelEdit} className="cancel-button">取消</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td>{expense.description}</td>
                      <td>
                        <span 
                          className="category-badge" 
                          style={{ backgroundColor: getCategoryColor(expense.category) }}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td>¥{expense.amount.toFixed(2)}</td>
                      <td>
                        <button onClick={() => startEditing(expense)} className="edit-button">编辑</button>
                        <button onClick={() => handleDelete(expense.id)} className="delete-button">删除</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
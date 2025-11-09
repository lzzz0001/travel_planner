// Utility for managing travel expenses
class ExpenseTracker {
  constructor() {
    this.expenses = [];
  }

  // Add a new expense
  addExpense(expense) {
    // 验证必要字段
    if (!expense.description || !expense.amount || expense.amount <= 0) {
      throw new Error('费用描述和有效金额是必需的');
    }
    
    const newExpense = {
      id: Date.now().toString(),
      ...expense,
      createdAt: new Date().toISOString()
    };
    
    this.expenses.push(newExpense);
    return newExpense;
  }

  // Get all expenses
  getExpenses() {
    return [...this.expenses];
  }
  
  // Get expenses for a specific itinerary
  getExpensesByItinerary(itineraryId) {
    if (!itineraryId) return this.getExpenses();
    return this.expenses.filter(expense => expense.itineraryId === itineraryId);
  }

  // Get expenses by category
  getExpensesByCategory(category) {
    return this.expenses.filter(expense => expense.category === category);
  }

  // Get total expenses
  getTotalExpenses() {
    return this.expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
  }

  // Get expenses by date range
  getExpensesByDateRange(startDate, endDate) {
    return this.expenses.filter(expense => {
      const expenseDate = new Date(expense.timestamp);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }

  // Delete an expense
  deleteExpense(id) {
    const index = this.expenses.findIndex(expense => expense.id === id);
    if (index !== -1) {
      this.expenses.splice(index, 1);
      return true;
    }
    return false;
  }
  
  // Clear all expenses (optionally for a specific itinerary)
  clearExpenses(itineraryId = null) {
    if (itineraryId) {
      this.expenses = this.expenses.filter(expense => expense.itineraryId !== itineraryId);
    } else {
      this.expenses = [];
    }
    return true;
  }

  // Update an expense
  updateExpense(id, updates) {
    // 如果更新金额，验证其有效性
    if (updates.amount !== undefined && (!updates.amount || parseFloat(updates.amount) <= 0)) {
      throw new Error('有效金额是必需的');
    }
    
    const index = this.expenses.findIndex(expense => expense.id === id);
    if (index !== -1) {
      this.expenses[index] = {
        ...this.expenses[index],
        ...updates,
        amount: updates.amount ? parseFloat(updates.amount) : this.expenses[index].amount,
        updatedAt: new Date().toISOString()
      };
      return this.expenses[index];
    }
    return null;
  }

  // Get expense categories
  getCategories() {
    const categories = this.expenses.map(expense => expense.category);
    return [...new Set(categories)];
  }

  // Get expense summary
  getSummary(itineraryId = null) {
    // 根据行程ID过滤费用
    const expenses = itineraryId ? this.getExpensesByItinerary(itineraryId) : this.expenses;
    
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Get unique categories
    const categories = [...new Set(expenses.map(expense => expense.category))];
    
    // Calculate totals by category
    const categoryTotals = {};
    const categoryPercentages = {};
    
    categories.forEach(category => {
      categoryTotals[category] = expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      
      categoryPercentages[category] = total > 0 ? 
        (categoryTotals[category] / total * 100).toFixed(1) : 0;
    });
    
    // 获取每日费用统计
    const dailyTotals = {};
    expenses.forEach(expense => {
      const date = expense.date || new Date(expense.createdAt).toISOString().split('T')[0];
      if (!dailyTotals[date]) dailyTotals[date] = 0;
      dailyTotals[date] += parseFloat(expense.amount);
    });
    
    // 计算平均每日支出
    const dailyAverage = Object.keys(dailyTotals).length > 0 ? 
      total / Object.keys(dailyTotals).length : 0;
    
    return {
      total,
      categories,
      categoryTotals,
      categoryPercentages,
      dailyTotals,
      dailyAverage,
      expenseCount: expenses.length
    };
  }
}

// Export a singleton instance
const expenseTracker = new ExpenseTracker();
export default expenseTracker;
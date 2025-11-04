// Expense tracker utility
class ExpenseTracker {
  constructor() {
    this.expenses = [];
  }

  // Add a new expense
  addExpense(expense) {
    const newExpense = {
      id: Date.now().toString(),
      ...expense,
      timestamp: new Date().toISOString()
    };
    this.expenses.push(newExpense);
    return newExpense;
  }

  // Get all expenses
  getExpenses() {
    return this.expenses;
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
    this.expenses = this.expenses.filter(expense => expense.id !== id);
  }

  // Update an expense
  updateExpense(id, updates) {
    const index = this.expenses.findIndex(expense => expense.id === id);
    if (index !== -1) {
      this.expenses[index] = { ...this.expenses[index], ...updates };
      return this.expenses[index];
    }
    return null;
  }

  // Get expense categories
  getCategories() {
    const categories = this.expenses.map(expense => expense.category);
    return [...new Set(categories)];
  }

  // Get expenses summary
  getSummary() {
    const total = this.getTotalExpenses();
    const categories = this.getCategories();
    const categoryTotals = {};

    categories.forEach(category => {
      const categoryExpenses = this.getExpensesByCategory(category);
      categoryTotals[category] = categoryExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    });

    return {
      total,
      categories,
      categoryTotals
    };
  }
}

// Export a singleton instance
const expenseTracker = new ExpenseTracker();
export default expenseTracker;
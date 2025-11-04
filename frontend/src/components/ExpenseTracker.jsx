import React, { useState, useEffect } from 'react';
import expenseTracker from '../utils/expenseTracker';

const ExpenseTracker = ({ itinerary }) => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  const [summary, setSummary] = useState({ total: 0, categories: [], categoryTotals: {} });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Expense categories
  const categories = [
    'Food', 'Accommodation', 'Transportation', 'Attractions', 
    'Shopping', 'Entertainment', 'Other'
  ];

  // Load expenses and summary on component mount
  useEffect(() => {
    updateExpenses();
    updateSummary();
  }, []);

  // Update expenses list
  const updateExpenses = () => {
    const expensesList = expenseTracker.getExpenses();
    setExpenses(expensesList);
  };

  // Update summary
  const updateSummary = () => {
    const summaryData = expenseTracker.getSummary();
    setSummary(summaryData);
  };

  // Handle input changes for new expense
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    });
  };

  // Handle input changes for edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    });
  };

  // Add a new expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (newExpense.description && newExpense.amount > 0) {
      expenseTracker.addExpense(newExpense);
      setNewExpense({
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
      });
      updateExpenses();
      updateSummary();
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

  return (
    <div className="expense-tracker">
      <h2>Budget & Expenses</h2>
      
      {/* Budget Summary */}
      <div className="budget-summary">
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p className="total-amount">¥{summary.total.toFixed(2)}</p>
        </div>
        
        {itinerary?.budget && (
          <div className="summary-card">
            <h3>Planned Budget</h3>
            <p className="budget-amount">{itinerary.budget}</p>
          </div>
        )}
        
        {itinerary?.budget && (
          <div className="summary-card">
            <h3>Remaining</h3>
            <p className="remaining-amount">
              ¥{(parseFloat(itinerary.budget.replace(/[^\d.]/g, '')) - summary.total).toFixed(2)}
            </p>
          </div>
        )}
      </div>
      
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
            Add Expense
          </button>
        </form>
      </div>
      
      {/* Expenses List */}
      {expenses.length > 0 && (
        <div className="expenses-list">
          <h3>Expense History</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Actions</th>
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
                        <button onClick={saveEdit} className="save-button">Save</button>
                        <button onClick={cancelEdit} className="cancel-button">Cancel</button>
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
                        <button onClick={() => startEditing(expense)} className="edit-button">Edit</button>
                        <button onClick={() => handleDelete(expense.id)} className="delete-button">Delete</button>
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
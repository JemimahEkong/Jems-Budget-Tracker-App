// DOM Elements
const incomeInput = document.getElementById('income');
const setIncomeBtn = document.getElementById('set-income');
const balanceEl = document.getElementById('balance');
const totalExpensesEl = document.getElementById('total-expenses');
const transactionForm = document.getElementById('transaction-form');
const transactionsEl = document.getElementById('transactions');
const categorySummaryEl = document.getElementById('category-summary-list');
const notificationEl = document.getElementById('notification');

// Data
let income = parseFloat(localStorage.getItem('income')) || 0;
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Initialize UI
incomeInput.value = income ? income : '';
updateBalance();
renderTransactions();

// Set Income
setIncomeBtn.addEventListener('click', () => {
  income = parseFloat(incomeInput.value) || 0;
  localStorage.setItem('income', income);
  updateBalance();
  showNotification(`💖 Income set to ₦${income.toFixed(2)}`, 'success');
});

// Add Transaction
transactionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const category = document.getElementById('category').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;

  if (!category || !amount || !date) {
    showNotification('⚠️ Please fill in all fields!', 'error');
    return;
  }

  const transaction = {
    id: Date.now(),
    category,
    amount,
    date
  };

  transactions.push(transaction);
  saveTransactions();
  renderTransactions();
  transactionForm.reset();
  showNotification(`✨ Expense of ₦${amount.toFixed(2)} added!`, 'success');

  if (getTotalExpenses() > income) {
    showNotification('⚠️ You are over budget!', 'error');
  }
});

// Save transactions
function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Render transactions
function renderTransactions() {
  transactionsEl.innerHTML = '';
  const categoryTotals = {};

  transactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.date}</td>
      <td>${t.category}</td>
      <td>₦${t.amount.toFixed(2)}</td>
      <td><button onclick="deleteTransaction(${t.id})">🗑️ Delete</button></td>
    `;
    transactionsEl.appendChild(tr);
  });

  totalExpensesEl.textContent = getTotalExpenses().toFixed(2);
  updateBalance();
  renderCategorySummary(categoryTotals);
}

// Delete transaction
function deleteTransaction(id) {
  const removed = transactions.find(t => t.id === id);
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  renderTransactions();
  showNotification(`🗑️ Expense of ₦${removed.amount.toFixed(2)} deleted!`, 'success');
}

// Update balance
function updateBalance() {
  const balance = income - getTotalExpenses();
  balanceEl.textContent = balance.toFixed(2);

  // Balance color
  if (balance < 0) {
    balanceEl.style.color = '#c2185b'; // red
  } else {
    balanceEl.style.color = '#27ae60'; // green
  }

  // Total expenses color
  if (getTotalExpenses() > income) {
    totalExpensesEl.style.color = '#c2185b';
  } else {
    totalExpensesEl.style.color = '#d6336c';
  }
}

// Get total expenses
function getTotalExpenses() {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

// Render category summary
function renderCategorySummary(categoryTotals) {
  categorySummaryEl.innerHTML = '';
  for (const category in categoryTotals) {
    const li = document.createElement('li');
    li.textContent = `${category}: ₦${categoryTotals[category].toFixed(2)}`;
    categorySummaryEl.appendChild(li);
  }
}

// Show notification
function showNotification(message, type) {
  notificationEl.textContent = message;
  notificationEl.className = type === 'error' ? 'error' : '';
  notificationEl.style.display = 'block';
  setTimeout(() => {
    notificationEl.style.display = 'none';
  }, 2500);
}

// Initial render
renderTransactions();

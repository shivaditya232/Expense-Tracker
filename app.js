// ===== DATA =====
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

// Current month and year (default: today)
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Chart instance (we need to destroy it before redrawing)
let myChart = null;

// Categories list
let categories = [
    { name: 'Food', emoji: '🍜' },
    { name: 'Transport', emoji: '🚕' },
    { name: 'Education', emoji: '📓' },
    { name: 'Beauty', emoji: '💄' },
    { name: 'Shopping', emoji: '🛍️' },
    { name: 'Entertainment', emoji: '🎬' },
    { name: 'Health', emoji: '💊' },
    { name: 'Others', emoji: '📦' }
];

// Colors for each category (used in chart and badges)
let categoryColors = {
    'Food': '#ff6b6b',
    'Transport': '#ffa94d',
    'Education': '#ffd43b',
    'Beauty': '#a9e34b',
    'Shopping': '#69db7c',
    'Entertainment': '#38d9a9',
    'Health': '#74c0fc',
    'Others': '#da77f2'
};

// ===== PAGE NAVIGATION =====
function showPage(page) {
    // Hide all pages
    let allPages = document.querySelectorAll('.page');
    allPages.forEach(function(p) {
        p.classList.remove('active');
    });

    // Remove active from all nav buttons
    let allBtns = document.querySelectorAll('.nav-btn');
    allBtns.forEach(function(b) {
        b.classList.remove('active');
    });

    // Show selected page and highlight button
    document.getElementById('page-' + page).classList.add('active');
    document.getElementById('btn-' + page).classList.add('active');

    // Render the right content
    if (page === 'add') {
        renderTransactions();
    }
    if (page === 'stats') {
        renderStats();
    }
    if (page === 'budget') {
        renderBudget();
    }
}

// ===== MONTH NAVIGATION =====
function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateMonthDisplay();
    refreshCurrentPage();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateMonthDisplay();
    refreshCurrentPage();
}

function updateMonthDisplay() {
    let monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    document.getElementById('current-month').textContent = monthNames[currentMonth] + ' ' + currentYear;
}

function refreshCurrentPage() {
    // Find which page is currently active and re-render it
    let activePage = document.querySelector('.page.active');
    if (activePage.id === 'page-add') renderTransactions();
    if (activePage.id === 'page-stats') renderStats();
    if (activePage.id === 'page-budget') renderBudget();
}

// ===== GET EXPENSES FOR CURRENT MONTH =====
function getCurrentMonthExpenses() {
    return expenses.filter(function(e) {
        let date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
}

// ===== ADD EXPENSE =====
function addExpense() {
    let amount = document.getElementById('amount').value;
    let category = document.getElementById('category').value;
    let description = document.getElementById('description').value;
    let payment = document.getElementById('payment').value;
    let date = document.getElementById('date').value;
    let typeInputs = document.querySelectorAll('input[name="type"]');
    let type = 'expense';

    typeInputs.forEach(function(input) {
        if (input.checked) {
            type = input.value;
        }
    });

    let msg = document.getElementById('form-msg');

    // Basic validation
    if (!amount || amount <= 0) {
        msg.textContent = 'Please enter a valid amount!';
        msg.style.color = '#ff6b6b';
        return;
    }
    if (!description) {
        msg.textContent = 'Please enter a description!';
        msg.style.color = '#ff6b6b';
        return;
    }
    if (!date) {
        msg.textContent = 'Please select a date!';
        msg.style.color = '#ff6b6b';
        return;
    }

    // Create expense object
    let newExpense = {
        id: Date.now(),
        amount: parseFloat(amount),
        category: category,
        description: description,
        payment: payment,
        date: date,
        type: type
    };

    // Save to array and localStorage
    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    msg.textContent = '✅ Transaction added successfully!';
    msg.style.color = '#69db7c';

    // Reset form fields
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    document.getElementById('date').value = '';

    // Re-render the list
    renderTransactions();

    // Check if any budget is exceeded
    checkBudgetAlert(newExpense);
}

// ===== DELETE EXPENSE =====
function deleteExpense(id) {
    expenses = expenses.filter(function(e) {
        return e.id !== id;
    });
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderTransactions();
}

// ===== RENDER TRANSACTIONS =====
function renderTransactions() {
    let monthExpenses = getCurrentMonthExpenses();

    // Calculate summary totals
    let totalIncome = 0;
    let totalExpense = 0;

    monthExpenses.forEach(function(e) {
        if (e.type === 'income') {
            totalIncome += e.amount;
        } else {
            totalExpense += e.amount;
        }
    });

    let balance = totalIncome - totalExpense;

    document.getElementById('total-income').textContent = '₹ ' + totalIncome.toFixed(2);
    document.getElementById('total-expense').textContent = '₹ ' + totalExpense.toFixed(2);
    document.getElementById('total-balance').textContent = '₹ ' + balance.toFixed(2);

    if (balance >= 0) {
        document.getElementById('total-balance').style.color = '#69db7c';
    } else {
        document.getElementById('total-balance').style.color = '#ff6b6b';
    }

    let container = document.getElementById('transaction-list');

    if (monthExpenses.length === 0) {
        container.innerHTML = '<p class="no-data">No transactions this month</p>';
        return;
    }

    // Group transactions by date
    let grouped = {};
    monthExpenses.forEach(function(e) {
        if (!grouped[e.date]) {
            grouped[e.date] = [];
        }
        grouped[e.date].push(e);
    });

    // Sort dates in descending order (latest first)
    let sortedDates = Object.keys(grouped).sort(function(a, b) {
        return new Date(b) - new Date(a);
    });

    container.innerHTML = '';

    sortedDates.forEach(function(date) {
        let dateObj = new Date(date + 'T00:00:00');
        let dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let dayName = dayNames[dateObj.getDay()];
        let dayNum = dateObj.getDate().toString().padStart(2, '0');

        // Calculate total for that day
        let dayTotal = 0;
        grouped[date].forEach(function(e) {
            if (e.type === 'expense') {
                dayTotal += e.amount;
            } else {
                dayTotal -= e.amount;
            }
        });

        let dayTotalColor = dayTotal > 0 ? '#ff6b6b' : '#69db7c';

        // Build the date group HTML
        let dateGroupDiv = document.createElement('div');
        dateGroupDiv.className = 'date-group';

        let dateHeaderHTML = `
            <div class="date-header">
                <div class="date-left">
                    <span class="day-num">${dayNum}</span>
                    <span class="day-badge">${dayName}</span>
                    <span class="date-full">${date}</span>
                </div>
                <span class="day-total" style="color: ${dayTotalColor}">₹ ${Math.abs(dayTotal).toFixed(2)}</span>
            </div>
            <div class="transactions-inner">
        `;

        let transactionsHTML = '';
        grouped[date].forEach(function(e) {
            let catObj = null;
            categories.forEach(function(c) {
                if (c.name === e.category) catObj = c;
            });

            let emoji = catObj ? catObj.emoji : '📦';
            let amountColor = e.type === 'expense' ? '#ff6b6b' : '#69db7c';
            let amountSign = e.type === 'expense' ? '-' : '+';

            transactionsHTML += `
                <div class="transaction-item">
                    <div class="trans-left">
                        <span class="cat-emoji">${emoji}</span>
                        <div class="trans-info">
                            <span class="trans-desc">${e.description}</span>
                            <span class="trans-payment">${e.payment} • ${e.category}</span>
                        </div>
                    </div>
                    <div class="trans-right">
                        <span class="trans-amount" style="color: ${amountColor}">
                            ${amountSign}₹ ${e.amount.toFixed(2)}
                        </span>
                        <button class="delete-btn" onclick="deleteExpense(${e.id})">🗑️</button>
                    </div>
                </div>
            `;
        });

        dateGroupDiv.innerHTML = dateHeaderHTML + transactionsHTML + '</div>';
        container.appendChild(dateGroupDiv);
    });
}

// ===== RENDER STATS =====
function renderStats() {
    let monthExpenses = getCurrentMonthExpenses().filter(function(e) {
        return e.type === 'expense';
    });

    let totalExpense = 0;
    monthExpenses.forEach(function(e) {
        totalExpense += e.amount;
    });

    document.getElementById('stats-total').textContent = '₹ ' + totalExpense.toFixed(2);

    // Sum per category
    let categoryTotals = {};
    categories.forEach(function(c) {
        categoryTotals[c.name] = 0;
    });
    monthExpenses.forEach(function(e) {
        categoryTotals[e.category] += e.amount;
    });

    // Get only categories that have data
    let activeCategories = categories.filter(function(c) {
        return categoryTotals[c.name] > 0;
    });

    let chartContainer = document.getElementById('chart-container');
    let categoryListDiv = document.getElementById('category-list');

    if (activeCategories.length === 0) {
        chartContainer.innerHTML = '<p class="no-data">No expense data for this month</p>';
        categoryListDiv.innerHTML = '';
        return;
    }

    // Destroy old chart before drawing a new one
    if (myChart !== null) {
        myChart.destroy();
        myChart = null;
    }

    chartContainer.innerHTML = '<canvas id="myChart"></canvas>';

    let labels = activeCategories.map(function(c) {
        return c.emoji + ' ' + c.name;
    });

    let data = activeCategories.map(function(c) {
        return categoryTotals[c.name];
    });

    let colors = activeCategories.map(function(c) {
        return categoryColors[c.name];
    });

    myChart = new Chart(document.getElementById('myChart'), {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#2a2a2a'
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        font: { size: 13 },
                        padding: 15
                    }
                }
            }
        }
    });

    // Sort by highest spending
    activeCategories.sort(function(a, b) {
        return categoryTotals[b.name] - categoryTotals[a.name];
    });

    // Render category breakdown list
    let listHTML = '';
    activeCategories.forEach(function(c) {
        let percent = 0;
        if (totalExpense > 0) {
            percent = ((categoryTotals[c.name] / totalExpense) * 100).toFixed(1);
        }
        let color = categoryColors[c.name];

        listHTML += `
            <div class="cat-item">
                <div class="cat-left">
                    <span class="cat-percent-badge" style="background-color: ${color}">${percent}%</span>
                    <span class="cat-emoji">${c.emoji}</span>
                    <span class="cat-name">${c.name}</span>
                </div>
                <span class="cat-amount">₹ ${categoryTotals[c.name].toFixed(2)}</span>
            </div>
        `;
    });

    categoryListDiv.innerHTML = listHTML;
}

// ===== RENDER BUDGET =====
function renderBudget() {
    let monthExpenses = getCurrentMonthExpenses().filter(function(e) {
        return e.type === 'expense';
    });

    let categoryTotals = {};
    categories.forEach(function(c) {
        categoryTotals[c.name] = 0;
    });
    monthExpenses.forEach(function(e) {
        categoryTotals[e.category] += e.amount;
    });

    let html = '';
    categories.forEach(function(c) {
        let spent = categoryTotals[c.name] || 0;
        let budget = budgets[c.name] || 0;

        let percent = 0;
        if (budget > 0) {
            percent = (spent / budget) * 100;
            if (percent > 100) percent = 100;
        }

        let barColor = '#69db7c';
        if (percent >= 100) {
            barColor = '#ff6b6b';
        } else if (percent >= 75) {
            barColor = '#ffa94d';
        }

        let budgetDisplay = budget > 0 ? '₹' + budget.toFixed(2) : '---';
        let alertHTML = '';
        if (budget > 0 && spent >= budget) {
            alertHTML = '<p class="budget-alert">⚠️ Budget exceeded!</p>';
        } else if (budget > 0 && percent >= 75) {
            alertHTML = '<p class="budget-warning">⚡ Approaching limit!</p>';
        }

        html += `
            <div class="budget-item">
                <div class="budget-header">
                    <span>${c.emoji} ${c.name}</span>
                    <span>₹${spent.toFixed(2)} / ${budgetDisplay}</span>
                </div>
                <div class="budget-input-row">
                    <input type="number" id="budget-${c.name}" class="budget-input"
                        placeholder="Set budget for ${c.name}..."
                        value="${budget > 0 ? budget : ''}">
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${barColor};"></div>
                </div>
                ${alertHTML}
            </div>
        `;
    });

    document.getElementById('budget-list').innerHTML = html;
}

// ===== SAVE BUDGET =====
function saveBudget() {
    categories.forEach(function(c) {
        let input = document.getElementById('budget-' + c.name);
        if (input && input.value !== '') {
            budgets[c.name] = parseFloat(input.value);
        } else {
            budgets[c.name] = 0;
        }
    });

    localStorage.setItem('budgets', JSON.stringify(budgets));

    let msg = document.getElementById('budget-msg');
    msg.textContent = '✅ Budgets saved successfully!';
    msg.style.color = '#69db7c';

    renderBudget();
}

// ===== CHECK BUDGET ALERT AFTER ADDING =====
function checkBudgetAlert(newExpense) {
    if (newExpense.type !== 'expense') return;

    let monthExpenses = getCurrentMonthExpenses().filter(function(e) {
        return e.type === 'expense';
    });

    let categoryTotal = 0;
    monthExpenses.forEach(function(e) {
        if (e.category === newExpense.category) {
            categoryTotal += e.amount;
        }
    });

    let budget = budgets[newExpense.category];
    if (budget && categoryTotal >= budget) {
        alert('⚠️ Budget Alert!\nYou have exceeded your ' + newExpense.category + ' budget of ₹' + budget.toFixed(2) + '!');
    }
}

// ===== SET TODAY'S DATE AS DEFAULT =====
function setDefaultDate() {
    let today = new Date();
    let yyyy = today.getFullYear();
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('date').value = yyyy + '-' + mm + '-' + dd;
}

// ===== INITIALIZE APP =====
updateMonthDisplay();
setDefaultDate();
renderTransactions();

'use strict';

const totalBudget = 5000;
let totalSpent = 0;
let budgetLeft = 5000;
let date;
let savedData = [];
// Element Selector

const headerDate = document.querySelector('#currentDate');
const btnExpense = document.querySelector('#expenseForm');
const totalBudgetEl = document.querySelector('#totalBudget');
const totalSpentEl = document.querySelector('#totalSpent');
const budgetLeftEl = document.querySelector('#budgetLeft');
const inputAmount = document.querySelector('.inputAmount');
const inputCategory = document.querySelector('#category');
const inputDescription = document.querySelector('#description');
const dateEl = document.querySelector('#date');
const expensesList = document.querySelector('#expensesList');
const btnReset = document.querySelector('.btn-reset');
const btnFilter = document.querySelectorAll('.filter-btn');
const btnDelete = document.querySelectorAll('.btn-delete');
// Setting deafault value
totalBudgetEl.textContent = '₹' + totalBudget;
headerDate.textContent = new Date().toLocaleDateString('en-IN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
});

// Functions

const updateHTMLel = function (data) {
  data.forEach((data, i) => {
    const html = `<div class="expense-item">
                <div class="expense-details">
                <div class="expense-amount">-₹${data.inputAmount}</div>
                <div class="expense-category">${data.category}</div>
                <div class="expense-description">${data.description}</div>
                <div class="expense-date">${data.date}</div>
              </div>
              <button class="btn btn-small btn-danger btn-delete" data-delete='${i}'>Delete</button>
            </div>`;
    // expensesList.insertAdjacentHTML('beforeend', html);
    expensesList.innerHTML += html;
  });
};

const updateUI = function () {
  totalSpentEl.textContent = '₹' + totalSpent;
  budgetLeftEl.textContent = '₹' + budgetLeft;
};

document.addEventListener('DOMContentLoaded', function () {
  const data = JSON.parse(localStorage.getItem('data'));
  if (data) {
    savedData = data;
    expensesList.innerHTML = '';
    savedData.forEach(data => {
      totalSpent += +data.inputAmount;
      budgetLeft -= +data.inputAmount;
    });
    updateHTMLel(savedData);
    updateUI();
  }
  const today = new Date();

  // Format as yyyy-mm-dd (required for input[type="date"])
  const formattedDate = today.toISOString().split('T')[0];
  dateEl.value = formattedDate;
});

btnExpense.addEventListener('submit', function (e) {
  e.preventDefault();
  if (budgetLeft > +inputAmount.value) {
    budgetLeft -= +inputAmount.value;
    totalSpent += +inputAmount.value;
    date = new Date(new Date(dateEl.value)).toLocaleDateString();
    expensesList.innerHTML = '';
    savedData.push({
      date: date,
      category: inputCategory.value,
      description: inputDescription.value,
      inputAmount: inputAmount.value,
    });

    updateHTMLel(savedData);
    updateUI();
    localStorage.setItem('data', JSON.stringify(savedData));
    inputAmount.value = inputCategory.value = inputDescription.value = '';
  } else alert(`You don't have enough budget to spent 😔`);
});

btnReset.addEventListener('click', function () {
  localStorage.removeItem('data');
});

btnFilter.forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    btnFilter.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    expensesList.innerHTML = '';

    if (e.target.dataset.filter !== 'all') {
      const filter = savedData.filter(
        data => data.category === e.target.dataset.filter
      );
      console.log(filter);
      updateHTMLel(filter);
    } else {
      updateHTMLel(savedData);
    }
  });
});

expensesList.addEventListener('click', function (e) {
  e.preventDefault();
  if (!e.target.classList.contains('btn-delete')) return;
  totalSpent = 0;
  budgetLeft = 5000;
  expensesList.innerHTML = '';
  savedData.splice(+e.target.dataset.delete, 1);
  savedData.forEach(data => {
    totalSpent += +data.inputAmount;
    budgetLeft -= +data.inputAmount;
  });
  updateHTMLel(savedData);
  updateUI();
  localStorage.setItem('data', JSON.stringify(savedData));
});

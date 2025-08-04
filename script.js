'use strict';
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
const emptyList = document.querySelector('.empty-state');

////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

class App {
  #totalBudget = 5000;
  #totalSpent = 0;
  #budgetLeft = 5000;
  #date;
  #savedData = [];
  constructor() {
    this._startupContent();
    this._displayDate();
    document.addEventListener(
      'DOMContentLoaded',
      this._previousDataLoading.bind(this)
    );
    btnExpense.addEventListener('submit', this._expenseCalculator.bind(this));
    btnReset.addEventListener('click', this._resetAll.bind(this));
    btnFilter.forEach(btn =>
      btn.addEventListener('click', this._filter.bind(this))
    );
    expensesList.addEventListener('click', this._deleteExpense.bind(this));
  }

  _startupContent() {
    totalBudgetEl.textContent = '₹' + this.#totalBudget;
    headerDate.textContent = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }

  _displayDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    dateEl.value = formattedDate;
  }

  _updateExpenseList(data) {
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
      expensesList.innerHTML += html;
    });
  }

  _updateUI() {
    totalSpentEl.textContent = '₹' + this.#totalSpent;
    budgetLeftEl.textContent = '₹' + this.#budgetLeft;
  }

  _previousDataLoading() {
    const data = JSON.parse(localStorage.getItem('data'));
    if (data) {
      this.#savedData = data;
      expensesList.innerHTML = '';
      this.#savedData.forEach(data => {
        this.#totalSpent += +data.inputAmount;
        this.#budgetLeft -= +data.inputAmount;
      });
      emptyList.style.opacity = 0;

      this._updateExpenseList(this.#savedData);
      this._updateUI();
    } else emptyList.style.opacity = 1;
  }

  _expenseCalculator(e) {
    e.preventDefault();
    if (this.#budgetLeft >= +inputAmount.value) {
      this.#budgetLeft -= +inputAmount.value;
      this.#totalSpent += +inputAmount.value;
      this.#date = new Date(new Date(dateEl.value)).toLocaleDateString();
      expensesList.innerHTML = '';
      this.#savedData.push({
        date: this.#date,
        category: inputCategory.value,
        description: inputDescription.value,
        inputAmount: inputAmount.value,
      });

      this._updateExpenseList(this.#savedData);
      this._updateUI();
      localStorage.setItem('data', JSON.stringify(this.#savedData));
      inputAmount.value = inputCategory.value = inputDescription.value = '';
      emptyList.style.opacity = 0;
    } else alert(`You don't have enough budget to spent 😔`);
  }

  _resetAll() {
    localStorage.removeItem('data');
    this.#savedData = [];
    expensesList.innerHTML = '';
    emptyList.style.opacity = 1;
    this.#totalSpent = 0;
    this.#budgetLeft = 5000;
    this._updateUI();
  }

  _filter(e) {
    e.preventDefault();
    btnFilter.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    expensesList.innerHTML = '';

    if (e.target.dataset.filter !== 'all') {
      const filter = this.#savedData.filter(
        data => data.category === e.target.dataset.filter
      );
      this._updateExpenseList(filter);
    } else if (e.target.dataset.filter === 'all') {
      this._updateExpenseList(this.#savedData);
    }
  }

  _deleteExpense(e) {
    e.preventDefault();
    if (!e.target.classList.contains('btn-delete')) return;
    this.#totalSpent = 0;
    this.#budgetLeft = 5000;
    expensesList.innerHTML = '';
    this.#savedData.splice(+e.target.dataset.delete, 1);
    this.#savedData.forEach(data => {
      this.#totalSpent += +data.inputAmount;
      this.#budgetLeft -= +data.inputAmount;
    });
    this._updateExpenseList(this.#savedData);
    this._updateUI();
    localStorage.setItem('data', JSON.stringify(this.#savedData));
  }

  _changeBudget(value) {
    this.#totalBudget += value;
    this.#budgetLeft += value;
    this._startupContent();
    this._updateUI();
  }
}

const app = new App();

app._changeBudget(5000);

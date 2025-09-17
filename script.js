"use strict";
// Element Selector

const headerDate = document.querySelector("#currentDate");
const btnExpense = document.querySelector("#expenseForm");
const totalBudgetEl = document.querySelector("#totalBudget");
const totalSpentEl = document.querySelector("#totalSpent");
const budgetLeftEl = document.querySelector("#budgetLeft");
const inputAmount = document.querySelector(".inputAmount");
const inputTransactionType = document.querySelector("#transaction-type");
const inputCategory = document.querySelector("#category");
const inputDescription = document.querySelector("#description");
const dateEl = document.querySelector("#date");
const expensesList = document.querySelector("#expensesList");
const btnSubmit = document.querySelector(".btn-submit");
const btnReset = document.querySelector(".btn-reset");
const btnFilter = document.querySelectorAll(".filter-btn");
const btnDelete = document.querySelectorAll(".btn-delete");
const emptyList = document.querySelector(".empty-state");
const btnFilterAll = document.querySelector(".filter-btn-all");

const localeCurrencyMap = {
  "en-US": "USD",
  "en-GB": "GBP",
  "en-CA": "CAD",
  "en-AU": "AUD",
  "en-IN": "INR",
  "de-DE": "EUR",
  "fr-FR": "EUR",
  "ja-JP": "JPY",
  "zh-CN": "CNY",
  "ko-KR": "KRW",
  "ru-RU": "RUB",
  "pt-BR": "BRL",
  "es-ES": "EUR",
  "it-IT": "EUR",
  "nl-NL": "EUR",
};

const categoryData = {
  income: [
    { value: "Salary", text: "💸 Salary" },
    { value: "others", text: "🤑 Other" },
  ],
  expense: [
    { value: "Food", text: "🍕 Food" },
    { value: "Grocery", text: "🛒 Grocery" },
    { value: "Transport", text: "🚗 Transport" },
    { value: "Entertainment", text: "🎬 Entertainment" },
    { value: "Shopping", text: "💳 Shopping" },
    { value: "Bills", text: "💡 Bills" },
    { value: "Health", text: "🏥 Health" },
    { value: "Other", text: "📋 Other" },
  ],
};

////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

class App {
  transactionType;
  #currency = localeCurrencyMap[navigator.language] || "INR";
  #totalBudget = 0;
  #totalSpent = 0;
  #budgetLeft = this.#totalBudget;
  #date;
  #savedData = [];
  constructor() {
    this._startupContent();
    this._displayDate();
    document.addEventListener(
      "DOMContentLoaded",
      this._previousDataLoading.bind(this)
    );
    inputTransactionType.addEventListener("change", this._changeCategory);
    btnExpense.addEventListener("submit", this._expenseCalculator.bind(this));
    btnReset.addEventListener("click", this._resetAll.bind(this));
    btnFilter.forEach((btn) =>
      btn.addEventListener("click", this._filter.bind(this))
    );
    expensesList.addEventListener("click", this._deleteExpense.bind(this));
  }

  _startupContent() {
    totalBudgetEl.textContent = this._formatCurrency(this.#totalBudget);
    headerDate.textContent = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }

  _displayDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    dateEl.value = formattedDate;
  }

  // Formatting numbers and currency

  _formatCurrency(num) {
    return new Intl.NumberFormat(navigator.language, {
      style: "currency",
      currency: this.#currency,
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
      maximumFractionDigits: num % 1 === 0 ? 0 : 2,
    }).format(num);
  }

  _updateExpenseList(data) {
    data.forEach((data, i) => {
      const html = `<div class="expense-item">
                <div class="expense-details">
                <div class="${data.transactionType}-amount">${
        data.transactionType === "expense"
          ? "-" + this._formatCurrency(data.inputAmount)
          : "+" + this._formatCurrency(data.inputAmount)
      }</div>
                <div class="expense-category">${data.category}</div>
                <div class="expense-description">${data.description}</div>
                <div class="expense-date">${data.date}</div>
              </div>
              <button class="btn btn-small btn-danger btn-delete" data-id='${
                data.id
              }'>Delete</button>
            </div>`;
      expensesList.innerHTML += html;
    });
  }

  _updateUI() {
    totalBudgetEl.textContent = this._formatCurrency(this.#totalBudget);
    totalSpentEl.textContent = this._formatCurrency(this.#totalSpent);
    budgetLeftEl.textContent = this._formatCurrency(this.#budgetLeft);
    if (this.#savedData.length === 0) emptyList.style.opacity = 1;
  }

  _previousDataLoading() {
    const data = JSON.parse(localStorage.getItem("data"));

    if (data) {
      this.#savedData = data;
      expensesList.innerHTML = "";
      this.#savedData.forEach((data) => {
        if (data.transactionType === "expense") {
          this.#totalSpent += +data.inputAmount;
          this.#budgetLeft -= +data.inputAmount;
        }
        if (data.transactionType === "income") {
          this.#totalBudget += +data.inputAmount;
          this.#budgetLeft += +data.inputAmount;
        }
      });
      emptyList.style.opacity = 0;

      this._updateExpenseList(this.#savedData);
      this._updateUI();
    } else emptyList.style.opacity = 1;
  }

  // Changing cateogry according to Transaction Type

  _changeCategory() {
    const selectedCategory = this.value;
    inputCategory.innerHTML = '<option value="">Select Category</option>';

    if (selectedCategory && categoryData[selectedCategory]) {
      categoryData[selectedCategory].forEach((item) => {
        const option = document.createElement("option");
        option.value = item.value;
        option.text = item.text;
        inputCategory.appendChild(option);
      });
    }
    if (this.value !== "") {
      btnSubmit.textContent = `Add ${this.value}`;
    }
  }

  _expenseCalculator(e) {
    e.preventDefault();
    if (+inputAmount.value === 0) {
      inputAmount.value =
        inputTransactionType.value =
        inputCategory.value =
        inputDescription.value =
          "";
      inputAmount.focus();
      return alert("Income/Expense cannot be 0. Please Enter a valid value.");
    }
    if (inputTransactionType.value === "expense") {
      this.#budgetLeft -= +inputAmount.value;
      this.#totalSpent += +inputAmount.value;
      this.transactionType = "expense";
    } else if (inputTransactionType.value === "income") {
      this.#totalBudget += +inputAmount.value;
      this.#budgetLeft += +inputAmount.value;
      this.transactionType = "income";
    }

    this.#date = new Date(new Date(dateEl.value)).toLocaleDateString();
    expensesList.innerHTML = "";
    this.#savedData.push({
      date: this.#date,
      category: inputCategory.value,
      description: inputDescription.value,
      inputAmount: +inputAmount.value,
      transactionType: this.transactionType,
      id: Date.now(),
    });
    this._updateExpenseList(this.#savedData);
    this._updateUI();
    localStorage.setItem("data", JSON.stringify(this.#savedData));
    inputAmount.value =
      inputTransactionType.value =
      inputCategory.value =
      inputDescription.value =
        "";
    emptyList.style.opacity = 0;
    btnFilter.forEach((btn) => btn.classList.remove("active"));
    btnFilterAll.classList.add("active");
  }

  _resetAll() {
    const confirmed = window.confirm(
      "Are you sure you want to remove all your expenses/incomes?"
    );
    if (!confirmed) return;
    localStorage.removeItem("data");
    this.#savedData = [];
    expensesList.innerHTML = "";
    emptyList.style.opacity = 1;
    this.#totalSpent = 0;
    this.#totalBudget = 0;
    this.#budgetLeft = this.#totalBudget;
    this._updateUI();
  }

  _filter(e) {
    e.preventDefault();
    btnFilter.forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");
    expensesList.innerHTML = "";

    if (e.target.dataset.filter !== "all") {
      const filter = this.#savedData.filter(
        (data) => data.category === e.target.dataset.filter
      );
      this._updateExpenseList(filter);
    } else if (e.target.dataset.filter === "all") {
      this._updateExpenseList(this.#savedData);
    }
  }

  _deleteExpense(e) {
    e.preventDefault();
    if (!e.target.classList.contains("btn-delete")) return;
    const currentDataIndex = this.#savedData.filter(
      (data) => data.id === +e.target.dataset.id
    );
    const [dataset] = currentDataIndex;
    if (dataset.transactionType === "expense") {
      this.#totalSpent -= +dataset.inputAmount;
      this.#budgetLeft += +dataset.inputAmount;
    }
    if (dataset.transactionType === "income") {
      this.#totalBudget -= +dataset.inputAmount;
      this.#budgetLeft -= +dataset.inputAmount;
    }

    expensesList.innerHTML = "";
    this.#savedData = this.#savedData.filter(
      (data) => data.id !== +e.target.dataset.id
    );
    btnFilter.forEach((btn) => btn.classList.remove("active"));
    btnFilterAll.classList.add("active");
    this._updateExpenseList(this.#savedData);
    this._updateUI();
    localStorage.setItem("data", JSON.stringify(this.#savedData));
  }
}

const app = new App();

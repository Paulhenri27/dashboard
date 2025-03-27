<template>
  <div class="dashboard">
    <Header :user="user" :balance="balance" :openTransactionForm="openTransactionForm"/>
    <div class="content">
<!--      <Sidebar :user="user" :balance="balance" :openTransactionForm="openTransactionForm" />-->
      <main>
<!--        <h2>Finance Tracker</h2>-->
        <div class="cards">
          <Card title="Total Balance" :value="balance" subValue="USD" bgColor="#fffaf0" />
          <Card title="Total Spending" :value="totalSpending" subValue="USD" bgColor="#f0f9ff" />
          <Card title="Total Income" :value="totalIncome" subValue="USD" bgColor="#e6f7ff" />
        </div>
        <div class="stats">
          <div class="chart">
            <PieChart :transactions="transactions" />
          </div>
          <div class="recent-transactions">
            <h4>Recent Transactions</h4>
            <Table
                :transactions="transactions"
                :categories="categories"
                @search="fetchTransactionsByDescription"
                @deleteTransaction="deleteTransaction"
                @applyFilters="fetchTransactionsByDate"
            />
          </div>
        </div>
        <div class="balance-chart">
          <h3>Daily Balance Over Time</h3>
          <LineChart :dailyBalances="dailyBalances" />
        </div>
      </main>
    </div>
    <div v-if="showTransactionForm" class="popup-overlay">
      <div class="popup-form">
        <h3>Add Transaction</h3>
        <form @submit.prevent="addTransaction">
          <div>
            <label for="description">Description:</label>
            <input type="text" v-model="transaction.description" required />
          </div>
          <div>
            <label for="amount">Amount:</label>
            <input type="text" v-model="transaction.amount" required />
          </div>
          <div>
            <label for="date">Date:</label>
            <input type="datetime-local" v-model="transaction.date" required />
          </div>
          <div>
            <label for="category">Category:</label>
            <select v-model="transaction.category.name">
              <option v-for="(category, index) in categories" :key="index" :value="category.name">
                {{ category.name }}
              </option>
            </select>
          </div>
          <button type="submit">Submit</button>
          <button type="button" @click="closeTransactionForm">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "../components/Header.vue";
import Sidebar from "../components/Sidebar.vue";
import Card from "../components/Card.vue";
import PieChart from "../components/PieChart.vue";
import LineChart from "../components/LineChart.vue";
import Table from "../components/Table.vue";

export default {
  components: { Header, Sidebar, Card, PieChart, LineChart, Table },
  data() {
    return {
      user: { firstName: "", lastName: "" },
      balance: 0,
      transactions: [],
      categories: [],
      showTransactionForm: false,
      transaction: {
        description: "",
        amount: null,
        date: "",
        category: { name: "" },
      },
      dailyBalances: [],
    };
  },
  computed: {
    totalSpending() {
      return this.transactions
          .filter((t) => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    },
    totalIncome() {
      return this.transactions
          .filter((t) => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);
    },
  },
  mounted() {
    this.getUser();
    this.getCategories();
    this.fetchTransactionsByAscendingOrder();
  },
  methods: {
    openTransactionForm() {
      this.showTransactionForm = true;
    },
    closeTransactionForm() {
      this.showTransactionForm = false;
    },
    getUser() {
      const token = localStorage.getItem("token");
      const parts = token.split(".");
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      const email = payload.sub;

      fetch("https://finance.rhea.comagno.com/get-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
          .then((response) => {
            if (response.ok) return response.json();
            throw new Error("Failed to fetch user");
          })
          .then((data) => {
            this.user = data;
          })
          .catch((error) => {
            console.error("Error fetching user:", error.message);
          });
    },
    getCategories() {
      fetch("https://finance.rhea.comagno.com/get-categories", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
          .then((response) => {
            if (response.ok) return response.json();
            throw new Error("Failed to fetch categories");
          })
          .then((data) => {
            this.categories = data;
          })
          .catch((error) => {
            console.error("Error fetching categories:", error.message);
          });
    },
    fetchTransactionsByDescription(description) {
      let url = "https://finance.rhea.comagno.com/get-by-description?";
      if (description.trim()) {
        url += `description=${encodeURIComponent(description)}`;
      } else {
        url += "description";
      }

      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
          .then((response) => {
            if (response.ok) return response.json();
            throw new Error("Failed to fetch transactions by description");
          })
          .then((data) => {
            this.transactions = data;
            this.balance = data.reduce((sum, t) => sum + t.amount, 0);
            this.renderChart();
          })
          .catch((error) => {
            console.error("Error fetching transactions by description:", error.message);
          });
    },
    fetchTransactionsByDate(filters) {
      const params = new URLSearchParams();
      if (filters.categoryName) {
        params.append("categoryName", filters.categoryName);
      }
      if (filters.startDate) {
        params.append("startDate", new Date(filters.startDate).toISOString());
      }
      if (filters.endDate) {
        let end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        params.append("endDate", end.toISOString());
      }

      const url = `https://finance.rhea.comagno.com/get-transactions-by-date?${params.toString()}`;

      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
          .then((response) => {
            if (response.ok) return response.json();
            throw new Error("Failed to fetch transactions");
          })
          .then((data) => {
            this.transactions = data;
            this.balance = data.reduce((sum, t) => sum + t.amount, 0);
            this.renderChart();
          })
          .catch((error) => {
            console.error("Error fetching transactions:", error.message);
          });
    },
    addTransaction() {
      if (this.transaction.category.name === "Spending" || this.transaction.category.name === "Investment" || this.transaction.category.name === "Debt" ) {
        this.transaction.amount = -Math.abs(this.transaction.amount);
      }

      fetch("https://finance.rhea.comagno.com/add-transaction", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.transaction),
      })
          .then((response) => {
            if (response.ok) return response.text();
            throw new Error("Failed to add transaction");
          })
          .then(() => {
            this.closeTransactionForm();
            this.transaction = {
              description: "",
              amount: null,
              date: "",
              category: { name: "" },
            };
            this.fetchTransactionsByAscendingOrder();
            this.calculateDailyBalance();
          })
          .catch((error) => {
            console.error("Error adding transaction:", error.message);
          });
    },
    deleteTransaction(transaction) {
      const params = new URLSearchParams();
      if (transaction) {
        params.append("transactionId", transaction.id);
      }
      const url = `https://finance.rhea.comagno.com/delete-transaction?${params}`;

      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
          .then((response) => {
            if (response.ok) return response.json();
            throw new Error("Failed to fetch transactions");
          })
          .then((data) => {
            this.transactions = data;
            console.log(this.transactions);
            this.balance = data.reduce((sum, t) => sum + t.amount, 0);
            this.renderChart();
            this.calculateDailyBalance();
          })
          .catch((error) => {
            console.error("Error deleting transaction:", error.message);
          });
    },
    fetchTransactionsByAscendingOrder() {
      fetch("https://finance.rhea.comagno.com/get-transactions", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
          .then((response) => {
            if (response.ok) return response.json();
            throw new Error("Failed to fetch transactions");
          })
          .then((data) => {
            this.transactions = data;
            this.balance = data.reduce((sum, t) => sum + t.amount, 0);
            this.calculateDailyBalance();
          })
          .catch((error) => {
            console.error("Error fetching transactions:", error.message);
          });
    },
    calculateDailyBalance() {
      const groupedTransactions = this.transactions.reduce((acc, t) => {
        const date = new Date(t.date).toISOString().split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(t);
        return acc;
      }, {});

      const dailyBalances = [];
      let cumulativeBalance = 0;

      Object.keys(groupedTransactions)
          .sort()
          .forEach((date) => {
            const dailyTotal = groupedTransactions[date].reduce(
                (sum, t) => sum + t.amount,
                0
            );
            cumulativeBalance += dailyTotal;
            dailyBalances.push({ date, balance: cumulativeBalance });
          });

      this.dailyBalances = dailyBalances;
    },
    renderChart() {
      const ctx = this.$refs.chart.getContext("2d");
      if (this.chart) this.chart.destroy();

      this.chart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: this.transactions.map((t) => t.description),
          datasets: [
            {
              label: "Amount",
              data: this.transactions.map((t) => t.amount),
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },
  },
};
</script>

<style scoped>

//.content{
//  padding: 100px;
//}


main{
  flex: 5;
}

.cards{
  display: flex;
  justify-content: center;
}
/* Popup overlay */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Popup form */
.popup-form {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 400px;
  z-index: 20;
  font-family: Arial, sans-serif;
}

.popup-form form div{
  margin: 20px 0;
  margin-right: 15px;
}

/* Form heading */
.popup-form h3 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

/* Form labels */
.popup-form label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  color: #555;
}

/* Form inputs */
.popup-form input,
.popup-form select {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}

/* Focus state for inputs */
.popup-form input:focus,
.popup-form select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}



/* Buttons */
.popup-form button {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.popup-form button:hover {
  background-color: #0056b3;
}

.popup-form button[type="button"] {
  margin-left: 16px;
  background-color: #dc3545;
}

.popup-form button[type="button"]:hover {
  background-color: #c82333;
}

.balance-chart {
  width: 100%;
  height: 300px;
  margin-top: 20px;
}
/* Responsive adjustments */
@media (max-width: 480px) {
  .popup-form {
    width: 90%;
  }
}



</style>
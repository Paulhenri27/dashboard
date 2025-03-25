<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <h3 v-if="user.firstName.length > 0 && user.lastName.length > 0">
        Welcome {{ user.firstName + " " + user.lastName }}
      </h3>
      <h3 v-else-if="user.firstName.length > 0 && user.lastName.length <= 0">
        Welcome {{ user.firstName }}
      </h3>
      <h3 v-else-if="user.lastName.length > 0 && user.firstName.length <= 0">
        Welcome {{ user.lastName }}
      </h3>
      <h3 v-else>Welcome</h3>
      <p>Balance: {{ balance }}</p>
      <p>Amount: {{ amount }}</p>
      <button @click="openTransactionForm">Add Transaction</button>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Popup Form -->
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
                <option v-for="(category, index) in categories" :key="index" :value="category.name">{{ category.name }}</option>
              </select>
            </div>
            <button type="submit">Submit</button>
            <button type="button" @click="closeTransactionForm">Cancel</button>
          </form>
        </div>
      </div>

      <!-- Transactions Table -->
      <table>
        <thead>
        <tr>
          <th>
            Description
            <input
                type="text"
                v-model="descriptionSearch"
                @input="fetchTransactionsByDescription"
                placeholder="Search description"
            />
          </th>
          <th>Amount</th>
          <th>
            Date
            <span class="calendar-icon" @click="toggleCalendar">📅</span>
            <div v-if="showCalendar" class="calendar-modal">
              <input type="date" v-model="transaction.startDate" placeholder="Start Date" />
              <input type="date" v-model="transaction.endDate" placeholder="End Date" />
              <button @click="applyDateFilters">Apply</button>
            </div>
          </th>
          <th>
            Category
            <select v-model="transaction.category.name" @change="fetchTransactionsByDate">
              <option v-for="(category, index) in categories" :key="index" :value="category.name">{{ category.name }}</option>
            </select>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(transaction, index) in transactions" :key="index">
          <td>{{ transaction.description }}</td>
          <td>{{ transaction.amount }}</td>
          <td>{{ formatDate(transaction.date) }}</td>
          <td>
            {{ transaction.category.name }}
            <button @click="deleteTransaction(transaction)">delete</button>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Pie Chart -->
      <div class="pie-chart">
        <h3>Transaction Breakdown</h3>
        <canvas ref="chart"></canvas>
      </div>

      <div class="balance-chart">
        <h3>Daily Balance Over Time</h3>
        <canvas ref="balanceChart"></canvas>
      </div>
    </main>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  data() {
    return {
      username: 'User Name',
      descriptionSearch: '',
      showTransactionForm: false,
      transaction: {
        description: '',
        amount: null,
        date: '',
        category: {
          name: '',
        },
        startDate: '',
        endDate: '',
      },
      user: {
        firstName: '',
        lastName: '',
      },
      displayName: {
        email: '',
      },
      balance: 0,
      amount : 0,
      transactions: [],
      categories : [],
      filteredTransactions  : [],
      showCalendar: false,
    };
  },
  mounted() {
    this.fetchTransactionsByDate();
    this.renderChart();
    this.getUser();
    this.fetchTransactionsByAscendingOrder();
    this.getCategories();
  },
  methods: {
    openTransactionForm()
    {
      this.showTransactionForm = true;
    },
    deleteTransaction(transaction)
    {
      console.log("graph");
      const params = new URLSearchParams();
      if (transaction)
      {
        params.append('transactionId', transaction.id);
      }
      const url = `http://rhea.sasg.de:8080/delete-transaction?${params}`;

      fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
          .then((response) => {
            if (response.ok) {
              return response.json();

            } else {
              throw new Error('Failed to fetch transactions');
            }
          })
          .then((data) => {
            this.transactions = data;
            this.renderChart();
            this.renderGraph();
            this.fetchTransactionsByDate();
            this.fetchTransactionsByAscendingOrder();
          })
          .catch((error) => {
            console.log('Error fetching transactions: ' + error.message);
          });
    },
    closeTransactionForm() {
      this.showTransactionForm = false;
    },
    getCategories()
    {
      fetch('http://rhea.sasg.de:8080/get-categories',
          {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Failed to fetch categories');
            }
          })
          .then((data) => {

            this.categories = data;
          })
          .catch((error) => {
            console.log('Error fetching categories: ' + error.message);
          });
    },
    fetchTransactionsByDescription()
    {
      let url = 'http://rhea.sasg.de:8080/get-by-description?';
      if (this.descriptionSearch.trim() === '')
      {
        url += 'description';
      }
      else
      {
        url += 'description=' + encodeURIComponent(this.descriptionSearch);
      }
      fetch(url,
  {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Failed to fetch transactions by description');
          })
          .then((data) => {
            this.transactions = data;
            this.amount = data.reduce((sum, t) => sum + t.amount, 0);
            this.renderChart();
          })
          .catch((error) => {
            console.log('Error fetching transactions by description: ' + error.message);
          });
    },
    addTransaction()
    {
      if(this.transaction.category.name === "Spending")
      {
        this.transaction.amount = -this.transaction.amount;
      }

     fetch('http://rhea.sasg.de:8080/add-transaction',
 {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(this.transaction),
      })
          .then((response) =>
          {
            if (response.ok)
            {
              return response.text();
            }
            else
            {
              throw new Error('Failed to add transaction');
            }
          })
          .then(() =>
          {
            this.closeTransactionForm();
            this.transaction.category.name = '';
            this.transaction.description = '';
            this.transaction.amount = null;
            this.transaction.date = '';
            this.fetchTransactionsByDate();
            this.fetchTransactionsByAscendingOrder();
          })
          .catch((error) => {
            console.log('Error adding transaction: ' + error.message);
          });
    },
    fetchTransactionsByDate()
    {
      const params = new URLSearchParams();

      if (this.transaction.category.name)
      {
        params.append('categoryName', this.transaction.category.name);
      }
      if (this.transaction.startDate)
      {
        params.append('startDate', new Date(this.transaction.startDate).toISOString());
      }
      if (this.transaction.endDate)
      {
        let end = new Date(this.transaction.endDate);
        end.setHours(23, 59, 59, 999);
        params.append('endDate', end.toISOString());
      }

      const url = `http://rhea.sasg.de:8080/get-transactions-by-date?${params.toString()}`;
      fetch(url,
          {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
          .then((response) =>
          {
            if (response.ok)
            {
              return response.json();

            }
            else
            {
              throw new Error('Failed to fetch transactions');
            }
          })
          .then((data) =>
          {
            this.transactions = data;
            this.amount = data.reduce((sum, t) => sum + t.amount, 0);
            this.renderChart();
          })
          .catch((error) => {
            console.log('Error fetching transactions: ' + error.message);
          });
    },
    fetchTransactionsByAscendingOrder()
    {
      fetch("http://rhea.sasg.de:8080/get-transactions", {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Failed to fetch transactions');
            }
          })
          .then((data) => {
            this.balance = data.reduce((sum, t) => sum + t.amount, 0);
            this.filteredTransactions = data;
            this.calculateDailyBalance();
            this.renderGraph();
          })
          .catch((error) => {
            console.log('Error fetching transactions: ' + error.message);
          });
    },
    calculateDailyBalance()
    {
      const dailyBalances = [];
      let cumulativeBalance = 0;


      const groupedTransactions = this.filteredTransactions.reduce((acc, transaction) =>
      {
        const date = new Date(transaction.date).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(transaction);
        return acc;
      }, {});

      Object.keys(groupedTransactions)
          .sort()
          .forEach((date) =>
          {
            const transactionsForDay = groupedTransactions[date];
            const dailyTotal = transactionsForDay.reduce((sum, t) => sum + t.amount, 0);
            cumulativeBalance += dailyTotal;
            dailyBalances.push({ date, balance: cumulativeBalance });
          });

      this.dailyBalances = dailyBalances;
    },
    getUser()
    {
      let token = localStorage.getItem('token');
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      this.displayName.email = payload.sub;

      fetch('http://rhea.sasg.de:8080/get-user',
          {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.displayName),
      })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Failed to fetch transactions');
            }
          })
          .then((data) => {
            this.user = data;
          })
          .catch((error) => {
            console.log('Error fetching transactions: ' + error.message);
          });
    },
    renderChart() {
      const ctx = this.$refs.chart.getContext('2d');
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.transactions.map((t) => t.description),
          datasets: [
            {
              label: 'Amoun',
              data: this.transactions.map((t) => t.amount),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },
    renderGraph() {
      const ctx = this.$refs.balanceChart.getContext('2d');
      if (this.balanceChart) {
        this.balanceChart.destroy(); // Destroy previous chart instance
      }

      this.balanceChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.dailyBalances.map((day) => day.date),
          datasets: [
            {
              label: 'Daily Balance',
              data: this.dailyBalances.map((day) => day.balance),
              borderColor: '#42b983',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Balance',
              },
            },
          },
        },
      });
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    toggleCalendar() {
      this.showCalendar = !this.showCalendar;
    },
    applyDateFilters() {
      this.fetchTransactionsByDate();
      this.showCalendar = false; // Hide the calendar after applying filters
    },
  },
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 250px;
  background-color: #f4f4f4;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}
.main-content {
  flex-grow: 1;
  padding: 20px;
  position: relative;
}
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
.popup-form {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
  z-index: 20;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
table th,
table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.calendar-icon {
  cursor: pointer;
  margin-left: 5px;
}
.calendar-modal {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  padding: 10px;
  z-index: 100;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.pie-chart {
  width: 100%;
  height: 300px;
}

.balance-chart {
  width: 100%;
  height: 300px;
  margin-top: 20px;
}
</style>
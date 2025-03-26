<template>
  <table>
    <thead>
    <tr>
      <th>
        Description
        <input
            type="text"
            v-model="descriptionSearch"
            @input="$emit('search', descriptionSearch)"
            placeholder="Search description"
        />
      </th>
      <th>Amount</th>
      <th>
        Date
        <span class="calendar-icon" @click="toggleCalendar">📅</span>
        <div v-if="showCalendar" class="calendar-modal">
          <input type="date" v-model="filters.startDate" placeholder="Start Date" />
          <input type="date" v-model="filters.endDate" placeholder="End Date" />
          <button @click="applyFilters">Apply</button>
        </div>
      </th>
      <th>
        Category
        <select v-model="filters.categoryName" @change="applyFilters">
          <option value="">All Categories</option>
          <option v-for="(category, index) in categories" :key="index" :value="category.name">
            {{ category.name }}
          </option>
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
        <button @click="$emit('deleteTransaction', transaction)">Delete</button>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    transactions: Array,
    categories: Array,
  },
  data() {
    return {
      descriptionSearch: "",
      showCalendar: false,
      filters: {
        startDate: "",
        endDate: "",
        categoryName: "",
      },
    };
  },
  methods: {
    toggleCalendar() {
      this.showCalendar = !this.showCalendar;
    },
    applyFilters() {
      const filters = {
        startDate: this.filters.startDate,
        endDate: this.filters.endDate,
        categoryName: this.filters.categoryName,
      };
      this.$emit("applyFilters", filters);
      this.showCalendar = false; // Hide the calendar after applying filters
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
  },
};
</script>


<style scoped>
.table-container table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.table-container th,
.table-container td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
.table-container th {
  font-weight: bold;
}

.calendar-icon {
  cursor: pointer;
}
.calendar-modal {
  position: absolute;
  background: white;
  padding: 10px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
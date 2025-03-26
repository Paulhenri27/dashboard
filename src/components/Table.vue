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
            placeholder="Search By description"
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
      <td class="category-td">
        {{ transaction.category.name }}
        <button @click="$emit('deleteTransaction', transaction)" class="delete-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faTrash);


export default {
  components: {FontAwesomeIcon},
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
/* General table styles */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-family: Arial, sans-serif;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.calendar-icon:hover {
  cursor: pointer;
}
/* Table header styles */
thead th {
  background-color: #f4f4f4; /* Light gray background for headers */
  color: #333; /* Dark text color */
  font-weight: bold;
  padding: 12px 8px;
  text-align: left;
  border-bottom: 2px solid #ddd;
}

/* Table cell styles */
td {
  padding: 10px 8px;
  border-bottom: 1px solid #ddd;
  vertical-align: top; /* Align content at the top of each cell */
}

/* Hover effect for rows */
tbody tr:hover {
  background-color: #f9f9f9; /* Lighter background on hover */
}

/* Input fields in the header */
th input[type="text"],
th select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

/* Calendar modal styles */
.calendar-modal {
  position: absolute;
  background: white;
  padding: 10px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* Ensure it appears above other elements */
}

.calendar-modal input[type="date"] {
  margin-bottom: 8px;
  width: 100%;
}

.calendar-modal button {
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.calendar-modal button:hover {
  background-color: #0056b3;
}

/* Delete button styles */
td button {
  padding: 4px 8px;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

td button:hover {
  background-color: #c82333; /* Darker red on hover */
}

.category-td{
  display: flex;
  justify-content: space-between;
}



/* Responsive adjustments */
@media (max-width: 768px) {
  th,
  td {
    padding: 8px;
    font-size: 12px;
  }

  .calendar-modal input[type="date"] {
    width: 100%;
  }
}

</style>
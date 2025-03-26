<template>
  <div class="sidebar">
    <h3 v-if="user.firstName && user.lastName">
      Welcome {{ user.firstName }} {{ user.lastName }}
    </h3>
    <h3 v-else>Welcome</h3>
<!--    <p>Balance: {{ balance }}</p>-->
    <button @click="openTransactionForm">Add Transaction</button>
  </div>
</template>

<script>
export default {
  props: {
    user: Object,
    balance: Number,
    openTransactionForm: Function,
  },
};
</script>

<style scoped>
.sidebar {
  background-color: #0d6efd;
  color: white;
  width: 250px;
  padding: 20px;
  flex: 1;
}
.sidebar h3 {
  margin-bottom: 20px;
}
.sidebar button {
  margin-top: 20px;
  padding: 10px;
  background: white;
  color: #0d6efd;
  border: none;
  cursor: pointer;
}
</style>
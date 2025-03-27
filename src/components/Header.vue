<template>
  <div class="header">
    <div class="search-bar">
<!--      <i class="fas fa-search"></i>-->
<!--      <input-->
<!--          type="text"-->
<!--          v-model="descriptionSearch"-->
<!--          @input="$emit('search', descriptionSearch)"-->
<!--          placeholder="Search description..."-->
<!--      />-->
      <div class="welcome">
        <h3 v-if="user.firstName && user.lastName">
          Welcome {{ user.firstName }} {{ user.lastName }}
        </h3>
        <h3 v-else>Welcome</h3>
        <!--    <p>Balance: {{ balance }}</p>-->
      </div>
      <button @click="openTransactionForm">Add Transaction</button>
    </div>

  </div>
</template>

<script>
export default {
  // data() {
  //   return {
  //     descriptionSearch: "",
  //   };
  // },
  props: {
    user: Object,
    balance: Number,
    openTransactionForm: Function,
  },
};
</script>

<style scoped>
.header {
  padding: 10px 20px;
  background-color: #0056B3;
  color: #F3F5F7;
  border-bottom: 1px solid #e2e8f0;
}

.search-bar{
  display: flex;
  justify-content: space-between;
}

.search-bar button{
  padding: 16px 18px;
  background-color: #F3F5F7;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
  color: #333;
  transition: background-color 0.3s ease;
}

.search-bar button:hover{
  background-color: #5B38ED;
  color: #F3F5F7;
}
</style>
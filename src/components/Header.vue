<template>
  <div class="header">
    <div class="search-bar">
      <i class="fas fa-search"></i>
      <input
          type="text"
          v-model="descriptionSearch"
          @input="$emit('search', descriptionSearch)"
          placeholder="Search description..."
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      descriptionSearch: "",
    };
  },
};
</script>

<style scoped>
.header {
  padding: 10px 20px;
  background: #f0f4f8;
  border-bottom: 1px solid #e2e8f0;
}
.search-bar {
  display: flex;
  align-items: center;
}
.search-bar input {
  border: none;
  outline: none;
  padding: 8px 12px;
  border-radius: 20px;
  width: 200px;
}
</style>
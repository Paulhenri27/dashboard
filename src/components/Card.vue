<template>
  <div class="card" :style="{ backgroundColor: bgColor }">
    <div class="card-content">
      <h4>{{ title }}</h4>
      <p class="value">{{ value }}</p>
      <p class="sub-value">{{ subValue }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    value: [String, Number],
    subValue: String,
    bgColor: String,
  },
};
</script>

<style scoped>
.card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 10px;
}
.value {
  font-size: 24px;
  font-weight: bold;
}
.sub-value {
  font-size: 12px;
  color: #777;
}
</style>
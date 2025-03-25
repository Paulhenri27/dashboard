<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="user.email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="user.password" required />
      </div>
      <button type="submit">Login</button>
      <div v-if="message === null"></div>
      <div v-else>{{ message }}</div>
    </form>
    <p>Don't have an account? <router-link to="/register">Register here</router-link></p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        email: '',
        password: '',
      },
      message : null,
    };
  },
  methods: {
    login() {
      fetch("http://rhea.sasg.de:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.user),
      })
          .then((response) => {
            if (response.ok) {
              // Use response.text() since the server returns a plain token string
              return response.text();
            } else {
              throw new Error("Login failed");
            }
          })
          .then((token) => {
            // Store the token in localStorage
            localStorage.setItem('token', token);
            console.log("Login successful!");
            this.$router.push('/dashboard');
          })
          .catch((error) => {
            this.message = "Login failed";
            console.log("Error during login: " + error.message);
          });
    },
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
input {
  width: 100%;
  padding: 8px;
  margin: 5px 0 15px 0;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #369c6e;
}
</style>
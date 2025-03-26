<template>
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" v-model="user.firstName" required />
      </div>

      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" v-model="user.lastName" required />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="user.email" required />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="user.password" required />
      </div>

      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "USERS",
      },
    };
  },
  methods: {
    handleSubmit() {
      // Send the user data to the server
      fetch("https://finance.rhea.comagno.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.user),
      })
          .then((response) => {
            if (response.ok) {
              this.$router.push('/login')
              return response.json();
            } else {
              throw new Error("Registration failed");
            }
          })
          .then((data) => {

          })
          .catch((error) => {
            console.log("Error during registration: " + error.message);
          });
    },
  },
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #369f6e;
}
</style>
<template>
  <div class="registration-container">
    
    <h1>REGISTREER & SPEEL</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt</p>
    
    <form v-on:submit.prevent="validateForm">
      <div>
        <label for="name">Voornaam</label>
        <div class="error" v-if="errors.name">{{ errors.name }}</div>
        <input type="text" id="name" v-model="formData.name" placeholder="Wat is je voornaam?" required>
      </div>
      <div>
        <label for="lastname">Achternaam</label>
        <div class="error" v-if="errors.lastname">{{ errors.lastname }}</div>
        <input type="text" id="lastname" v-model="formData.lastname" placeholder="Wat is je achternaam?" required>
      </div>
      <div>
        <label for="email">Email address</label>
        <div class="error" v-if="errors.email">{{ errors.email }}</div>
        <input type="email" id="email" v-model="formData.email" placeholder="you@example.com" required>
      </div>
      <div>
        <input type="checkbox" id="terms" v-model="formData.terms" required>
        <label for="terms">Ik ga akkoord met de algemene voorwaarden</label>
        <div class="error" v-if="errors.terms">{{ errors.terms }}</div>
      </div>
      <button type="submit">Registreer</button>
    </form>
  </div>

</template>

<script>
export default {
  data() {
    return {
      formData: {
        name: '',
        lastname: '',
        password: '',
      },
      errors: {},
    };
  },
  methods: {
    validateForm() {
      this.errors = {};

      if (!this.formData.name) {
        this.errors.name = 'Voornaam is verplicht';
      }

      if (!this.formData.lastname) {
        this.errors.lastname = 'Achternaam is verplicht';
      }

      if (!this.formData.email) {
        this.errors.email = 'E-mailadres is verplicht';
      } else if (!this.isValidEmail(this.formData.email)) {
        this.errors.email = 'Voer een geldig e-mailadres in';
      }

      if (!document.getElementById('terms').checked) {
        this.errors.terms = 'Je moet akkoord gaan met de algemene voorwaarden';
      }

      if (Object.keys(this.errors).length === 0) {
        this.handleSubmit();
      }
    },
    isValidEmail(email) {
      const re = /\S+@\S+\.\S+/;
      return re.test(email);
    },
    handleSubmit() {
      this.$emit('formSubmitted');
    },
  },
};
</script>

<style scoped>
  .registration-container {
    display: flex;
    align-items: center;
    flex-direction: column;
    transform: translateY(50%);
  }
  h1 {
    font-weight: bold;
    color: white;
    font-size: 20px;
    margin-bottom: 10px;
  }
  p {
    width: 305px;
    text-align: center;
    color: white;
    font-size: 13px;
  }

  form {
    background-color: #002f34;
    padding: 20px;
    width: 305px;
  }

  label {
    color: white;
    font-size: 12px;
  }

  input[type='text'], input[type='email'] {
    margin-bottom: 10px;
    background-color: #002428;
    color: white;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #3d585b;
    font-size: 16px;
    width: 100%;
  }

  input[type='checkbox'] {
    margin-right: 10px;
    background-color: #002428;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #3d585b;
    font-size: 16px;
    vertical-align: middle;
  }

  button[type="submit"] {
    background-color: #fcd500;
    width: 100%;
    border: none;
    /* color: white; */
    padding: 15px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    font-weight: bold;
    margin-top: 10px;
    cursor: pointer;
    border-radius: 20px;
    transition: background-color 0.3s ease;
  }

  button[type="submit"]:hover {
    background-color: #ab9104;
  }

  div.error {
    color: white;
    padding: 2px;
    text-align: center;
    background: red;
    border-radius: 10px;
    margin-bottom: 5px;
    font-size: 14px;
  }
</style>
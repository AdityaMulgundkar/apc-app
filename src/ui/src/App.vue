<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/>
  <button class="dev-btn" @click="openDevCredentials">Dev Credentials</button>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  async mounted(){
    const data = await window.ghl.getUserData();
    console.log("user-details", data)
  },
  methods: {
    openDevCredentials() {
      window.open('/dev-credentials', '_blank');
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.dev-btn {
  position: fixed;
  bottom: 16px;
  right: 16px;
  padding: 8px 14px;
  font-size: 12px;
  background: #1a1a2e;
  color: #e0e0e0;
  border: 1px solid #444;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.7;
  z-index: 9999;
}
.dev-btn:hover {
  opacity: 1;
}
</style>

<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/>
  <button class="dev-btn" @click="copyDevCredentials">{{ copyLabel }}</button>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data() {
    return {
      copyLabel: 'Copy Dev Credentials'
    }
  },
  async mounted(){
    const data = await window.ghl.getUserData();
    console.log("user-details", data)
  },
  methods: {
    async copyDevCredentials() {
      try {
        const res = await fetch('/dev-credentials');
        const data = await res.json();
        if (!res.ok) {
          this.copyLabel = 'No credentials found';
          setTimeout(() => { this.copyLabel = 'Copy Dev Credentials'; }, 2000);
          return;
        }
        const entry = data[0];
        const envText = [
          `DEV_ACCESS_TOKEN=${entry.accessToken}`,
          `DEV_REFRESH_TOKEN=${entry.refreshToken}`,
          `DEV_LOCATION_ID=${entry.locationId || entry.resourceId}`,
        ].join('\n');
        await navigator.clipboard.writeText(envText);
        this.copyLabel = 'Copied!';
        setTimeout(() => { this.copyLabel = 'Copy Dev Credentials'; }, 2000);
      } catch (err) {
        console.error('Failed to copy dev credentials', err);
        this.copyLabel = 'Error';
        setTimeout(() => { this.copyLabel = 'Copy Dev Credentials'; }, 2000);
      }
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

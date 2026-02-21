import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { GHL } from "./ghl";

const ghl = new GHL();
window.ghl = ghl;

const app = createApp(App);
app.use(createPinia());
app.mount("#app");

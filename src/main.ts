import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import axios from "axios";

import { registerPlugins } from '@/plugins'

const pinia = createPinia();

pinia.use(() => ({ axios }));
// vue
const app = createApp(App);
app.use(pinia);
registerPlugins(app)
app.mount("#app");

  

import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import axios from "axios";
import { registerPlugins } from "@/plugins";
import {en, ar} from "./locales";
import language from "./plugins/language";



const pinia = createPinia();
pinia.use(() => ({ axios }));
// vue
const app = createApp(App);
app.use(pinia);

app.use(language, {
  defaultLocale: "en",
  fallbackLocale: "en",
  locales: {
    en: {
      name: "English",
      code: "en",
      strings: en,
    },
    ar: {
      name: "Arabic",
      code: "ar",
      strings: ar,
    },
  },
});

registerPlugins(app);
app.mount("#app");
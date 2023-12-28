<script setup lang="ts">
import { ref, watch } from "vue";

// const formatting = shallowRef<{ bold: boolean, italic: boolean, underline: boolean }>({
//   bold: false,
//   italic: false,
//   underline: false
// });
const bold = ref(false)
const italic = ref(false)
const underline = ref(false)

const isMarkDown = ref(false);

defineProps<{
  formatting?: { bold: boolean, italic: boolean, underline: boolean };
  alignment?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "update:format": [value: { key: string, value: boolean }];
  "update:alignment": [value: string];
}>();

// watchEffect(() => {
//   if(isMarkDown.value)
//     emit('update:format', formatting.value)
// })

// const formatStyle = (key: string, value: boolean) => {
//   if(key === "bold") {
//     bold.value  = value === true ? false : true
//    // emit("update:format", { key, value: bold.value })
//   }
  
// }
 

watch(bold, (newB) => {
  emit("update:format", { key: 'bold', value: newB })

})
</script>

<template>
  <v-btn @click.stop="isMarkDown = !isMarkDown" icon density="compact">
    <v-icon icon="mdi-format-header-pound"></v-icon>
  </v-btn>
  <v-expand-transition>
    <v-sheet class="d-inline mb-2 ms-2" v-if="isMarkDown">
      <v-btn icon="mdi-format-italic" @click.stop="italic = !italic" :active="italic" :aria-pressed="italic"></v-btn>
      <v-btn icon="mdi-format-bold" @click.stop="bold = !bold" :active="bold"></v-btn>
      <v-btn icon="mdi-format-underline" @click.stop="underline = !underline" :active="underline"></v-btn>

      <v-btn icon="mdi-format-align-center" value="center"></v-btn>
      <v-btn icon="mdi-format-align-left" value="left"></v-btn>
      <v-btn icon="mdi-format-align-right" value="right"></v-btn>

    </v-sheet>
  </v-expand-transition>
</template>
<style scoped>
.markdown {
  position: absolute;
  float: right;
}
</style>

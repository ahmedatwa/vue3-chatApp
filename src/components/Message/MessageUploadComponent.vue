<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { UploadSettings } from "@/types"


const uploadSettings: UploadSettings = reactive({
  accept: "image/*,.doc,.docx,.pdf",
  maxSize: 102400, //bytes
  multiple: true,
});

const inputUpload = ref<HTMLInputElement | null>(null);
const files = ref<File[]>([]);
const isOpen = ref(false);

// props
defineProps<{
  files: File[] | null;
}>();

// emits
const emit = defineEmits<{
  "update:files": [value: File[]];
  "error:upload": [value: string];
}>();

// upload
const handleUpload = () => {
  inputUpload.value?.click();
  isOpen.value = true;
};

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  isOpen.value = false;


  if (target.files) {
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i];
      if (file.size > uploadSettings.maxSize) {
        emit("error:upload", `Warning: Max Upload File Size Exceeds 100kb. filename ${file.name}`)
        break;
      }
      files.value.push(file);
    }
    emit("update:files", files.value);
  }
};

onMounted(() => {
  inputUpload.value?.addEventListener("cancel", () => {
    isOpen.value = false;
  });
});
</script>
<template>
  <v-btn icon color="orange-accent-2" @click="handleUpload">
    <v-icon :icon="isOpen ? 'mdi-minus-circle' : 'mdi-plus-circle'"></v-icon></v-btn>
  <input class="d-none" ref="inputUpload" type="file" @change="onChange" :accept="uploadSettings.accept"
    :multiple="uploadSettings.multiple" />
</template>

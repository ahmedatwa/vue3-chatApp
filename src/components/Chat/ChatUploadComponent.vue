<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import type { UploadSettings } from "@/types/Chat"
import type { TenorGifs } from "@/types/Chat";


const uploadSettings: UploadSettings = reactive({
  accept: "image/*,.doc,.docx,.pdf,.mp4,.mp3",
  maxSize: 2000000, //2mb
  multiple: true,
});

const inputUpload = ref<HTMLInputElement | null>(null);
const files = ref<File[]>([]);
const isOpen = ref(false);

// props
defineProps<{
  files: File[] | TenorGifs | null;
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
  files.value = [];
  emit("error:upload", "")
  if (target.files) {
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i];
      if (file.size > uploadSettings.maxSize) {
        emit("error:upload",
          `Warning: Max Upload File Size Exceeds ${uploadSettings.maxSize / 1000000}Mb. filename ${file.name}`)
        break;
      }
      files.value.push(file);
    }
    if(files.value) {
      emit("update:files", files.value);
    }
  }
};

onMounted(() => {
  inputUpload.value?.addEventListener("cancel", () => {
    isOpen.value = false;
  });
});
</script>
<template>
  <v-btn :icon="isOpen ? 'mdi-minus-circle' : 'mdi-plus-circle'" color="teal" @click="handleUpload"></v-btn>
  <input class="d-none" ref="inputUpload" type="file" @change="onChange" :accept="uploadSettings.accept"
    :multiple="uploadSettings.multiple" />
</template>

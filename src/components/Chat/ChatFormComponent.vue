<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ChatUploadComponent, ChatMarkedComponent } from "@/components/Chat";
import { ChatEmojiComponent, ChatTenorComponent } from "@/components/Chat";
import type { TenorGifs } from "@/types/Chat";

import { useMarkdown } from "@/composables/markdown"
import { watchEffect } from "vue";
import { nextTick } from "vue";

const formInputValue = ref("")
const uploadedFiles = ref<File[] | null>(null);
const error = ref("");
const isEmoji = ref(false);
const formatting = ref<string[] | null>(null);
const txtareaRef = ref<HTMLInputElement>();
const tenorGif = ref<TenorGifs | null>(null)

interface Props {
  id?: string | number;
  textAreaRows: number | string;
  textAreaRowHeight: number | string;
  textAreaLabel?: string;
  autoGrow?: boolean;
  noResize?: boolean;
  uploadButton?: boolean;
  emojiButton?: boolean;
  submitButton?: boolean;
  markedButton?: boolean;
  tenorButton?: boolean;
}

withDefaults(defineProps<Props>(), {
  textAreaRows: 3,
  textAreaRowHeight: 15,
  textAreaLabel: "",
  autoGrow: false,
  noResize: false,
  uploadButton: false,
  emojiButton: true,
  submitButton: true,
  tenorButton: true,
  markedButton: true,
});
// emits
const emit = defineEmits<{
  "update:submit": [value: { content: string; files: File[] | TenorGifs | null }];
  "update:typing": [value: number];
}>();

const removeFile = (index: number) => {
  if (uploadedFiles.value !== null && Array.isArray(uploadedFiles.value)) {
    uploadedFiles.value?.splice(index, 1);
    if (uploadedFiles.value.length === 0) {
      uploadedFiles.value = null
    }
  }
};

const isDisabled = computed((): boolean => {
  if (formInputValue.value || uploadedFiles.value !== null || tenorGif.value !== null) {
    return false;
  }
  return true;
});

const submitForm = () => {
  if (formInputValue.value || uploadedFiles.value !== null || tenorGif.value !== null) {
    emit("update:submit", {
      content: formInputValue.value,
      files: uploadedFiles.value || tenorGif.value
    })
    uploadedFiles.value = null;
    tenorGif.value = null;
    formInputValue.value = ""
  }
};

const handleEnter = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    submitForm();
  }
};

watch(formInputValue, (newValue) => {
  emit("update:typing", newValue.length);
});


const updateTenor = () => {
  uploadedFiles.value = null
}

const { text, formatted, formattedInput } = useMarkdown(formInputValue, formatting)
console.log(formatted);

watchEffect(() => {
  if (text.value.length) {
    nextTick(() => {


    })
  }
})

</script>

<template>
  <v-form :id="`chat-input-${id}`" :key="`chat-input-${id}`" @submit.prevent="submitForm">
    <v-card elevation="4" :id="`message-form-wrapper-${id}`">
      <v-slide-x-transition>
        <v-card-text v-if="text" class="pa-1">
          <p v-html="formattedInput"></p>
        </v-card-text>
        <v-card-text v-else-if="uploadedFiles" class="pa-1">
          <div class="d-flex flex-wrap">
            <v-chip v-for="(file, index) in uploadedFiles" :key="file.name" closable class="ma-2"
              @click:close="removeFile(index)">
              {{ file.name }}
            </v-chip>
          </div>
        </v-card-text>
        <v-card-text v-else-if="tenorGif" class="pa-1">
          <v-img :src="tenorGif.src" width="100" height="100"></v-img>
        </v-card-text>
      </v-slide-x-transition>

      <v-textarea ref="txtareaRef" :name="`input-message-${id}`" id="input-message" :label="textAreaLabel"
        :rows="textAreaRows" :row-height="textAreaRowHeight" :auto-grow="autoGrow" :no-resize="noResize"
        v-model="formInputValue" hide-details="auto" :hint="$lang('chat.help.newLine')" :error-messages="error"
        @click:clear="formInputValue = ''" @keyup.enter="handleEnter" clearable autofocus persistent-hint>
      </v-textarea>
      <v-sheet class="d-flex flex-wrap">
        <div class="flex-1-0">
          <chat-upload-component v-if="uploadButton" v-model:files="uploadedFiles" @update:files="uploadedFiles = $event"
            @error:upload="error = $event">
          </chat-upload-component>
          <chat-emoji-component icon-color="orange-darken-2" @update:open="isEmoji = $event"
            @update:selected="formInputValue += $event" offset="40" location="left">
          </chat-emoji-component>
          <chat-marked-component @update:formatting="formatting = $event"></chat-marked-component>
          <chat-tenor-component v-if="tenorButton" v-model:model-value="tenorGif" @update:model-value="updateTenor">
          </chat-tenor-component>
        </div>
        <v-btn v-if="submitButton" icon color="teal" :disabled="isDisabled" type="submit" @click="submitForm"
          variant="text">
          <v-icon icon="mdi-send" size="large"></v-icon>
        </v-btn>
      </v-sheet>
    </v-card>
  </v-form>
</template>
<style scoped>
.absolute {
  position: absolute;
}
</style>
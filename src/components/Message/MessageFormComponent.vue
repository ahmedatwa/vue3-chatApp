<script setup lang="ts">
import { ref } from "vue";
import "vue3-emoji-picker/css";
import EmojiPicker from "vue3-emoji-picker";
import { MessageUploadComponent } from "@/components/Message";

const uploadedFiles = ref<File[]>([]);
const error = ref("");
const isEmoji = ref(false);

defineProps<{
  modelValue: string;
  textAreaRows: number;
  textAreaRowHeight: number;
  autoGrow?: boolean;
  noResize?: boolean;
}>();
// emits
const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:emoji": [value: string];
  "update:files": [value: File[]];
  "sendMessage": [value: boolean];
}>();

const clearMessage = () => {
  emit("update:modelValue", "");
};
const newUpload = (files: File[]) => {
  emit("update:files", files);
};

const onSelectEmoji = (emoji: any) => {
  emit("update:emoji", emoji.i);
};

const removeFile = (index: number) => {
  uploadedFiles.value?.splice(index, 1);
  emit("update:files", uploadedFiles.value);
};

</script>

<template>
  <v-card elevation="4" id="message-form-wrapper">
      <v-textarea
        name="input-message"
        :label="$lang('textSendMessage')"
        :rows="textAreaRows"
        :row-height="textAreaRowHeight"
        :auto-grow="autoGrow"
        :no-resize="noResize"
        :model-value="modelValue"
        hide-details="auto"
        clearable
        :hint="$lang('help.messageInputHint')"
        @update:model-value="$emit('update:modelValue', $event)"
        :error-messages="error"
        @click:clear="clearMessage"
        @keyup.enter.exact="$emit('sendMessage', true)"
      >
        <template v-slot:prepend-inner>
          <div class="d-flex flex-wrap" v-if="uploadedFiles">
            <v-chip
              v-for="(file, index) in uploadedFiles"
              :key="file.name"
              closable
              class="ma-2"
              @click:close="removeFile(index)"
            >
              {{ file.name }}
            </v-chip>
          </div>
        </template>
      </v-textarea>
      <v-sheet>
        <div class="float-left ml-2">
          <message-upload-component
            v-model:files="uploadedFiles"
            @update:files="newUpload"
            @error:upload="error = $event"
          ></message-upload-component>
          <v-btn
            icon="mdi-emoticon-happy-outline"
            density="default"
            id="emoji-activator"
            @click="isEmoji = !isEmoji"
            color="orange-darken-2"
          >
          </v-btn>
          <v-menu :close-on-content-click="false" v-model="isEmoji" target="parent">
            <emoji-picker
              :native="true"
              :hide-search="false"
              @select="onSelectEmoji"
            ></emoji-picker>
          </v-menu>
        </div>
        <div class="float-right">
          <slot name="send"></slot>
        </div>
      </v-sheet>
  </v-card>
</template>

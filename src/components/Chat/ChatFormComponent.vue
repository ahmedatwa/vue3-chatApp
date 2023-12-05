<script setup lang="ts">
import { ref, computed } from "vue";
import "vue3-emoji-picker/css";
import EmojiPicker from "vue3-emoji-picker";
import { ChatUploadComponent } from "@/components/Chat";

const uploadedFiles = ref<File[]>([]);
const error = ref("");
const isEmoji = ref(false);

interface Props {
  id: string | number | undefined;
  modelValue: string;
  textAreaRows: number | string;
  textAreaRowHeight: number | string;
  textAreaLabel?: string;
  autoGrow?: boolean;
  noResize?: boolean;
  uploadbutton?: boolean;
  emojiButton?: boolean;
  submitButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  textAreaRows: 3,
  textAreaRowHeight: 15,
  textAreaLabel: "",
  autoGrow: false,
  noResize: false,
  uploadbutton: false,
  emojiButton: true,
  submitButton: true,
});
// emits
const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:emoji": [value: string];
  "update:files": [value: File[]];
  submit: [value: boolean];
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

const isDisabled = computed((): boolean => {
  return props.modelValue.length > 1 || uploadedFiles.value.length > 1
    ? false
    : true;
});
</script>

<template>
  <v-form :id="`chat-input${id}`" :key="`chat-input${id}`">
    <v-card elevation="4" id="message-form-wrapper">
      <v-textarea name="input-message" :label="textAreaLabel" :rows="textAreaRows" :row-height="textAreaRowHeight"
        :auto-grow="autoGrow" :no-resize="noResize" :model-value="modelValue" hide-details="auto" clearable autofocus
        :hint="$lang('chat.help.newLine')" @update:model-value="$emit('update:modelValue', $event)"
        :error-messages="error" @click:clear="clearMessage" @keyup.enter.exact="$emit('submit', true)" persistent-hint>
        <template v-slot:prepend-inner>
          <div class="d-flex flex-wrap" v-if="uploadedFiles">
            <v-chip v-for="(file, index) in uploadedFiles" :key="file.name" closable class="ma-2"
              @click:close="removeFile(index)">
              {{ file.name }}
            </v-chip>
          </div>
        </template>
      </v-textarea>
      <v-sheet>
        <div class="float-left ml-2">
          <chat-upload-component v-if="uploadbutton" v-model:files="uploadedFiles" @update:files="newUpload"
            @error:upload="error = $event"></chat-upload-component>
          <v-btn v-if="emojiButton" icon="mdi-emoticon-happy-outline" density="default" id="emoji-activator"
            @click="isEmoji = !isEmoji" color="orange-darken-2">
          </v-btn>
          <v-menu :close-on-content-click="false" v-model="isEmoji" target="parent" location="start">
            <emoji-picker :native="true" :hide-search="false" @select="onSelectEmoji"></emoji-picker>
          </v-menu>
        </div>
        <div class="float-right" v-if="submitButton">
          <v-btn icon color="teal" :disabled="isDisabled" @click="$emit('submit', true)" variant="plain">
            <v-icon icon="mdi-send" size="large"></v-icon>
          </v-btn>
        </div>
      </v-sheet>
    </v-card>
  </v-form>
</template>

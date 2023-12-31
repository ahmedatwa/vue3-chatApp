<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ChatUploadComponent, ChatMarkedComponent } from "@/components/Chat";
import { ChatEmojiComponent, ChatTenorComponent, MessageRecorderComponent } from "@/components/Chat";
import type { TenorGifs } from "@/types/Chat";

import { useMarkdown } from "@/composables/useMarkdown"
import { watchEffect } from "vue";


const formInputValue = ref("sdsds ahmed test")
const uploadedFiles = ref<File[] | null>(null);
const error = ref("");
const isEmoji = ref(false);
const isAudioRecording = ref(false)
const audioSrc = ref()
const audioType = ref("")

const formatting = ref<{ key: string, value: boolean } | null>(null);
// const bold = ref(false)
// const italic = ref(false)
// const underline = ref(false)


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

watchEffect(() => {

})

const { result, text } = useMarkdown(formInputValue, formatting)

// if(result.value) {
//   formInputValue.value = result.value
// }

</script>

<template>
  <v-form :id="`chat-input-${id}`" :key="`chat-input-${id}`" @submit.prevent="submitForm">
    <v-card elevation="4" :id="`message-form-wrapper-${id}`">
      <v-slide-x-transition>
        <v-card-text v-if="text" class="pa-1 w-100">
          result: <p class="d-inline" v-html="result"></p><br />
          selected: <p class="d-inline" v-html="text"></p>

        </v-card-text>
        <v-card-text v-else-if="uploadedFiles" class="pa-1">
          <div class="d-flex flex-wrap">
            <v-chip v-for="(file, index) in uploadedFiles" :key="file.name" closable class="ma-2"
              @click:close="removeFile(index)">
              {{ file.name }}
            </v-chip>
          </div>
        </v-card-text>
        <v-card-text v-else-if="tenorGif" class="pa-1 tenor_wrapper">
          <v-img :src="tenorGif.src" max-width="100" height="100" cover class="image"></v-img>
          <div class="middle">
            <v-btn icon="mdi-close-thick" variant="flat" density="compact" color="red" @click.prevent="tenorGif = null">
            </v-btn>
          </div>
        </v-card-text>
        <v-card-text v-else-if="isAudioRecording">
          <v-chip size="x-large" closable @click:close="isAudioRecording = false">
            <audio controls :src="audioSrc" :type="audioType"></audio>
          </v-chip>
        </v-card-text>
      </v-slide-x-transition>

      <v-textarea ref="txtareaRef" :name="`input-message-${id}`" id="input-message" :label="textAreaLabel"
        :rows="textAreaRows" :row-height="textAreaRowHeight" :auto-grow="autoGrow" :no-resize="noResize"
        v-model="formInputValue" hide-details="auto" :hint="$lang('chat.help.newLine')" :error-messages="error"
        @click:clear="formInputValue = ''" @keyup.enter="handleEnter" clearable autofocus persistent-hint>
      </v-textarea>

      <v-sheet class="d-flex">
        <v-sheet class="me-auto mt-2 ms-2" cols="10">
          <chat-upload-component v-if="uploadButton" v-model:files="uploadedFiles" @update:files="uploadedFiles = $event"
            @error:upload="error = $event">
          </chat-upload-component>
          <chat-emoji-component icon size="default" @update:open="isEmoji = $event"
            @update:selected="formInputValue += $event" offset="40" location="left">
          </chat-emoji-component>
          <chat-tenor-component v-if="tenorButton" v-model:model-value="tenorGif" @update:model-value="updateTenor"
            offset="0" location="right">
          </chat-tenor-component>
          <v-divider :thickness="3" color="info" vertical></v-divider>
          <message-recorder-component @update:recording-start="isAudioRecording = $event"
            @update:recording-src="audioSrc = $event"
            @update:recording-type="audioType = $event">
          </message-recorder-component>
          <chat-marked-component @update:format="formatting = $event" :key="`chat-marked-${id}`"></chat-marked-component>

        </v-sheet>
        <v-sheet cols="2">
          <v-btn v-if="submitButton" icon color="teal" :disabled="isDisabled" type="submit" @click.prevent="submitForm"
            variant="text">
            <v-icon icon="mdi-send" size="large"></v-icon>
          </v-btn>
        </v-sheet>
      </v-sheet>
    </v-card>
  </v-form>
</template>
<style scoped>
.tenor_wrapper {
  position: relative;
  width: 120px;
}

.image {
  opacity: 1;
  display: block;
  width: 100%;
  height: auto;
  transition: .5s ease;
  backface-visibility: hidden;
}

.middle {
  transition: .5s ease;
  opacity: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  text-align: center;
}

.tenor_wrapper:hover .image {
  opacity: 0.3;
}

.tenor_wrapper:hover .middle {
  opacity: 1;
}
</style>
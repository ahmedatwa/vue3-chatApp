<script setup lang="ts">
import { ref, watch } from "vue";


const isMarkDown = ref(false);

const bold = ref(false)
const italic = ref(false)
const underline = ref(false)
const link = ref("")
const list = ref(false)

const emit = defineEmits<{
  "update:bold": [value: boolean];
  "update:italic": [value: boolean];
  "update:undeline": [value: boolean];
  "update:list": [value: boolean];
  "update:link": [value: string];
  "clear:formatting": [value: boolean]
}>();


watch(bold, (newB) => {
  emit("update:bold", newB)
})

watch(italic, (newI) => {
  emit("update:italic", newI)
})

watch(underline, (newU) => {
  emit("update:undeline", newU)
})

watch(list, (newU) => {
  emit("update:list", newU)
})

</script>

<template>
  <v-btn @click.stop="isMarkDown = !isMarkDown" icon density="compact">
    <v-icon icon="mdi-format-text"></v-icon>
  </v-btn>
  <v-expand-transition>
    <v-sheet v-if="isMarkDown" class="d-inline ms-1">
      <v-btn-toggle variant="flat" density="compact" class="ms-2">
        <v-btn @click="italic = !italic">
          <v-icon icon="mdi-format-italic"></v-icon>
        </v-btn>
        <v-btn @click="bold = !bold">
          <v-icon icon="mdi-format-bold"></v-icon>
        </v-btn>
        <v-btn @click="underline = !underline">
          <v-icon icon="mdi-format-underline"></v-icon>
        </v-btn>
      </v-btn-toggle>
      <v-divider class="border-opacity-100" vertical thickness="5"></v-divider>
      <v-btn-toggle density="compact" variant="flat">
        <v-btn @click="list = !list">
          <v-icon icon="mdi-format-list-bulleted"></v-icon>
        </v-btn>
        <v-btn>
          <v-menu activator="parent" target="parent" :close-on-content-click="false" width="350">
            <v-list>
              <v-text-field density="compact" hide-details v-model="link" class="ma-1" label="URL">
                <template #append-inner>
                  <v-btn density="compact" @click="$emit('update:link', link)" icon variant="text">
                    <v-icon icon="mdi-content-save-edit-outline" color="indigo"></v-icon></v-btn>
                </template>
              </v-text-field>
            </v-list>
          </v-menu>
          <v-icon icon="mdi-link-variant"></v-icon>
        </v-btn>
        <v-btn @click="$emit('clear:formatting', true)">
          <v-icon icon="mdi-signature-text"></v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-sheet>
  </v-expand-transition>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTenor } from "@/composables/tenor";
import type { TenorGifs } from "@/types/Chat";

const isTenor = ref(false)
const searchTerm = ref("");
//const items = ref<{ id: string; src: string }[] | null>(null)
defineProps<{
  modelValue: TenorGifs | null;
  tooltip?: string;
  iconColor?: string;
  offset?: string | number | number[];
  location?: any;
}>()

defineEmits<{
  "update:modelValue": [value: TenorGifs]
}>()

const { result } = useTenor(searchTerm);

</script>
<template>
  <v-btn @click.stop="isTenor = !isTenor">
    <v-menu :location="location ?? 'top'" width="300" height="300" v-model="isTenor" :close-on-content-click="false"
      @mouseleave="isTenor = false" target="parent">
      <v-list>
        <v-sheet class="ma-2">
          <v-text-field label="Search" v-model="searchTerm" autofocus clearable density="comfortable"
            hide-details></v-text-field>
        </v-sheet>
        <v-row class="pa-2">
          <v-col v-for="item in result" :key="item.id" class="d-flex child-flex" cols="4">
            <v-img :src="item.src" :key="item.id" aspect-ratio="1" cover @click.stop="$emit('update:modelValue', item)">
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-col>
        </v-row>
      </v-list>
    </v-menu>
    <v-icon icon="mdi-file-gif-box" size="large" :color="iconColor ?? 'indigo'"></v-icon>
    <v-tooltip activator="parent" location="top" v-if="tooltip">{{ tooltip }}</v-tooltip>
  </v-btn>
</template>

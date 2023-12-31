<script setup lang="ts">
import { shallowRef } from "vue";
// Types
import type { TenorGifs } from "@/types/Chat";
import { useTenor } from "@/composables/useTenor"

const isTenor = shallowRef(false)
const searchTerm = shallowRef("");
const { data, error } = useTenor(isTenor, searchTerm)

defineProps<{
  modelValue: TenorGifs | null;
  tooltip?: string;
  iconColor?: string;
  offset: string | number | number[];
  location: any;
}>()

defineEmits<{
  "update:modelValue": [value: TenorGifs]
}>()

</script>
<template>
  <v-btn @click="isTenor = !isTenor" id="menu-activator">
    <v-icon icon="mdi-file-gif-box" :color="iconColor ?? 'indigo'"></v-icon>
    <v-tooltip activator="parent" location="top" v-if="tooltip">{{ tooltip }}</v-tooltip>

    <v-menu :location="location" width="300" height="300" target="parent" close-on-content-click
      @mouseleave="isTenor = false" :offset="offset" v-model="isTenor">
      <v-list>
        <v-sheet class="ma-1">
          <v-text-field :label="$lang('chat.text.searchTenor')" v-model="searchTerm" autofocus clearable
            density="comfortable" hide-details></v-text-field>
        </v-sheet>
        <v-row class="pa-2" v-if="error">
          <v-col>
            <v-sheet class="d-flex align-center ma-2 pa-2 text-red">{{ error }}</v-sheet>
          </v-col>
        </v-row>
        <v-row class="pa-2" v-else-if="data">
          <v-col v-for="item in data" :key="item.id" class="d-flex child-flex" cols="4">
            <v-img :src="item.src" :key="item.id" aspect-ratio="1" cover @click.stop="$emit('update:modelValue', item)">
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-col>
        </v-row>
        <v-row class="pa-2" v-else>
          <v-col>
            <v-sheet class="d-flex justify-center mx-auto">
              <v-progress-circular indeterminate :size="56"></v-progress-circular>
            </v-sheet>
          </v-col>
        </v-row>
      </v-list>
    </v-menu>
  </v-btn>
</template>

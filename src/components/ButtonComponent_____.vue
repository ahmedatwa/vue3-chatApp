<script setup lang="ts">
import type { PropType, ButtonHTMLAttributes } from 'vue';

defineProps({
  type: {
    type: String as PropType<ButtonHTMLAttributes['type']>,
    required: false,
    default: 'button'
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  block: {
    type: Boolean,
    required: false,
    default: false
  },
  variant: {
    type: String,
    required: false,
    default: "btn-primary"
  },
  size: {
    type: String,
    required: false,
    default: ""
  }
});

</script>
<template>
   
    <button
      class="btn"
      :class="[variant, size ? 'btn-' + size : '', block ? 'btn-block': '']"
      :disabled="disabled"
      :type="type"
    >
      <slot>Submit</slot>
      <div v-if="loading">
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span class="visually-hidden" role="status">Loading...</span>
      </div>
    </button>
 
</template>
<style scoped>
.btn-block{
  display: block;
  width: 100%;
}
</style>
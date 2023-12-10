<script setup lang="ts">
import { ref, onMounted, computed, inject } from "vue";
import type { UserSessionData } from "@/types/User";

const user = inject<UserSessionData>("user")
const previewURL = ref("")
const profileForm = ref<{ displayName: string, image: string }>({
    displayName: "",
    image: "",
});
const isAlert = ref(false)
const emit = defineEmits<{
    "update:profile": [value: { displayName: string, image: string }];
}>();

const saveProfile = () => {
    emit("update:profile", profileForm.value);
    isAlert.value = true
};

onMounted(() => {
    if (user) {
        profileForm.value.displayName = user.displayName;
        profileForm.value.image = user.image;
    }
});


// upload 
const inputUpload = ref<HTMLInputElement | null>(null)
const errorUpload = ref("")
const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (target.files) {
        const file = target.files[0]

        if (file.size > 102400) {
            errorUpload.value = `Warning: Max Upload File Size Exceeds 100kb. filename ${file.name}`
            return;
        }
        previewURL.value = URL.createObjectURL(file)
        profileForm.value.image = file.name;
    }
};

const upload = () => {
    inputUpload.value?.click()
}

const userImage = computed(() => {
    if (user?.image) {
        return import.meta.env.VITE_API_URL + 'images/uploads/' + user.image
    } else {
        return `https://placehold.co/150?text=${user?.displayName}`
    }
})
</script>
<template>
    <v-sheet class="ma-4 px-4 overflow-y-auto" max-height="300">
        <v-alert v-if="isAlert" closable :text="$lang('preference.success', ['settings'])" type="success"
      variant="tonal"></v-alert>
        <div class="mb-3">
            <v-hover v-slot="{ isHovering, props }">
                <v-card class="mx-auto" max-width="150" v-bind="props">
                    <v-img :src="previewURL? previewURL : userImage" height="150" width="150" cover class="ma-auto"></v-img>
                    <v-overlay :model-value="isHovering" contained scrim="#036358" class="align-center justify-center">
                        <v-btn variant="flat" @click.prevent="upload">Upload</v-btn>
                        <input ref="inputUpload" type="file" class="d-none" @change="onChange" accept="image/*">
                    </v-overlay>
                    <v-card-text>{{ errorUpload }}</v-card-text>
                </v-card>
            </v-hover>
        </div>
        <v-text-field prepend-inner-icon="mdi-lock" :model-value="user?.firstName"
            :label="$lang('preference.input.firstName')" readonly></v-text-field>
        <v-text-field prepend-inner-icon="mdi-lock" :model-value="user?.lastName"
            :label="$lang('preference.input.lastName')" readonly></v-text-field>
        <v-text-field v-model="profileForm.displayName" :label="$lang('preference.input.displayName')"></v-text-field>
        <v-text-field prepend-inner-icon="mdi-lock" :model-value="user?.email" :label="$lang('preference.input.email')"
            readonly></v-text-field>
        <v-btn @click="saveProfile" block variant="flat" class="my-4" color="#5865f2"
            prepend-icon="mdi-account-check-outline">
            {{ $lang("preference.button.saveProfile") }}
        </v-btn>
    </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { UserSessionData } from "@/types/User";
import { capitalize } from "@/helpers";

const dialog = ref(false)
const previewURL = ref("");
const profileForm = ref<{ displayName: string; image: File | null }>({
    displayName: "",
    image: null,
});
const isAlert = ref(false);

const props = defineProps<{
    user: UserSessionData | undefined;
}>()
const emit = defineEmits<{
    "update:profile": [value: { displayName: string; image: File | null }];
}>();

const saveProfile = () => {
    if (profileForm.value.displayName === '') {
        return;
    }
    emit("update:profile", profileForm.value);
    isAlert.value = true;
};

onMounted(() => {
    if (props.user && profileForm.value) {
        profileForm.value.displayName = props.user.displayName;
    }
});

// upload
const inputUpload = ref<HTMLInputElement | null>(null);
const errorUpload = ref("");
const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    errorUpload.value = "";
    if (target.files) {
        const file = target.files[0];
        if (file.size > 102400) {
            errorUpload.value = `Warning: Max Upload File Size Exceeds 100kb. filename ${file.name}`;
            return;
        }
        previewURL.value = URL.createObjectURL(file);
        if (profileForm.value) {
            profileForm.value.image = file;
        }
    }
};

const upload = () => {
    inputUpload.value?.click();
};

const userImage = computed(() => {
    if (props.user?.image === "") {
        return `https://placehold.co/150?text=${props.user?.displayName}`;
    } else {
        return props.user?.image;
    }
});

const fullName = computed(() => {
    if (props.user) {
        return capitalize(props.user.firstName + ' ' + props.user.lastName)
    }
})
</script>
<template>
    <v-sheet @click.stop="dialog = !dialog">
        {{ $lang('header.profile') }}
    </v-sheet>
    <v-dialog v-model="dialog">
        <v-card class="mx-auto" width="400">
            <v-card-title>
               <v-icon icon="mdi-account-settings"></v-icon> {{ $lang('header.profile') }}
                <v-icon icon="mdi-close-circle-outline" color="red" class="float-right" @click="dialog = !dialog"></v-icon>
            </v-card-title>
            <v-divider :thickness="3" color="info"></v-divider>
            <v-card-text>
                <v-alert v-if="isAlert" closable :text="$lang('header.success', ['settings'])" type="success"
                    variant="tonal" class="mb-3"></v-alert>
                <div class="mb-3">
                    <v-hover v-slot="{ isHovering, props }">
                        <v-card class="mx-auto" max-width="150" v-bind="props">
                            <v-img :src="previewURL ? previewURL : userImage" height="150" width="150" cover
                                class="ma-auto"></v-img>
                            <v-overlay :model-value="isHovering" contained scrim="#036358"
                                class="align-center justify-center">
                                <v-btn variant="flat" @click.prevent="upload">Upload</v-btn>
                                <input ref="inputUpload" type="file" class="d-none" @change="onChange" accept="image/*" />
                            </v-overlay>
                            <v-card-text>{{ errorUpload }}</v-card-text>
                        </v-card>
                    </v-hover>
                </div>
                <v-text-field prepend-inner-icon="mdi-lock" :model-value="fullName" :label="$lang('header.input.fullName')"
                    readonly></v-text-field>
                <v-text-field v-model="profileForm.displayName" :label="$lang('header.input.displayName')"></v-text-field>
                <v-text-field prepend-inner-icon="mdi-lock" :model-value="user?.email" :label="$lang('header.input.email')"
                    readonly></v-text-field>
                <v-btn @click="saveProfile" block variant="flat" class="my-4" color="#5865f2"
                    prepend-icon="mdi-account-check-outline">
                    {{ $lang("header.button.saveProfile") }}
                </v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

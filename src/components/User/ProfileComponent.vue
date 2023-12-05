<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { UserSessionData } from "@/types/User";

const userForm = ref<{ displayName: string, image: string }>({
    displayName: "",
    image: "",
});

const props = defineProps<{
    modelValue: boolean;
    user: UserSessionData | undefined;
}>();

const emit = defineEmits<{
    "update:profile": [value: { displayName: string, image: string }];
    "update:modelValue": [value: boolean];
}>();

const saveProfile = () => {
    emit("update:profile", userForm.value);
};

onMounted(() => {
    if (props.user) {
        userForm.value.displayName = props.user.displayName;
        userForm.value.image = props.user.image;
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
        userForm.value.image = file.name;
    }
};

const upload = () => {
    inputUpload.value?.click()
}

const userImage = computed(() => {
    if(props.user?.image) {
        return import.meta.env.VITE_API_URL +'images/uploads/' + props.user.image
    } else {
       return `https://placehold.co/150?text=${props.user?.displayName}`
    }
})
</script>
<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" width="500"
        transition="dialog-top-transition" class="pa-4">
        <v-card>
            <v-card-title>
                <v-avatar :image="userForm.image" v-if="userForm.image"></v-avatar>
                <v-avatar icon="mdi-account-circle" :color="user?.connected ? 'success' : ''" v-else>
                </v-avatar>
                {{ user?.displayName }}
                <v-icon class="float-right" @click="$emit('update:modelValue', false)" icon="mdi-close-circle-outline"
                    color="red"></v-icon>
            </v-card-title>
            <v-divider :thickness="3" color="info"></v-divider>
            <v-card-text class="">
                <div class=" mb-2">
                    <v-hover v-slot="{ isHovering, props }">
                        <v-card class="mx-auto" max-width="150" v-bind="props">
                            <v-img :src="userImage" height="150" width="150"
                                cover class="ma-auto"></v-img>
                            <v-overlay :model-value="isHovering" contained scrim="#036358"
                                class="align-center justify-center">
                                <v-btn variant="flat" @click.prevent="upload">Upload</v-btn>
                                <input ref="inputUpload" type="file" class="d-none" @change="onChange" accept="image/*">
                            </v-overlay>
                            <v-card-text>{{ errorUpload }}</v-card-text>
                        </v-card>
                    </v-hover>
                </div>
                <v-text-field prepend-inner-icon="mdi-lock" :model-value="user?.firstName"
                    :label="$lang('profile.input.firstName')" readonly></v-text-field>
                <v-text-field prepend-inner-icon="mdi-lock" :model-value="user?.lastName"
                    :label="$lang('profile.input.lastName')" readonly></v-text-field>
                <v-text-field v-model="userForm.displayName" :label="$lang('profile.input.displayName')"></v-text-field>
                <v-text-field prepend-inner-icon="mdi-lock" :model-value="user?.email" :label="$lang('profile.input.email')"
                    readonly></v-text-field>
            </v-card-text>

            <v-card-actions class="w-100">
                <v-btn @click="saveProfile" block variant="flat" color="#5865f2" prepend-icon="mdi-account-check-outline">
                    {{ $lang("profile.button.save") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import type { UserSessionData } from "@/types/Session";
import type { UserProfile } from "@/types/User"

const userForm = ref<UserProfile>({
    firstName: "",
    lastName: "",
    displayName: "",
    email: "",
    image: ""
})

const props = defineProps<{
    modelValue: boolean;
    user: UserSessionData | undefined;
}>()

const emit = defineEmits<{
    "update:profile": [value: UserProfile]
    "update:modelValue": [value: boolean]
}>();

const saveProfile = () => {
    emit("update:profile", userForm.value)
}

onMounted(() => {
    if (props.user) {
        userForm.value.firstName = props.user.firstName
        userForm.value.lastName = props.user.lastName
        userForm.value.displayName = props.user.displayName
        userForm.value.image = props.user.image
        userForm.value.email = props.user.email
    }
})

</script>
<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" width="500"
        transition="dialog-top-transition" class="pa-4">
        <v-card>
            <v-card-title>
                <v-avatar :image="userForm.image"></v-avatar> {{ $lang('text.userProfile') }}
                <v-icon class="float-right" @click="$emit('update:modelValue', false)" icon="mdi-close-circle-outline"
                    color="red"></v-icon>
            </v-card-title>
            <v-divider :thickness="3" color="info"></v-divider>
            <v-card-text>
                <v-text-field v-model="userForm.firstName" label="First Name"></v-text-field>
                <v-text-field v-model="userForm.lastName" label="Last Name"></v-text-field>
                <v-text-field v-model="userForm.displayName" label="Display Name"></v-text-field>
                <v-text-field v-model="userForm.email" label="Email"></v-text-field>
            </v-card-text>
            <v-card-actions class="w-100">
                <v-btn @click="saveProfile" block variant="flat" color="#5865f2" prepend-icon="mdi-account-check-outline">
                    {{ $lang('button.submit') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
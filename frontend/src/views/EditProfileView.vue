<template>
    <div class="edit-profile-page">
        <h2>Edit Profile</h2>

        <div class="avatar-section">
            <img :src="previewAvatar || (user.avatar?.startsWith('http') ? user.avatar : (user.avatar?.startsWith('/') ? user.avatar : `/src/assets${user.avatar || '/avatar.jpg'}`)) || avatar" alt="Avatar"
                class="avatar-preview" />
            <input type="file" @change="onFileChange" accept="image/*" />
            <button @click="uploadAvatar" :disabled="!file">Upload Avatar</button>
        </div>

        <div class="username-section">
            <label>Username:</label>
            <input v-model="username" placeholder="Enter new username" />
            <button @click="updateUsername">Update Username</button>
        </div>

        <button @click="goBack">Cancel</button>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { uploadAvatarAPI, updateNameAPI } from '@/api/user'
import { useRouter } from 'vue-router'
import avatar from '../assets/avatar.jpg'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.userInfo)

const file = ref(null)
const previewAvatar = ref(null)
const username = ref(user.value.username)

const onFileChange = (e) => {
    file.value = e.target.files[0]
    previewAvatar.value = URL.createObjectURL(file.value)
}

const uploadAvatar = async () => {
    if (!file.value) return
    try {
        const res = await uploadAvatarAPI(file.value)
        userStore.setAvatar(res.avatar)
        alert('Avatar updated successfully!')
    } catch (err) {
        console.error(err)
        alert('Failed to upload avatar')
    }
}

const updateUsername = async () => {
    try {
        const res = await updateNameAPI(username.value)
        userStore.setUsername(res.user.username)
        alert('Username updated!')
    } catch (err) {
        console.error(err)
        alert('Failed to update username')
    }
}

const goBack = () => router.back()
</script>


<style scoped>
.edit-profile-page {
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
}

.avatar-preview {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 10px;
}

.username-section {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
}

input[type="file"] {
    margin-bottom: 10px;
}

button {
    padding: 8px 14px;
    margin-top: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background-color: var(--btn-color);
    color: white;
}

button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>

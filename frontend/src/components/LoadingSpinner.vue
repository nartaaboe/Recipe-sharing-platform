<template>
    <div v-if="show" class="loading-spinner">
        <div class="spinner"></div>
        <p v-if="message" class="message">{{ message }}</p>
    </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
    show: {
        type: Boolean,
        default: true
    },
    message: {
        type: String,
        default: ''
    }
})
</script>

<style scoped>
.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 16px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 127, 80, 0.2);
    border-top-color: var(--btn-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.message {
    color: #666;
    font-size: 14px;
    margin: 0;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>


<template>
    <div class="not-found-page">
        <div class="not-found-content">
            <h1 class="error-code">404</h1>
            <h2 class="error-title">Page Not Found</h2>
            <p class="error-message">Oops! The page you're looking for doesn't exist.</p>
            <router-link to="/" class="home-btn">Go Back Home</router-link>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
    console.log('404 page loaded')
})
</script>

<style scoped>
.not-found-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 20px;
}

.not-found-content {
    text-align: center;
    animation: fadeInUp 0.6s ease-out;
}

.error-code {
    font-size: 120px;
    font-weight: 800;
    color: var(--btn-color);
    margin: 0;
    line-height: 1;
    animation: pulse 2s ease-in-out infinite;
}

.error-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-color);
    margin: 20px 0 10px;
}

.error-message {
    font-size: 16px;
    color: #666;
    margin-bottom: 30px;
}

.home-btn {
    display: inline-block;
    padding: 12px 24px;
    background: var(--btn-color);
    color: #fff;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.home-btn:hover {
    background: var(--btn-color-hover);
    transform: translateY(-2px);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

@media (max-width: 480px) {
    .error-code {
        font-size: 80px;
    }
    
    .error-title {
        font-size: 24px;
    }
}
</style>


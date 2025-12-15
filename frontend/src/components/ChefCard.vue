<template>
    <div class="chef-card">
        <div class="chef-header">
            <div class="avatar-container" @click="$emit('view-profile', chef._id)">
                <img 
                    :src="chef.avatar?.startsWith('http') ? chef.avatar : (chef.avatar?.startsWith('/') ? chef.avatar : `/src/assets${chef.avatar || '/avatar.jpg'}`)" 
                    :alt="chef.username" 
                    class="chef-avatar"
                />
            </div>
            <button 
                v-if="!isFollowing"
                @click="$emit('follow', chef._id)"
                class="follow-btn"
            >
                Follow
            </button>
            <button 
                v-else
                @click="$emit('unfollow', chef._id)"
                class="follow-btn following"
            >
                Following
            </button>
        </div>

        <div class="chef-info" @click="$emit('view-profile', chef._id)">
            <h3 class="chef-name">{{ chef.username }}</h3>
            <p class="chef-email">{{ chef.email }}</p>
            
            <div class="chef-stats">
                <div class="stat-item">
                    <span class="stat-value">{{ chef.recipeCount || 0 }}</span>
                    <span class="stat-label">Recipes</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ formatViews(chef.totalViews || 0) }}</span>
                    <span class="stat-label">Views</span>
                </div>
                <div class="stat-item" v-if="chef.followers !== undefined">
                    <span class="stat-value">{{ chef.followers || 0 }}</span>
                    <span class="stat-label">Followers</span>
                </div>
            </div>

            <div v-if="chef.latestRecipe" class="latest-recipe">
                <p class="latest-label">Latest Recipe:</p>
                <div class="latest-recipe-card">
                    <img 
                        :src="chef.latestRecipe.image?.startsWith('http') ? chef.latestRecipe.image : (chef.latestRecipe.image?.startsWith('/') ? chef.latestRecipe.image : `/src/assets${chef.latestRecipe.image}`)" 
                        :alt="chef.latestRecipe.title"
                        class="latest-image"
                    />
                    <div class="latest-info">
                        <p class="latest-title">{{ chef.latestRecipe.title }}</p>
                        <p class="latest-date">{{ formatDate(chef.latestRecipe.createdAt) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    chef: {
        type: Object,
        required: true
    },
    isFollowing: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['follow', 'unfollow', 'view-profile'])

const formatViews = (views) => {
    if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M'
    }
    if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K'
    }
    return views.toString()
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
}
</script>

<style scoped>
.chef-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    cursor: pointer;
}

.chef-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.chef-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.avatar-container {
    cursor: pointer;
}

.chef-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #f0f0f0;
    transition: border-color 0.3s ease;
}

.chef-card:hover .chef-avatar {
    border-color: var(--primary-color, #ff7f50);
}

.follow-btn {
    padding: 8px 20px;
    border: 2px solid var(--primary-color, #ff7f50);
    background: white;
    color: var(--primary-color, #ff7f50);
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.follow-btn:hover {
    background: var(--primary-color, #ff7f50);
    color: white;
    transform: scale(1.05);
}

.follow-btn.following {
    background: var(--primary-color, #ff7f50);
    color: white;
}

.follow-btn.following:hover {
    background: #e06b40;
    border-color: #e06b40;
}

.chef-info {
    cursor: pointer;
}

.chef-name {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;
    color: #333;
}

.chef-email {
    font-size: 14px;
    color: #999;
    margin-bottom: 20px;
}

.chef-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
}

.stat-item {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--primary-color, #ff7f50);
}

.stat-label {
    font-size: 12px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.latest-recipe {
    margin-top: 16px;
}

.latest-label {
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.latest-recipe-card {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 12px;
    transition: background 0.3s ease;
}

.chef-card:hover .latest-recipe-card {
    background: #f0f0f0;
}

.latest-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
}

.latest-info {
    flex: 1;
    min-width: 0;
}

.latest-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.latest-date {
    font-size: 12px;
    color: #999;
}
</style>

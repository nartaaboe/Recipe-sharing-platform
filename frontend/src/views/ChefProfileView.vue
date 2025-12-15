<template>
    <div class="page-root chef-profile-page">
        <div v-if="loading" class="loading-state">
            <LoadingSpinner />
            <p>Loading chef profile...</p>
        </div>

        <div v-else-if="error" class="error-state">
            <p>{{ error }}</p>
            <button @click="$router.back()" class="back-btn">Go Back</button>
        </div>

        <div v-else-if="chef" class="chef-content">
            <!-- Header Section -->
            <div class="profile-header">
                <img 
                    :src="chef.avatar?.startsWith('http') ? chef.avatar : (chef.avatar?.startsWith('/') ? chef.avatar : `/src/assets${chef.avatar || '/avatar.jpg'}`)" 
                    :alt="chef.username" 
                    class="profile-avatar"
                />
                <div class="profile-info">
                    <h1 class="profile-name">{{ chef.username }}</h1>
                    <p class="profile-email">{{ chef.email }}</p>
                    
                    <div class="profile-stats">
                        <div class="stat-box">
                            <span class="stat-number">{{ chef.recipeCount || 0 }}</span>
                            <span class="stat-text">Recipes</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-number">{{ chef.followers || 0 }}</span>
                            <span class="stat-text">Followers</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-number">{{ chef.following || 0 }}</span>
                            <span class="stat-text">Following</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-number">{{ formatViews(chef.totalViews || 0) }}</span>
                            <span class="stat-text">Total Views</span>
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button 
                            v-if="!isFollowing"
                            @click="handleFollow"
                            class="action-btn follow-btn"
                        >
                            Follow
                        </button>
                        <button 
                            v-else
                            @click="handleUnfollow"
                            class="action-btn following-btn"
                        >
                            Following
                        </button>
                        <button @click="$router.back()" class="action-btn back-btn">
                            Back
                        </button>
                    </div>
                </div>
            </div>

            <!-- Recipes Section -->
            <div class="recipes-section">
                <h2 class="section-title">Recipes by {{ chef.username }}</h2>
                
                <div v-if="chef.recipes && chef.recipes.length" class="recipes-grid">
                    <RecipeCard 
                        v-for="recipe in chef.recipes" 
                        :key="recipe._id" 
                        :recipe="recipe"
                    />
                </div>
                
                <div v-else class="empty-recipes">
                    <p>This chef hasn't published any recipes yet.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getChefProfileAPI, followChefAPI, unfollowChefAPI, isFollowingAPI } from '@/api/chef'
import RecipeCard from '@/components/RecipeCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const chefId = route.params.id

const chef = ref(null)
const loading = ref(true)
const error = ref('')
const isFollowing = ref(false)

const loadChefProfile = async () => {
    loading.value = true
    error.value = ''
    try {
        const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL
        chef.value = await getChefProfileAPI(chefId)
        
        // Check if following
        try {
            isFollowing.value = await isFollowingAPI(chefId)
        } catch (err) {
            // If API doesn't support this, default to false
            isFollowing.value = false
        }
    } catch (err) {
        error.value = err.message || 'Failed to load chef profile'
        console.error('Error loading chef profile:', err)
    } finally {
        loading.value = false
    }
}

const handleFollow = async () => {
    try {
        await followChefAPI(chefId)
        isFollowing.value = true
        if (chef.value) {
            chef.value.followers = (chef.value.followers || 0) + 1
        }
    } catch (err) {
        console.error('Error following chef:', err)
        alert('Failed to follow chef')
    }
}

const handleUnfollow = async () => {
    try {
        await unfollowChefAPI(chefId)
        isFollowing.value = false
        if (chef.value && chef.value.followers > 0) {
            chef.value.followers = chef.value.followers - 1
        }
    } catch (err) {
        console.error('Error unfollowing chef:', err)
        alert('Failed to unfollow chef')
    }
}

const formatViews = (views) => {
    if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M'
    }
    if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K'
    }
    return views.toString()
}

onMounted(() => {
    loadChefProfile()
})
</script>

<style scoped>
.chef-profile-page {
    padding: 40px;
    max-width: 1400px;
    margin: 0 auto;
}

.loading-state,
.error-state {
    text-align: center;
    padding: 60px 20px;
}

.profile-header {
    display: flex;
    gap: 40px;
    margin-bottom: 60px;
    padding: 40px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.profile-avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid var(--primary-color, #ff7f50);
}

.profile-info {
    flex: 1;
}

.profile-name {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #333;
}

.profile-email {
    font-size: 16px;
    color: #999;
    margin-bottom: 30px;
}

.profile-stats {
    display: flex;
    gap: 40px;
    margin-bottom: 30px;
}

.stat-box {
    display: flex;
    flex-direction: column;
}

.stat-number {
    font-size: 32px;
    font-weight: 700;
    color: var(--primary-color, #ff7f50);
}

.stat-text {
    font-size: 14px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.profile-actions {
    display: flex;
    gap: 12px;
}

.action-btn {
    padding: 12px 24px;
    border-radius: 25px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
}

.follow-btn {
    background: var(--primary-color, #ff7f50);
    color: white;
}

.follow-btn:hover {
    background: #e06b40;
    transform: scale(1.05);
}

.following-btn {
    background: #e0e0e0;
    color: #666;
}

.following-btn:hover {
    background: #d0d0d0;
}

.back-btn {
    background: white;
    color: #666;
    border: 2px solid #e0e0e0;
}

.back-btn:hover {
    border-color: #ccc;
    background: #f9f9f9;
}

.recipes-section {
    margin-top: 40px;
}

.section-title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 30px;
    color: #333;
}

.recipes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
}

.empty-recipes {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 16px;
    color: #999;
}

@media (max-width: 768px) {
    .chef-profile-page {
        padding: 20px;
    }

    .profile-header {
        flex-direction: column;
        text-align: center;
        padding: 30px 20px;
    }

    .profile-stats {
        justify-content: center;
    }

    .recipes-grid {
        grid-template-columns: 1fr;
    }
}
</style>

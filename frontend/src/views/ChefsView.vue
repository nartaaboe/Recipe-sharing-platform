<template>
    <div class="page-root chefs-page">
        <div class="page-header">
            <h1 class="page-title">Discover <span class="accent">Chefs</span></h1>
            <p class="page-subtitle">Find and follow your favorite recipe creators</p>
        </div>

        <!-- Search Bar -->
        <div class="search-section">
            <div class="search-wrapper">
                <Search class="search-icon" />
                <input 
                    v-model="searchQuery" 
                    @input="handleSearch" 
                    type="text" 
                    placeholder="Search chefs by name..." 
                    class="search-input"
                />
            </div>
            <div class="filter-tabs">
                <button 
                    :class="['filter-tab', { active: activeTab === 'all' }]"
                    @click="activeTab = 'all'"
                >
                    All Chefs
                </button>
                <button 
                    :class="['filter-tab', { active: activeTab === 'following' }]"
                    @click="activeTab = 'following'"
                >
                    Following
                </button>
                <button 
                    :class="['filter-tab', { active: activeTab === 'recipes' }]"
                    @click="activeTab = 'recipes'"
                >
                    Find by Recipe
                </button>
            </div>
        </div>

        <!-- Find by Recipe Section -->
        <div v-if="activeTab === 'recipes'" class="find-by-recipe">
            <h3>Search for chefs by recipe</h3>
            <div class="recipe-search-wrapper">
                <input 
                    v-model="recipeSearchQuery" 
                    @input="handleRecipeSearch" 
                    type="text" 
                    placeholder="Type recipe name..." 
                    class="recipe-search-input"
                />
            </div>
            <div v-if="matchingRecipes.length" class="recipe-suggestions">
                <div 
                    v-for="recipe in matchingRecipes" 
                    :key="recipe._id"
                    @click="findChefsByRecipe(recipe._id)"
                    class="recipe-suggestion-item"
                >
                    <img :src="recipe.image?.startsWith('http') ? recipe.image : (recipe.image?.startsWith('/') ? recipe.image : `/src/assets${recipe.image}`)" alt="" class="recipe-thumb" />
                    <div class="recipe-info">
                        <div class="recipe-name">{{ recipe.title }}</div>
                        <div class="recipe-author">by {{ recipe.author?.username }}</div>
                    </div>
                </div>
            </div>
            <div v-if="chefsByRecipe.length" class="chefs-found">
                <h4>Chefs with similar recipes:</h4>
                <div class="chefs-grid">
                    <ChefCard 
                        v-for="chef in chefsByRecipe" 
                        :key="chef._id" 
                        :chef="chef"
                        @follow="handleFollow"
                        @unfollow="handleUnfollow"
                    />
                </div>
            </div>
        </div>

        <!-- Chefs Grid -->
        <div v-else class="chefs-section">
            <div v-if="loading" class="loading-state">
                <LoadingSpinner />
                <p>Loading chefs...</p>
            </div>

            <div v-else-if="error" class="error-state">
                <p>{{ error }}</p>
            </div>

            <div v-else-if="displayedChefs.length === 0" class="empty-state">
                <Users class="empty-icon" />
                <p>No chefs found</p>
                <p class="empty-subtitle">Try adjusting your search</p>
            </div>

            <div v-else class="chefs-grid">
                <ChefCard 
                    v-for="chef in displayedChefs" 
                    :key="chef._id" 
                    :chef="chef"
                    :is-following="followingMap[chef._id]"
                    @follow="handleFollow"
                    @unfollow="handleUnfollow"
                    @view-profile="viewChefProfile"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Users } from 'lucide-vue-next'
import { getAllChefsAPI, getFollowingAPI, getChefsByRecipeAPI, followChefAPI, unfollowChefAPI } from '@/api/chef'
import { getAllRecipesAPI } from '@/api/recipe'
import { mockRecipes } from '@/mocks/mockData'
import ChefCard from '@/components/ChefCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()

const chefs = ref([])
const following = ref([])
const chefsByRecipe = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const recipeSearchQuery = ref('')
const matchingRecipes = ref([])
const activeTab = ref('all')

const followingMap = computed(() => {
    const map = {}
    following.value.forEach(chef => {
        map[chef._id] = true
    })
    return map
})

const displayedChefs = computed(() => {
    if (activeTab.value === 'following') {
        return following.value
    }
    return chefs.value
})

// Load all chefs
const loadChefs = async () => {
    loading.value = true
    error.value = ''
    try {
        const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL
        if (USE_MOCK) {
            chefs.value = await getAllChefsAPI(searchQuery.value)
        } else {
            const res = await getAllChefsAPI(searchQuery.value)
            chefs.value = Array.isArray(res) ? res : res.chefs || []
        }
    } catch (err) {
        error.value = err.message || 'Failed to load chefs'
        console.error('Error loading chefs:', err)
    } finally {
        loading.value = false
    }
}

// Load following
const loadFollowing = async () => {
    try {
        const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL
        if (USE_MOCK) {
            following.value = await getFollowingAPI()
        } else {
            const res = await getFollowingAPI()
            following.value = Array.isArray(res) ? res : res.chefs || []
        }
    } catch (err) {
        console.error('Error loading following:', err)
    }
}

// Search handler
const handleSearch = () => {
    loadChefs()
}

// Recipe search handler
const handleRecipeSearch = () => {
    if (!recipeSearchQuery.value.trim()) {
        matchingRecipes.value = []
        chefsByRecipe.value = []
        return
    }
    
    const query = recipeSearchQuery.value.toLowerCase()
    matchingRecipes.value = mockRecipes
        .filter(r => r.title.toLowerCase().includes(query))
        .slice(0, 5)
}

// Find chefs by recipe
const findChefsByRecipe = async (recipeId) => {
    loading.value = true
    try {
        const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL
        if (USE_MOCK) {
            chefsByRecipe.value = await getChefsByRecipeAPI(recipeId)
        } else {
            const res = await getChefsByRecipeAPI(recipeId)
            chefsByRecipe.value = Array.isArray(res) ? res : res.chefs || []
        }
    } catch (err) {
        console.error('Error finding chefs by recipe:', err)
    } finally {
        loading.value = false
    }
}

// Follow chef
const handleFollow = async (chefId) => {
    try {
        await followChefAPI(chefId)
        await loadFollowing()
        // Update chef in list
        const chef = chefs.value.find(c => c._id === chefId)
        if (chef) {
            chef.followers = (chef.followers || 0) + 1
        }
    } catch (err) {
        console.error('Error following chef:', err)
        alert('Failed to follow chef')
    }
}

// Unfollow chef
const handleUnfollow = async (chefId) => {
    try {
        await unfollowChefAPI(chefId)
        await loadFollowing()
        // Update chef in list
        const chef = chefs.value.find(c => c._id === chefId)
        if (chef && chef.followers > 0) {
            chef.followers = chef.followers - 1
        }
    } catch (err) {
        console.error('Error unfollowing chef:', err)
        alert('Failed to unfollow chef')
    }
}

// View chef profile
const viewChefProfile = (chefId) => {
    router.push(`/chef/${chefId}`)
}

// Watch active tab
watch(activeTab, (newTab) => {
    if (newTab === 'following') {
        loadFollowing()
    } else if (newTab === 'all') {
        loadChefs()
    }
})

onMounted(() => {
    loadChefs()
    loadFollowing()
})
</script>

<style scoped>
.chefs-page {
    padding: 40px;
    max-width: 1400px;
    margin: 0 auto;
}

.page-header {
    text-align: center;
    margin-bottom: 40px;
}

.page-title {
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 10px;
    color: #333;
}

.page-title .accent {
    color: var(--primary-color, #ff7f50);
}

.page-subtitle {
    font-size: 18px;
    color: #666;
}

.search-section {
    margin-bottom: 40px;
}

.search-wrapper {
    position: relative;
    max-width: 600px;
    margin: 0 auto 20px;
}

.search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: #999;
}

.search-input {
    width: 100%;
    padding: 14px 16px 14px 48px;
    border: 2px solid #e0e0e0;
    border-radius: 30px;
    font-size: 16px;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: var(--primary-color, #ff7f50);
    box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
}

.filter-tabs {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
}

.filter-tab {
    padding: 10px 24px;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 25px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #666;
}

.filter-tab:hover {
    border-color: var(--primary-color, #ff7f50);
    color: var(--primary-color, #ff7f50);
}

.filter-tab.active {
    background: var(--primary-color, #ff7f50);
    border-color: var(--primary-color, #ff7f50);
    color: white;
}

.find-by-recipe {
    background: #f9f9f9;
    padding: 30px;
    border-radius: 16px;
    margin-bottom: 30px;
}

.find-by-recipe h3 {
    margin-bottom: 20px;
    color: #333;
}

.recipe-search-wrapper {
    margin-bottom: 20px;
}

.recipe-search-input {
    width: 100%;
    max-width: 500px;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 15px;
}

.recipe-suggestions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 30px;
}

.recipe-suggestion-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px;
    background: white;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.recipe-suggestion-item:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recipe-thumb {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
}

.recipe-info {
    flex: 1;
}

.recipe-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
}

.recipe-author {
    font-size: 14px;
    color: #666;
}

.chefs-found h4 {
    margin-bottom: 20px;
    color: #333;
}

.chefs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
    margin-top: 30px;
}

.loading-state,
.error-state,
.empty-state {
    text-align: center;
    padding: 60px 20px;
}

.empty-icon {
    width: 80px;
    height: 80px;
    color: #ccc;
    margin-bottom: 20px;
}

.empty-state p {
    font-size: 18px;
    color: #666;
    margin-bottom: 8px;
}

.empty-subtitle {
    font-size: 14px;
    color: #999;
}

@media (max-width: 768px) {
    .chefs-page {
        padding: 20px;
    }

    .page-title {
        font-size: 32px;
    }

    .chefs-grid {
        grid-template-columns: 1fr;
    }
}
</style>

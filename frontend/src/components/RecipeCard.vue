<template>
    <div class="card">
        <div class="image-container">
            <img :src="recipe.image?.startsWith('http') ? recipe.image : (recipe.image?.startsWith('/') ? recipe.image : `/src/assets${recipe.image}`)" alt="Recipe image" />
            <button class="fav-btn" @click="toggleFavorite">
                <Heart :fill="isFavorite ? '#ff7f50' : 'none'" stroke="#ff7f50" />
            </button>
        </div>

        <div class="content" @click="goDetail">
            <h3>{{ recipe.title }}</h3>
            <p class="desc">{{ recipe.description }}</p>

            <div v-if="recipe.tags && recipe.tags.length" class="tags">
                <span v-for="(tag, i) in recipe.tags" :key="i" class="tag-btn">#{{ tag }}</span>
            </div>

            <div class="info-row">
                <span class="views">
                    <Eye style="width: 16px; height: 16px; vertical-align:sub; margin-right: 4px;" />
                    {{ recipe.views }} views
                </span>
                <router-link :to="`/recipe/${recipe._id}`" class="btn">View</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onUpdated, defineProps } from "vue";
import { Heart, Eye } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { addFavoriteAPI, removeFavoriteAPI, getFavoritesAPI } from '@/api/user'

const router = useRouter();
const props = defineProps({ recipe: Object });

const isFavorite = ref(false);
let favoriteCheckInterval = null;

onMounted(async () => {
    try {
        const favorites = await getFavoritesAPI()
        console.log('User favorites:', favorites)
        isFavorite.value = favorites.some(r => r._id === props.recipe._id)
    } catch (err) {
        console.error('Failed to load favorites', err)
    }
    
    // Example: Set up interval to check favorites periodically
    favoriteCheckInterval = setInterval(async () => {
        try {
            const favorites = await getFavoritesAPI()
            isFavorite.value = favorites.some(r => r._id === props.recipe._id)
        } catch (err) {
            // Silent fail for background check
        }
    }, 30000) // Check every 30 seconds
})

onUnmounted(() => {
    // Cleanup: Clear interval when component is unmounted
    if (favoriteCheckInterval) {
        clearInterval(favoriteCheckInterval)
        favoriteCheckInterval = null
    }
})

onUpdated(() => {
    // Log when component updates (e.g., when recipe prop changes)
    console.log('RecipeCard updated for recipe:', props.recipe?._id || props.recipe?.id)
})

const toggleFavorite = async (e) => {
    e.stopPropagation() // Prevent triggering the card click
    try {
        if (isFavorite.value) {
            await removeFavoriteAPI(props.recipe._id)
            isFavorite.value = false
        } else {
            await addFavoriteAPI(props.recipe._id)
            isFavorite.value = true
        }
    } catch (err) {
        console.error('Failed to toggle favorite', err)
        alert('Failed to update favorite. Please try again.')
    }
}

const goDetail = () => {
    router.push(`/recipe/${props.recipe._id}`);
};

</script>

<style scoped>
.card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    animation: slideIn 0.5s ease-out;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.image-container {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.card:hover img {
    transform: scale(1.05);
}

.fav-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.8);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.fav-btn:hover {
    transform: scale(1.1);
}

.content {
    padding: 15px;
    text-align: left;
}

h3 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 6px;
    color: #333;
}

.desc {
    font-size: 14px;
    color: #666;
    margin-bottom: 12px;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 14px;
}

.tag:hover {
    background: var(--secondary-color);
    color: #fff;
    transform: translateY(-1px);
}

.info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
}

.views {
    font-size: 13px;
    color: #888;
}

.btn {
    background: var(--btn-color);
    color: #fff;
    padding: 6px 14px;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    transition: background 0.3s ease, transform 0.2s;
}

.btn:hover {
    background: var(--btn-color-hover);
    transform: translateY(-2px);
}
</style>

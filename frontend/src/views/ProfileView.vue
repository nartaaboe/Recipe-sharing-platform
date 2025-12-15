<template>
    <div class="page-root profile-page">
        <div v-if="!user || !user.token" class="not-logged-in">
            <p>Please log in first to view your profile.</p>
            <button @click="goLogin">Go to Login</button>
        </div>

        <div v-else>
            <div class="profile-header">
                <img class="avatar" :src="user.avatar?.startsWith('http') ? user.avatar : (user.avatar?.startsWith('/') ? user.avatar : `/src/assets${user.avatar || '/avatar.jpg'}`)" alt="Avatar" />
                <div class="profile-info">
                    <h2 class="username">{{ user.username }}</h2>
                    <button class="edit-btn" @click="editProfile">Edit Profile</button>
                    <button class="logout-btn" @click="logout">Logout</button>
                </div>
            </div>

            <div class="profile-stats">
                <span><strong>{{ myRecipes?.length || 0 }}</strong> Recipes</span>
                <span><strong>{{ user.followers || 0 }}</strong> Followers</span>
                <span><strong>{{ user.following || 0 }}</strong> Following</span>
            </div>

            <div class="profile-tabs">
                <div class="profile-tabs">
                    <button class="tab" :class="{ active: currentTab === 'myRecipes' }"
                        @click="currentTab = 'myRecipes'">My
                        Recipes</button>
                    <button class="tab" :class="{ active: currentTab === 'favorites' }"
                        @click="currentTab = 'favorites'">Favorites</button>
                    <button class="tab" :class="{ active: currentTab === 'collections' }"
                        @click="currentTab = 'collections'">Collections</button>
                </div>
            </div>
            <div v-if="currentTab === 'myRecipes'">
                <div v-if="myRecipes.length" class="recipe-grid">
                    <div class="my-recipe-card" v-for="recipe in myRecipes" :key="recipe._id">
                        <img :src="recipe.image?.startsWith('http') ? recipe.image : (recipe.image?.startsWith('/') ? recipe.image : `/src/assets${recipe.image}`)" alt="Recipe image" class="recipe-thumb" />
                        <div class="recipe-content">
                            <h3 class="recipe-title">{{ recipe.title }}</h3>
                            <p class="recipe-desc">{{ recipe.description }}</p>
                        </div>
                        <div class="recipe-actions">
                            <button class="edit-btn" @click="editRecipe(recipe)">Edit</button>
                            <button class="delete-btn" @click="deleteRecipe(recipe._id)">Delete</button>
                        </div>
                    </div>
                </div>

                <div v-else class="no-recipes">
                    <p>You haven't created any recipes yet.</p>
                </div>
            </div>

            <div v-else-if="currentTab === 'favorites'">
                <div v-if="favorites.length" class="recipe-grid">
                    <RecipeCard v-for="recipe in favorites" :key="recipe.id" :recipe="recipe" class="recipes" />
                </div>
                <div v-else class="no-favorites">
                    <p>You haven't favorited any recipes yet.</p>
                </div>
            </div>

            <div v-else-if="currentTab === 'collections'">
                <!-- collections -->
            </div>
        </div>
        <BaseModal v-if="mode === 'base'" :isOpen="isOpen" :title="modalTitle" :message="modalMessage"
            :onConfirm="confirm" :onCancel="cancel" />

        <EditModal v-else :isOpen="isOpen" :title="modalTitle" :defaultData="tempData" @confirm="confirm"
            @cancel="cancel" />


    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import avatar from '../assets/avatar.jpg'
import { logoutAPI, getFavoritesAPI, getMyRecipesAPI } from '@/api/user'
import { useRouter } from 'vue-router'
import RecipeCard from '@/components/RecipeCard.vue'
import BaseModal from '@/components/BaseModal.vue'
import { useModal } from '@/composables/useModal'
import { deleteRecipeAPI, updateRecipeAPI } from '@/api/recipe'
import EditModal from '@/components/EditModal.vue'

const router = useRouter()
const currentTab = ref('myRecipes')

const userStore = useUserStore()

const user = computed(() => userStore.userInfo)

const favorites = ref([])
const myRecipes = ref([])

const {
    isOpen,
    mode,
    modalTitle,
    modalMessage,
    tempData,
    openModal,
    openEditModal,
    confirm,
    cancel
} = useModal()


const loadRecipes = async () => {
    try {
        if (currentTab.value === 'myRecipes') {
            myRecipes.value = await getMyRecipesAPI()
            console.log('My recipes:', myRecipes.value)
        } else if (currentTab.value === 'favorites') {
            favorites.value = await getFavoritesAPI()
        }
    } catch (err) {
        console.error('Failed to load recipes:', err)
    }
}

watch(currentTab, loadRecipes)
onMounted(loadRecipes)


const goLogin = () => {
    router.push('/login')
}

const logout = async () => {
    await logoutAPI()
    userStore.logout()
    router.push('/')
}

const editProfile = () => {
    router.push('/profile/edit')
}

const editRecipe = async (recipe) => {
    const data = await openEditModal('Edit Recipe', recipe)
    console.log('Received data from modal:', data)
    if (!data) return
    try {
        const formData = new FormData()
        formData.append('title', data.title)
        formData.append('description', data.description)
        if (data.image) formData.append('image', data.image)
        console.log('Updating recipe with data:', data.image)
        await updateRecipeAPI(recipe._id, formData)
        alert('Recipe updated successfully!')
        await loadRecipes()
    } catch (err) {
        console.error('Failed to update recipe:', err)
        alert('Failed to update recipe. Please try again.')
    }
}

const deleteRecipe = async (id) => {
    const confirmed = await openModal('Delete Recipe', 'Are you sure you want to delete this recipe? This action cannot be undone.')
    if (!confirmed) return
    try {
        await deleteRecipeAPI(id)
        alert('Recipe deleted successfully!')
        await loadRecipes()
    } catch (err) {
        console.error('Failed to delete recipe:', err)
        alert('Failed to delete recipe. Please try again.')
    }
}

</script>

<style scoped>
.page-root {
    max-width: 960px;
    margin: 0 auto;
    padding: 30px;
    font-family: Arial, sans-serif;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 20px;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 100%;
    object-fit: cover;
}

.profile-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.edit-btn {
    padding: 8px 14px;
    background-color: var(--btn-color);
    border: none;
    color: white;
    cursor: pointer;
    margin-left: 10px;
    border-radius: 6px;
}

.edit-btn:hover {
    background: var(--btn-color-hover);
}

.profile-stats {
    margin: 20px 0;
    display: flex;
    gap: 25px;
    font-size: 14px;
    color: #666;
}

.profile-tabs {
    display: flex;
    gap: 20px;
    margin-bottom: 25px;
}

.tab {
    border: none;
    background: transparent;
    padding: 8px 0;
    cursor: pointer;
    border-bottom: 2px solid transparent;
}

.tab.active {
    border-color: black;
    font-weight: bold;
}

.my-recipe-card {
    border: 1px solid #eee;
    border-radius: 12px;
    background: #fff;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: all 0.2s ease;
}

.my-recipe-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recipe-thumb {
    width: 100%;
    height: 160px;
    border-radius: 12px;
    object-fit: cover;
}

.recipe-content {
    flex: 1;
}

.recipe-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.delete-btn {
    padding: 6px 12px;
    border: 1px solid var(--btn-color);
    background: white;
    color: var(--secondary-color);
    border-radius: 6px;
    cursor: pointer;
}

.delete-btn:hover {
    background: var(--btn-color);
    color: white;
}

.no-recipes {
    text-align: center;
    color: #777;
    padding: 40px 0;
}

.recipe-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 24px;
}

.recipe-thumb {
    width: 100%;
    height: 160px;
    object-fit: cover;
    border-radius: 16px;
}

.recipe-title {
    font-size: 16px;
    margin: 10px 0 4px;
}

.recipe-desc {
    font-size: 13px;
    color: #555;
}

.not-logged-in {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    font-size: 16px;
    gap: 12px;
}

.not-logged-in button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background-color: var(--btn-color);
    color: white;
    cursor: pointer;
}

.logout-btn {
    padding: 8px 14px;
    border: 1px solid var(--btn-color);
    background: #fff;
    color: var(--secondary-color);
    cursor: pointer;
    margin-left: 10px;
    border-radius: 6px;
}

.logout-btn:hover {
    background: var(--btn-color);
    color: white;
}
</style>

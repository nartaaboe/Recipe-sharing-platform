<template>
    <div class="page-root">
        <div ref="printableArea" class="printable-content">
            <div class="hero">
                <div class="hero-image">
                    <img :src="`http://localhost:5001${recipe.image}`" alt="recipe" crossorigin="anonymous" />
                </div>

                <div class="title-row">
                    <div class="title-block">
                        <h1 class="recipe-title">{{ recipe.title }}</h1>
                        <div class="tag-row">
                            <span v-for="tag in recipe.tags" :key="tag" class="tag-btn"># {{ tag }}</span>
                        </div>
                    </div>

                    <div class="title-actions" data-html2canvas-ignore>
                        <button class="icon-btn" @click="toggleLike">
                            <Heart :stroke="isLiked ? '#ff6b35' : '#222'" :fill="isLiked ? '#ff6b35' : 'none'" />
                        </button>
                        <div class="share-wrapper">
                            <button class="icon-btn" @click="handleShare">
                                <Share2 />
                            </button>
                            <transition name="fade">
                                <span v-if="showCopyTooltip" class="copy-tooltip">Link Copied!</span>
                            </transition>
                        </div>
                    </div>
                </div>
            </div>

            <div class="meta-row">
                <div class="meta-item"><strong>Prep</strong> {{ recipe.prepTime }} mins</div>
                <div class="meta-item"><strong>Cook</strong> {{ recipe.cookTime }} mins</div>
                <div class="meta-item"><strong>Serves</strong> {{ recipe.servings }} persons</div>
                <div class="meta-item"><strong>Calories</strong> {{ recipe.calories }}</div>
            </div>

            <p class="short-desc">{{ recipe.description }}</p>

            <div class="author-actions">
                <div class="author-card">
                    <img :src="`http://localhost:5001${recipe.author.avatar}`" alt="author" class="author-avatar" />
                    <div class="author-info">
                        <div class="author-name">{{ recipe.author.username }}</div>
                        <div class="author-role">{{ new Date(recipe.createdAt).toLocaleDateString() }}</div>
                    </div>
                </div>

                <div class="actions-group" data-html2canvas-ignore>
                    <button class="btn-outline" @click="downloadPDF">Download PDF</button>
                    <button class="btn-ghost" @click="viewMore">More Recipes →</button>
                </div>
            </div>

            <div class="content-grid">
                <section class="ingredients">
                    <h2>Ingredients</h2>
                    <ul>
                        <li v-for="(ing, i) in recipe.ingredients" :key="i">{{ ing }}</li>
                    </ul>
                </section>

                <section class="nutrition">
                    <h2>Nutrition</h2>
                    <ul>
                        <li v-for="(n, i) in recipe.nutrition" :key="i">{{ n }}</li>
                    </ul>
                </section>

            </div>

            <section class="instructions">
                <h2>Cooking <span>Instructions</span></h2>
                <div class="step">
                    <div v-for="(step, idx) in recipe.instructions" :key="idx" class="step-card">
                        <!-- <div class="step-index">{{ idx + 1 }}</div> -->
                        <div class="step-body">
                            <p class="step-text">{{ step }}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <section class="reviews">
            <h2>Cooking <span>Reviews</span></h2>
            <div v-if="reviews.length" class="review-list">
                <div v-for="r in reviews" :key="r.id" class="review-item">
                    <div class="review-head">
                        <img :src="r.avatar" class="review-avatar" />
                        <div>
                            <div class="review-author">{{ r.name }}</div>
                            <div class="review-meta">{{ r.date }} · {{ r.rating }}⭐</div>
                        </div>
                    </div>
                    <p class="review-body">{{ r.text }}</p>
                </div>
            </div>
            <div v-else class="no-reviews">Be the first to review this recipe.</div>
        </section>

        <section class="related">
            <h2>Related <span>Recipes</span></h2>
            <div class="related-row">
                <article v-for="rel in related" :key="rel.id" class="rel-card">
                    <img :src="rel.image" alt="" class="rel-thumb" />
                    <div class="rel-info">
                        <div class="rel-title">{{ rel.title }}</div>
                        <div class="rel-sub">{{ rel.author }}</div>
                    </div>
                </article>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Heart, Share2 } from 'lucide-vue-next'
import { getRecipeAPI } from '@/api/recipe'
import { addFavoriteAPI, removeFavoriteAPI, getFavoritesAPI } from '@/api/user'
import html2pdf from 'html2pdf.js'

const router = useRouter()
const route = useRoute()
const recipeId = route.params.id // 从路由拿到 ID
const recipe = ref({
    title: '',
    description: '',
    image: '',
    tags: [],
    prepTime: 0,
    cookTime: 0,
    servings: 0,
    calories: 0,
    author: { username: '', avatar: '' },
    ingredients: [],
    nutrition: [],
    instructions: [],
    reviews: [],
    createdAt: '',
})
const isLiked = ref(false)
const reviews = ref([])
const related = ref([])
const printableArea = ref(null) // 绑定 DOM
const isGeneratingPdf = ref(false)

const showCopyTooltip = ref(false)

const fetchRecipe = async () => {
    try {
        const res = await getRecipeAPI(recipeId)
        recipe.value = res

        reviews.value = res.reviews || []
        //related.value = res.related || []
    } catch (err) {
        console.error('Failed to fetch recipe:', err)
    }
}

onMounted(async () => {
    fetchRecipe()
    try {
        const favorites = await getFavoritesAPI()
        console.log('User favorites:', favorites)
        isLiked.value = favorites.some(r => r._id === recipeId)
    } catch (err) {
        console.error('Failed to load favorites', err)
    }
})

const toggleLike = async () => {
    try {
        if (isLiked.value) {
            await removeFavoriteAPI(recipeId)
            isLiked.value = false
        } else {
            await addFavoriteAPI(recipeId)
            isLiked.value = true
        }
    }
    catch (err) {
        console.error('Failed to toggle like:', err)
        alert('Failed to update favorite. Please try again.')
    }
}

const handleShare = async () => {
    const shareData = {
        title: recipe.value.title,
        text: `Check out this delicious recipe: ${recipe.value.title} by ${recipe.value.author?.username || 'a chef'}`,
        url: window.location.href
    }

    // Try native share API (works on mobile and some desktop browsers)
    if (navigator.share && navigator.share instanceof Function) {
        try {
            await navigator.share(shareData)
            console.log('Shared successfully')
            return
        } catch (err) {
            // User cancelled share - don't treat as error
            if (err.name === 'AbortError') {
                return
            }
            console.error('Error sharing:', err)
            // Fall through to clipboard method
        }
    }
    
    // Fallback: Copy to clipboard (for desktop browsers)
    try {
        await navigator.clipboard.writeText(shareData.url)
        // Show "Link Copied!" tooltip
        showCopyTooltip.value = true
        setTimeout(() => {
            showCopyTooltip.value = false
        }, 2000)
    } catch (err) {
        console.error('Failed to copy:', err)
        // Final fallback: show URL in alert
        alert(`Share this recipe: ${shareData.url}`)
    }
}

const downloadPDF = () => {
    isGeneratingPdf.value = true

    const element = printableArea.value
    const opt = {
        margin: [10, 10, 10, 10], // 上右下左边距 (mm)
        filename: `${recipe.value.title.replace(/\s+/g, '_')}_Recipe.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2, // 提高清晰度
            useCORS: true, // 允许跨域加载图片
            scrollY: 0 // 防止滚动条偏移导致截图不全
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
            isGeneratingPdf.value = false
        })
        .catch(err => {
            console.error('PDF Generation failed:', err)
            isGeneratingPdf.value = false
        })
}

function viewMore() {
    if (recipe.value && recipe.value.author) {
        // 跳转到 /recipes 页面，并带上查询参数 author
        router.push({
            path: '/recipes',
            query: { author: recipe.value.author._id }
        })
    }
}
</script>

<style scoped>
.right-col {
    margin-left: 328px;
    max-width: 820px;
}

.hero-image {
    width: 100%;
    height: 420px;
    border-radius: 16px;
    overflow: hidden;
    background: #eee;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.hero-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.title-row {
    margin-top: 18px;
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 12px;
}

.title-block {
    flex: 1 1 auto;
}

.recipe-title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    line-height: 1.05;
}

.tag-row {
    margin-top: 8px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.title-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.share-wrapper {
    position: relative;
    display: inline-block;
}

.icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-btn:hover {
    background-color: #f0f0f0;
}

.icon {
    width: 20px;
    height: 20px;
    stroke: #333;
}

.copy-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    margin-bottom: 8px;
    pointer-events: none;
    z-index: 10;
}

.copy-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -4px;
    border-width: 4px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.meta-row {
    display: flex;
    gap: 18px;
    margin-top: 14px;
    color: var(--text-color);
    font-size: 14px;
}

.meta-item strong {
    font-weight: 700;
    color: #333;
}

.short-desc {
    margin-top: 14px;
    color: #444;
    font-size: 15px;
    line-height: 1.6;
}

.author-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 18px;
    background: #fff;
    padding: 14px;
    border-radius: 12px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
}

.author-card {
    display: flex;
    gap: 12px;
    align-items: center;
}

.author-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: var(--shadow);
}

.author-info {
    display: flex;
    flex-direction: column;
}

.author-name {
    font-weight: 700;
}

.author-role {
    color: var(--text-color);
    font-size: 13px;
}

.actions-group {
    display: flex;
    gap: 10px;
    align-items: center;
}

.btn-outline {
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: #fff;
    cursor: pointer;
}

.btn-ghost {
    padding: 8px 12px;
    border-radius: 10px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-color);
    font-weight: 700;
}

.content-grid {
    margin-top: 22px;
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 24px;
    align-items: start;
}

.ingredients,
.nutrition {
    background: #fff;
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s;
}

.ingredients ul,
.nutrition ul {
    list-style: none;
    padding: 0;
    margin: 10px 0;
}

.ingredients li,
.nutrition li {
    position: relative;
    padding-left: 16px;
    margin-bottom: 8px;
}

.ingredients li::before,
.nutrition li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--primary-color);
    font-weight: bold;
}


.instructions {
    margin-top: 30px;
}

.instructions span {
    color: var(--primary-color);
}

.step-card {
    display: flex;
    gap: 16px;
    background: #fff;
    padding: 18px;
    border-radius: 16px;
    margin: 10px 0;
    align-items: flex-start;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s;
}

.step-body p {
    margin: 0;
    color: #333;
    line-height: 1.7;
}

.reviews {
    margin-top: 20px;
}

.reviews span {
    color: var(--primary-color);
}

.review-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.review-item {
    background: #fff;
    padding: 12px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.review-head {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 8px;
}

.review-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
}

.review-author {
    font-weight: 700;
}

.review-meta {
    color: var(--text-color);
    font-size: 13px;
}

.review-body {
    margin: 0;
    color: #444;
}

.related {
    margin-top: 20px;
}

.related span {
    color: var(--primary-color);
}

.related-row {
    margin-top: 10px;
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 6px;
}

.rel-card {
    min-width: 200px;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    flex: 0 0 auto;
}

.rel-thumb {
    width: 100%;
    height: 120px;
    object-fit: cover;
    display: block;
}

.rel-info {
    padding: 10px;
}

.rel-title {
    font-weight: 700;
    font-size: 14px;
}

.rel-sub {
    color: var(--text-color);
    font-size: 13px;
    margin-top: 6px;
}

/* small screens */
@media (max-width: 1100px) {
    .page-root {
        padding: 18px;
    }

    .left-col {
        display: none;
    }

    .right-col {
        margin-left: 0;
        max-width: 100%;
    }

    .content-grid {
        grid-template-columns: 1fr;
    }

    .hero-image {
        height: 300px;
    }

    .step-img {
        width: 100%;
        height: 200px;
    }

    .related-row {
        gap: 10px;
    }
}
</style>

<template>
    <div class="page-root">
        <div v-if="isAuthorMode" class="author-mode-container">
            <div class="author-header">
                <button class="back-btn" @click="clearAuthorFilter">
                    ← Back to All Recipes
                </button>
                <h2 class="page-h1">
                    Recipes by <span class="accent">{{ authorName }}</span>
                </h2>
                <p class="sub" v-if="!loading">Found {{ authorRecipes.length }} recipes</p>
            </div>

            <div v-if="loading" class="loading-state">Loading...</div>

            <div v-else-if="authorRecipes.length > 0" class="author-grid">
                <RecipeCard v-for="item in authorRecipes" :key="item.id" :recipe="item" />
            </div>

            <div v-else class="empty-state">
                <p>This author hasn't published any recipes yet.</p>
            </div>
        </div>

        <div v-else class="discovery-mode-container">
            <aside class="left-col">
                <section class="rank-list">
                    <div class="section-title small">Popular</div>
                    <ol>
                        <li v-for="(item, idx) in mostViewed" :key="item.id" class="rank-item">
                            <div class="rank-index">{{ (idx + 1).toString().padStart(2, '0') }}</div>
                            <div class="rank-body">
                                <div class="rank-meta">
                                    <div class="rank-title">{{ item.title }}</div>
                                    <div class="rank-sub">{{ item.author?.username }} · {{ item.date }}</div>
                                </div>
                            </div>
                        </li>
                    </ol>
                </section>

                <section class="tags-section">
                    <div class="section-title">Popular Tags</div>
                    <div class="tags-wrap">
                        <button v-for="t in popularTags" :key="t" class="tag-btn"># {{ t }}</button>
                    </div>
                </section>
            </aside>

            <main class="right-col">
                <div class="grid-main">
                    <section class="featured-card">
                        <div class="featured-thumb-wrap">
                            <img :src="`http://localhost:5001${featured.image}`" alt="featured"
                                class="featured-image" />
                        </div>
                        <div class="featured-body">
                            <div class="title-row">
                                <h2 class="featured-title">{{ featured.title }}</h2>
                                <div class="featured-actions">
                                    <Heart class="icon-btn" />
                                    <Share2 class="icon-btn" />
                                </div>
                            </div>

                            <p class="featured-desc">{{ featured.description }}</p>
                            <div class="featured-meta">
                                <div class="author">
                                    <img :src="`http://localhost:5001${featured.author?.avatar}`" class="avatar" />
                                    <div>
                                        <div class="author-name">{{ featured.author?.username }}</div>
                                        <div class="author-date">{{ new Date(featured.createdAt).toLocaleDateString() }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="latest-section">
                        <div class="latest-header">
                            <h3>Latest Recipes</h3>
                        </div>

                        <div class="latest-grid">
                            <article v-for="r in latest" :key="r.id" class="article-card">
                                <img :src="`http://localhost:5001${r.image}`" class="article-thumb" />
                                <div class="article-body">
                                    <h4 class="article-title">{{ r.title }}</h4>
                                    <div class="article-meta">{{ r.author?.username }} · {{ r.date }}</div>
                                </div>
                            </article>
                        </div>
                    </section>

                    <aside class="recommended">
                        <h3 class="rec-title">Recommended Recipes</h3>
                        <ol class="rec-list">
                            <li v-for="(it, i) in recommended" :key="it.id" class="rec-item">
                                <span class="rec-num">{{ (i + 1).toString().padStart(2, '0') }}</span>
                                <div class="rec-text">
                                    <div class="rec-head">{{ it.title }}</div>
                                    <div class="rec-date">{{ it.date }}</div>
                                </div>
                            </li>
                        </ol>
                    </aside>
                </div>
            </main>
            <div style="clear: both;"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect, reactive, onMounted, onUnmounted } from 'vue'
import { Heart, Share2 } from 'lucide-vue-next'
import { getPopularRecipesAPI, getLatestRecipesAPI, getAllRecipesAPI } from '@/api/recipe'
import { useRoute, useRouter } from 'vue-router'
import RecipeCard from '@/components/RecipeCard.vue'

const mostViewed = ref([])
const latest = ref([])
const featured = ref({})
const recommended = ref([])
const popularTags = ref([])

const authorRecipes = ref([])
const authorName = ref('Author')
const loading = ref(false)

// Using reactive for filter state
const filterState = reactive({
    searchQuery: '',
    sortBy: 'latest',
    category: 'all'
})

// watchEffect example - automatically tracks dependencies
let watchEffectStop = null
onMounted(() => {
    watchEffectStop = watchEffect(() => {
        // This will run whenever filterState changes
        if (filterState.searchQuery || filterState.sortBy !== 'latest' || filterState.category !== 'all') {
            console.log('Filter state changed:', filterState)
            // Could trigger a search here
        }
    })
})

onUnmounted(() => {
    // Cleanup watchEffect
    if (watchEffectStop) {
        watchEffectStop()
    }
})

const isAuthorMode = computed(() => !!route.query.author)

const route = useRoute()
const router = useRouter()

const fetchDiscoveryData = async () => {
    try {
        // 热门菜谱
        const popularRes = await getPopularRecipesAPI(5)
        mostViewed.value = popularRes.map(r => ({
            id: r._id,
            title: r.title,
            author: r.author,
            date: new Date(r.createdAt).toLocaleDateString(),
            image: r.image
        }))

        // 最新菜谱
        const latestRes = await getLatestRecipesAPI()
        // 映射数据以便显示
        const mappedLatest = latestRes.recipes.map(r => ({
            ...r,
            id: r._id, // 确保 id 字段存在
            date: new Date(r.createdAt).toLocaleDateString(),
        }))
        latest.value = mappedLatest

        // 取最新一条作为 featured
        featured.value = mappedLatest[0] || {}

        // 推荐菜谱（随便取 2 条）
        recommended.value = mappedLatest.slice(1, 3)

        // popularTags
        const allRes = await getAllRecipesAPI(1, 50)
        const tagsSet = new Set()
        allRes.recipes.forEach(r => r.tags?.forEach(t => tagsSet.add(t)))
        popularTags.value = Array.from(tagsSet).slice(0, 10)

    } catch (err) {
        console.error('Failed to load discovery recipes:', err)
    }
}

// 2. 获取特定作者的数据 (新逻辑)
const fetchAuthorRecipes = async () => {
    const authorId = route.query.author
    if (!authorId) return

    loading.value = true
    try {
        // 调用我们之前修改过的 getAllRecipesAPI (支持传 author)
        const res = await getAllRecipesAPI(1, 100, '', authorId)

        authorRecipes.value = res.recipes.map(r => ({
            ...r,
            id: r._id,
            date: new Date(r.createdAt).toLocaleDateString()
        }))

        // 尝试从第一条数据获取作者名字
        if (res.recipes.length > 0 && res.recipes[0].author) {
            authorName.value = res.recipes[0].author.username
        } else {
            authorName.value = 'User'
        }
    } catch (err) {
        console.error('Failed to load author recipes:', err)
    } finally {
        loading.value = false
    }
}

// 3. 退出作者模式
const clearAuthorFilter = () => {
    router.push('/recipes') // 清除 query 参数，回到发现模式
}

// --- 生命周期与监听 ---

onMounted(() => {
    if (isAuthorMode.value) {
        fetchAuthorRecipes()
    } else {
        fetchDiscoveryData()
    }
})

// 监听路由参数变化（例如点击 "Back" 或从详情页跳转过来）
watch(() => route.query.author, (newVal) => {
    if (newVal) {
        fetchAuthorRecipes()
    } else {
        fetchDiscoveryData()
    }
})

</script>

<style scoped>
.left-col {
    width: 300px;
    float: left;
    margin-right: 28px;
    display: flex;
    flex-direction: column;
    gap: 28px;
}

.right-col {
    margin-left: 328px;
}

.section-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 10px;
    text-transform: uppercase;
}

.section-title.small {
    font-size: 12px;
    color: var(--text-color);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
}

.rank-list ol {
    list-style: none;
    padding: 0;
    margin: 0;
}

.rank-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(20, 20, 20, 0.03);
}

.rank-index {
    min-width: 36px;
    font-weight: 800;
    color: var(--primary-color);
    font-size: 18px;
}

.rank-body {
    display: flex;
    gap: 10px;
    align-items: center;
}

.rank-thumb {
    width: 74px;
    height: 54px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: var(--shadow);
}

.rank-meta {
    max-width: 170px;
}

.rank-title {
    font-weight: 600;
    font-size: 16px;
    line-height: 1.1;
    margin-bottom: 6px;
}

.rank-sub {
    font-size: 13px;
    color: var(--muted);
}

.tags-section {
    padding-top: 6px;
}

.tags-wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
}

.page-header {
    margin-bottom: 18px;
}

.page-h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.4px;
}

.sub {
    margin-top: 6px;
    color: var(--muted);
}

.grid-main {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.featured-card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    flex-direction: column;
    gap: 20px;
    padding: 18px;
}

.featured-thumb-wrap {
    position: relative;
    width: 100%;
    min-width: 340px;
    border-radius: 10px;
    overflow: hidden;
}

.featured-image {
    width: 100%;
    height: 420px;
    object-fit: cover;
    display: block;
}

.title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.featured-actions {
    display: flex;
    gap: 10px;
}

.icon-btn {
    width: 20px;
    height: 20px;
    cursor: pointer;
    stroke: #222;
    /* 或 var(--text-color) */
}


.featured-body {
    padding: 6px 4px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: calc(100% - 20px);
}

.featured-title {
    margin: 0;
    font-size: 26px;
    line-height: 1.15;
    font-weight: 800;
}

.featured-desc {
    margin-top: 0px;
    color: #444;
    font-size: 14px;
    line-height: 1.45;
}

.featured-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 14px;
}

.author {
    display: flex;
    gap: 10px;
    align-items: center;
}

.author-name {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-color);
}

.author-date {
    font-size: 13px;
    color: #555;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.latest-section {
    margin-top: 20px;
}

.latest-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 12px;
}

.latest-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
}

.accent {
    color: var(--text-color);
    font-weight: 800;
}

.latest-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
}

.article-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    gap: 12px;
    padding: 10px;
    box-shadow: 0 4px 14px rgba(10, 10, 10, 0.04);
    align-items: center;
}

.article-thumb {
    width: 110px;
    height: 76px;
    object-fit: cover;
    border-radius: 8px;
}

.article-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.article-title {
    font-size: 14px;
    margin: 0;
    font-weight: 700;
    line-height: 1.15;
}

.article-meta {
    font-size: 12px;
    color: var(--muted);
}

.recommended {
    background: transparent;
    padding-top: 6px;
}

.rec-title {
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 10px;
}

.rec-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.rec-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 0;
    border-top: 1px dashed rgba(0, 0, 0, 0.04);
}

.rec-num {
    min-width: 34px;
    font-weight: 800;
    color: var(--accent);
}

.rec-head {
    font-weight: 700;
    font-size: 14px;
}

.rec-date {
    font-size: 12px;
    color: var(--muted);
    margin-top: 4px;
}

.author-mode-container {
    padding: 0 10px;
}

.author-header {
    margin-bottom: 30px;
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
}

.back-btn {
    background: none;
    border: none;
    color: var(--muted);
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    margin-bottom: 10px;
}

.back-btn:hover {
    color: var(--primary-color);
    text-decoration: underline;
}

.page-h1 .accent {
    color: var(--primary-color);
}

.author-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 24px;
}

/* 适配你的原有小屏 CSS */
@media (max-width: 1100px) {
    .page-root {
        padding: 18px;
    }

    .left-col {
        display: none;
    }

    .right-col {
        margin-left: 0;
    }

    .grid-main {
        grid-template-columns: 1fr;
    }

    .featured-thumb-wrap {
        min-width: auto;
        width: 100%;
    }

    .featured-card {
        flex-direction: column;
        gap: 12px;
    }

    .featured-body {
        width: 100%;
    }

    .latest-grid {
        grid-template-columns: 1fr;
    }

    /* 作者模式的小屏适配 */
    .author-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<template>
    <nav class="navbar">
        <div class="left-section">
            <img class="logo" src="../assets/logo.jpg" alt="Recipe Sharing" />
        </div>

        <ul class="links">
            <li>
                <RouterLink to="/">HOME</RouterLink>
            </li>
            <li>
                <RouterLink to="/add">CREATE</RouterLink>
            </li>
            <li>
                <RouterLink to="/recipes">RECIPES</RouterLink>
            </li>
            <li>
                <RouterLink to="/chefs">CHEFS</RouterLink>
            </li>
            <li>
                <RouterLink to="/login">LOGIN</RouterLink>
            </li>
            <li>
                <RouterLink to="/register">REGISTER</RouterLink>
            </li>
        </ul>

        <div class="right-section">
            <div class="search-box">
                <input type="text" placeholder="Search recipes..." @keyup.enter="handleSearch" />
                <Search class="icon" @click="handleSearch" />
            </div>
            <RouterLink to="/profile" class="profile-btn">
                <User class="icon" />
            </RouterLink>
        </div>
    </nav>
</template>

<script setup>
import { ref } from "vue";
import { Search, User } from "lucide-vue-next";
import { useRouter } from "vue-router";

const query = ref("");
const router = useRouter();

const handleSearch = () => {
    if (!query.value.trim()) return;
    // 跳转到搜索页并传递搜索关键词
    router.push({ path: "/search", query: { q: query.value.trim() } });
};
</script>

<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--card-bg);
    padding: 10px 30px;
    box-shadow: 0 2px 5px var(--shadow-color);
    border-bottom: 1px solid var(--border-color);
}

.left-section {
    display: flex;
    align-items: center;
}

.logo {
    height: 52px;
    margin: 6px;
}

.links {
    display: flex;
    list-style: none;
    gap: 30px;
}

.links a {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.2s ease;
}

.links a:hover {
    color: var(--primary-color);
}

.links a.router-link-exact-active {
    color: var(--primary-color);
    font-weight: 600;
}

.right-section {
    display: flex;
    align-items: center;
    gap: 15px;
}

.search-box {
    display: flex;
    align-items: center;
    border-radius: 36px;
    padding: 4px 16px;
    background: var(--bg-color);
    transition: box-shadow 0.2s ease;
    width: 280px;
}

.search-box input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: var(--text-color);
}

.search-box button {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
}

.search-box:hover {
    box-shadow: 0 0 0 2px rgba(255, 184, 107, 0.15);
}

.profile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #000000;
    font-size: 18px;
    text-decoration: none;
    transition: all 0.2s ease;
}

.profile-btn:hover {
    background: var(--text-color);
}

.search-box .icon {
    width: 18px;
    height: 18px;
    color: var(--text-color);
}

.profile-btn .icon {
    width: 20px;
    height: 20px;
    color: #fff;
}

@media (max-width: 768px) {
    .logo {
        height: 40px;
        margin: 6px;
    }

    .links {
        gap: 18px;
    }

    .links a {
        font-size: 14px;
    }

    .search-box {
        width: 180px;
        background: var(--bg-color);
        box-shadow: none;
    }

    .search-box input {
        border-radius: 20px;
        font-size: 12px;
    }
}
</style>

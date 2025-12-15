<template>
    <div class="auth-page">
        <div class="auth-card">
            <div class="logo">
                <img src="../assets/logo.jpg" alt="Logo" />
            </div>
            <h2>Welcome Back</h2>
            <p class="subtitle">Login to your account</p>

            <form @submit.prevent="login">
                <div class="input-group">
                    <Mail class="icon" />
                    <input v-model="email" type="email" placeholder="Email" required />
                </div>

                <div class="input-group">
                    <Lock class="icon" />
                    <input v-model="password" type="password" placeholder="Password" required />
                </div>

                <div class="forgot-password">
                    <a href="#">Forgot password?</a>
                </div>

                <button type="submit">Login</button>
            </form>

            <p class="signup">
                Don't have an account? <a href="/register">Sign Up</a>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { Mail, Lock } from "lucide-vue-next";
import { loginAPI } from '@/api/user'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const email = ref("");
const password = ref("");


const login = async () => {
    try {
        const res = await loginAPI({
            email: email.value,
            password: password.value
        })
        // Handle both formats: { user, token } or { ...user, token }
        if (res.user) {
            userStore.setUserInfo({ ...res.user, token: res.token })
            userStore.setToken(res.token)
        } else {
            userStore.setUserInfo(res)
            userStore.setToken(res.token)
        }
        router.push('/')
    } catch (err) {
        console.error("login error", err)
    }
};
</script>

<style scoped>
.auth-page {
    display: flex;
    align-items: center;
    justify-content: center;
}

.auth-card {
    background: #fff;
    padding: 40px 30px;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 380px;
    text-align: center;
}

.logo img {
    width: 80px;
    margin-bottom: 20px;
}

h2 {
    margin-bottom: 6px;
    font-size: 28px;
    font-weight: 700;
    color: var(--text-color);
}

.subtitle {
    margin-bottom: 20px;
    color: #777;
    font-size: 14px;
}

form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.input-group {
    position: relative;
}

.input-group .icon {
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    font-size: 12px;
    color: var(--btn-color);
    width: 18px;
    height: 18px;
}

.input-group input {
    width: 100%;
    padding: 10px 12px 10px 36px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 14px;
    transition: 0.3s;
}

.input-group input:focus {
    outline: none;
    border-color: var(--btn-color);
    box-shadow: 0 0 5px rgba(255, 127, 80, 0.5);
}

.forgot-password {
    text-align: right;
    font-size: 13px;
}

.forgot-password a {
    color: var(--secondary-color);
    text-decoration: none;
}

.forgot-password a:hover {
    text-decoration: underline;
}

button {
    background: var(--btn-color);
    color: #fff;
    padding: 12px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background: var(--btn-color-hover);
    transform: translateY(-2px);
}

.signup {
    margin-top: 15px;
    font-size: 13px;
    color: #555;
}

.signup a {
    color: var(--secondary-color);
    text-decoration: none;
    font-weight: 600;
}

.signup a:hover {
    text-decoration: underline;
}

@media (max-width: 480px) {
    .auth-card {
        padding: 30px 20px;
    }
}
</style>

<template>
    <div class="auth-page">
        <div class="auth-card">
            <div class="logo">
                <img src="../assets/logo.jpg" alt="Logo" />
            </div>
            <h2>Create Account</h2>
            <p class="subtitle">Sign up to get started</p>

            <form @submit.prevent="register">
                <div class="input-group">
                    <User class="icon" />
                    <input 
                        v-model="name" 
                        type="text" 
                        placeholder="Full Name" 
                        :class="{ 'error': errors.name }"
                        @blur="validateName"
                        @input="clearError('name')"
                    />
                    <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                </div>

                <div class="input-group">
                    <Mail class="icon" />
                    <input 
                        v-model="email" 
                        type="email" 
                        placeholder="Email" 
                        :class="{ 'error': errors.email }"
                        @blur="validateEmail"
                        @input="clearError('email')"
                    />
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>

                <div class="input-group">
                    <Lock class="icon" />
                    <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="password" 
                        placeholder="Password"
                        :class="{ 'error': errors.password }"
                        @blur="validatePassword"
                        @input="clearError('password')"
                    />
                    <span class="toggle" @click="showPassword = !showPassword">
                        <component :is="showPassword ? EyeOff : Eye" class="eye-icon" />
                    </span>
                    <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                </div>

                <div class="input-group">
                    <Lock class="icon" />
                    <input 
                        :type="showConfirmPassword ? 'text' : 'password'" 
                        v-model="confirmPassword"
                        placeholder="Confirm Password" 
                        :class="{ 'error': errors.confirmPassword }"
                        @blur="validateConfirmPassword"
                        @input="clearError('confirmPassword')"
                    />
                    <span class="toggle" @click="showConfirmPassword = !showConfirmPassword">
                        <component :is="showConfirmPassword ? EyeOff : Eye" class="eye-icon" />
                    </span>
                    <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
                </div>

                <button type="submit" :disabled="loading">{{ loading ? 'Registering...' : 'Register' }}</button>
            </form>

            <p class="signup">
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-vue-next";
import { registerAPI } from "../api/user";
import { useRouter } from 'vue-router';

const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);

// Using reactive for errors object
const errors = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
});

const validateName = () => {
    if (!name.value.trim()) {
        errors.name = 'Name is required';
    } else if (name.value.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
    } else if (name.value.trim().length > 50) {
        errors.name = 'Name must be less than 50 characters';
    } else {
        errors.name = '';
    }
};

const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        errors.email = 'Email is required';
    } else if (!emailRegex.test(email.value)) {
        errors.email = 'Please enter a valid email address';
    } else {
        errors.email = '';
    }
};

const validatePassword = () => {
    if (!password.value) {
        errors.password = 'Password is required';
    } else if (password.value.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    } else if (password.value.length > 100) {
        errors.password = 'Password must be less than 100 characters';
    } else {
        errors.password = '';
    }
    // Re-validate confirm password if it's already filled
    if (confirmPassword.value) {
        validateConfirmPassword();
    }
};

const validateConfirmPassword = () => {
    if (!confirmPassword.value) {
        errors.confirmPassword = 'Please confirm your password';
    } else if (password.value !== confirmPassword.value) {
        errors.confirmPassword = 'Passwords do not match';
    } else {
        errors.confirmPassword = '';
    }
};

const clearError = (field) => {
    if (errors[field]) {
        errors[field] = '';
    }
};

const register = async () => {
    // Validate all fields
    validateName();
    validateEmail();
    validatePassword();
    validateConfirmPassword();

    // Check if there are any errors
    if (errors.name || errors.email || errors.password || errors.confirmPassword) {
        return;
    }

    loading.value = true;
    try {
        const res = await registerAPI({
            username: name.value.trim(),
            email: email.value.trim(),
            password: password.value
        })

        console.log("✅ 注册成功", res)
        router.push('/login')
    } catch (err) {
        console.error("register error", err)
        if (err.response?.data?.message) {
            errors.email = err.response.data.message;
        }
    } finally {
        loading.value = false;
    }
}

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

.input-group input.error {
    border-color: #c62828;
    box-shadow: 0 0 5px rgba(198, 40, 40, 0.3);
}

.error-message {
    display: block;
    color: #c62828;
    font-size: 12px;
    margin-top: 4px;
    text-align: left;
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.input-group .toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 16px;
}

.eye-icon {
    width: 18px;
    height: 18px;
    color: #888;
    transform: translateY(15%);
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

button:hover:not(:disabled) {
    background: var(--btn-color-hover);
    transform: translateY(-2px);
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

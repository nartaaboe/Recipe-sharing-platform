<template>
    <div class="search-bar">
        <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="placeholder"
            @input="handleInput"
            @keyup.enter="handleSearch"
            class="search-input"
        />
        <button @click="handleSearch" class="search-btn">
            <Search class="icon" />
        </button>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { Search } from 'lucide-vue-next'

const props = defineProps({
    placeholder: {
        type: String,
        default: 'Search recipes...'
    },
    modelValue: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue', 'search'])

const searchQuery = ref(props.modelValue)

const handleInput = () => {
    emit('update:modelValue', searchQuery.value)
}

const handleSearch = () => {
    emit('search', searchQuery.value)
}
</script>

<style scoped>
.search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-color);
    border-radius: 30px;
    padding: 8px 16px;
    border: 1px solid #ddd;
    transition: all 0.3s ease;
}

.search-bar:focus-within {
    border-color: var(--btn-color);
    box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
}

.search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: var(--text-color);
}

.search-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    transition: transform 0.2s;
}

.search-btn:hover {
    transform: scale(1.1);
}

.icon {
    width: 18px;
    height: 18px;
    color: var(--btn-color);
}
</style>


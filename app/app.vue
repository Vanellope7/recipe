<script setup lang="ts">
import '~/assets/css/main.css'

const recipes = ref([])
const showAddModal = ref(false)
const loading = ref(true)
const newRecipe = reactive({
  name: '',
  image_url: ''
})

// 加载食谱列表
async function loadRecipes() {
  loading.value = true
  try {
    recipes.value = await $fetch('/api/recipes')
  } catch (e) {
    console.error('加载失败:', e)
  } finally {
    loading.value = false
  }
}

// 添加食谱
async function addRecipe() {
  if (!newRecipe.name || !newRecipe.image_url) {
    alert('请填写完整的食谱信息')
    return
  }

  try {
    await $fetch('/api/recipes', {
      method: 'POST',
      body: {
        name: newRecipe.name,
        image_url: newRecipe.image_url
      }
    })

    newRecipe.name = ''
    newRecipe.image_url = ''
    showAddModal.value = false
    await loadRecipes()
  } catch (e) {
    alert('添加失败: ' + e.message)
  }
}

// 删除食谱
async function deleteRecipe(id: number) {
  if (!confirm('确定要删除这个食谱吗？')) return

  try {
    await $fetch(`/api/recipes/${id}`, {
      method: 'DELETE'
    })
    await loadRecipes()
  } catch (e) {
    alert('删除失败: ' + e.message)
  }
}

// 评分
async function rateRecipe(id: number, score: number) {
  try {
    await $fetch(`/api/recipes/${id}/rate`, {
      method: 'POST',
      body: { score }
    })
    await loadRecipes()
  } catch (e) {
    alert('评分失败: ' + e.message)
  }
}

// 收藏/取消收藏
async function toggleFavorite(recipe: any) {
  try {
    await $fetch(`/api/recipes/${recipe.id}/favorite`, {
      method: 'POST',
      body: { favorite: !recipe.is_favorite }
    })
    await loadRecipes()
  } catch (e) {
    alert('操作失败: ' + e.message)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadRecipes()
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>🍳 食谱小管家</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        + 添加食谱
      </button>
    </header>

    <main class="main">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="recipes.length === 0" class="empty">
        <p>还没有食谱，快来添加第一个吧！</p>
      </div>

      <div v-else class="recipe-grid">
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
          @delete="deleteRecipe"
          @rate="rateRecipe"
          @favorite="toggleFavorite"
        />
      </div>
    </main>

    <!-- 添加食谱模态框 -->
    <div v-if="showAddModal" class="modal" @click.self="showAddModal = false">
      <div class="modal-content">
        <h2>添加新食谱</h2>
        <form @submit.prevent="addRecipe">
          <div class="form-group">
            <label>食谱名称</label>
            <input
              v-model="newRecipe.name"
              type="text"
              placeholder="例如：红烧肉"
              required
            />
          </div>

          <div class="form-group">
            <label>图片 URL</label>
            <input
              v-model="newRecipe.image_url"
              type="url"
              placeholder="https://example.com/image.jpg"
              required
            />
            <small>提示：可以使用 Cloudflare Images 或任何公开的图片 URL</small>
          </div>

          <div class="form-actions">
            <button type="button" @click="showAddModal = false" class="btn btn-secondary">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #ff6b6b;
}

.main {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group small {
  display: block;
  margin-top: 0.5rem;
  color: #999;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #ff6b6b;
  color: white;
}

.btn-primary:hover {
  background: #ff5252;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}
</style>

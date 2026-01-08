<script setup lang="ts">
const props = defineProps<{
  recipe: {
    id: number
    name: string
    image_url: string
    average_rating: number
    rating_count: number
    is_favorite: number
  }
}>()

const emit = defineEmits<{
  delete: [id: number]
  rate: [id: number, score: number]
  favorite: [recipe: any]
}>()

const showRatingModal = ref(false)
const imageError = ref(false)

function handleRate(score: number) {
  emit('rate', props.recipe.id, score)
  showRatingModal.value = false
}

function getStars(rating: number) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  return { fullStars, hasHalfStar }
}

const { fullStars, hasHalfStar } = getStars(props.recipe.average_rating || 0)
</script>

<template>
  <div class="recipe-card" :class="{ favorite: recipe.is_favorite }">
    <div class="recipe-image">
      <img
        v-if="!imageError"
        :src="recipe.image_url"
        :alt="recipe.name"
        @error="imageError = true"
      />
      <div v-else class="image-placeholder">
        <span>🍽️</span>
      </div>
      <button
        @click="emit('favorite', recipe)"
        class="favorite-btn"
        :class="{ active: recipe.is_favorite }"
      >
        {{ recipe.is_favorite ? '❤️' : '🤍' }}
      </button>
    </div>

    <div class="recipe-content">
      <h3>{{ recipe.name }}</h3>

      <div class="recipe-rating">
        <span class="stars">
          <span v-for="i in 5" :key="i" class="star">
            {{
              i <= Math.floor(recipe.average_rating || 0)
                ? '⭐'
                : i - 0.5 <= (recipe.average_rating || 0)
                ? '✨'
                : '☆'
            }}
          </span>
        </span>
        <span class="rating-text">
          {{ recipe.average_rating?.toFixed(1) || '0.0' }}
          <small>({{ recipe.rating_count || 0 }} 人评分)</small>
        </span>
      </div>

      <div class="recipe-actions">
        <button @click="showRatingModal = true" class="btn-rate">
          打分
        </button>
        <button @click="emit('delete', recipe.id)" class="btn-delete">
          删除
        </button>
      </div>
    </div>

    <!-- 评分模态框 -->
    <div v-if="showRatingModal" class="rating-modal" @click.self="showRatingModal = false">
      <div class="rating-modal-content">
        <h3>给 "{{ recipe.name }}" 打分</h3>
        <div class="rating-options">
          <button
            v-for="score in [1, 2, 3, 4, 5]"
            :key="score"
            @click="handleRate(score)"
            class="rating-option"
          >
            <span class="score">{{ score }}</span>
            <span class="stars">{{
              score === 1
                ? '☆'
                : score === 2
                ? '☆☆'
                : score === 3
                ? '⭐'
                : score === 4
                ? '⭐⭐'
                : '⭐⭐⭐'
            }}</span>
            <span class="label">{{
              score === 1 ? '很难吃' : score === 2 ? '不太好' : score === 3 ? '一般' : score === 4 ? '好吃' : '超级好吃'
            }}</span>
          </button>
        </div>
        <button @click="showRatingModal = false" class="btn-cancel">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recipe-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s;
  position: relative;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.recipe-card.favorite::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  width: 8px;
  height: 8px;
  background: #ff6b6b;
  border-radius: 50%;
}

.recipe-image {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
  background: #f0f0f0;
}

.recipe-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.recipe-card:hover .recipe-image img {
  transform: scale(1.05);
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: all 0.2s;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.favorite-btn.active {
  background: rgba(255, 107, 107, 0.9);
}

.recipe-content {
  padding: 1rem;
}

.recipe-content h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1rem;
}

.rating-text {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.rating-text small {
  color: #999;
  font-weight: 400;
}

.recipe-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-rate,
.btn-delete {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-rate {
  background: #f0f0f0;
  color: #333;
}

.btn-rate:hover {
  background: #e0e0e0;
}

.btn-delete {
  background: #ffe0e0;
  color: #d32f2f;
}

.btn-delete:hover {
  background: #ffc0c0;
}

/* 评分模态框 */
.rating-modal {
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

.rating-modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
}

.rating-modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.rating-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.rating-option:hover {
  border-color: #ff6b6b;
  background: #fff5f5;
}

.rating-option .score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6b6b;
  width: 30px;
  text-align: center;
}

.rating-option .stars {
  font-size: 1.25rem;
}

.rating-option .label {
  flex: 1;
  text-align: center;
  font-weight: 500;
  color: #333;
}

.btn-cancel {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: #e0e0e0;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel:hover {
  background: #d0d0d0;
}
</style>

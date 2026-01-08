export default defineEventHandler(async (event) => {
  const db = useCloudflareD1Database(event)

  // 获取所有食谱及其评分和收藏状态
  const { results } = await db.prepare(`
    SELECT
      r.id,
      r.name,
      r.image_url,
      r.created_at,
      r.updated_at,
      COALESCE(AVG(rat.score), 0) as average_rating,
      COUNT(rat.id) as rating_count,
      CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
    FROM recipes r
    LEFT JOIN ratings rat ON r.id = rat.recipe_id
    LEFT JOIN favorites f ON r.id = f.recipe_id
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `).all()

  return results
})

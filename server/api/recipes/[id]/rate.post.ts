export default defineEventHandler(async (event) => {
  const db = useCloudflareD1Database(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { score } = body

  if (!score || score < 1 || score > 5) {
    throw createError({
      statusCode: 400,
      message: '评分必须在 1-5 之间'
    })
  }

  // 检查食谱是否存在
  const recipe = await db.prepare('SELECT id FROM recipes WHERE id = ?').bind(id).first()
  if (!recipe) {
    throw createError({
      statusCode: 404,
      message: '食谱不存在'
    })
  }

  // 先删除该食谱的旧评分（如果需要支持多次评分，可以去掉这段）
  await db.prepare('DELETE FROM ratings WHERE recipe_id = ?').bind(id).run()

  // 插入新评分
  const result = await db.prepare(`
    INSERT INTO ratings (recipe_id, score)
    VALUES (?, ?)
  `).bind(id, score).run()

  if (!result.success) {
    throw createError({
      statusCode: 500,
      message: '评分失败'
    })
  }

  // 返回更新后的平均评分
  const avgRating = await db.prepare(`
    SELECT AVG(score) as average_rating, COUNT(*) as rating_count
    FROM ratings
    WHERE recipe_id = ?
  `).bind(id).first()

  return avgRating
})

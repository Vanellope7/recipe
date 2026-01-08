export default defineEventHandler(async (event) => {
  const db = useCloudflareD1Database(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { favorite } = body

  // 检查食谱是否存在
  const recipe = await db.prepare('SELECT id FROM recipes WHERE id = ?').bind(id).first()
  if (!recipe) {
    throw createError({
      statusCode: 404,
      message: '食谱不存在'
    })
  }

  if (favorite) {
    // 添加收藏（使用 INSERT OR IGNORE 避免重复）
    await db.prepare(`
      INSERT OR IGNORE INTO favorites (recipe_id)
      VALUES (?)
    `).bind(id).run()
  } else {
    // 取消收藏
    await db.prepare('DELETE FROM favorites WHERE recipe_id = ?').bind(id).run()
  }

  return { success: true, is_favorite: favorite }
})

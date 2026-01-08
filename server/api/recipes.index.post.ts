export default defineEventHandler(async (event) => {
  const db = useCloudflareD1Database(event)
  const body = await readBody(event)

  const { name, image_url } = body

  if (!name || !image_url) {
    throw createError({
      statusCode: 400,
      message: '名称和图片不能为空'
    })
  }

  const result = await db.prepare(`
    INSERT INTO recipes (name, image_url)
    VALUES (?, ?)
  `).bind(name, image_url).run()

  if (!result.success) {
    throw createError({
      statusCode: 500,
      message: '创建食谱失败'
    })
  }

  // 获取刚创建的食谱
  const { results } = await db.prepare(`
    SELECT * FROM recipes WHERE id = ?
  `).bind(result.meta.last_row_id).first()

  return results
})

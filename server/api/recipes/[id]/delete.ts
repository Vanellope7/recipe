export default defineEventHandler(async (event) => {
  const db = useCloudflareD1Database(event)
  const id = getRouterParam(event, 'id')

  const result = await db.prepare('DELETE FROM recipes WHERE id = ?').bind(id).run()

  if (!result.success) {
    throw createError({
      statusCode: 500,
      message: '删除失败'
    })
  }

  if (result.meta.changes === 0) {
    throw createError({
      statusCode: 404,
      message: '食谱不存在'
    })
  }

  return { success: true }
})

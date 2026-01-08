-- 食谱表
CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 评分表
CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK(score >= 1 AND score <= 5),
  rated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL UNIQUE,
  favorited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- 获取食谱及其平均评分和收藏状态的视图
CREATE VIEW IF NOT EXISTS recipe_details AS
SELECT
  r.id,
  r.name,
  r.image_url,
  r.created_at,
  r.updated_at,
  AVG(rat.score) as average_rating,
  COUNT(rat.id) as rating_count,
  CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
FROM recipes r
LEFT JOIN ratings rat ON r.id = rat.recipe_id
LEFT JOIN favorites f ON r.id = f.recipe_id
GROUP BY r.id;

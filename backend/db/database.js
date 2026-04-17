const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'playlist.db');

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('✅ SQLite 数据库已连接');
    initializeDatabase();
  }
});

// 初始化数据库表
function initializeDatabase() {
  db.run(
    `CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error('创建表失败:', err.message);
      } else {
        console.log('✅ playlists 表初始化完成');
      }
    }
  );

  // 创建歌单项表
  db.run(
    `CREATE TABLE IF NOT EXISTS playlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      duration TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
    )`,
    (err) => {
      if (err) {
        console.error('创建 playlist_items 表失败:', err.message);
      } else {
        console.log('✅ playlist_items 表初始化完成');
      }
    }
  );

  // 创建歌曲目录表
  db.run(
    `CREATE TABLE IF NOT EXISTS music_directories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error('创建 music_directories 表失败:', err.message);
      } else {
        console.log('✅ music_directories 表初始化完成');
      }
    }
  );
}

module.exports = db;

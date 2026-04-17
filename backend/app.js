const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件托管 - 将 dist 目录作为前端静态资源
app.use(express.static(path.join(__dirname, 'dist')));

// API 路由 - 歌单相关接口
app.get('/api/playlists', (req, res) => {
  db.all('SELECT * FROM playlists', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

app.get('/api/playlists/:id', (req, res) => {
  db.get('SELECT * FROM playlists WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json({ data: row });
    } else {
      res.status(404).json({ message: '歌单未找到' });
    }
  });
});

app.post('/api/playlists', (req, res) => {
  const { name, description } = req.body;
  db.run(
    'INSERT INTO playlists (name, description) VALUES (?, ?)',
    [name, description],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ data: { id: this.lastID, name, description } });
    }
  );
});

app.put('/api/playlists/:id', (req, res) => {
  const { name, description } = req.body;
  db.run(
    'UPDATE playlists SET name = ?, description = ? WHERE id = ?',
    [name, description, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: '歌单未找到' });
      }
      res.json({ data: { id: req.params.id, name, description } });
    }
  );
});

app.delete('/api/playlists/:id', (req, res) => {
  db.run('DELETE FROM playlists WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '歌单未找到' });
    }
    res.json({ message: '删除成功' });
  });
});

// 前端路由 - 所有其他请求返回 index.html（支持 Vue Router 的 history 模式）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🎵 歌单编辑器服务已启动`);
  console.log(` API 地址: http://localhost:${PORT}/api`);
  console.log(`🌐 前端地址: http://localhost:${PORT}`);
});

module.exports = app;

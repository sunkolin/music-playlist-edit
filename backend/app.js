const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件托管 - 将 dist 目录作为前端静态资源
app.use(express.static(path.join(__dirname, 'dist')));

// ==================== 歌单相关 API ====================

// 获取所有歌单
app.get('/api/playlists', (req, res) => {
  db.all(
    `SELECT p.*, 
            (SELECT COUNT(*) FROM playlist_items WHERE playlist_id = p.id) as itemCount
     FROM playlists p 
     ORDER BY p.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ data: rows });
    }
  );
});

// 获取单个歌单详情
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

// 创建歌单
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

// 更新歌单
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

// 删除歌单
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

// ==================== 歌单项（歌曲）相关 API ====================

// 获取歌单中的所有歌曲
app.get('/api/playlists/:playlistId/items', (req, res) => {
  const { playlistId } = req.params;
  db.all(
    'SELECT * FROM playlist_items WHERE playlist_id = ? ORDER BY created_at ASC',
    [playlistId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ data: rows });
    }
  );
});

// 添加歌曲到歌单
app.post('/api/playlists/:playlistId/items', (req, res) => {
  const { playlistId } = req.params;
  const { name, filePath, fileSize, duration } = req.body;
  
  // 先检查是否已存在相同路径的歌曲
  db.get(
    'SELECT id FROM playlist_items WHERE playlist_id = ? AND file_path = ?',
    [playlistId, filePath],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (row) {
        // 歌曲已存在，直接返回成功（忽略重复添加）
        return res.json({
          message: '歌曲已存在，跳过添加',
          data: {
            id: row.id,
            playlist_id: playlistId,
            name,
            file_path: filePath,
            skipped: true
          }
        });
      }
      
      // 歌曲不存在，执行插入
      db.run(
        'INSERT INTO playlist_items (playlist_id, name, file_path, file_size, duration) VALUES (?, ?, ?, ?, ?)',
        [playlistId, name, filePath, fileSize || null, duration || null],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({
            data: {
              id: this.lastID,
              playlist_id: playlistId,
              name,
              file_path: filePath,
              file_size: fileSize,
              duration
            }
          });
        }
      );
    }
  );
});

// 删除歌单中的歌曲
app.delete('/api/playlists/:playlistId/items/:itemId', (req, res) => {
  const { playlistId, itemId } = req.params;
  db.run(
    'DELETE FROM playlist_items WHERE id = ? AND playlist_id = ?',
    [itemId, playlistId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: '歌曲未找到' });
      }
      res.json({ message: '删除成功' });
    }
  );
});

// ==================== 文件系统浏览 API ====================

// 浏览目录 - 只允许访问已录入的目录
app.get('/api/filesystem', (req, res) => {
  const { dir } = req.query;
  
  // 如果指定了目录，检查是否在已录入的目录中
  if (dir) {
    // 获取所有已录入的目录
    db.all('SELECT path FROM music_directories', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const allowedPaths = rows.map(row => row.path);
      
      // 检查请求的目录是否在允许的目录中
      const isAllowed = allowedPaths.some(allowedPath => {
        // 检查dir是否在某个允许的目录下
        if (dir.startsWith(allowedPath)) {
          // 检查是否是子目录
          const relativePath = dir.substring(allowedPath.length);
          return relativePath === '' || relativePath.startsWith('/') || relativePath.startsWith('\\');
        }
        return false;
      });
      
      if (!isAllowed) {
        return res.status(403).json({ error: '无权访问此目录' });
      }
      
      browseDirectoryInternal(res, dir);
    });
  } else {
    // 如果没有指定目录，返回已录入的根目录列表
    db.all('SELECT path FROM music_directories', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const allowedPaths = rows.map(row => row.path);
      
      // 只返回允许的根目录
      const items = allowedPaths.map(path => {
        const name = path.split(/[\/\\]/).pop() || path;
        return {
          name: name,
          path: path,
          isDirectory: true,
          size: null,
          modified: null,
          isAudio: false
        };
      });
      
      const result = {
        currentDir: '已录入的目录',
        parentDir: null,
        items: items
      };
      
      res.json({ data: result });
    });
  }
});

// 内部方法：实际的目录浏览功能
function browseDirectoryInternal(res, targetDir) {
  // 安全检查：确保路径是绝对路径
  if (!path.isAbsolute(targetDir)) {
    return res.status(400).json({ error: '路径必须是绝对路径' });
  }
  
  try {
    const stats = fs.statSync(targetDir);
    
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: '路径不是目录' });
    }
    
    const items = fs.readdirSync(targetDir, { withFileTypes: true });
    
    const result = {
      currentDir: targetDir,
      parentDir: path.dirname(targetDir),
      items: items
        .filter(item => {
          // 过滤隐藏文件和隐藏目录（以 . 开头）
          return !item.name.startsWith('.');
        })
        .map(item => {
          const fullPath = path.join(targetDir, item.name);
          const itemStats = fs.statSync(fullPath);
          
          return {
            name: item.name,
            path: fullPath,
            isDirectory: item.isDirectory(),
            size: itemStats.size,
            modified: itemStats.mtime,
            // 判断是否为音频文件
            isAudio: item.isFile() && /\.(mp3|wav|flac|aac|ogg|m4a|wma)$/i.test(item.name)
          };
        })
    };
    
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 获取音频文件信息
app.get('/api/filesystem/fileinfo', (req, res) => {
  const { filePath } = req.query;
  
  if (!filePath || !path.isAbsolute(filePath)) {
    return res.status(400).json({ error: '无效的文件路径' });
  }
  
  try {
    const stats = fs.statSync(filePath);
    
    res.json({
      data: {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        isDirectory: stats.isDirectory()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== 歌曲目录相关 API ====================

// 获取所有歌曲目录
app.get('/api/music-directories', (req, res) => {
  db.all('SELECT * FROM music_directories ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// 添加歌曲目录
app.post('/api/music-directories', (req, res) => {
  const { path, name } = req.body;
  
  if (!path || !name) {
    return res.status(400).json({ error: '路径和名称不能为空' });
  }
  
  db.run(
    'INSERT INTO music_directories (path, name) VALUES (?, ?)',
    [path, name],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ data: { id: this.lastID, path, name } });
    }
  );
});

// 删除歌曲目录
app.delete('/api/music-directories/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM music_directories WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '歌曲目录未找到' });
    }
    res.json({ message: '删除成功' });
  });
});

// ==================== m3u8 文件相关 API ====================

// 获取歌单的 m3u8 内容
app.get('/api/playlists/:playlistId/m3u8', (req, res) => {
  const { playlistId } = req.params;
  
  db.all(
    'SELECT * FROM playlist_items WHERE playlist_id = ? ORDER BY created_at ASC',
    [playlistId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // 获取歌单信息
      db.get('SELECT * FROM playlists WHERE id = ?', [playlistId], (err, playlist) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // 生成 m3u8 内容
        const m3u8Content = generateM3U8(playlist.name, rows);
        
        res.json({
          data: {
            content: m3u8Content,
            itemCount: rows.length
          }
        });
      });
    }
  );
});

// 导出 m3u8 文件到指定目录
app.post('/api/playlists/:playlistId/export', (req, res) => {
  const { playlistId } = req.params;
  const { exportDir } = req.body;
  
  if (!exportDir || !path.isAbsolute(exportDir)) {
    return res.status(400).json({ error: '导出目录必须是有效的绝对路径' });
  }
  
  try {
    // 确保导出目录存在
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // 获取歌单和歌曲
    db.get('SELECT * FROM playlists WHERE id = ?', [playlistId], (err, playlist) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!playlist) {
        return res.status(404).json({ error: '歌单未找到' });
      }
      
      db.all(
        'SELECT * FROM playlist_items WHERE playlist_id = ? ORDER BY created_at ASC',
        [playlistId],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          // 生成 m3u8 内容
          const m3u8Content = generateM3U8(playlist.name, rows);
          
          // 生成文件名（使用歌单名称，去除特殊字符）
          const safeName = playlist.name.replace(/[^\w\u4e00-\u9fa5]/g, '_');
          const fileName = `${safeName}.m3u8`;
          const filePath = path.join(exportDir, fileName);
          
          // 写入文件
          try {
            fs.writeFileSync(filePath, m3u8Content, 'utf8');
            
            res.json({
              message: '导出成功',
              data: {
                filePath: filePath,
                fileName: fileName
              }
            });
          } catch (writeError) {
            res.status(500).json({ error: '写入文件失败: ' + writeError.message });
          }
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 导入 m3u8 文件（从本地文件路径）
app.post('/api/playlists/import', (req, res) => {
  const { filePath, playlistName } = req.body;
  
  if (!filePath || !path.isAbsolute(filePath)) {
    return res.status(400).json({ error: '文件路径必须是有效的绝对路径' });
  }
  
  try {
    // 读取 m3u8 文件
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 解析 m3u8 内容
    const parsed = parseM3U8(content, playlistName);
    
    // 创建新歌单
    importPlaylistToDB(parsed, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 导入 m3u8 文件内容（前端上传）
app.post('/api/playlists/import-content', (req, res) => {
  const { content, playlistName } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: '文件内容不能为空' });
  }
  
  try {
    // 解析 m3u8 内容
    const parsed = parseM3U8(content, playlistName);
    
    // 创建新歌单
    importPlaylistToDB(parsed, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== 辅助函数 ====================

// 导入歌单到数据库
function importPlaylistToDB(parsed, res) {
  // 检查歌单名称是否已存在
  db.get('SELECT id FROM playlists WHERE name = ?', [parsed.name], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (row) {
      // 歌单名称已存在
      return res.status(409).json({ 
        error: `歌单 "${parsed.name}" 已存在，导入失败。请修改 m3u8 文件中的歌单名称或使用不同的名称。`
      });
    }
    
    // 创建新歌单
    db.run(
      'INSERT INTO playlists (name, description) VALUES (?, ?)',
      [parsed.name, `从 m3u8 文件导入，共 ${parsed.items.length} 首歌曲`],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const playlistId = this.lastID;
        
        // 批量插入歌曲
        if (parsed.items.length > 0) {
          const stmt = db.prepare(
            'INSERT INTO playlist_items (playlist_id, name, file_path) VALUES (?, ?, ?)'
          );
          
          db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            parsed.items.forEach(item => {
              stmt.run(playlistId, item.name, item.filePath);
            });
            
            stmt.finalize();
            
            db.run('COMMIT', (err) => {
              if (err) {
                return res.status(500).json({ error: '导入失败: ' + err.message });
              }
              
              res.json({
                message: '导入成功',
                data: {
                  playlistId: playlistId,
                  playlistName: parsed.name,
                  itemCount: parsed.items.length
                }
              });
            });
          });
        } else {
          res.json({
            message: '导入成功（无歌曲）',
            data: {
              playlistId: playlistId,
              playlistName: parsed.name,
              itemCount: 0
            }
          });
        }
      }
    );
  });
}

// 生成 m3u8 文件内容
function generateM3U8(playlistName, items) {
  let content = '#EXTM3U\n';
  content += `#PLAYLIST:${playlistName}\n\n`;
  
  items.forEach(item => {
    content += `#EXTINF:-1,${item.name}\n`;
    content += `${item.file_path}\n\n`;
  });
  
  return content;
}

// 解析 m3u8 文件内容
function parseM3U8(content, customName) {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  // 获取歌单名称
  let playlistName = customName;
  if (!playlistName) {
    const playlistLine = lines.find(line => line.startsWith('#PLAYLIST:'));
    if (playlistLine) {
      playlistName = playlistLine.substring('#PLAYLIST:'.length);
    }
  }
  
  if (!playlistName) {
    playlistName = '未命名歌单';
  }
  
  // 解析歌曲
  const items = [];
  let currentName = null;
  
  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      // 提取歌曲名称
      const commaIndex = line.indexOf(',');
      if (commaIndex !== -1) {
        currentName = line.substring(commaIndex + 1).trim();
      }
    } else if (!line.startsWith('#') && line) {
      // 这是文件路径
      if (currentName) {
        items.push({
          name: currentName,
          filePath: line
        });
        currentName = null;
      }
    }
  }
  
  return {
    name: playlistName,
    items: items
  };
}

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

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

// const BETA = true;
const BETA = __dirname.split("\\").at(-1) === "DB Server2"
let PORT = 3001;
if (!BETA) PORT = 3002;

let FILES_DIR = "C:\\hugodatabase\\beta-dc-bot";
if (!BETA) FILES_DIR = "C:\\hugodatabase\\rel-dc-bot";
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR);

app.use(express.json());

// 檔案上傳設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, FILES_DIR),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// 獲取檔案最後修改日期
app.get('/files/:filename/last-modified', (req, res) => {
    const filePath = path.join(FILES_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    fs.stat(filePath, (err, stats) => {
        if (err) return res.status(500).json({ error: err.stack });
        res.json({ lastModified: stats.mtime.getTime() });
    });
});

// 列出所有檔案
app.get('/files', (req, res) => {
    fs.readdir(FILES_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: err.stack });
        res.json({ files });
    });
});

// 下載檔案
app.get('/files/:filename', (req, res) => {
    const filePath = path.join(FILES_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    res.download(filePath);
});

// 上傳檔案
app.post('/files', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (req.body.mtime) {
        const mtime = new Date(Number(req.body.mtime));
        fs.utimesSync(req.file.path, mtime, mtime);
    }
    res.json({ message: 'File uploaded', filename: req.file.filename });
});

// 刪除檔案
app.delete('/files/:filename', (req, res) => {
    const filePath = path.join(FILES_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    fs.unlink(filePath, err => {
        if (err) return res.status(500).json({ error: err.stack });
        res.json({ message: 'File deleted' });
    });
});

// 建立資料夾
app.post('/mkdir', (req, res) => {
    const dir = req.body.dir;
    if (!dir) return res.status(400).json({ error: 'No dir specified' });
    const fullPath = path.isAbsolute(dir) ? dir : path.join(FILES_DIR, dir);
    try {
        fs.mkdirSync(fullPath, { recursive: true });
        res.json({ message: `Directory created: ${fullPath}` });
    } catch (err) {
        res.status(500).json({ error: err.stack });
    }
});

// 複製遠端文件
app.post('/copy', (req, res) => {
    const { src, dst } = req.body;
    if (!src || !dst) return res.status(400).json({ error: 'src and dst required' });
    const srcPath = path.isAbsolute(src) ? src : path.join(FILES_DIR, src);
    const dstPath = path.isAbsolute(dst) ? dst : path.join(FILES_DIR, dst);
    if (!fs.existsSync(srcPath)) return res.status(404).json({ error: 'Source file not found' });
    try {
        // 確保目標資料夾存在
        fs.mkdirSync(path.dirname(dstPath), { recursive: true });
        fs.copyFileSync(srcPath, dstPath);
        res.json({ message: `File copied from ${srcPath} to ${dstPath}` });
    } catch (err) {
        res.status(500).json({ error: err.stack });
    }
});

// 伺服器 啟動！
app.listen(PORT, () => {
    console.log(`REST API 伺服器已啟動，埠號 ${PORT}`);
});

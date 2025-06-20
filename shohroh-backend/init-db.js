const { Admin, Station, Route, RouteStation } = require('./db/models');
const sequelize = require('./db/config');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Initialize database
async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Sync all models (create tables)
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    // Create default admin user
    const admin = await Admin.create({
      username: 'saycoko',
      password: 'R6r25ey38t_'
    });
    console.log('Default admin created:', admin.username);

    // Create initial stations
    const stations = [
      { id: uuidv4(), name: 'Истгоҳи "Садбарг"', name_latin: 'Istgohi Sadbarg', lat: 38.5616714, lng: 68.799592 },
      { id: uuidv4(), name: 'Истгоҳи "Парки Рӯдакӣ"', name_latin: 'Istgohi Parki Rudaki', lat: 38.5748038, lng: 68.7866793 },
      { id: uuidv4(), name: 'Цирк', name_latin: 'Circus', lat: 38.557233, lng: 68.7617033 },
      { id: uuidv4(), name: 'Истгоҳи "Роҳи оҳан"', name_latin: 'Istgohi Rohi Ohan', lat: 38.5578113, lng: 68.8001208 },
      { id: uuidv4(), name: 'Аэропорт', name_latin: 'Airport', lat: 38.5502479, lng: 68.8151432 },
      { id: uuidv4(), name: 'Оперный театр', name_latin: 'Opera Theatre', lat: 38.5667853, lng: 68.793877 },
      { id: uuidv4(), name: 'Дом печати', name_latin: 'Press House', lat: 38.5706843, lng: 68.7897228 },
      { id: uuidv4(), name: 'Маркази савдои "Тоҷикистон"', name_latin: 'Markazi Savdoi Tojikiston', lat: 38.5796048, lng: 68.7864736 },
      { id: uuidv4(), name: 'Ватан', name_latin: 'Vatan', lat: 38.563966, lng: 68.7969471 },
      { id: uuidv4(), name: 'Рынок 46 мкр', name_latin: 'Market 46', lat: 38.5250519, lng: 68.7649808 },
      { id: uuidv4(), name: 'Парк Фирдавси', name_latin: 'Firdavsi Park', lat: 38.5250254, lng: 68.754318 },
      { id: uuidv4(), name: 'Истгоҳи "Донишгоҳи Омӯзгорӣ"', name_latin: 'Pedagogical University', lat: 38.5963937, lng: 68.7869728 },
      { id: uuidv4(), name: 'Истгоҳи "Бонки Миллӣ"', name_latin: 'National Bank', lat: 38.568539, lng: 68.7926956 },
      { id: uuidv4(), name: 'Истгоҳи "Чойхона Роҳат"', name_latin: 'Rohat Teahouse', lat: 38.585278, lng: 68.7868577 },
      { id: uuidv4(), name: 'Жилмассив', name_latin: 'Zhilmassiv', lat: 38.5602287, lng: 68.8263841 },
      { id: uuidv4(), name: 'Поликлинника', name_latin: 'Polyclinic', lat: 38.5584249, lng: 68.8304584 },
      { id: uuidv4(), name: 'Садбарг', name_latin: 'Sadbarg', lat: 38.5616899, lng: 68.7989026 },
      { id: uuidv4(), name: 'Minibus "22"', name_latin: 'Minibus 22', lat: 38.5947394, lng: 68.7841636 },
      { id: uuidv4(), name: 'Minibus "17"', name_latin: 'Minibus 17', lat: 38.608406, lng: 68.7867555 },
      { id: uuidv4(), name: '13 маршрут', name_latin: 'Route 13', lat: 38.5499748, lng: 68.7418905 },
      { id: uuidv4(), name: '9, 16 маршрут', name_latin: 'Routes 9, 16', lat: 38.5584058, lng: 68.7422311 },
      { id: uuidv4(), name: 'Истгох', name_latin: 'Bus Stop', lat: 38.5110752, lng: 68.7400774 },
      { id: uuidv4(), name: 'Мединститут', name_latin: 'Medical Institute', lat: 38.5791059, lng: 68.754831 },
      { id: uuidv4(), name: 'Конечка маршрутки #33', name_latin: 'Route 33 Terminal', lat: 38.5488511, lng: 68.7808808 },
      { id: uuidv4(), name: 'Конечка маршрутки #14', name_latin: 'Route 14 Terminal', lat: 38.5513677, lng: 68.8147857 },
      { id: uuidv4(), name: 'Bus Taxi', name_latin: 'Bus Taxi', lat: 38.5109379, lng: 68.7614687 },
      { id: uuidv4(), name: 'Шайнак', name_latin: 'Shaynak', lat: 38.4858772, lng: 68.7131356 },
      { id: uuidv4(), name: 'Фурудгох', name_latin: 'Airport', lat: 38.5504421, lng: 68.8149781 },
      { id: uuidv4(), name: 'Истгоҳи "Донишгоҳи Тиббӣ"', name_latin: 'Medical University', lat: 38.6016767, lng: 68.7869426 },
      { id: uuidv4(), name: 'Супермаркет "Душанбе"', name_latin: 'Dushanbe Supermarket', lat: 38.5248034, lng: 68.7669589 },
      { id: uuidv4(), name: 'Торговый центр "Эвропа"', name_latin: 'Europa Mall', lat: 38.5621102, lng: 68.8148244 },
      { id: uuidv4(), name: 'Парк имени Алишера Навои', name_latin: 'Alisher Navoi Park', lat: 38.5698395, lng: 68.798507 },
      { id: uuidv4(), name: 'СП "Шёлковый путь"', name_latin: 'Silk Road', lat: 38.5533363, lng: 68.8152744 },
      { id: uuidv4(), name: 'Истгохи Обамбор', name_latin: 'Obambor Stop', lat: 38.6192263, lng: 68.7819364 },
      { id: uuidv4(), name: '3A Bus to City Center', name_latin: '3A Bus to City Center', lat: 38.6580847, lng: 68.7650079 }
    ];

    await Station.bulkCreate(stations);
    console.log('Created initial stations');

    // Create some example routes
    const routes = [
      { name: 'Route 1', number: '1' },
      { name: 'Route 2', number: '2' }
    ];

    await Route.bulkCreate(routes);
    console.log('Created initial routes');

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
console.log('Running database initialization...');
initializeDatabase(); 
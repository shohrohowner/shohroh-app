const { Station } = require('../db/models');
const { sequelize } = require('../db/config');  // Use the main database config
const path = require('path');

// Dushanbe bus stops data from frontend
const BUS_STOPS = [
  { lat: 38.5614748, lon: 68.779865, name: 'Unnamed' },
  { lat: 38.5616714, lon: 68.799592, name: 'Истгоҳи "Садбарг"' },
  { lat: 38.5832621, lon: 68.7830047, name: 'Unnamed' },
  { lat: 38.5180275, lon: 68.7610281, name: 'Unnamed' },
  { lat: 38.5670665, lon: 68.7927132, name: 'Unnamed' },
  { lat: 38.5748038, lon: 68.7866793, name: 'Истгоҳи "Парки Рӯдакӣ"' },
  { lat: 38.5829329, lon: 68.7835733, name: 'Unnamed' },
  { lat: 38.5183969, lon: 68.7623413, name: 'Unnamed' },
  { lat: 38.5247763, lon: 68.763706, name: 'Амонатбонк' },
  { lat: 38.5708211, lon: 68.7881274, name: 'Unnamed' },
  { lat: 38.557233, lon: 68.7617033, name: 'Цирк' },
  { lat: 38.5574679, lon: 68.7623728, name: 'Цирк' },
  { lat: 38.5584814, lon: 68.7634628, name: 'Цирк' },
  { lat: 38.5595486, lon: 68.7551973, name: 'Unnamed' },
  { lat: 38.5625754, lon: 68.7547596, name: 'Unnamed' },
  { lat: 38.5645486, lon: 68.7551115, name: 'Unnamed' },
  { lat: 38.5578113, lon: 68.8001208, name: 'Истгоҳи "Роҳи оҳан"' },
  { lat: 38.5631309, lon: 68.8009907, name: 'олами китоб' },
  { lat: 38.562805, lon: 68.7981584, name: 'Unnamed' },
  { lat: 38.5630332, lon: 68.7956597, name: 'Unnamed' },
  { lat: 38.5629612, lon: 68.8008098, name: 'олами китоб' },
  { lat: 38.5631175, lon: 68.8142516, name: 'Поворот Аэропорта' },
  { lat: 38.5502479, lon: 68.8151432, name: 'Аэропорт' },
  { lat: 38.5515463, lon: 68.8736207, name: 'Unnamed' },
  { lat: 38.5622001, lon: 68.7417112, name: 'Unnamed' },
  { lat: 38.5667853, lon: 68.793877, name: 'Оперный театр' },
  { lat: 38.5706843, lon: 68.7897228, name: 'Дом печати' },
  { lat: 38.5796048, lon: 68.7864736, name: 'Маркази савдои "Тоҷикистон"' },
  { lat: 38.5806671, lon: 68.7867456, name: 'Истгоҳи "Маркази Савдои Toҷикистон"' },
  { lat: 38.563966, lon: 68.7969471, name: 'Ватан' },
  { lat: 38.5629801, lon: 68.7905811, name: 'Unnamed' },
  { lat: 38.562819, lon: 68.7887185, name: 'Unnamed' },
  { lat: 38.5250519, lon: 68.7649808, name: 'Рынок 46 мкр' },
  { lat: 38.5251107, lon: 68.7610827, name: 'Прекресток 46' },
  { lat: 38.5250254, lon: 68.754318, name: 'Парк Фирдавси' },
  { lat: 38.5256786, lon: 68.7482894, name: 'Unnamed' },
  { lat: 38.5263059, lon: 68.7499848, name: 'Unnamed' },
  { lat: 38.5177643, lon: 68.7556239, name: 'Unnamed' },
  { lat: 38.5180598, lon: 68.7529717, name: 'Unnamed' },
  { lat: 38.5222924, lon: 68.7623003, name: 'Unnamed' },
  { lat: 38.5215739, lon: 68.7616737, name: 'Unnamed' },
  { lat: 38.5175111, lon: 68.7616565, name: 'Unnamed' },
  { lat: 38.5191818, lon: 68.7487993, name: 'Unnamed' },
  { lat: 38.5187201, lon: 68.7493787, name: 'Unnamed' },
  { lat: 38.5255491, lon: 68.7485845, name: 'Unnamed' },
  { lat: 38.5253813, lon: 68.7542923, name: 'Unnamed' },
  { lat: 38.5612227, lon: 68.78108, name: 'Unnamed' },
  { lat: 38.5637462, lon: 68.7877662, name: 'Unnamed' },
  { lat: 38.5963937, lon: 68.7869728, name: 'Истгоҳи "Донишгоҳи Омӯзгорӣ бо номи С. Айнӣ"' },
  { lat: 38.5582607, lon: 68.7488582, name: 'Unnamed' },
  { lat: 38.5585828, lon: 68.7475107, name: 'Unnamed' },
  { lat: 38.5677102, lon: 68.7433307, name: 'Unnamed' },
  { lat: 38.567878, lon: 68.742996, name: 'Unnamed' },
  { lat: 38.5684551, lon: 68.748575, name: 'Unnamed' },
  { lat: 38.5682806, lon: 68.7487638, name: 'Unnamed' },
  { lat: 38.568539, lon: 68.7926956, name: 'Истгоҳи "Бонки Миллӣ"' },
  { lat: 38.5844928, lon: 68.7865858, name: 'Unnamed' },
  { lat: 38.585278, lon: 68.7868577, name: 'Истгоҳи "Чойхона Роҳат"' },
  { lat: 38.584666, lon: 68.7542015, name: 'Unnamed' },
  { lat: 38.5839154, lon: 68.7527343, name: 'Unnamed' },
  { lat: 38.5840329, lon: 68.747453, name: 'Unnamed' },
  { lat: 38.5837237, lon: 68.7432673, name: 'Unnamed' },
  { lat: 38.5831601, lon: 68.7439604, name: 'Unnamed' },
  { lat: 38.5833362, lon: 68.7459398, name: 'Unnamed' },
  { lat: 38.59592, lon: 68.7866697, name: 'Unnamed' },
  { lat: 38.522212, lon: 68.7471149, name: 'Unnamed' },
  { lat: 38.5115846, lon: 68.7568996, name: 'Unnamed' },
  { lat: 38.51187, lon: 68.7571356, name: 'Unnamed' },
  { lat: 38.5128606, lon: 68.7534449, name: 'Unnamed' },
  { lat: 38.5149237, lon: 68.7534878, name: 'Unnamed' },
  { lat: 38.5718397, lon: 68.7545193, name: 'Unnamed' },
  { lat: 38.5716463, lon: 68.7549806, name: 'Unnamed' },
  { lat: 38.567921, lon: 68.7844186, name: 'Unnamed' },
  { lat: 38.5602287, lon: 68.8263841, name: 'Жилмассив' },
  { lat: 38.5599225, lon: 68.8263707, name: 'Жилмассив' },
  { lat: 38.5584249, lon: 68.8304584, name: 'Поликлинника' },
  { lat: 38.5585738, lon: 68.8310055, name: 'Поликлинника' },
  { lat: 38.5616899, lon: 68.7989026, name: 'Садбарг' },
  { lat: 38.5437423, lon: 68.796776, name: 'Unnamed' },
  { lat: 38.5947394, lon: 68.7841636, name: 'Minibus "22" to 82/102 district' },
  { lat: 38.608406, lon: 68.7867555, name: 'Minibus "17"' },
  { lat: 38.6084157, lon: 68.7867796, name: 'Конечка маршрутки No17 / No17a' },
  { lat: 38.6145943, lon: 68.7850441, name: 'Конечка маршрутки No67' },
  { lat: 38.5499748, lon: 68.7418905, name: '13 маршрут' },
  { lat: 38.5584058, lon: 68.7422311, name: '9, 16 маршрут' },
  { lat: 38.5520542, lon: 68.7857991, name: 'Unnamed' },
  { lat: 38.5823039, lon: 68.8005364, name: 'Unnamed' },
  { lat: 38.5110752, lon: 68.7400774, name: 'Истгох' },
  { lat: 38.512776, lon: 68.7425432, name: 'Истгох' },
  { lat: 38.5936303, lon: 68.749511, name: 'Конечка Маршрутки 52' },
  { lat: 38.568611, lon: 68.7669502, name: 'Остановка Поезда "Душанбе-Пахтабад"' },
  { lat: 38.58882, lon: 68.7866814, name: 'Unnamed' },
  { lat: 38.5473398, lon: 68.7622912, name: 'Unnamed' },
  { lat: 38.6476977, lon: 68.768898, name: 'Unnamed' },
  { lat: 38.5812955, lon: 68.7549925, name: 'Остановка' },
  { lat: 38.5791059, lon: 68.754831, name: 'Мединститут' },
  { lat: 38.5488511, lon: 68.7808808, name: 'Конечка маршрутки #33' },
  { lat: 38.5513677, lon: 68.8147857, name: 'Конечка маршрутки #14' },
  { lat: 38.5664251, lon: 68.7866136, name: 'Конечка маршрутки #11' },
  { lat: 38.5271275, lon: 68.7270342, name: 'Остановка' },
  { lat: 38.5754325, lon: 68.7863808, name: 'Unnamed' },
  { lat: 38.5109379, lon: 68.7614687, name: 'Bus Taxi' },
  { lat: 38.5174926, lon: 68.7622201, name: 'Taxi arrivals from Qurghonteppa' },
  { lat: 38.5508247, lon: 68.8068578, name: 'Unnamed' },
  { lat: 38.5510796, lon: 68.8075837, name: 'Unnamed' },
  { lat: 38.4858772, lon: 68.7131356, name: 'Шайнак' },
  { lat: 38.4881522, lon: 68.7153354, name: 'Поворот' },
  { lat: 38.584334, lon: 68.7587272, name: 'Unnamed' },
  { lat: 38.5840903, lon: 68.758741, name: 'Unnamed' },
  { lat: 38.5502698, lon: 68.815842, name: 'Аэропорт' },
  { lat: 38.5504421, lon: 68.8149781, name: 'Фурудгох' },
  { lat: 38.6016767, lon: 68.7869426, name: 'Истгоҳи "Донишгоҳи Тиббӣ бо номи А. Сино"' },
  { lat: 38.5518658, lon: 68.7622561, name: 'Остановка' },
  { lat: 38.5588607, lon: 68.7415275, name: 'Unnamed' },
  { lat: 38.5657189, lon: 68.8149581, name: 'Unnamed' },
  { lat: 38.563089, lon: 68.8099119, name: 'Unnamed' },
  { lat: 38.5248034, lon: 68.7669589, name: 'Супермаркет "Душанбе"' },
  { lat: 38.5629712, lon: 68.8076227, name: 'Unnamed' },
  { lat: 38.562955, lon: 68.8143844, name: 'Поворот Аэропорта' },
  { lat: 38.55309, lon: 68.8789762, name: 'Unnamed' },
  { lat: 38.5842886, lon: 68.786674, name: 'Rohat Teahouse bus stop' },
  { lat: 38.5962278, lon: 68.7867, name: 'Bus stop of national university' },
  { lat: 38.5910116, lon: 68.7868185, name: 'Истгоҳи "Меҳмонхонаи Авесто"' },
  { lat: 38.6100003, lon: 68.7827118, name: 'Unnamed' },
  { lat: 38.5788488, lon: 68.7926019, name: 'Unnamed' },
  { lat: 38.5787404, lon: 68.7927828, name: 'Unnamed' },
  { lat: 38.5174524, lon: 68.7616583, name: 'Курган-Тюбе маршрутка' },
  { lat: 38.5630668, lon: 68.7973399, name: 'Unnamed' },
  { lat: 38.5711083, lon: 68.7899213, name: 'Истгоҳи "ТВ Сафина"' },
  { lat: 38.5797228, lon: 68.7867042, name: 'Истгоҳи "Маркази миллӣ Тоҷикистон"' },
  { lat: 38.5652619, lon: 68.7962802, name: 'Истгоҳи "Кинотеатри Ватан"' },
  { lat: 38.5698395, lon: 68.798507, name: 'Парк имени Алишера Навои' },
  { lat: 38.5720004, lon: 68.7963793, name: 'Парк имени Алишера Навои' },
  { lat: 38.5372966, lon: 68.7308548, name: 'Конечкаи машруткаи 11' },
  { lat: 38.5628465, lon: 68.7962051, name: 'Unnamed' },
  { lat: 38.5533363, lon: 68.8152744, name: 'СП "Шёлковый путь"' },
  { lat: 38.5545314, lon: 68.8154782, name: 'СП "Шёлковый путь"' },
  { lat: 38.5621102, lon: 68.8148244, name: 'Торговый центр "Эвропа"' },
  { lat: 38.5610722, lon: 68.8151578, name: 'Торговый центр "Эвропа"' },
  { lat: 38.5716347, lon: 68.7990145, name: 'Парк имени Алишера Навои' },
  { lat: 38.5677669, lon: 68.8302622, name: 'Unnamed' },
  { lat: 38.5685, lon: 68.8300948, name: 'Unnamed' },
  { lat: 38.5819966, lon: 68.7298757, name: 'Unnamed' },
  { lat: 38.582701, lon: 68.7382441, name: 'Unnamed' },
  { lat: 38.5677489, lon: 68.8007363, name: 'Unnamed' },
  { lat: 38.6192263, lon: 68.7819364, name: 'Истгохи Обамбор' },
  { lat: 38.6199029, lon: 68.7818586, name: 'Истгохи махаллаи чашмасор' },
  { lat: 38.5921945, lon: 68.7866183, name: 'Unnamed' },
  { lat: 38.57051, lon: 68.7999942, name: 'Unnamed' },
  { lat: 38.6580847, lon: 68.7650079, name: '3A Bus to City Center' }
];

async function importStations() {
  try {
    console.log('Starting station import...');
    console.log('Database location:', path.resolve(sequelize.options.storage));
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // Clear existing stations
    const deletedCount = await Station.destroy({ where: {} });
    console.log(`Cleared ${deletedCount} existing stations`);

    // Import all stations
    const stations = BUS_STOPS.map(stop => ({
      name: stop.name,
      lat: stop.lat,
      lng: stop.lon,
      // Add default values for other fields
      shelter: false,
      bench: false,
      lit: false
    }));

    console.log(`Attempting to import ${stations.length} stations...`);
    const created = await Station.bulkCreate(stations);
    console.log(`Successfully imported ${created.length} stations`);

    // Verify the import
    const count = await Station.count();
    console.log(`Total stations in database: ${count}`);

    // List some stations to verify data
    const sampleStations = await Station.findAll({ limit: 5 });
    console.log('Sample of imported stations:');
    sampleStations.forEach(station => {
      console.log(`- ${station.name} (${station.lat}, ${station.lng})`);
    });

  } catch (error) {
    console.error('Error importing stations:', error);
    process.exit(1);
  }
}

// Run the import
console.log('Starting import process...');
importStations()
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  }); 
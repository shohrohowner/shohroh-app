require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.NODE_ENV === 'production') {
  // Production: Use PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Development: Use SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
}

module.exports = {
  sequelize
}; 
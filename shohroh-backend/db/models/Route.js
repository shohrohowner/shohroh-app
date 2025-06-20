const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^#[0-9A-F]{6}$/i  // Hex color validation
    }
  }
});

module.exports = Route; 
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const RouteStation = sequelize.define('RouteStation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = RouteStation; 
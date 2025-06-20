const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Station = sequelize.define('Station', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name_latin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    validate: {
      min: -90,
      max: 90
    }
  },
  lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    validate: {
      min: -180,
      max: 180
    }
  },
  osm_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    unique: true
  },
  osm_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shelter: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  bench: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  lit: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  network: {
    type: DataTypes.STRING,
    allowNull: true
  },
  operator: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ref: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['lat', 'lng']
    },
    {
      fields: ['name_latin']
    }
  ]
});

module.exports = Station; 
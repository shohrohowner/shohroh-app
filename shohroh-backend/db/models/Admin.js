const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config');

class Admin extends Model {
    validPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

Admin.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 50],
            is: /^[a-zA-Z0-9_]+$/i
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [8, 100]
        },
        set(value) {
            if (value) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(value, salt);
                this.setDataValue('password', hash);
            }
        }
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Admin',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['username']
        }
    ]
});

module.exports = Admin; 
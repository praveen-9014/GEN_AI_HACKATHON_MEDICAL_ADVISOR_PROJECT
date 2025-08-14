const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Medication", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dosage: {
            type: DataTypes.STRING,
            allowNull: true
        },
        scheduleTime: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mealTiming: {
            type: DataTypes.STRING,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });
};

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Score", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        value: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });
};

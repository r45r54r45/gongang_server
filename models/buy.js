"use strict";

module.exports = function(sequelize, DataTypes) {
    var Buy = sequelize.define("Buy", {
        start_date: DataTypes.DATE,
        hope_time: DataTypes.STRING(100),
        price: DataTypes.INTEGER(10),
        buy: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
    return Buy;
};
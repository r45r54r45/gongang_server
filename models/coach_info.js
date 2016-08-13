"use strict";

module.exports = function(sequelize, DataTypes) {
    var Coach_info = sequelize.define("Coach_info", {
        history: DataTypes.TEXT,
        introduce: DataTypes.TEXT
    });
    return Coach_info;
};
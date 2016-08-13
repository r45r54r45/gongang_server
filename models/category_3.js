"use strict";

module.exports = function(sequelize, DataTypes) {
    var Category_3 = sequelize.define("Category_3", {
        name: DataTypes.STRING(300)
    });
    return Category_3;
};
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Rating = sequelize.define("Rating", {
        time: DataTypes.INTEGER(1),
        curriculum: DataTypes.INTEGER(1),
        feedback: DataTypes.INTEGER(1),
        prepare: DataTypes.INTEGER(1),
        body: DataTypes.TEXT
    });
    return Rating;
};
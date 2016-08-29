"use strict";

module.exports = function(sequelize, DataTypes) {
    var Curriculum = sequelize.define("Curriculum", {
        description: DataTypes.TEXT
    });
    return Curriculum;
};
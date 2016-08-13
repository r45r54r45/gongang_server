"use strict";

module.exports = function(sequelize, DataTypes) {
    var Avail_time = sequelize.define("Avail_time", {
        start_time: {
            type: DataTypes.STRING(20),
            allowNull:false
        },
        duration: DataTypes.INTEGER(1)
    });
    return Avail_time;
};
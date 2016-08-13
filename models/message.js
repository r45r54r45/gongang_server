"use strict";

module.exports = function(sequelize, DataTypes) {
    var Message = sequelize.define("Message", {
        body: DataTypes.TEXT
    });
    return Message;
};
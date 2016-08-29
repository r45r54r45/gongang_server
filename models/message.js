"use strict";

module.exports = function(sequelize, DataTypes) {
    var Message = sequelize.define("Message", {
        body: DataTypes.TEXT
    },{
        classMethods: {
            associate: function(models){
                Message.belongsTo(models.Course ,{as: 'message'});
            }
        }
    });
    return Message;
};
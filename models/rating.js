"use strict";

module.exports = function(sequelize, DataTypes) {
    var Rating = sequelize.define("Rating", {
        time: DataTypes.INTEGER(1),
        curriculum: DataTypes.INTEGER(1),
        feedback: DataTypes.INTEGER(1),
        prepare: DataTypes.INTEGER(1),
        body: DataTypes.TEXT
    },{
        classMethods:{
            associate: function(models){
                // Rating.belongsTo(models.Course);
                // Rating.belongsTo(models.User);
            }
        }
    });
    return Rating;
};
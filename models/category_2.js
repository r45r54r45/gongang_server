"use strict";

module.exports = function(sequelize, DataTypes) {
    var Category_2 = sequelize.define("Category_2", {
        name: DataTypes.STRING(50)
    }, {
        classMethods: {
            associate: function(models){
                Category_2.hasMany(models.Category_3);
            }
        }
    });
    return Category_2;
};
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Category_1 = sequelize.define("Category_1", {
        name: DataTypes.STRING(50)
    }, {
        classMethods: {
            associate: function(models){
                Category_1.hasMany(models.Course);
                Category_1.hasMany(models.Category_2);
            }
        }
    });
    return Category_1;
};
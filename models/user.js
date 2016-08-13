"use strict";

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        school:{
            type: DataTypes.ENUM('yonsei','hongik','leewha','sogang','korea'),
            allowNull: false
        },
        email: DataTypes.STRING(300),
        profile: DataTypes.STRING(1000),
        name: DataTypes.STRING,
        phone: DataTypes.STRING(30),
        school_id: DataTypes.STRING(20)
    }, {
        classMethods: {
            associate: function (models) {
                User.hasMany(models.Buy);
                User.hasMany(models.Rating);
                User.hasMany(models.Avail_time);
                User.hasOne(models.Coach_info);
                User.hasMany(models.Message);
                User.hasMany(models.Course);
                User.belongsToMany(models.Course, {through: models.Rating});
                User.belongsToMany(models.Course, {through: models.Buy});
                User.belongsToMany(models.Course, {through: models.Message});
            }
        }
    });

    return User;
};
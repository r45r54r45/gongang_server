"use strict";

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define("User", {
        school: {
            type: DataTypes.ENUM('yonsei', 'hongik', 'leewha', 'sogang', 'korea'),
            allowNull: false
        },
        email: DataTypes.STRING(300),
        profile: DataTypes.STRING(1000),
        name: DataTypes.STRING,
        phone: DataTypes.STRING(30),
        school_id: DataTypes.STRING(20),
        status: {
            type: DataTypes.ENUM('ON', 'OFF'),
            defaultValue: 'ON'
        },
        avail_time:{
            type:DataTypes.STRING(1000)
        }
    }, {
        classMethods: {
            associate: function (models) {
                User.hasMany(models.Buy);
                User.hasMany(models.Rating);
                User.hasOne(models.Coach_info);
                User.hasMany(models.Course, {as: 'owner'});
                User.belongsToMany(models.Course, {as: 'rate', through: models.Rating});
                User.belongsToMany(models.Course, {
                    as: 'buyer',
                    through: models.Buy,
                    foreignKey: 'user',
                    otherKey: 'course'
                });
                User.hasMany(models.Message,{as: 'message'});
            },
            findById: function (id, callback) {
                User.findOne({
                    where: {
                        id: id
                    }
                }).then(function (data) {
                    callback(data);
                });
            },
            getSchedule:function(id, callback){
                User.findOne({
                    where: {
                        id: id
                    },
                    attributes: ['avail_time']
                }).then(function (data) {
                    callback(data.dataValues);
                });
            }
        },
        instanceMethods: {
            setName: function (name, callback) {
                this.update({
                    name: name
                }).then(function (result) {
                    callback(result);
                });
            },
            setEmail: function (email, callback) {
                this.update({
                    email: email
                }).then(function (result) {
                    callback(result);
                });
            },
            setPhone: function (phone, callback) {
                this.update({
                    phone: phone
                }).then(function (result) {
                    callback(result);
                });
            },
            setSchool: function (school, callback) {
                this.update({
                    school: school
                }).then(function (result) {
                    callback(result);
                });
            },
            setSchoolId: function (school_id, callback) {
                this.update({
                    school_id: school_id
                }).then(function (result) {
                    callback(result);
                });
            },
            setMajor: function (major, callback) {
                this.update({
                    major: major
                }).then(function (result) {
                    callback(result);
                });
            },
            setSchedule:function(schedule,callback){
                this.update({
                    avail_time: schedule
                }).then(function(result){
                   callback(result);
                });
            }
        }
    });
    return User;
};
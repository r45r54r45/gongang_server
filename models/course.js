"use strict";

module.exports = function(sequelize, DataTypes) {
    var Course = sequelize.define("Course", {
        title:{
            type: DataTypes.STRING(200),
            allowNull: false
        },
        comment:{
            type:DataTypes.TEXT,
            allowNull: false
        },
        weekend:{
            type:DataTypes.BOOLEAN
        },
        place:{
            type:DataTypes.STRING(400),
        },
        total_weeks:{
            type:DataTypes.INTEGER(2),
        },
        cover_image:{
            type:DataTypes.STRING(1000)
        },
        class_duration:{
            type:DataTypes.INTEGER(2),
        },
        portfolio_1:{
            type:DataTypes.STRING(1000)
        },
        portfolio_2:{
            type:DataTypes.STRING(1000)
        },
        portfolio_3:{
            type:DataTypes.STRING(1000)
        },
        faq_how:DataTypes.TEXT,
        price: DataTypes.INTEGER.UNSIGNED,
        required_material:DataTypes.TEXT,
        total_available_time: DataTypes.STRING(300),
        available_time: DataTypes.STRING(300),
        status:{
            type:DataTypes.ENUM('READY','NOT_AUTH','WAIT'),
            //not_auth는 아직 승인이 안된 상태
            //wait 은 필수 데이터 부족으로 아직 오픈을 못하는 상태
            defaultValue: 'WAIT',
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function(models) {
                Course.belongsToMany(models.User, {through: models.Rating});
                Course.belongsToMany(models.User, {through: models.Buy});
                Course.belongsToMany(models.User, {through: models.Message});
                Course.hasMany(models.Curriculum);
            }
        }
    });

    return Course;
};
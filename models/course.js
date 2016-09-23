"use strict";

module.exports = function (sequelize, DataTypes) {
    var Course = sequelize.define("Course", {
        title: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        weekend: {
            type: DataTypes.BOOLEAN
        },
        place: {
            type: DataTypes.STRING(400),
        },
        total_weeks: {
            type: DataTypes.INTEGER(2),
        },
        cover_image: {
            type: DataTypes.STRING(1000)
        },
        class_duration: {
            type: DataTypes.INTEGER(2),
        },
        portfolio_1: {
            type: DataTypes.STRING(1000)
        },
        portfolio_2: {
            type: DataTypes.STRING(1000)
        },
        portfolio_3: {
            type: DataTypes.STRING(1000)
        },
        faq_how: DataTypes.TEXT,
        price: DataTypes.INTEGER.UNSIGNED,
        required_material: DataTypes.TEXT,
        status: {
            type: DataTypes.ENUM('READY', 'NOT_AUTH', 'WAIT'),
            //not_auth는 아직 승인이 안된 상태
            //wait 은 필수 데이터 부족으로 아직 오픈을 못하는 상태
            defaultValue: 'WAIT',
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function (models) {
                Course.belongsTo(models.User, {as: 'owner'});
                Course.belongsToMany(models.User, {as: 'rate', through: models.Rating});
                Course.belongsToMany(models.User, {
                    as: 'buyment',
                    through: models.Buy,
                    foreignKey: 'course',
                    otherKey: 'user'
                });
                Course.hasMany(models.Message,{as: 'message'});
                Course.hasMany(models.Curriculum);
                Course.hasMany(models.Avail_time, {as: 'availTime'});
                Course.belongsTo(models.Category_1);
            },
            findById: function (id, callback) {
                Course.findOne({
                    where: {
                        id: id
                    }
                }).then(function (data) {
                    callback(data);
                });
            },
            getByIds: function (ids,start, callback) {
                Course.findAll({
                    where: {
                        status: 'READY',
                        id: {
                            $in: ids
                        }
                    },
                    offset: start,
                    limit: 10,
                    include: [
                        {
                            model: sequelize.models.User,
                            as: 'owner',
                            attributes: ['profile', 'name'],
                            where: {
                                status: 'ON'
                            }
                        }
                    ],
                    attributes: ['id', 'price', 'cover_image', 'title']
                }).then(function (data) {
                    callback(data);
                });
            }
        },
        instanceMethods: {
            getAllSchedule: function (callback) {
                this.getAvailTime({
                    attributes:['start_time','duration']
                }).then(function (availTimeList) {
                    callback(availTimeList);
                });
            },
            getEmptySchedule: function (callback) {
                this.getAvailTime({
                    where: {
                        occupied: false
                    },
                    attributes:['start_time','duration']
                }).then(function (availTimeList) {
                    callback(availTimeList);
                });
            },
            occupySchedule: function (start, callback) {
                this.getAvailTime({
                    where: {
                        start_time: start
                    }
                }).then(function (availTime) {
                    availTime.update({occupied: true}).then(function (res) {
                        callback(res);
                    })
                });
            },
            releaseSchedule: function (start, callback) {
                this.getAvailTime({
                    where: {
                        start_time: start
                    }
                }).then(function (availTime) {
                    availTime.update({occupied: false}).then(function (res) {
                        callback(res);
                    })
                });
            },
            setSchedule: function (schedule, callback) {
                var _this = this;
                this.getAvailTime().then(function (result) {
                    result.forEach(function (item, index) {
                        item.destroy();
                    });
                    var length = schedule.length;
                    var counter = 0;
                    schedule.forEach(function (item, index) {
                        _this.createAvailTime(item).then(function (created) {
                            counter++;
                            if (counter == length) {
                                callback();
                            }
                        });
                    });
                });
            }
        }
    });

    return Course;
};

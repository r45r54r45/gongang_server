var express = require('express');
var router = express.Router();
var token = require('../modules/token');
var models = require('../models');
var _ = require('underscore-node');

router.get("/list", function (req, res, next) {
    var start = req.query.start;
    models.Course.findAll({
        offset: parseInt(start),
        limit: 10,
        include: [
            {
                model: models.User,
                as: 'owner',
                attributes: ['profile', 'name'],
                where: {
                    status: 'ON'
                }
            },
            {
                model: models.Avail_time,
                as: 'availTime',
                attributes: ['start_time', 'duration'],
                where: {
                    occupied: false
                }
            }
        ],
        attributes: ['id','price', 'cover_image', 'title']
    }).then(function (courseList) {
        res.json(courseList);
    });
});

router.get("/match/list", token.validate, function (req, res, next) {
    //강의자 시간표 형식은 start_time: 1_3, duration: 3
    var start = parseInt(req.query.start);
    models.User.getSchedule(req.user.id, function (schedule) {
        //여기서 유저의 스케쥴은 되는 시간을 전체 string으로 저장해놓은 것 반환
        //{ avail_time: '1_1,2_1,3_1,4_1' }
        var user_time = schedule.avail_time.split(',');
        // ["1_1","2_1","3_1","4_1"]
        /*
         새로운 방법: 먼저 스케쥴만 다 불러오고 체크하기
         */
        models.Avail_time.findAll().then(function (scheduleList) {
            var confirmedCourseIdList = [];
            var scheduleCurrentCount = 0;
            for (var i = 0; i < scheduleList.length; i++) {
                if (confirmedCourseIdList.indexOf(scheduleList[i].dataValues.CourseId) == -1 && isScheduleFit(user_time, scheduleList[i])) {
                    confirmedCourseIdList.push(scheduleList[i].dataValues.CourseId);
                }
            }
            models.Course.getByIds(confirmedCourseIdList, start, function (courseList) {
                res.json(courseList);
            });
        });

        //이제 모든 수업 돌리면서 확인하기(실패한 방법)
        // models.Course.findAll({
        //     offset: parseInt(start),
        //     limit: 10,
        //     include: [
        //         {
        //             model: models.User,
        //             as: 'owner',
        //             attributes: ['profile', 'name'],
        //             where: {
        //                 status: 'ON'
        //             }
        //         }
        //     ],
        //     attributes: ['id','price', 'cover_image', 'title']
        // }).then(function (courseList) {
        //     var courseList=courseList;
        //     var successCourseList=[];
        //     var completeCount=courseList.length;
        //     var currentCount=0;
        //     var failCount=0;
        //     for (var courseIndex = 0; courseIndex < courseList.length; courseIndex++) {
        //         courseList[courseIndex].getEmptySchedule(function (scheduleList) {
        //             for (var scheduleIndex = 0; scheduleIndex < scheduleList.length; scheduleIndex++) {
        //                 if(isScheduleFit(user_time,scheduleList[scheduleIndex])){
        //                     this.successCourseList.push(this.courseList[this.courseIndex]);
        //                     this.currentCount++;
        //                     isFinish(this.completeCount,this.currentCount,this.successCourseList,this.failCount,res);
        //                     return;
        //                 }
        //             }
        //             this.failCount++;
        //             isFinish(this.completeCount,this.currentCount,this.successCourseList,this.failCount,res);
        //         }.bind({failCount:failCount,courseIndex:courseIndex,courseList:courseList,completeCount:completeCount,currentCount:currentCount,successCourseList:successCourseList }));
        //     }
        // });
    });
});
router.get("/category/list", function (req, res, next) {
    models.Course.findAll({
        limit: 10,
        offset: parseInt(req.query.start),
        include: [
            {
                model: models.Category_1,
                where: {
                    name: {
                        $like: "%" + req.query.category1 + "%"
                    }

                },
                attributes: ['name'],
                include: [
                    {
                        model: models.Category_2,
                        where: {
                            name: {
                                $like: "%" + req.query.category2 + "%"
                            }
                        },
                        attributes: ['name']
                    }
                ]
            },
            {
                model: models.User,
                as: 'owner',
                attributes: ['profile', 'name'],
                where: {
                    status: 'ON'
                }
            },
            {
                model: models.Avail_time,
                as: 'availTime',
                attributes: ['start_time', 'duration'],
                where: {
                    occupied: false
                }
            }
        ],
        attributes: ['id', 'price', 'cover_image', 'title']
    }).then(function (courseList) {
        res.json(courseList);
    })
});
router.get("/watch/basic", function (req, res, next) {
    models.Course.findOne({
        where: {
            id: req.query.courseId
        },
        include: [
            {
                model: models.User,
                as: 'owner',
                attributes: ['profile', 'name']
            }
        ],
        attributes: ['cover_image', 'title']
    }).then(function (course) {
        res.json(course);
    })
});
router.get("/watch/profile", function (req, res, next) {
    models.Course.findOne({
        where: {
            id: req.query.courseId
        },
        include: [
            {
                model: models.User,
                as: 'owner',
                attributes: ['name'],
                include: [
                    {
                        model: models.Coach_info,
                        attributes: ['history', 'introduce']
                    }
                ]
            },
            {
                model: models.Curriculum,
                attributes: ['description'],
                order: [['id', 'DESC']]
            },
            {
                model: models.Avail_time,
                as: 'availTime',
                attributes: ['start_time', 'duration'],
                where: {
                    occupied: false
                }
            }
        ],
        attributes: ['class_duration', 'total_weeks', 'price', 'place', 'required_material']
    }).then(function (course) {
        res.json(course);
    })
});
router.get("/watch/faq", function (req, res, next) {
    models.Course.findOne({
        where: {
            id: req.query.courseId
        },
        attributes: ['faq_how']
    }).then(function (course) {
        res.json(course);
    })
});
router.get("/watch/review/rating", function (req, res, next) {
    models.Course.findOne({
        where: {
            id: req.query.courseId
        }
    }).then(function (course) {
        course.getRate({
            attributes: ['Rating.time']
        }).then(function (rateList) {
            var time = 0, curriculum = 0, feedback = 0, prepare = 0;
            var length = rateList.length;
            for (var i = 0; i < length; i++) {
                var rating = rateList[i].Rating;
                time += rating.time;
                curriculum += rating.curriculum;
                feedback += rating.feedback;
                prepare += rating.prepare;
            }
            var data = {
                avg_time: time / length,
                avg_curriculum: curriculum / length,
                avg_feedback: feedback / length,
                avg_prepare: prepare / length
            }
            res.json(data);
        });
    })
});
router.get("/watch/review/comment", function (req, res, next) {
    models.Course.findOne({
        where: {
            id: req.query.courseId
        }
    }).then(function (course) {
        course.getRate({
            attributes: ['profile', 'name'],
            limit: 10,
            offset: parseInt(req.query.start)
        }).then(function (rateList) {
            var length = rateList.length;
            for (var i = 0; i < length; i++) {
                var total = 0;
                var rating = rateList[i].Rating.dataValues;
                total += rating.time;
                total += rating.curriculum;
                total += rating.feedback;
                total += rating.prepare;
                rateList[i].dataValues.avg_total = total / 4;
                rateList[i].dataValues.body = rating.body;
                rateList[i].dataValues.createdAt = rating.createdAt;
                delete rateList[i].dataValues.Rating;
            }
            res.json(rateList);
        });
    })
});
router.post("/ask", token.validate, function (req, res, next) {
    console.log(req.body.courseId);
    models.Message.create({
        UserId: req.user.id,
        CourseId: parseInt(req.body.courseId),
        body: req.body.body
    }).then(function (result) {
        res.json({result: true});
    })
});
router.get("/message/list", token.validate, function (req, res, next) {
    //TODO need fix
    models.Message.findAll({
        where: {
            UserID: req.user.id
        },
        group: ['CourseId'],
        attributes: ['body', 'createdAt', 'CourseId'],
        include: [
            {
                model: models.Course,
                attribute: ['title', 'cover_image']
            }
        ]
    }).then(function (messageList) {
        res.json(messageList);
    })
});
router.get("/register/prepare", token.validate, function (req, res, next) {
    var data = {};
    models.User.findById(req.user.id, function (user) {
        data.school_id = user.dataValues.school_id;
        data.phone = user.dataValues.phone;
        models.Course.findOne({
            where: {
                id: req.query.courseId
            },
            attributes:['id','price','total_weeks','class_duration']
        }).then(function(course){
            data.price=course.dataValues.price;
            data.total_weeks=course.dataValues.total_weeks;
            data.class_duration=course.dataValues.class_duration;
            course.getEmptySchedule(function(schedule){
                this.data.available_time=schedule;
                res.json(this.data);
            }.bind({data:data}));
        });
    })
});

module.exports = router;

var isScheduleFit = function (user_time, schedule) {
    var start_time = schedule.dataValues.start_time.split('_');
    var min_row = parseInt(start_time[0]);
    var max_row = parseInt(start_time[0]) + schedule.dataValues.duration - 1;
    var col = start_time[1];
    for (var i = min_row; i <= max_row; i++) {
        if (user_time.indexOf(i.toString() + "_" + col) == -1) {
            return false;
        }
    }
    return true;
}
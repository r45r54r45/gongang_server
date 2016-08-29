var express = require('express');
var router = express.Router();
var token = require('../modules/token');
var models = require('../models');


/* GET users listing. */
router.get('/validate', token.validate, function (req, res, next) {
    res.json(req.user);
});

router.post('/register', function (req, res, next) {
    models.User.create({
        name: req.body.name,
        school: req.body.school,
        ionic_id: req.body.ionic_id
    }).then(function (user) {
        res.json({token: token.generate({id: user.dataValues.id}), result: true});
    });
});
// 2. watch(get)
// 1. input: 강사 user_id
// 2. output: profile, name, introduce, history, [강사가 소유한 코스들 (course_id, cover_image)]
router.get('/watch', function (req, res, next) {
    var uid = req.query.user_id;
    models.User.findOne({
        where: {
            id: uid,
            status: 'ON'
        },
        include: [
            {
                model: models.Coach_info,
                attributes: ['introduce', 'history']
            },
            {
                model: models.Course,
                attributes: ['cover_image', 'id'],
                where: {
                    status: 'READY'
                }
            }
        ],
        attributes: ['profile', 'name']
    }).then(function (tutor_info) {
        res.json(tutor_info);
    });
});
// 1. publish (post)
// 1. input: access_token, on (bool)
// 2. output: result
router.post('/publish', token.validate, function (req, res, next) {
    var status;
    if (req.body.on == "true") {
        status = "ON";
    } else {
        status = "OFF";
    }
    models.User.update({
        status: status
    }, {
        where: {
            id: req.user.id
        }
    }).then(function (output) {
        res.json({result: true});
    });
});

// 2. mine/list (get) - 결제 된 것만 보여주기
// 1. input: access_token
// 2. output: [리뷰 여부 (로직 필요),  cover_image, profile, name, 학과(변경 가능), title, 결제 날짜]
router.get('/mine/list', token.validate, function (req, res, next) {
    models.Course.findAll({
        include: [
            {
                model: models.User,
                as: 'buyer',
                where: {
                    id: req.user.id
                },
                through: {
                    model: models.Buy,
                    where: {
                        buy: true
                    },
                    as: 'buy',
                    attributes: ['updatedAt']
                },
                attributes: ['id']
            },
            {
                model: models.User,
                as: 'owner',
                attributes: ['profile', 'name']
            },
            {
                model: models.User,
                through: {
                    model: models.Rating,
                    as: 'rating'
                },
                attributes: ['id']
            }
        ],
        attributes: ['cover_image', 'title']
    }).then(function (data) {
        data.forEach(function (item, index) {
            data[index].dataValues.hasRating = (item.dataValues.Users.length == 1);
            data[index].dataValues.boughtAt = item.dataValues.buyer[0].buy.updatedAt;
            delete data[index].dataValues.Users;
            delete data[index].dataValues.buyer;
        });
        res.json(data);
    });
});
router.post("/mine/review", token.validate, function (req, res, next) {
    models.User.findById(req.user.id, function (user) {
        models.Course.findById(req.body.course_id, function (course) {
            // user.createRate(course,{
            //
            // }).then(function(data){
            //     res.json(data);
            // });
            var uid = user.dataValues.id;
            var cid = course.dataValues.id;
            models.Rating.create({
                time: req.body.time,
                curriculum: req.body.curriculum,
                feedback: req.body.feedback,
                prepare: req.body.prepare,
                body: req.body.body,
                CourseId: cid,
                UserId: uid
            }).then(function (result) {
                res.json({result: true})
            }, function (err) {
                res.json({result: false, error: err});
            });
        });

    });
});

router.get("/teach/list", token.validate, function (req, res, next) {
    models.User.findById(req.user.id, function (user) {
        user.getOwner({
            attributes: ['id', 'cover_image']
        }).then(function (data) {
            res.json(data);
        });
    });
});

router.get("/info", token.validate, function (req, res, next) {
    var resultData = {};
    models.User.findById(req.user.id, function (user) {
        resultData.user = user.dataValues;
        user.getAvailTime({attributes: ['start_time', 'duration']}).then(function (time) {
            resultData.avail_time = time;
            res.json(resultData);
        });

    });
});
router.patch("/info/email", token.validate, function (req, res, next) {
    models.User.findById(req.user.id,function(user){
        user.setEmail(req.body.email,function(result){
           res.json({result:true});
        });
    });
});
router.patch("/info/name", token.validate, function (req, res, next) {
    models.User.findById(req.user.id,function(user){
        user.setName(req.body.name,function(result){
            res.json({result:true});
        });
    });
});
router.patch("/info/phone", token.validate, function (req, res, next) {
    models.User.findById(req.user.id,function(user){
        console.log(req.body.phone);
        user.setPhone(req.body.phone,function(result){
            res.json({result:true});
        });
    });
});
router.patch("/info/school", token.validate, function (req, res, next) {
    models.User.findById(req.user.id,function(user){
        user.setSchool(req.body.school,function(result){
            res.json({result:true});
        });
    });
});
router.patch("/info/schoolId", token.validate, function (req, res, next) {
    models.User.findById(req.user.id,function(user){
        user.setSchoolId(req.body.schoolId,function(result){
            res.json({result:true});
        });
    });
});
router.patch("/info/major", token.validate, function (req, res, next) {
    models.User.findById(req.user.id,function(user){
        user.setMajor(req.body.major,function(result){
            res.json({result:true});
        });
    });
});
router.patch("/info/schedule", token.validate, function (req, res, next) {
    models.User.findById(req.user.id,function(user){
        user.setSchedule(req.body.schedule,function(result){
            res.json({result:true});
        });
    });
});
module.exports = router;

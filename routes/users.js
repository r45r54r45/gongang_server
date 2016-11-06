var express = require('express');
var router = express.Router();
var token = require('../modules/token');
var _ = require('underscore-node');
var conn = require('../mysql');

/* GET users listing. */
router.post('/verify', function(req, res, next) {
    conn.query('select id from user where email=?',[req.body.email],function(err, result){
        if(result.length==0){
            //없을 때
            res.json({
                isNew: true
            });
        }else{
            var id=result[0].id;
            res.json({
                isNew: false,
                token: token.generate({
                    id: id
                })
            });
        }
    });
});
router.get('/getId',token.validate,function(req,res,next){
  res.json({uid:req.user.id});
});
router.post('/register', function(req, res, next) {
    conn.query('insert into user (name, school, email, profile) values (?,?,?,?)',[req.body.name,req.body.school,req.body.email,req.body.profile],function(err, result){
        res.json({
            token: token.generate({
                id: result.insertId
            }),
            result: true
        });
    });
});
// // 2. watch(get)
// // 1. input: 강사 user_id
// // 2. output: profile, name, introduce, history, [강사가 소유한 코스들 (course_id, cover_image)]
router.get('/bought',token.validate,function(req, res, next){
    var uid=req.user.id;
    var cid=req.query.courseId;
    conn.query('select id from buy where course_id=? and user_id=?',[cid, uid], function(err, result){
       if(result.length==0){
           res.json(false);
       } else{
           res.json(true);
       }
    });
});
router.get('/watch', function(req, res, next) {
  var uid = req.query.user_id;
    conn.query('select ')


  models.User.findOne({
    where: {
      id: uid,
      status: 'ON'
    },
    include: [{
      model: models.Coach_info,
      attributes: ['introduce', 'history']
    }, {
      model: models.Course,
      attributes: ['cover_image', 'id'],
      where: {
        status: 'READY'
      }
    }],
    attributes: ['profile', 'name']
  }).then(function(tutor_info) {
    res.json(tutor_info);
  });
});
// // 1. publish (post)
// // 1. input: access_token, on (bool)
// // 2. output: result
router.post('/publish', token.validate, function(req, res, next) {
  var status=req.body.on;
    console.log(status);
    var uid=req.user.id;
    conn.query('update user set status=? where id=?',[status,uid], function(err, result){
        res.json({
            result: true
        });
    });

});
//
// // 2. mine/list (get) - 결제 된 것만 보여주기
// // 1. input: access_token
// // 2. output: [리뷰 여부 (로직 필요),  cover_image, profile, name, 학과(변경 가능), title, 결제 날짜]
router.get('/mine/list', token.validate, function (req, res, next) {
    conn.query('select owner.profile, owner.name, owner.id as ownerId, c.id, c.title, c.cover_image, b.buy_at, r.id as rid from buy b ' +
        ' join course c on b.course_id=c.id ' +
        ' join user owner on owner.id=c.user_id' +
        ' left join rating r on r.course_id=c.id' +
        ' join user u on u.id=b.user_id' +
        ' where b.user_id=?', [req.user.id], function (err, result) {
        res.json(result);
    });
});
router.post("/mine/review", token.validate, function (req, res, next) {
    var cid = req.query.courseId;
    var body=req.body;
    conn.query('insert into rating (course_id, time, curriculum, feedback, prepare, body, user_id) ' +
        ' values (?,?,?,?,?,?,?)', [cid, body.time, body.curriculum, body.feedback, body.prepare, body.body, req.user.id], function (err, result) {
        res.json(result);
    });
});

router.get("/teach/list", token.validate, function (req, res, next) {
    conn.query('select id, cover_image from course where user_id=?', [req.user.id], function (err, result) {
        res.json(result);
    });

});
//
router.get("/info", token.validate, function(req, res, next) {
  var resultData = {};
  var uid=req.query.uid||req.user.id;
    conn.query('select * from user where id=?',[uid], function(err, result){
        var data=result[0];
        conn.query('select time from avail_time where user_id=?',[uid],function(err,times){
            res.json(Object.assign({},data,{avail_time:times}));
        })

    })
});
router.patch("/info/email", token.validate, function(req, res, next) {
    var uid=req.user.id;
    conn.query('update user set email=? where id=?',[req.body.email,uid], function(err, result){
        res.json({
            result: true
        });
    });
});
router.patch("/info/name", token.validate, function(req, res, next) {
    var uid=req.user.id;
    conn.query('update user set name=? where id=?',[req.body.name,uid], function(err, result){
        res.json({
            result: true
        });
    });
});
router.patch("/info/phone", token.validate, function(req, res, next) {
    var uid=req.user.id;
    conn.query('update user set phone=? where id=?',[req.body.phone,uid], function(err, result){
        res.json({
            result: true
        });
    });
});
router.patch("/info/school", token.validate, function(req, res, next) {
    var uid=req.user.id;
    conn.query('update user set school=? where id=?',[req.body.school,uid], function(err, result){
        res.json({
            result: true
        });
    });
});
router.patch("/info/schoolId", token.validate, function(req, res, next) {
    var uid=req.user.id;
    conn.query('update user set school_id=? where id=?',[req.body.schoolId,uid], function(err, result){
        res.json({
            result: true
        });
    });
});
router.patch("/info/major", token.validate, function(req, res, next) {
    var uid=req.user.id;
    conn.query('update user set school_id=? where id=?',[req.body.schoolId,uid], function(err, result){
        res.json({
            result: true
        });
    });
});
router.patch("/info/schedule", token.validate, function(req, res, next) {
    var uid=req.user.id;
    conn.query('delete from avail_time where user_id=?',[uid],function(err, result){
        var max=req.body.schedule.length;
        var count=0;
        req.body.schedule.forEach(function(item){
            conn.query('insert into avail_time (time, user_id) values (?,?)',[item, uid],function(err, result){
                if(++count==max){
                    res.json({result: true});
                }
            });
        });

    });
});
module.exports = router;

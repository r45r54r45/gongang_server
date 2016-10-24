var express = require('express');
var router = express.Router();
var token = require('../modules/token');
var _ = require('underscore-node');
var conn = require('../mysql');

/* GET users listing. */
// router.post('/verify', function(req, res, next) {
//   models.User.count({
//     where: {
//       email: req.body.email
//     }
//   }).then(function(data) {
//     if (data == 0) {
//       res.json({
//         isNew: true
//       });
//     } else {
//       models.User.findOne({
//         where: {
//           email: req.body.email
//         },
//         attributes: ['id']
//       }).then(function(datum) {
//         res.json({
//           isNew: false,
//           token: token.generate({
//             id: datum.dataValues.id
//           })
//         });
//       })
//     }
//   });
// });
// router.get('/getId',token.validate,function(req,res,next){
//   res.json({uid:req.user.id});
// });
// router.post('/register', function(req, res, next) {
//   models.User.create({
//     name: req.body.name,
//     school: req.body.school,
//     profile: req.body.profile,
//     email: req.body.email
//   }).then(function(user) {
//     res.json({
//       token: token.generate({
//         id: user.dataValues.id
//       }),
//       result: true
//     });
//   });
// });
// // 2. watch(get)
// // 1. input: 강사 user_id
// // 2. output: profile, name, introduce, history, [강사가 소유한 코스들 (course_id, cover_image)]
// router.get('/watch', function(req, res, next) {
//   var uid = req.query.user_id;
//   models.User.findOne({
//     where: {
//       id: uid,
//       status: 'ON'
//     },
//     include: [{
//       model: models.Coach_info,
//       attributes: ['introduce', 'history']
//     }, {
//       model: models.Course,
//       attributes: ['cover_image', 'id'],
//       where: {
//         status: 'READY'
//       }
//     }],
//     attributes: ['profile', 'name']
//   }).then(function(tutor_info) {
//     res.json(tutor_info);
//   });
// });
// // 1. publish (post)
// // 1. input: access_token, on (bool)
// // 2. output: result
// router.post('/publish', token.validate, function(req, res, next) {
//   var status;
//   if (req.body.on == "true") {
//     status = "ON";
//   } else {
//     status = "OFF";
//   }
//   models.User.update({
//     status: status
//   }, {
//     where: {
//       id: req.user.id
//     }
//   }).then(function(output) {
//     res.json({
//       result: true
//     });
//   });
// });
//
// // 2. mine/list (get) - 결제 된 것만 보여주기
// // 1. input: access_token
// // 2. output: [리뷰 여부 (로직 필요),  cover_image, profile, name, 학과(변경 가능), title, 결제 날짜]
// router.get('/mine/list', token.validate, function(req, res, next) {
//   models.User.findAll({
//     include: [
//       {
//         model: models.Course,
//         as: 'buyer',
//         attributes: ['id','title','cover_image'],
//         include: [
//           {
//             model: models.User,
//             as: 'owner',
//             attributes: ['id','profile','name']
//           }
//         ]
//       }
//     ],
//     where: {
//       id: req.user.id
//     },
//     attributes: ['id']
//   }).then(function(data){
//     var length=data.length;
//     var counter=0;
//     data[0].buyer.map(function(item){
//       if(!item.Buy.buy){
//         item.dataValues.isPaid=false;
//       }else{
//         item.dataValues.isPaid=true;
//       }
//       models.Rating.count({
//         where: {
//           UserId: req.user.id,
//           CourseId: item.id
//         }
//       }).then(function(datum){
//         if(datum==0){
//           item.dataValues.isRated=false;
//         }else {
//           item.dataValues.isRated = true;
//         }
//         counter++;
//         if(counter==length){
//           res.json(data);
//         }
//       });
//     });
//   });
// });
// router.post("/mine/review", token.validate, function(req, res, next) {
//   models.User.findById(req.user.id, function(user) {
//     models.Course.findById(req.body.course_id, function(course) {
//       // user.createRate(course,{
//       //
//       // }).then(function(data){
//       //     res.json(data);
//       // });
//       var uid = user.dataValues.id;
//       var cid = course.dataValues.id;
//       models.Rating.create({
//         time: req.body.time,
//         curriculum: req.body.curriculum,
//         feedback: req.body.feedback,
//         prepare: req.body.prepare,
//         body: req.body.body,
//         CourseId: cid,
//         UserId: uid
//       }).then(function(result) {
//         res.json({
//           result: true
//         })
//       }, function(err) {
//         res.json({
//           result: false,
//           error: err
//         });
//       });
//     });
//
//   });
// });

router.get("/teach/list", token.validate, function(req, res, next) {
   conn.query('select id, cover_image from course where user_id=?',[req.user.id],function(err,result){
       res.json(result);
   }) ;

  // models.User.findById(req.user.id, function(user) {
  //   user.getOwner({
  //     attributes: ['id', 'cover_image']
  //   }).then(function(data) {
  //     res.json(data);
  //   });
  // });
});
//
// router.get("/info", token.validate, function(req, res, next) {
//   var resultData = {};
//   if(req.query.uid){
//     models.User.findById(req.query.uid, function(user) {
//       resultData.user = user.dataValues;
//       res.json(resultData.user);
//     });
//   }else{
//     models.User.findById(req.user.id, function(user) {
//       resultData.user = user.dataValues;
//       res.json(resultData.user);
//     });
//   }
// });
// router.patch("/info/email", token.validate, function(req, res, next) {
//   models.User.findById(req.user.id, function(user) {
//     user.setEmail(req.body.email, function(result) {
//       res.json({
//         result: true
//       });
//     });
//   });
// });
// router.patch("/info/name", token.validate, function(req, res, next) {
//   models.User.findById(req.user.id, function(user) {
//     user.setName(req.body.name, function(result) {
//       res.json({
//         result: true
//       });
//     });
//   });
// });
// router.patch("/info/phone", token.validate, function(req, res, next) {
//   models.User.findById(req.user.id, function(user) {
//     console.log(req.body.phone);
//     user.setPhone(req.body.phone, function(result) {
//       res.json({
//         result: true
//       });
//     });
//   });
// });
// router.patch("/info/school", token.validate, function(req, res, next) {
//   models.User.findById(req.user.id, function(user) {
//     user.setSchool(req.body.school, function(result) {
//       res.json({
//         result: true
//       });
//     });
//   });
// });
// router.patch("/info/schoolId", token.validate, function(req, res, next) {
//   models.User.findById(req.user.id, function(user) {
//     user.setSchoolId(req.body.schoolId, function(result) {
//       res.json({
//         result: true
//       });
//     });
//   });
// });
// router.patch("/info/major", token.validate, function(req, res, next) {
//   models.User.findById(req.user.id, function(user) {
//     user.setMajor(req.body.major, function(result) {
//       res.json({
//         result: true
//       });
//     });
//   });
// });
// router.patch("/info/schedule", token.validate, function(req, res, next) {
//   models.User.findById(req.user.id, function(user) {
//     user.setSchedule(req.body.schedule, function(result) {
//       res.json({
//         result: true
//       });
//     });
//   });
// });
module.exports = router;

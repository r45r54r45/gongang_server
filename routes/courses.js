var express = require('express');
var router = express.Router();
var token = require('../modules/token');
var _ = require('underscore-node');
var conn = require('../mysql');
const count = 5;
router.get("/list", function (req, res, next) {
    var start = req.query.start;
    conn.query('SELECT c.id, c.title, c.cover_image, c.price, u.profile, u.name from course c' +
        ' join user u on u.id=c.user_id' +
        ' where u.status=true' +
        ' order by c.id desc' +
        ' limit ' + start + ',' + count, function (err, rows, fields) {
        if (err) throw err;
        res.json({
            courses: rows,
            hasMore: rows.length < count ? false : true
        });
    });
});

var findSameElement = function (arr1, arr2) {
    var ret = [];
    arr1.sort();
    arr2.sort();
    for (var i = 0; i < arr1.length; i += 1) {
        if (arr2.findIndex(function(item){
            return item.time==arr1[i].time;
            }) > -1) {
            ret.push(arr1[i]);
        }
    }
    return ret;
};

var searchMatchingCourses = function (user_times, courseIdStart) {
    return new Promise(function (resolve, reject) {
            conn.query('select c.id, c.duration from course c join user u on u.id=c.user_id where u.status=true order by c.id desc limit ?,1', [courseIdStart++], function (err, cid) {
                    console.log("course 검색 결과",cid);
                    if (cid.length == 0) {
                        return reject('NO RESULT');
                    }
                    var course = cid[0].id;
                    var duration = cid[0].duration;
                    console.log("확인할 cid: ", course);
                    conn.query('select time from class_time where course_id=? and empty=true', [course], function (err, times) {
                        var matchingTimes = findSameElement(user_times, times);
                        //뒤에 숫자는 1부터 5까지 (요일)
                        var sortedByDay = [];
                        for (var i = 0; i < matchingTimes.length; i++) {
                            var day = parseInt(matchingTimes[i].time.split('_')[1]);
                            var time = parseInt(matchingTimes[i].time.split('_')[0]);
                            if (sortedByDay[day] == undefined) {
                                sortedByDay[day] = [];
                            }
                            sortedByDay[day].push(parseInt(time));
                        }
                        console.log("공통으로 찾아진 것: ", sortedByDay);
                        for (var i = 0; i < sortedByDay.length; i++) {
                            if (sortedByDay[i] == undefined)continue;
                            //여기서 리스트는 각 요일 마다 겹치는 시간을 넣은 array
                            sortedByDay[i].sort();
                            for (var j = 0; j < sortedByDay[i].length; j++) {

                                //duration 크기의 array 만들어서 forEach로 돌려주고 그 안에서 resolve 시키거나 그 전에 return 시키면 매칭 되는 것만 보는거 가능할듯!


                                for (var k = 1; k < duration; k++) {
                                    if (sortedByDay[i].indexOf(sortedByDay[i][j] + k) == -1) {
                                        // continue;
                                        //TODO 이부분 해결 필요
                                    }
                                }
                                resolve(course);




                            }
                        }
                        reject('NOT MATCH');
                    });
                }
            )
        }
    );
};

var recursivelySearchMatchingCourses = function (user_times, courseIdStart,priorList) {
    return new Promise(function (resolve) {
        const end = 5;
        var successCidList = priorList;
        searchMatchingCourses(user_times, courseIdStart).then(function (cid) {
            successCidList.push(cid);
            console.log("successList",successCidList);
            if (successCidList.length == end) {
                conn.query('select c.id, c.title, c.cover_image, c.price, u.profile, u.name from course c' +
                    ' join user u on u.id=c.user_id' +
                    ' where c.id in (?)' +
                    ' order by c.id desc', [successCidList], function (err, result) {
                    resolve(result);
                })
            } else {
                resolve(recursivelySearchMatchingCourses(user_times, ++courseIdStart,successCidList));
            }
        }, function (errorCode) {
            if (errorCode == 'NO RESULT') {
                conn.query('select c.id, c.title, c.cover_image, c.price, u.profile, u.name from course c' +
                    ' join user u on u.id=c.user_id' +
                    ' where c.id in (?)' +
                    ' order by c.id desc', [successCidList], function (err, result) {
                    if(err){
                        throw err;
                    }
                    resolve(result);
                })
            } else if (errorCode == 'NOT MATCH') {
                resolve(recursivelySearchMatchingCourses(user_times, ++courseIdStart,successCidList));
            }
        })
    })

}
router.get("/match/list", token.validate, function (req, res, next) {
    //강의자 시간표 형식은 start_time: 1_3, duration: 3
    conn.query('select time from avail_time where user_id=?', [req.user.id], function (err, times) {
        var user_times = times;
        var courseIdStart = req.query.start || 0;
        recursivelySearchMatchingCourses(user_times, courseIdStart,[]).then(function (result) {
            res.json(result);
        })
    });
});
router.get("/category/list", function (req, res, next) {
    var start = req.query.start;
    var category = req.query.category;
    //카테고리 별로 가져오기
    conn.query('SELECT c.id, c.title, c.cover_image, c.price, u.profile, u.name from course c' +
        ' join user u on u.id=c.user_id' +
        ' join category_3 t3 on t3.id=c.category_3_id' +
        ' join category_2 t2 on t3.category_2_id=t2.id' +
        ' join category_1 t1 on t2.category_1_id=t1.id' +
        ' where u.status=true and t1.id=' + category +
        ' order by c.id desc' +
        ' limit ' + start + ',' + count, function (err, rows, fields) {
        if (err) throw err;
        res.json({
            courses: rows,
            hasMore: rows.length < count ? false : true
        });
    });
});
router.get("/watch/basic", function (req, res, next) {
    const cid = req.query.courseId;
    //'id','profile', 'name'
    //'cover_image', 'title'
    conn.query('SELECT c.id as cid, c.title, c.cover_image, u.id as uid, u.profile, u.name from course c join user u on u.id=c.user_id where c.id=' + cid, function (err, rows, fields) {
        if (err) throw err;
        res.json(rows[0]);
    });
});
router.get("/watch/profile", function (req, res, next) {
    const cid = req.query.courseId;
    var info = new Promise(function (resolve, reject) {
        conn.query('select' +
            ' ci.history, ci.introduce, c.duration, c.total_weeks, c.price, c.place, c.faq_how, c.required_material from course c' +
            ' join user u on u.id=c.user_id' +
            ' join coach_info ci on ci.id=u.coach_info_id' +
            ' where c.id=' + cid, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows[0]);
        });
    });
    var time = new Promise(function (resolve, reject) {
        conn.query('select ct.time from class_time ct where ct.empty=true and ct.course_id=' + cid, function (err, rows, fields) {
            resolve(rows);
        })
    });
    var curriculum = new Promise(function (resolve, reject) {
        conn.query('select description from curriculum where course_id=? order by number', [cid], function (err, result) {
            resolve(result);
        })
    });
    Promise.all([info, time, curriculum]).then(function (v) {
        var data = {
            info: v[0],
            time: v[1],
            curriculum: v[2]
        };
        res.json(data);
    });
});

router.get("/watch/review/rating", function (req, res, next) {
    const cid = req.query.courseId;
    conn.query('select' +
        ' avg(r.time) as time, avg(r.curriculum) as curriculum, avg(r.feedback) as feedback, avg(r.prepare) as prepare ' +
        ' from course c join rating r on c.id=r.course_id' +
        ' where c.id=' + cid, function (err, rows, fields) {
        if (err) throw err;
        var row = rows[0];
        var data = {
            avg_time: row.time || 0,
            avg_curriculum: row.curriculum || 0,
            avg_feedback: row.feedback || 0,
            avg_prepare: row.prepare || 0
        };
        res.json(data);
    });
});

router.get("/watch/review/comment", function (req, res, next) {
    const cid = req.query.courseId;
    // const start=req.query.start;
    conn.query('select' +
        ' (r.time+r.curriculum+r.feedback+r.prepare)/4 as avg, r.body, u.profile, u.name ' +
        ' from course c join rating r on c.id=r.course_id' +
        ' join user u on u.id=r.user_id' +
        ' where c.id=' + cid, function (err, rows, fields) {
        if (err) throw err;
        res.json(rows);
    });
});

router.post("/new/info", function (req, res, next) {
    var cid = req.query.cid;
    console.log("additional info received");
    console.log("cid는 ", cid);
});
router.post("/new", token.validate, function (req, res, next) {
    var body = req.body;
    const uid = parseInt(req.user.id);
    conn.beginTransaction(function (err) {
        if (err) {
            res.json({result: 'fail on begin transaction'});
        }
        conn.query('insert into category_3' +
            ' (category_2_id, name)' +
            ' values ' +
            ' (?,?)', [body.class_category, body.class_tag], function (err, result) {
            if (err) {
                return conn.rollback(function () {
                    console.log(err);
                    res.json({result: 'fail on begin insert category id ', err: err});

                });
            }
            var categoryId = result.insertId;
            var total_weeks = body.class_curriculum_list.length;
            conn.query('insert into course' +
                ' (comment, duration, faq_how, place, title, weekend, category_3_id, user_id,total_weeks)' +
                ' values ' +
                ' (?,?,?,?,?,?,?,?,?)',
                [body.class_comment, parseInt(body.class_duration), body.class_faq, body.class_place, body.class_title, body.class_weekend, categoryId, uid, total_weeks],
                function (err, result2) {
                    if (err) {
                        return conn.rollback(function () {
                            res.json({result: 'fail on insert into course'});
                        });
                    }
                    var courseId = result2.insertId;
                    conn.query('update' +
                        ' user ' +
                        ' set ' +
                        ' phone = ? where id=?', [body.class_phone, uid], function (err, result3) {
                        if (err) {
                            return conn.rollback(function () {
                                res.json({result: 'fail on updating user phone'});
                            });
                        }
                        conn.query('select' +
                            ' coach_info_id' +
                            ' from' +
                            ' user' +
                            ' where id=?', [uid], function (err, result4) {
                            if (err) {
                                return conn.rollback(function () {
                                    res.json({result: 'fail on selecting coach info id'});
                                });
                            }
                            var coach_info_id = result4.coach_info_id;
                            conn.query('update' +
                                ' coach_info' +
                                ' set' +
                                ' history = ? where id=?', [body.class_history, coach_info_id], function (err, result5) {
                                if (err) {
                                    return conn.rollback(function () {
                                        res.json({result: 'fail on updating coach info'});
                                    });
                                }
                                var time = body.avail_time.split(',');
                                for (var i = 0; i < time.length; i++) {
                                    conn.query('insert' +
                                        ' into class_time' +
                                        ' (course_id, time)' +
                                        ' values ' +
                                        ' (?,?)', [courseId, time[i]], function (err, result6) {
                                        if (err) {
                                            return conn.rollback(function () {
                                                res.json({result: 'fail on inserting class_Time'});
                                            });
                                        }
                                    })
                                }
                                for (var j = 0; j < body.class_curriculum_list.length; j++) {
                                    conn.query('insert' +
                                        ' into curriculum' +
                                        ' (course_id, description, number)' +
                                        ' values ' +
                                        ' (?,?,?)', [courseId, body.class_curriculum_list[j], j], function (err, result7) {
                                        if (err) {
                                            return conn.rollback(function () {
                                                res.json({result: 'fail on inserting curriculum'});
                                            });
                                        }
                                    })
                                }
                                conn.query('select ' +
                                    'email,name from user ' +
                                    ' where id=?', [uid], function (err, result8) {
                                    if (err) {
                                        return conn.rollback(function () {
                                            res.json({result: 'fail on selecting email, name'});
                                        });
                                    }
                                    var email = result8[0].email;
                                    var name = result8[0].name;
                                    conn.commit(function (err) {
                                        if (err) {
                                            return conn.rollback(function () {
                                                res.json({result: 'fail on commit'});
                                            });
                                        }
                                        var url = 'http://localhost:3002/courses/new/info?cid=' + courseId;
                                        var nodemailer = require('nodemailer');
                                        var smtpTransport = nodemailer.createTransport("SMTP", {
                                            service: 'Gmail',
                                            auth: {
                                                user: 'gonggangschool',
                                                pass: 'rhdrkdtmznf@@2'
                                            }
                                        });
                                        var emailBody = '<style> .header{ height: 50px; padding: 0 20px; display: flex; align-items: center; justify-content: center; } ' +
                                            '.header>.logo{ text-align: left; flex:1; font-size: 20px; } .header>.title{ flex:1; text-align: right; } .docu-title{ height:' +
                                            ' 50px; color: white; background-color: red; text-align: center; font-size: 40px; padding: 5px; align-items: center; justify-co' +
                                            'ntent: center; } .docu-title>span{ flex:1; } .body{ padding: 15px 30px; } .footer{ text-align:center; margin-top:20px; font-si' +
                                            'ze: 20px; } form{ margin: 20px 0; } form label{ margin-right: 10px; } form>p{ margin: 30px 0; } </style><div class="wrapper"> ' +
                                            '<div class="header" style="height: 50px;padding: 0 20px;display: flex;align-items: center;justify-content: center;"> <div class=' +
                                            '"logo" style="text-align: left;flex: 1;font-size: 20px;"> 공강스쿨 </div> <div class="title" style="flex: 1;text-align: right;"> <s' +
                                            'pan>코치 신청서</span> </div> </div> <div class="docu-title" style="height: 50px;color: white;background-color: red;text-align: cent' +
                                            'er;font-size: 40px;padding: 5px;align-items: center;justify-content: center;"> 공강코치 이력증빙 </div> <div class="body" style="paddi' +
                                            'ng: 15px 30px;"> <p>안녕하세요! 공강스쿨에 오신 ' + name + '코치님 환영합니다.</p> <p>신청해주신 [' + body.class_title + '] 수업 개설까지 파일 첨부 과정만 남았습니다! 아래 첨부파일을' +
                                            ' 채워주세요</p> <p>수업 경력 증빙 자료 첨부하기<span class="red">(pdf, jpg, png 파일만 업로드 가능합니다)</span></p> <form enctype="multipart/for' +
                                            'm-data" action="' + url + '" method="POST" style="margin: 20px 0;"> <p style="margin: 30px 0;"><label for="file1" style="margin-right: 10px' +
                                            ';">경력 증빙 자료 1</label><input type="file" id="file1" required></p> <p style="margin: 30px 0;"><label for="file2" style="margin-ri' +
                                            'ght: 10px;">경력 증빙 자료 1</label><input type="file" id="file2" required></p> <p style="margin: 30px 0;"><label for="file3" style="' +
                                            'margin-right: 10px;">경력 증빙 자료 1</label><input type="file" id="file3"></p> <input type="submit"> </form> <p>첨부파일을 첨부하신 후 확인 ' +
                                            '절차를 거쳐 본 이메일로 승인 여부를 보내드리겠습니다.</p> </div> <div class="footer" style="text-align: center;margin-top: 20px;font-size: 20px' +
                                            ';"> 학교 안에 재능 학교<br> 공강스쿨 </div></div>';
                                        var mailOptions = {
                                            from: '공강스쿨 <gonggangschool@gmail.com>',
                                            to: email,
                                            subject: '공강스쿨 강의개설 추가정보 이메일입니다.',
                                            html: emailBody
                                        };

                                        smtpTransport.sendMail(mailOptions, function (error, response) {
                                            if (error) {
                                                res.json({result: 'fail on sending email'});
                                            } else {
                                                console.log("Message sent : " + response.message);
                                            }
                                            smtpTransport.close();
                                        });
                                        res.json({result: 'success'});
                                    });
                                })
                            })
                        })

                    })
                })
        })

    });
})
;

router.get("/register/prepare", token.validate, function (req, res, next) {
    var courseId = req.query.courseId;
    var data = {};
    conn.query('select school_id, phone, email from' +
        ' user where id=?', [req.user.id], function (err, result) {
        if (err) {
            res.json({result: 'fail'})
        }
        result = result[0];
        data.school_id = result.school_id;
        data.phone = result.phone;
        data.email = result.email;
        conn.query('select ' +
            'id, price, total_weeks, duration from' +
            ' course where id=?', [courseId], function (err, result) {
            if (err) {
                res.json({result: 'fail'})
            }
            result = result[0];
            data.courseId = result.id;
            data.price = result.price;
            data.total_weeks = result.total_weeks;
            data.duration = result.duration;
            conn.query('select time from class_time where course_id=? and empty=true', [courseId], function (err, result) {
                data.times = result;
                res.json(data);
            });
        })
    })
});

router.post("/register/payment", token.validate, function (req, res, next) {
    console.log("payment info received");
    var uid = req.user.id;
    var total_price = req.body.data.total_price;
    var email = req.body.data.email;
    var courseId = req.query.courseId;
    var time = req.body.data.time;

    conn.query('insert into buy' +
        ' (user_id, course_id, price,time)' +
        ' values ' +
        ' (?,?,?,?)', [uid, courseId, total_price, time], function (err, result) {
        if (err) {
            res.json({result: 'fail'});
        }
        var nodemailer = require('nodemailer');
        var smtpTransport = nodemailer.createTransport("SMTP", {
            service: 'Gmail',
            auth: {
                user: 'gonggangschool',
                pass: 'rhdrkdtmznf@@2'
            }
        });
        var emailBody = '';


        var mailOptions = {
            from: '공강스쿨 <gonggangschool@gmail.com>',
            to: email,
            subject: '공강스쿨 결제 정보관련 이메일입니다.',
            html: emailBody
        };
        // 'total_price+'를 여기로 보내주시기 바랍니다.'

        smtpTransport.sendMail(mailOptions, function (error, response) {

            if (error) {
                console.log(error);
            } else {
                console.log("Message sent : " + response.message);
            }
            smtpTransport.close();
        });
        res.json({result: 'success'});
    });
});
router.post("/register/payment/complete", function (req, res, next) {
    var uid = req.body.uid; //구매하는 사람
    var bid = req.body.bid;
    conn.query('update buy ' +
        ' set buy=true,' +
        ' buy_at=? ' +
        ' where id=?', [Date.now(), bid], function (err, result) {
        if (err) {
            res.json({result: 'fail'})
        }
        conn.query('select c.user_id, b.time from course c join buy b on b.course_id=c.id where b.id=?', [bid], function (err, result) {
            var target = result[0].time.split(',');
            var owner = result[0].user_id;
            conn.query('select id from course where user_id=?', [owner], function (err, result) {
                for (var i = 0; i < result.length; i++) { //ids
                    var targetCourseId = result[i].id;
                    for (var j = 0; j < target.length; j++) { //times
                        conn.query('update class_time set empty=false where time=? and course_id=?', [target[j], targetCourseId], function (err, result) {
                            if (err) {
                                res.json({result: 'fail'});
                            }
                        });
                    }
                }
                res.json({result: 'success'});
            });
        })
    })
});
router.get("/category", function (req, res, next) {
    var level = req.query.type;
    switch (level) {
        case '1':
            conn.query('select * from category_' + level, function (err, result) {
                res.json({category: result});
            });
            break;
        case '2':
            var cate1id = req.query.category1;
            conn.query('select * from category_' + level + ' where category_1_id=' + cate1id, function (err, result) {
                res.json({category: result});
            });
            break;
    }
})

module.exports = router;

// var isScheduleFit = function (user_time, schedule) {
//     var start_time = schedule.dataValues.start_time.split('_');
//     var min_row = parseInt(start_time[0]);
//     var max_row = parseInt(start_time[0]) + schedule.dataValues.duration - 1;
//     var col = start_time[1];
//     for (var i = min_row; i <= max_row; i++) {
//         if (user_time.indexOf(i.toString() + "_" + col) == -1) {
//             return false;
//         }
//     }
//     return true;
// }

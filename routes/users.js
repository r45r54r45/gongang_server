var express = require('express');
var router = express.Router();
var token=require('../modules/token');


/* GET users listing. */
router.get('/validate', token.validate,function(req, res, next) {
  res.json(req.user);
});
router.post('/generate',function(req,res, next){
  res.send(token.generate(req.body));
});

module.exports = router;

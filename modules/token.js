var jwt=require('jsonwebtoken');
var secret="secret-weapon";
exports.validate=function(req, res, next){
    var accesstoken=req.headers.authorization;
    var token_info;
    try {
        token_info = jwt.verify(accesstoken, secret);
    }catch(err){
        res.status(500);
        res.send("wrong access token");
        return;
    }
    req.user=token_info;
    next();
};
exports.generate=function(data){
    return jwt.sign(data, secret);
}
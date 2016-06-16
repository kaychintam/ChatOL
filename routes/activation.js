var db = require('./db');
var express = require('express');
var router = express.Router();

router.get('/', function (req,res,next){
    var name = req.query.name;
    var verificationcode = req.query.verificationcode;
    var user = db.user;
    user.findOne({name:name},function (err,docs) {
        if(err) {
            console.log(err);
            res.end('ActivationErr!');
            return;
        }
        console.log(docs.verificationCode);
        if(verificationcode == docs.verificationCode) {
            var condition = {name:name};
            var update = {$set: {verified:'true'}};
            var options = {upsert:true};
            user.update(condition,update,options, function (err){
                if( err ) {
                    console.log(err);
                    res.end('update err');
                    return;
                } else {
                    res.end('verified success!');
                    return;
                }
            })
        } else {
            res.end('Wrong verification code');
            return;
        }
    })
});

module.exports = router;
var db = require('./db');
var express = require('express');
var router = express.Router();

router.get('/', function (req,res,next){
    var name = req.query.name;
    var verificationcode = req.query.verificationcode;
    var user = db.user;
    console.log(req.query);
    user.findOne({name:name},function (err,docs) {
        if(err) {
            console.log(err);
            res.render("status",{status:"Activation Error"});
            return;
        }
        console.log(docs);
        if(verificationcode == docs.verificationCode) {
            var condition = {name:name};
            var update = {$set: {verified:'true'}};
            var options = {upsert:true};
            user.update(condition,update,options, function (err){
                if( err ) {
                    console.log(err);
                    //res.end('update err');
                    res.render("status",{status:"UPDATE ERROR. Please Try Again!"});
                    return;
                } else {
                    res.render("status",{status:"You Have Verified"});
                    return;
                }
            })
        } else {
            res.render("status",{status:"Wrong Verification Code"});
            return;
        }
    })
});

module.exports = router;
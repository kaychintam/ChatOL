var sendmail = require('./sendMail');
var db = require("./db");

var moment = require("moment");
var uuid = require("node-uuid");

module.exports = function (req,res,next) {
    var users;
    db.user.findOne({name:req.body.user}, function (err,doc) {
        if(err) {
            res.end('find user err');
            return;
        }
        users = doc;
        if(users!=null) {
            res.render('index',{message:"User name existed!",register_page:"true"});
        } else {
            console.log(req.body);
            var name = req.body.user;
            var email = req.body.email;
            var password = req.body.password;
            var verified = 'false';
            var verificationcode = uuid.v1();
            var userentity = new db.user({
                name: name,
                email: email,
                password:password,
                verificationCode:verificationcode,
                verified:verified
            });
            userentity.save( function(err) {
                console.log(err);
                res.end("Add User Err!");
                return;
            });
            var  groupentity = new db.group({
                owner:name,
                name:"My Friends",
                member:name,
                email:email
            });
            groupentity.save( function (err) {
                console.log(err);
                res.end("Create Group Err!");
                return;
            })
            sendmail(email,"<a href='http://10.180.28.116:3000/activation?name="+name+"&verificationcode="+verificationcode+ "'>Please click this to complete register.</a>");
            // res.render("status", {status:"You Successfully Registered. Check Your Email To Verify"});
            res.send("{msg:'success'}");
        }
    });
}
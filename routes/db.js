var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/OICQ');

var schema = mongoose.Schema;
var userschema = new schema({
    name:String,
    password:String,
    email:String,
    verified:String,
    verificationCode:String
});
var messageschema = new schema({
    sender:String,
    receiver:String,
    content:String,
    timestamp:String
});
var groupschema = new schema({
    owner:String,
    name:String,
    member:String,
    email:String
});
var user = mongoose.model('user',userschema);
var message = mongoose.model('message',messageschema);
var group = mongoose.model('group',groupschema);

function savemessage(msg) {
    var nmsg = new message({
        sender:msg.sender,
        receiver:msg.receiver,
        content:msg.content,
        timestamp:msg.timestamp
    });
    nmsg.save(function(err) {
        console.log(err);
        console.log("save msg Err!");
        return;
    });
}

exports.userschema = userschema;
exports.messageschema = messageschema;
exports.groupschema = groupschema;

exports.user = user;
exports.message = message;
exports.group = group;
exports.savemessage = savemessage;
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/ChatOL');

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
var requestschema = new schema({
    sender:String,
    receiver:String,
    groupname:String
});
var responseschema = new schema({
    sender:String,
    receiver:String,
    groupname:String,
    request:{
        sender:String,
        receiver:String,
        groupname:String
    },
    res:String
});
var user = mongoose.model('user',userschema);
var message = mongoose.model('message',messageschema);
var group = mongoose.model('group',groupschema);
var request = mongoose.model('request',requestschema);
var response = mongoose.model('response',responseschema);

function savemessage(msg) {
    var nmsg = new message({
        sender:msg.sender,
        receiver:msg.receiver,
        content:msg.content,
        timestamp:msg.timestamp
    });
    nmsg.save(function(err) {
        if(err!=null) {
            console.log(err);
            console.log("save msg Err!");
        }
        return;
    });
}

function savegroup(grp) {
    var ngrp = new group({
        owner:grp.owner,
        name:grp.name,
        member:grp.member,
        email:grp.email
    });
    ngrp.save(function(err) {
        if(err!=null) {
            console.log(err);
            console.log("save group Err!");
            return;
        }
    });
}

function saverequest(rqst) {
    var nrqst = new request({
        sender:rqst.sender,
        receiver:rqst.receiver,
        groupname:rqst.groupname
    });
    nrqst.save(function(err) {
        if(err!=null) {
            console.log(err);
            console.log("save rquest Err!");
            return;
        }
    });
}

function saveresponse(rsps) {
    var nrsps = new response({
        sender:rsps.sender,
        receiver:rsps.receiver,
        groupname:rsps.groupname,
        request:rsps.request,
        res:rsps.res
    });
    nrsps.save(function(err) {
        if(err!=null) {
            console.log(err);
            console.log("save response Err!");
            return;
        }
    });
}

exports.userschema = userschema;
exports.messageschema = messageschema;
exports.groupschema = groupschema;

exports.user = user;
exports.message = message;
exports.group = group;
exports.request = request;
exports.response = response;

exports.savemessage = savemessage;
exports.savegroup = savegroup;
exports.saverequest = saverequest;
exports.saveresponse = saveresponse;
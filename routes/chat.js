var express = require('express');
var router = express.Router();

/*
router.get('/',function (req,res,next){
    if((typeof req.session.logged_in) == "undefined" || req.session.logged_in == false)
    {
        res.render("You'v not logged in!");
        return;
    }
    res.render('chatview');
});
module.exports = router;
    */

module.exports = function (req,res,next){
    if((typeof req.session.logged_in) == "undefined" || req.session.logged_in == false)
    {
        res.end("You'v not logged in!");
        return;
    }

    if(req.url == "/chat")
    {
        res.redirect("/chat/"+req.session.name);
        return;
    }

    res.render('chatview',{username:req.session.name, useremail:req.session.email});
}
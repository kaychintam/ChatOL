var express = require('express');
var router = express.Router();
var login = require('./login');
var register = require('./register');
var chat = require('./chat');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/login', login );
router.post('/register', register);
router.get('/loginsuccess', function (req,res,next) {
      res.redirect('/chat/'+req.session.name);
    }
);
router.get('/chat/:name?',chat);

module.exports = router;

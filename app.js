var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var activation = require('./routes/activation');
//var chatview = require('./routes/chat');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var db = require("./routes/db");

global.online = {};
global.sockets = {};

io.sockets.on("connection", function (socket) {
  console.log('someone in!');
  socket.on('applydata',function (name) {
    global.sockets[name] = this;
    var group = {};
    var messages = {};
    var data = {};
    var online;
    db.group.find({owner:name},function (err,docs) {
      console.log(docs);
      for(var i in docs) {
        online = global.online[docs[i].member];
        if((typeof  online)=="undefined") online = false;
        else online = true;
        var friend = {};
        friend[docs[i].member] = {
          'email':docs[i].email,
          'online':online
        };
        console.log(friend);
        group[docs[i].name] = friend;
      }
      db.message.find({receiver:name},function (err,docs) {
        for(var i in docs) {
          if((typeof messages[docs[i].sender]) == "undefined") messages[docs[i].sender] = [];
          messages[docs[i].sender].push({
            'sender': docs[i].sender,
            'receiver': docs[i].receiver,
            'content': docs[i].content,
            'timestamp': docs[i].timestamp
          });
        }
        db.message.find({sender:name},function (err,docs) {
          for (var i in docs) {
            if((typeof messages[docs[i].receiver]) == "undefined") messages[docs[i].receiver] = [];
            messages[docs[i].receiver].push({
              'sender': docs[i].sender,
              'receiver': docs[i].receiver,
              'content': docs[i].content,
              'timestamp': docs[i].timestamp
            });
          }
          data["group"] = group;
          data["messages"] = messages;
          socket.emit('data',data);
        });
      });
    });
  });
  socket.on('sendmessage',function (message) {
    console.log(message);
    socket.emit('message',message);
    if((typeof global.sockets[message.receiver]) == "undefined" || global.sockets[message.receiver] == null) db.savemessage(message);
    else global.sockets[message.receiver].emit('message',message);
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    resave:true,
    saveUninitialized: false,
    secret: 'OICQ'
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/activation', activation);
//app.use('/chat',chat);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

server.listen(3000);

module.exports = app;

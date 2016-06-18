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
  socket.on('disconnect',function () {
    for(var name in global.sockets) {
      if(global.sockets[name] == socket) {
        global.sockets[name] = null;
        break;
      }
    }
  });
  socket.on('applydata',function (name) {
    console.log('applydata');
    global.sockets[name] = this;
    var group = {};
    var messages = {};
    var data = {};
    var request = [];
    var response = [];
    var online;
    db.group.find({owner:name},function (err,docs) {
      console.log(docs);
      for(var i in docs) {
        if(typeof group[docs[i].name] == "undefined") group[docs[i].name] = {};
        online = global.online[docs[i].member];
        if((typeof  online)=="undefined") online = false;
        else online = true;
        var friend = {};
        friend[docs[i].member] = {
          'email':docs[i].email,
          'online':online
        };
        console.log(friend);
        group[docs[i].name][docs[i].member] = {
          'email':docs[i].email,
          'online':online
        };
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
          db.message.remove({sender:name},function (err) {
            if(err) console.log(err);
          });
          for (var i in docs) {
            if((typeof messages[docs[i].receiver]) == "undefined") messages[docs[i].receiver] = [];
            messages[docs[i].receiver].push({
              'sender': docs[i].sender,
              'receiver': docs[i].receiver,
              'content': docs[i].content,
              'timestamp': docs[i].timestamp
            });
          }
          db.request.find({receiver:name},function (err,docs) {
            db.request.remove({receiver:name}, function (err) {
              if(err) console.log(err);
            });
            console.log(docs);
            for (var i in docs) {
              request.push({
                'sender': docs[i].sender,
                'receiver': docs[i].receiver,
                'groupname': docs[i].groupname
              });
            }
            db.response.find({receiver:name},function (err,docs) {
              db.response.remove({receiver:name}, function (err) {
                if(err) console.log(err);
              });
              console.log(docs);
              for(var i in docs) {
                response.push({
                  'sender': docs[i].sender,
                  'receiver': docs[i].receiver,
                  'res':docs[i].res,
                  'request':docs[i].request,
                  'groupname':docs[i].groupname
                });
              }
              data["group"] = group;
              data["messages"] = messages;
              data["request"] = request;
              data["response"] = response;
              socket.emit('data',data);
            });
          });
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
  socket.on('friendrequest',function (request) {
    console.log("request:");
    console.log(request);
    if((typeof global.sockets[request.receiver]) == "undefined" || global.sockets[request.receiver] == null) db.saverequest(request);
    else global.sockets[request.receiver].emit('friendrequest',request);
  });
  socket.on('deletefriend',function (data) {
    console.log('delete:');
    console.log(data);
    db.group.remove({owner:data.sender,member:data.receiver},function (err) {
      if(err) console.log('Remove friend err');
    });
    db.group.remove({owner:data.receiver,member:data.sender},function (err) {
      if(err) console.log('Remove friend err');
    });
    global.sockets[data.sender].emit('deletefriend',data);
    if((typeof global.sockets[data.receiver]) != "undefined" && global.sockets[data.receiver] != null)
      global.sockets[data.receiver].emit('deletefriend',data);
  });
  socket.on('friendresponse',function (response) {
    console.log("response:");
    console.log(response);
    if((typeof global.sockets[response.receiver]) == "undefined" || global.sockets[response.receiver] == null) db.saveresponse(response);
    else global.sockets[response.receiver].emit('friendresponse',response);
    if(response.res == "accept") {
      db.user.findOne({name:response.receiver}, function (err,doc) {
        if(err!=null) {
          console.log('Error with find user:');
          console.log(response.receiver);
          return;
        }
        db.savegroup({
          owner:response.sender,
          name:response.sendergroup,
          member:response.receiver,
          email:doc.email
        });
      });
      db.user.findOne({name:response.sender}, function (err,doc) {
        if(err!=null) {
          console.log('Error with find user:');
          console.log(response.sender);
          return;
        }
        db.savegroup({
          owner:response.receiver,
          name:response.receivergroup,
          member:response.sender,
          email:doc.email
        });
      });
    }
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
    secret: 'ChatOL'
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

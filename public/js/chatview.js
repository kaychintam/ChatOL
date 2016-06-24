/**
 * Created by petertam on 16/6/16.
 */
var messages;
var currentname;
var socket = io.connect();
var myname = window.location.href.split('/')[4];
var response;
var request;
var first = 0;

socket.on('connect', function () {
    socket.emit('applydata',myname);
});

function removeAllSpace(str) {
    return str.replace(/\s+/g, "");
}

function SolveRequest(request) {
    response = {
        sender : request.receiver,
        receiver : request.sender,
        sendergroup : request.groupname,
        receivergroup : "",
        res : ""
    };

    $('#acceptUserName').val(request.sender);
    $('#receive-a-request').modal('show');
}

function SolveResponse(response) {
    if (response.res == "accept") {
        $('#response_res').html('You requst is accepted.');
    } else {
        $('#response_res').html('You requst is rejected.');
    }
    $('#get_response').modal('show');
}

$(document).ready(function() {

    socket.on('friendrequest',function (data) {
        SolveRequest(data);
    });

    socket.on('friendresponse',function (data) {
        SolveResponse(data);
    });

    socket.on('deletefriend',function(data) {
        window.location.reload();
    });

    socket.on('data',function (data) {
        messages = JSON.parse(JSON.stringify(data.messages));
        for(var groupname in data.group) {

                  var panel = $('<div class="panel panel-default group-panel '+removeAllSpace(groupname)+'"></div>');

            var heading = $('<div class="panel-heading group-heading"></div>')
                .append($('<a class="panel-title group_name" data-toggle="collapse" href="#'
                    + removeAllSpace(groupname) + '" style="text-decoration: none">' + groupname+'</a>'));

             panel = panel.append(heading);

            var friendwrapper = $('<div id="'+removeAllSpace(groupname)+'" class="panel-collapse collapse in"></div>');

            var uwrapper = $('<ul class="list-group contacts"></ul>');


            for (var friend in data.group[groupname]) {


                var single =  $('<li class="list-group-item">'+
                    '<div class="col-xs-12 col-sm-3">'+
                    '<img src="/img/1_copy.jpg" alt="default" class="img-responsive img-circle">' +
                    '</div>'+
                    '<div class="col-xs-12 col-sm-9">' +
                    '<span class="name">'+friend+'</span><br>' +
                    '<span class="glyphicon glyphicon-pencil text-muted c-info edit tooltip-f" data-toggle="tooltip" title=""></span>' +
                    '<span class="glyphicon glyphicon-trash text-muted c-info delete tooltip-f" data-toggle="tooltip" title=""></span>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '</li>');
                uwrapper = uwrapper.append(single);

            }

            friendwrapper.append(uwrapper);

            panel = panel.append(heading).append(friendwrapper);
            $('#panel-9875').append(panel);
        }

        $('.send_message').click(function () {

            if((typeof messages[currentname]) == "undefined") messages[currentname] = [];
            var currentmessage =
            {
                'sender':myname,
                'receiver':currentname,
                'type':'send',
                'content':$('.message_input').val(),
                'timestamp':(new Date()).getHours().toString()+':'+(new Date()).getMinutes().toString()+':'+(new Date()).getSeconds().toString()
            };
            socket.emit('sendmessage', currentmessage);
            messages[currentmessage.receiver].push(currentmessage);
            $('.message_input').val('');
        });

        $('span.name').each(function () {
            $(this).click(function () {
                var name = $(this).text();
                if (name != currentname) {
                    currentname = name;
                    $('.chat_window').hide();
                    $('.messages').html('');
                    $('.top_menu .title').text(currentname);
                    $('.chat_window').show(500);
                    for (var msg in messages[name]) {
                        var msgbox = $('.messages');
                        if (messages[name][msg].receiver == myname) {
                            var msg = $('<li class="message left appeared"></li>')
                                .append($('<div class="avatar"></div>'));
                            var wra = $('<div class="text_wrapper"></div>').append($('<div class="text">' + messages[name][msg].content + '</div>'));
                            msg.append(wra);
                            msgbox.append(msg);
                        } else {
                            alert(messages[name][msg].content);
                            var msg = $('<li class="message right appeared"></li>')
                                .append($('<div class="avatar"></div>'));
                            var wra = $('<div class="text_wrapper"></div>').append($('<div class="text">' + messages[name][msg].content + '</div>'));
                            msg.append(wra);
                            msgbox.append(msg);
                        }
                    }
                }
            });
        });

        $('span.delete').each(function () {
            $(this).click(function () {
                var deletename = $(this).siblings('.name').text();
                if(confirm('Delete Friend: '+deletename+' ?')) {
                    socket.emit('deletefriend',{sender:myname,receiver:deletename});
                }
            });
        });


        $('#accept-adding').click(function () {
            response.receivergroup = $('#acceptGroupName').val();
            response.res = "accept";
            if (response.receivergroup) {
                socket.emit("friendresponse", response);
            }
            window.location.reload();
        });

        $('#reject-adding').click(function () {
            response.receivergroup = $('#acceptGroupName').val();
            response.res = "reject";
            socket.emit("friendresponse", response);
            window.location.reload();
        });

        $('a[href="#add-a-contact"]').on('click', function (event) {
            event.preventDefault();
            $('#add-a-contact').modal('show');
        });

        $('[data-command="toggle-search"]').on('click', function (event) {
            event.preventDefault();
            $(this).toggleClass('hide-search');

            if ($(this).hasClass('hide-search')) {
                $('.c-search').closest('.row').slideUp(100);
            } else {
                $('.c-search').closest('.row').slideDown(100);
            }
        });

        $('#contact-list').searchable({
            searchField: '#contact-list-search',
            selector: 'li',
            childSelector: '.col-xs-12',
            show: function (elem) {
                elem.slideDown(100);
            },
            hide: function (elem) {
                elem.slideUp(100);
            }
        });

        $('#submit-adding').click(function () {
            request =
            {
                sender: myname,
                receiver: $('#inputUserName').val(),
                groupname: $('#inputUserGroup').val()
            };
            if (request.sender == request.receiver) return;
            socket.emit('friendrequest', request);
        });

        socket.on('message',function (newmsg) {
            var msgbox = $('.messages');
            if (newmsg.sender == myname) {
                var msg = $('<li class="message right appeared"></li>')
                    .append($('<div class="avatar"></div>'));
                var wra = $('<div class="text_wrapper"></div>').append($('<div class="text">'+newmsg.content+'</div>'));
                msg.append(wra);
                msgbox.append(msg);
            } else {
                var msg = $('<li class="message left appeared"></li>')
                    .append($('<div class="avatar"></div>'));
                var wra = $('<div class="text_wrapper"></div>').append($('<div class="text">'+newmsg.content+'</div>'));
                msg.append(wra);
                msgbox.append(msg);
            }
            messages[newmsg.sender].push(newmsg);
            $('.messages').scrollTop(10000);
        });

    });

});
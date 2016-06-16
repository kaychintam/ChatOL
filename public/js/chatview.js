/**
 * Created by petertam on 16/6/16.
 */
var messages;
var currentname;
var socket = io.connect();
var myname = window.location.href.split('/')[4];

socket.on('connect', function () {
    socket.emit('applydata',myname);
});

function removeAllSpace(str) {
    return str.replace(/\s+/g, "");
}

$(document).ready(function() {

    $('a[href="#cant-do-all-the-work-for-you"]').on('click', function (event) {
        event.preventDefault();
        $('#cant-do-all-the-work-for-you').modal('show');
    })

    $('[data-command="toggle-search"]').on('click', function (event) {
        event.preventDefault();
        $(this).toggleClass('hide-search');

        if ($(this).hasClass('hide-search')) {
            $('.c-search').closest('.row').slideUp(100);
        } else {
            $('.c-search').closest('.row').slideDown(100);
        }
    })

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
    })


    socket.on('message',function (msg) {
        var img;
        var div;
        var name;
        if(msg.sender == myname) {
            div = $("<div class='message right'></div>");
            name = msg.receiver;
        } else {
            div = $("<div class='message'></div>");
            name = msg.sender;
        }
        img = $('<img src="/img/1_copy.jpg" />');
        var content = $('<div class="bubble"></div>').append(msg.content).append($(' <div class="corner"></div>'));
        var span = $('<span></span>').text(msg.timestamp);
        content = content.append(span);
        $('#chat-messages').append(div.append(img).append(content));
        $('#chat-messages').scrollTop(1000000);
        $('#sendmessage input').val('');
        messages[msg.sender].push(msg);
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

        // var preloadbg = document.createElement('img');
        // preloadbg.src = '/img/timeline1.png';
        // $('#searchfield').focus(function () {
        //     if ($(this).val() == 'Search contacts...') {
        //         $(this).val('');
        //     }
        // });
        // $('#searchfield').focusout(function () {
        //     if ($(this).val() == '') {
        //         $(this).val('Search contacts...');
        //     }
        // });
        // $('#sendmessage input').focus(function () {
        //     if ($(this).val() == 'Send message...') {
        //         $(this).val('');
        //     }
        // });
        // $('#sendmessage input').focusout(function () {
        //     if ($(this).val() == '') {
        //         $(this).val('Send message...');
        //     }
        // });
        $('#send').click(function () {
            alert('clicked!');
            if((typeof  messages[currentname]) == "undefined") messages[currentname] = [];
            var currentmessage =
            {
                'sender':myname,
                'receiver':currentname,
                'type':'send',
                'content':$('#sendmessage input').val(),
                'timestamp':(new Date()).getHours().toString()+':'+(new Date()).getMinutes().toString()+':'+(new Date()).getSeconds().toString()
            };
            socket.emit('sendmessage', currentmessage);
            messages[currentmessage.receiver].push(currentmessage);
        });
        // $('.friend').each(function () {
        //     $(this).click(function () {
        //         var childOffset = $(this).offset();
        //         var parentOffset = $(this).parent().parent().offset();
        //         var childTop = childOffset.top - parentOffset.top;
        //         var clone = $(this).find('img').eq(0).clone();
        //         var top = childTop + 12 + 'px';
        //         var name = $(this).find('p strong').html();
        //         var email = $(this).find('p span').html();
        //         if(name != currentname) {
        //             $('#chat-messages').children('div').remove();
        //             currentname = name;
        //             for (var msg in messages[name]) {
        //                 var img;
        //                 var div;
        //                 if (messages[name][msg].receiver == myname) {
        //                     div = $("<div class='message'></div>");
        //                     img = $('<img src="/img/2_copy.jpg" />');
        //                 } else {
        //                     div = $("<div class='message right'></div>");
        //                     img = $('<img src="/img/1_copy.jpg" />');
        //                 }
        //                 var content = $('<div class="bubble"></div>').append(messages[name][msg].content).append($(' <div class="corner"></div>'));
        //                 var span = $('<span></span>').text(messages[name][msg].timestamp);
        //                 content = content.append(span);
        //                 $('#chat-messages').append(div.append(img).append(content));
        //             }
        //         }
        //         $(clone).css({ 'top': top }).addClass('floatingImg').appendTo('#chatbox');
        //         setTimeout(function () {
        //             $('#profile p').addClass('animate');
        //             $('#profile').addClass('animate');
        //         }, 100);
        //         setTimeout(function () {
        //             $('#chat-messages').addClass('animate');
        //             $('.cx, .cy').addClass('s1');
        //             setTimeout(function () {
        //                 $('.cx, .cy').addClass('s2');
        //             }, 100);
        //             setTimeout(function () {
        //                 $('.cx, .cy').addClass('s3');
        //             }, 200);
        //         }, 150);
        //         $('.floatingImg').animate({
        //             'width': '68px',
        //             'left': '108px',
        //             'top': '20px'
        //         }, 200);
        //
        //         $('#profile p').html(name);
        //         $('#profile span').html(email);
        //         $('.message').not('.right').find('img').attr('src', $(clone).attr('src'));
        //         $('#friendslist').fadeOut();
        //         $('#chatview').fadeIn();
        //         $('#close').unbind('click').click(function () {
        //             $('#chat-messages, #profile, #profile p').removeClass('animate');
        //             $('.cx, .cy').removeClass('s1 s2 s3');
        //             $('.floatingImg').animate({
        //                 'width': '40px',
        //                 'top': top,
        //                 'left': '12px'
        //             }, 200, function () {
        //                 $('.floatingImg').remove();
        //             });
        //             setTimeout(function () {
        //                 $('#chatview').fadeOut();
        //                 $('#friendslist').fadeIn();
        //             }, 50);
        //         });
        //     });
        //});
    });

});
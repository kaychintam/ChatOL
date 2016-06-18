$(document).ready(function() {

    //注册和登陆页切换动画
    $('.message a').click(function() {
        $('form').animate({ height: "toggle", opacity: "toggle" }, "slow");
        $('#username_register').val("");
        $('#password_register').val("");
        $('#email_register').val("");
        $('#login-error').text("");
    });

    $(document).ready(function () {
        $("#register-form").validate({
            rules:{
                user:{
                    required:true,
                    minlength:6
                },
                password:{
                    required:true,
                    minlength:6
                },
                confirmpassword:{
                    equalTo:"#password"
                },
                email:{
                    required:true,
                    email:true
                }
            },
            messages:{
                user: "At least 6 letters for username.",
                password : "At least 6 letters for password.",
                confirmpassword: "Please type exactly the same as above.",
                email: "Please input email address in correct format."
            },
            submitHandler:function(form){
                var user = $(form.user).val();
                var password = hex_md5($(form.password).val());
                var email = $(form.email).val();
                $.support.cors = true;
                $.ajax({
                    url:'/register',
                    cache:false,
                    type:'POST',
                    data:{
                        email:email,
                        user:user,
                        password:password
                    },
                    error:function (a,b,c) {
                        // $('#reg_message').html("Error");
                        // $('#reg_result').modal('show');
                        alert('time out');
                    },
                    success:function(json) {
                        var data = eval('('+json+')');
                        if(data && data.msg == 'success') {
                           //$.post()
                            alert('Successfully Registered!');
                            window.href = '/'
                        }
                    }
                });
            }
        });
        $("#login-form").validate({
            rules: {
                user: {
                    required: true,
                    minlength: 6
                },
                password: {
                    required: true,
                    minlength: 6
                }
            },
            messages:{
                user: "Correct username required.",
                password: "Correct password required."
            },
            submitHandler: function (form) {
                var user = $(form.user).val();
                var password = hex_md5($(form.password).val());
                $.ajax({
                    url:'/login',
                    cache:false,
                    type:'POST',
                    data:{
                        user:user,
                        password:password
                    },
                    error:function (a,b,c) {
                        alert("time out");
                    },
                    success:function(json) {
                        data = eval('('+json+')');
                        if( data.msg == 'success') {
                            window.location.href = '/chat';
                        } else {
                             $("#login-error").text(data.message);
                        }
                    }
                });
            }
        });
    });
})

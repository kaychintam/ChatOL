var nodemailer = require('nodemailer');
module.exports =  function (email,content) {
    if(!email || !content) {
        return ;
    }
    var transporter = nodemailer.createTransport({
        host:'smtp.qq.com',
        secure:true,
        port:465,
        auth:{
            user:'xs6666@qq.com',
            pass:'kolqnoghjwjwbjab'
        }
    });
    var mailOption = {
        from: 'Chat OL <xs6666@qq.com>',
        to:email,
        subject:'Chat OL Verification Detail',
        html:content
    };
    transporter.sendMail(mailOption, function(err,info){
        if(err) {
            console.log(err);
        } else {
            console.log("Send success!\n"+info.response);
        }
    })
}
var mongoose = require('mongoose');
/* Connect to the DB */
mongoose.connect('mongodb://localhost/ChatOL',function(){
		mongoose.connection.db.dropDatabase();
});

const mongoose = require('mongoose');
require('dotenv').config();

const options = {
    connectTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology : true
}



mongoose.connect(process.env.DB_CONNECT, options, (err) => {
    if(err) {
        console.error(err);
    } else {
        console.log("Connected to DB");
    }
});
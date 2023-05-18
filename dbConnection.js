const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

dbURI = "mongodb+srv://adnandzindo:wSlfywQUzPTjYde7@cluster0.5qxbtnk.mongodb.net/";

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const authJWT = require('./middleware/authJWT')
const userRoutes = require('./routes/userRoutes');

const app = express();

require('./dbConnection');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.all('*', authJWT.verifyUserToken);

app.use("/api/users", userRoutes);

app.listen(process.env.PORT, () => {
    console.log("PORT: " + process.env.PORT);
});

app.get('/', (req, res) => {
    res.send("Hello World!");
})
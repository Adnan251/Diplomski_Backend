const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const authJWT = require('./middleware/authJWT')
const userRoutes = require('./routes/userRoutes');
const houseRoutes = require("./routes/houseRoutes");
const roomRoutes = require("./routes/roomRoutes");
const logRoutes = require("./routes/logRoutes");
const deviceRouters = require("./routes/deviceRoutes");
require('dotenv').config();

const app = express();

require('./dbConnection');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.all('*', authJWT.verifyUserToken);

app.use("/api/users", userRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/devices", deviceRouters);

app.listen(process.env.PORT, () => {
    console.log("PORT: " + process.env.PORT);
});

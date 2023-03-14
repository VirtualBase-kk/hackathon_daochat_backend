const serverlessExpress = require("@vendia/serverless-express");
const express = require("express");

const todoIndex = require("./router/index")

const app = express();

const allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.ORIGIN);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, access_token, boundary"
    );

    if ("OPTIONS" === req.method) {
        res.send(200);
    } else {
        next();
    }
};
app.use(allowCrossDomain);

app.use(express.json());

app.use(todoIndex)

exports.handler = serverlessExpress({ app });
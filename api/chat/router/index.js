const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const secretsManager = new aws.SecretsManager()
const {dbname} = require("../dbname")
const auth = require("../auth")
const { v4:uuidv4 } = require("uuid")
const Web3 = require("web3")



module.exports = router
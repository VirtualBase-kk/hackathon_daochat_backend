const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const secretsManager = new aws.SecretsManager()
const {dbname} = require("../dbname")
const auth = require("../auth")
const { v4:uuidv4 } = require("uuid")
const Web3 = require("web3")

/*
    Todoを作成
    リクエスト：
    {
        name: title,
        organization: string
    }
    レスポンス：
    {
        status: bool
        id: string
    }
*/
router.post("/todo/create",async(req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {

    } else {
        res.status(401).json({
            status:false
        })
    }
} )

module.exports = router
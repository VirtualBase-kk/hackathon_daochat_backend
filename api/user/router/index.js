const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager()
const {dbname} = require("../dbname")
const auth = require("../auth")
const { v4:uuidv4 } = require("uuid")
const Web3 = require("web3")
var jwt = require("jsonwebtoken");

/*
    ユーザー表示名を設定
    リクエスト：
    {
        name:string
    }
*/
router.post("/user/name",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const updateDatabaseParam = {
            TableName: dbname["User"],
            Key:{
                id: authResp.user["cognito:username"]
            },
            UpdateExpression: "set #name=:name",
            ExpressionAttributeNames: {
                "#name": "name",
            },
            ExpressionAttributeValues: {
                ":name": req.body["name"],
            },
        }
        await documentClient.update(updateDatabaseParam).promise()
        res.json({
            status:true
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    ユーザーの情報を取得
    リクエストパラメータ：
    ｛
        id: string（ユーザーID）
     ｝
     レスポンス：
     {
        name: string
        walletAddress: string

     }
 */
router.get("/user/meta",async(req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getUserParam = {
            TableName: dbname["User"],
            Key:{
                id: req.query["id"]
            }
        }
        let resp = await documentClient.get(getUserParam).promise()
        res.json({
            name: resp.Item.name,
            walletAddress: resp.Item.evmAddress,
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    Metamask署名用メッセージを生成
    リクエスト：
    {
        walletAddress:string
    }
    レスポンス：
    {
        status: bool
        id: string
        message string
    }
*/
router.post("/user/message",async (req,res)=>{
        let message = uuidv4();
        for (let i = 0; i < 5; i++) {
            message = message + uuidv4()
        }
        const messageId = uuidv4()
        const putMessageParams = {
            TableName: dbname["SignMessage"],
            Item: {
                id: messageId,
                message: message,
                walletAddress:req.body["walletAddress"],
            }
        }
        try {
            await documentClient.put(putMessageParams).promise()
            res.json({
                status:true,
                id: messageId,
                message: message
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({})
        }
})

/*
    ウォレットログイン
    リクエスト：
    {
        messageId:string
        signature: string
    }
    レスポンス：
    {
        status: bool
        jwt: string,
        userId:string
    }
 */
router.post("/user/wallet/signin",async (req,res)=>{
    const getMessageParam = {
        TableName: dbname["SignMessage"],
        Key:{
            id: req.body["messageId"]
        }
    }
    const resp = await documentClient.get(getMessageParam).promise()

    const web3 = new Web3();
    let recoverAddress = web3.eth.accounts.recover(
        resp.Item["message"],
        req.body["signature"]
    );
    if (resp.Item.walletAddress.toUpperCase().slice(2) === recoverAddress.toUpperCase().slice(2)) {
        const queryUserTableParam = {
            TableName: dbname["User"],
            IndexName: "evmAddress-index",
            ExpressionAttributeNames: {
                "#evmAddress":"evmAddress"
            },
            ExpressionAttributeValues: {
                ":evmAddress": resp.Item.walletAddress.toUpperCase()
            },
            KeyConditionExpression:"#evmAddress = :evmAddress"
        }
        const userResp = await documentClient.query(queryUserTableParam).promise()
        let userId = uuidv4()
        if (userResp.Count === 0) {
            const putUserParam = {
                TableName: dbname["User"],
                Item:{
                    id: userId,
                    evmAddress: resp.Item.walletAddress.toUpperCase()
                }
            }
            await documentClient.put(putUserParam).promise()
        } else {
            userId = userResp.Items[0].id
        }
        const response = await secretsManager.getSecretValue({
            SecretId: process.env.SECRET_NAME,
        }).promise()
        const jwtSecret = response.SecretString
        const token = jwt.sign({ userId: userId }, jwtSecret, {
            algorithm: "HS256",
            expiresIn: "10M",
        });
        res.json({
            status:true,
            jwt:token,
            userId: userId
        })
    } else {
        res.status(400).json({status:false})
    }
})

/*
    ユーザーが参加している組織一覧
    レスポンス：
    [
        string
    ]
 */
router.get("/user/organization",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getMemberParam = {
            TableName: dbname["Member"],
            IndexName: "userId-index",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues:{
                ":userId":authResp.user["cognito:username"]
            },
            KeyConditionExpression: "#userId = :userId"
        }
        console.log(getMemberParam)
        const queryResp = await documentClient.query(getMemberParam).promise()
        const resp = []
        queryResp.Items.forEach(item=>{
            resp.push(item.organizationId)
        })
        res.json(resp)
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    ユーザーのポイント
    リクエストパラメータ：
    {
        id: string
    }
    レスポンス：
    number
 */
router.get("/user/point",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getMemberParam = {
            TableName: dbname["Member"],
            IndexName: "userId-index",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues:{
                ":userId":authResp.user["cognito:username"]
            },
            KeyConditionExpression: "#userId = :userId"
        }
        const queryResp = await documentClient.query(getMemberParam).promise()
        const resp = []
        queryResp.Items.forEach(item=>{
            if (item.organizationId === req.query["id"]) {
                resp.push(item)
            }
        })
        if (resp.length === 0) {
            resp.push({point:0})
        }
        res.json(resp[0].point)
    } else {
        res.status(401).json({
            status:false
        })
    }
})


module.exports = router
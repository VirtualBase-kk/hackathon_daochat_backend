const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const secretsManager = new aws.SecretsManager()
const {dbname} = require("../dbname")
const auth = require("../auth")
import { v4 as uuidv4 } from 'uuid';
import Web3 from "web3"

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
            walletAddress: resp.Item.walletAddress,
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
            TableName: dbname["User"],
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
        jwt: string
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
        const response = await secretsManager.getSecretValue({
            SecretId: process.env.SECRET_NAME,
        }).promise()
        const jwtSecret = response.SecretString
        const token = jwt.sign({ walletAddress: resp.walletAddress }, jwtSecret, {
            algorithm: "HS256",
            expiresIn: "1H",
        });
        res.json({
            status:true,
            jwt:token
        })
    } else {
        res.status(400).json({status:false})
    }
})

/*
    ユーザーにウォレットアドレスを紐付け
    リクエスト：
    {
        messageId: string
        signature: string
    }
    レスポンス：
    {
        status: bool
    }
 */
router.post("/user/wallet",async(req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
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
            const updateDatabaseParam = {
                TableName: dbname["User"],
                Key:{
                    id: authResp.user["cognito:username"]
                },
                UpdateExpression: "set #walletAddress=:walletAddress",
                ExpressionAttributeNames: {
                    "#walletAddress": "walletAddress",
                },
                ExpressionAttributeValues: {
                    ":walletAddress": resp.Item.walletAddress,
                },
            }
            await documentClient.update(updateDatabaseParam).promise()
            res.json({status:true})
        } else {
            res.status(400).json({status:false})
        }
    } else {
        res.status(401).json({
            status:false
        })
    }
})
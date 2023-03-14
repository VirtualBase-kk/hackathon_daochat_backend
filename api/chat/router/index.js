const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager()
const {dbname} = require("../dbname")
const auth = require("../auth")
const { v4:uuidv4 } = require("uuid")
const Web3 = require("web3")

/*
    ルームを作成
    リクエスト：
    {
        name: title,
        organization: string
        discussionFlag: bool
    }
    レスポンス：
    {
        status: bool
        id: string
    }
*/
router.post("/room/create",async(req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const queryMemberReq = {
            TableName: dbname["Member"],
            IndexName: "userId-index",
            ExpressionAttributeValues:{
                ":userId":authResp.user["cognito:username"]
            },
            ExpressionAttributeNames:{
                "#userId":"userId"
            },
            KeyConditionExpression:"#userId = :userId"
        }
        const memberResp = await documentClient.query(queryMemberReq).promise()
        if (memberResp.Count === 0) {
            res.status(401).json({
                status:false
            })
            return
        }
        let access = false
        memberResp.Items.forEach(item=>{
            if(item.organizationId === req.body["organization"]) {
                access = true
            }
        })
        if (!access) {
            res.status(401).json({
                status:false
            })
            return
        }
        const id = uuidv4()
        const putRoomInput = {
            TableName: dbname["Room"],
            Items:{
                id: id,
                organizationId: req.body["organization"],
                title: req.body["name"],
                status: true,
                discussionFlag: req.body["discussionFlag"]
            }
        }
        await documentClient.put(putRoomInput).promise()
        res.json({
            id: id,
            status: true
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    ルーム情報を取得
    リクエストクエリ：
    {
        id: string
    }
    レスポンス：
    {
        id: string
        name: string
        discussionFlag: bool
    }
*/
router.get("/room",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getRoomIndex = {
            TableName: dbname["Room"],
            Key:{
                id: req.query["id"]
            }
        }
        const resp = documentClient.get(getRoomIndex).promise()
        const queryMemberReq = {
            TableName: dbname["Member"],
            IndexName: "userId-index",
            ExpressionAttributeValues:{
                ":userId":authResp.user["cognito:username"]
            },
            ExpressionAttributeNames:{
                "#userId":"userId"
            },
            KeyConditionExpression:"#userId = :userId"
        }
        const memberResp = await documentClient.query(queryMemberReq).promise()
        if (memberResp.Count === 0) {
            res.status(401).json({
                status:false
            })
            return
        }
        let access = false
        memberResp.Items.forEach(item=>{
            if(item.organizationId === resp.Item.organizationId) {
                access = true
            }
        })
        if (!access) {
            res.status(401).json({
                status:false
            })
            return
        }
        res.json({
            id: req.query["id"],
            name: resp.Item.name,
            discussionFlag: resp.Item.discussionFlag
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})

module.exports = router
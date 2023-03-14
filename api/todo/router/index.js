const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager()
const {dbname} = require("../dbname")
const auth = require("../auth")
const {v4: uuidv4} = require("uuid")
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
router.post("/todo/create", async (req, res) => {
    const authResp = await auth(req)
    if (authResp.status) {
        const queryMemberReq = {
            TableName: dbname["Member"],
            IndexName: "userId-index",
            ExpressionAttributeValues: {
                ":userId": authResp.user["cognito:username"]
            },
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            KeyConditionExpression: "#userId = :userId"
        }
        const memberResp = await documentClient.query(queryMemberReq).promise()
        if (memberResp.Count === 0) {
            res.status(401).json({
                status: false
            })
            return
        }
        let access = false
        memberResp.Items.forEach(item => {
            if (item.organizationId === req.body["organization"]) {
                access = true
            }
        })
        if (!access) {
            res.status(401).json({
                status: false
            })
            return
        }
        const id = uuidv4()
        const putTodoItem = {
            TableName: dbname["TodoItem"],
            Item: {
                id: id,
                title: req.body["name"],
                status: false,
                organization: req.body["organization"]
            }
        }
        await documentClient.put(putTodoItem).promise()
    } else {
        res.status(401).json({
            status: false
        })
    }
})

/*
    Todo一覧を取得
    リクエストクエリ：
    {
        id: string（組織ID）
    }
    レスポンス：
    [
        {
            id: string,
            title: string,
            status: int
        }
    ]
*/
router.get("/todo/list", async (req, res) => {
    const authResp = await auth(req)
    if (authResp.status) {
        const queryMemberReq = {
            TableName: dbname["Member"],
            IndexName: "userId-index",
            ExpressionAttributeValues: {
                ":userId": authResp.user["cognito:username"]
            },
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            KeyConditionExpression: "#userId = :userId"
        }
        const memberResp = await documentClient.query(queryMemberReq).promise()
        if (memberResp.Count === 0) {
            res.status(401).json({
                status: false
            })
            return
        }
        let access = false
        memberResp.Items.forEach(item => {
            if (item.organizationId === req.body["organization"]) {
                access = true
            }
        })
        if (!access) {
            res.status(401).json({
                status: false
            })
        }
        const getTodoParam = {
            TableName: dbname["TodoItem"],
            IndexName:"organization-index",
            ExpressionAttributeValues:{
                "#organization": req.query["id"]
            },
            ExpressionAttributeNames:{
                ":organization":"organization"
            },
            KeyConditionExpression:"#organization=:organization"
        }
        const getTodoResp = await documentClient.query(getTodoParam).promise()
        const respData = []
        getTodoResp.Items.forEach(item=>{
            respData.push({
                id: item.id,
                title: item.title,
                status: item.status
            })
        })
        res.json(respData)
    } else {
        res.status(401).json({
            status: false
        })
    }
})

/*
    Todoを完了
    リクエスト：
    {
        id: string
        state: int
    }
    レスポンス：
    {
        status: bool
    }
*/
router.post("/todo/change", async (req, res) => {
    const authResp = await auth(req)
    if (authResp.status) {
        const getTodoReq = {
            TableName: dbname["TodoItem"],
            Key: {
                id: req.body["id"]
            }
        }
        const todoResp = await documentClient.get(getTodoReq).promise()
        const queryMemberReq = {
            TableName: dbname["Member"],
            IndexName: "userId-index",
            ExpressionAttributeValues: {
                ":userId": authResp.user["cognito:username"]
            },
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            KeyConditionExpression: "#userId = :userId"
        }
        const memberResp = await documentClient.query(queryMemberReq).promise()
        if (memberResp.Count === 0) {
            res.status(401).json({
                status: false
            })
            return
        }
        let access = false
        memberResp.Items.forEach(item => {
            if (item.organizationId === todoResp.Item["organizationId"]) {
                access = true
            }
        })
        if (!access) {
            res.status(401).json({
                status: false
            })
            return
        }
        const updateTodoItem = {
            TableName: dbname["TodoItem"],
            Key: {
                id: req.body["id"]
            },
            ExpressionAttributeNames: {
                "#status": "status",
            },
            ExpressionAttributeValues: {
                ":status": req.body["state"]
            },
            UpdateExpression: "set #status = :status"
        }
        await documentClient.update(updateTodoItem).promise()
        res.json({
            status: true
        })
    } else {
        res.status(401).json({
            status: false
        })
    }
})

module.exports = router
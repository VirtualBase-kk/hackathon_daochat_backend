const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager()
const {dbname} = require("../dbname")
const auth = require("../auth")
const { v4:uuidv4 } = require("uuid")
const Web3 = require("web3")
const abi = require("../contract/abi.json")

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
            Item:{
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
    ルーム一覧
    リクエストパラメータ：
    {
        id: string
    }
    レスポンス：
    [
        {
            id: string,
            name: string,
            isDiscussion: bool
        }
    ]
*/
router.get("/room/list",async (req,res)=>{
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
            if(item.organizationId === req.query["id"]) {
                access = true
            }
        })
        if (!access) {
            res.status(401).json({
                status:false
            })
            return
        }
        const queryRoomInput = {
            TableName: dbname["Room"],
            IndexName: "organizationId-index",
            ExpressionAttributeValues:{
                ":organizationId":req.query["id"],
            },
            ExpressionAttributeNames:{
                "#organizationId":"organizationId"
            },
            KeyConditionExpression: "#organizationId = :organizationId"
        }
        const RoomListResp = await documentClient.query(queryRoomInput).promise()
        const respData = []
        console.log(RoomListResp)
        RoomListResp.Items.forEach(item=>{
            respData.push({
                id: item.id,
                name: item.title,
                isDiscussion: item.discussionFlag
            })
        })
        console.log(respData)
        res.json(respData)
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

/*
    チャット投稿
    リクエスト：
    {
        id: string（roomId）
        text: string
    }
    レスポンス：
    {
        status: bool
    }
*/
router.post("/room/chat",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getRoomIndex = {
            TableName: dbname["Room"],
            Key:{
                id: req.body["id"]
            }
        }
        const resp = await documentClient.get(getRoomIndex).promise()
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
        const postChatInput = {
            TableName: dbname["Chat"],
            Item: {
                id: uuidv4(),
                userId: authResp.user["cognito:username"],
                roomId: req.body["id"],
                createdTs: Date.now(),
                text: req.body["text"],
                status: true,
            }
        }
        await documentClient.put(postChatInput).promise()
        res.json({status:false})
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    チャットデータ取得
    リクエストクエリ：
    {
        id: string（roomId）
    }
    レスポンス：
    [
        {
            text: string
            createdTs: number
            userId: string
            userName: string,
            walletAddress: string
        }
    ]
*/
router.get("/room/chat",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getRoomIndex = {
            TableName: dbname["Room"],
            Key:{
                id: req.query["id"]
            }
        }
        const resp = await documentClient.get(getRoomIndex).promise()
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
        const queryChatInput = {
            TableName: dbname["Chat"],
            IndexName: "roomId-createdTs-index",
            ExpressionAttributeNames:{
                "#roomId":"roomId"
            },
            ExpressionAttributeValues:{
                ":roomId":req.query["id"]
            },
            KeyConditionExpression:"#roomId = :roomId"
        }
        const chatResp = await documentClient.query(queryChatInput).promise()
        const responseData = []

        await Promise.all(chatResp.Items.map(async(item)=>{
            const getPostUserInput = {
                TableName: dbname["User"],
                Key: {
                    id: item.userId
                }
            }
            const getPostUserResp = await documentClient.get(getPostUserInput).promise()
            responseData.push({
                text: item.text,
                createdTs: item.createdTs,
                userId: item.userId,
                userName: getPostUserResp.Item.name,
                walletAddress: getPostUserResp.Item.evmAddress,
            })
        }))
        res.json(responseData)
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    投票作成
    リクエスト：
    {
        id: string（roomId）
        title: string
        text: string
        choice:[
            {
                id: string
                title: string
            }
        ],
        end: int
    }
    レスポンス：
    {
        message: string
    }
*/
router.post("/room/vote/create",async(req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getRoomIndex = {
            TableName: dbname["Room"],
            Key: {
                id: req.body["id"]
            }
        }
        const resp = await documentClient.get(getRoomIndex).promise()
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
            if (item.organizationId === resp.Item.organizationId) {
                access = true
            }
        })
        if (!access) {
            res.status(401).json({
                status: false
            })
            return
        }

        const voteId = uuidv4()

        const createVoteInput = {
            TableName: dbname["Vote"],
            Item:{
                id:voteId,
                roomId: req.body["id"],
                userId: authResp.user["cognito:username"],
                title: req.body["title"],
                text: req.body["text"],
                choiceId: req.body["choice"],
                end: req.body["end"]
            }
        }

        await documentClient.put(createVoteInput).promise()

        const web3 = new Web3()
        const contract = new web3.eth.Contract(abi)

        const choiceId = []
        req.body["choice"].forEach(item=>{
            choiceId.push(item.id)
        })

        const message = contract.methods.AddVote(voteId,req.body["title"],choiceId).encodeABI()
        res.json({
            message:message
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    投票
    リクエスト：
    {
        id: string,
        choiceId: string
    }
    レスポンス：
    {
        message: string
    }
*/
router.post("/room/vote",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getVoteItem = {
            TableName: dbname["Vote"],
            Key: {
                id: req.body["id"]
            }
        }
        const VoteResp = await documentClient.get(getVoteItem).promise()

        const getRoomIndex = {
            TableName: dbname["Room"],
            Key: {
                id: VoteResp.Item["roomId"]
            }
        }
        const resp = await documentClient.get(getRoomIndex).promise()
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
            if (item.organizationId === resp.Item.organizationId) {
                access = true
            }
        })
        if (!access) {
            res.status(401).json({
                status: false
            })
            return
        }

        if (VoteResp.Item.end > Date.now()) {
            res.status(400).json({
                status: false
            })
            return
        }

        const putItemInput = {
            TableName: dbname["VoteResult"],
            Item:{
                id: uuidv4(),
                voteId: req.body["id"],
                userId: authResp.user["cognito:username"],
                choiceId: req.body["choiceId"]
            }
        }

        await documentClient.put(putItemInput).promise()

        res.json({
            status: true
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    投票取得
    リクエストパラメータ：
    {
        id: string（ルームID）
    }
    レスポンス：
        {
           id: string
           title:string,
           text:string,
           choice: [
                {
                    id: string
                    title: string
                }
           ],
           result:{
                [id:string]:number
           },
           voted:bool,
           endTs: number,
           votedId: string
        }
*/
router.get("/room/vote/",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getVoteItem = {
            TableName: dbname["Vote"],
            IndexName: "roomId-index",
            ExpressionAttributeNames:{
                "#roomId":"roomId"
            },
            ExpressionAttributeValues:{
                ":roomId":req.query["id"]
            },
            KeyConditionExpression: "#roomId = :roomId"
        }
        const VoteResp = await documentClient.query(getVoteItem).promise()
        const getRoomIndex = {
            TableName: dbname["Room"],
            Key: {
                id: VoteResp.Items[0].roomId
            }
        }
        const resp = await documentClient.get(getRoomIndex).promise()
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
            if (item.organizationId === resp.Item.organizationId) {
                access = true
            }
        })
        if (!access) {
            res.status(401).json({
                status: false
            })
            return
        }

        const quertResultParam = {
            TableName: dbname["VoteResult"],
            IndexName: "voteId-index",
            ExpressionAttributeValues: {
                ":voteId": VoteResp.Items[0].id
            },
            ExpressionAttributeNames:{
                "#voteId":"voteId"
            },
            KeyConditionExpression:"#voteId = :voteId"
        }
        
        const voteResultResp = await documentClient.query(quertResultParam).promise()

        const respResult = {

        }
        VoteResp.Items[0]["choiceId"].forEach(item=>{
            respResult[item.id] = 0
        })

        let voted = false
        let myChoice = ""
        voteResultResp.Items.forEach(item=>{
            respResult[item.choiceId] = respResult[item.choiceId]+1
            if (item.userId === authResp.user["cognito:username"]) {
                voted = true
                myChoice = respResult[item.choiceId].choiceId
            }
        })

        res.json({
            id: VoteResp.Items[0]["id"],
            title:VoteResp.Items[0]["title"],
            text: VoteResp.Items[0]["text"],
            choice: VoteResp.Items[0]["choiceId"],
            result:respResult,
            voted: voted,
            endTs: VoteResp.Items[0]["end"],
            votedId: myChoice
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    集計結果をコントラクトへアップロード
    リクエスト：
    {
        id: string（voteId）
    }
    レスポンス：
    {
        message: string
    }
*/
router.get("/room/vote/push",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getVoteItem = {
            TableName: dbname["Vote"],
            Key: {
                id: req.body["id"]
            }
        }
        const VoteResp = await documentClient.get(getVoteItem).promise()

        const getRoomIndex = {
            TableName: dbname["Room"],
            Key: {
                id: VoteResp.Item["roomId"]
            }
        }
        const resp = documentClient.get(getRoomIndex).promise()
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
            if (item.organizationId === resp.Item.organizationId) {
                access = true
            }
        })
        if (!access) {
            res.status(401).json({
                status: false
            })
            return
        }

        if (VoteResp.Item.end > Date.now()) {
            res.status(400).json({
                status: false
            })
            return
        }

        const queryVoteResult = {
            TableName: dbname["VoteResult"],
            IndexName: "voteId-index",
            ExpressionAttributeNames:{
                "#voteId":"voteId"
            },
            ExpressionAttributeValues:{
                ":voteId":req.query["id"]
            },
            KeyConditionExpression: "#voteId = :voteId"
        }
        const voteResultResp = await documentClient.query(queryVoteResult).promise()

        const answer = {}
        voteResultResp.Items.forEach(item=>{
            if (answer.includes(item.choiceId)) {
                answer[item.choiceId] += 1
            } else {
                answer[item.choiceId] = 0
            }
        })

        const choiceIds = []
        const counts = []

        Object.keys(answer).forEach(item=>{
            choiceIds.push(item)
            counts.push(answer[item])
        })

        const web3 = new Web3()
        const contract = new web3.eth.Contract(abi)

        const message = contract.methods.AddAnswer([req.query["id"],choiceIds,counts]).encodeABI()

        res.json({
            message: message
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})

module.exports = router
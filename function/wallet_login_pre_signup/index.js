const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
const documentClient = new AWS.DynamoDB.DocumentClient();
const {dbname} = require("./dbname");

exports.handler = async (event, context, callback) => {
    const UserTableName = dbname["User"]
    const params = {
        TableName: UserTableName,
        Item: {
            "id": event.userName,
        },
    };
    await documentClient.put(params).promise();
    event.response.autoConfirmUser = true;
    callback(null, event);
};
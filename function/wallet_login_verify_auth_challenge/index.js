const {verify} = require("jsonwebtoken")
const aws = require("aws-sdk")
export const handler = async (event) => {
    const secretsManager = new aws.SecretsManager()
    const response = await secretsManager.getSecretValue({
        SecretId: process.env.SECRET_NAME,
    }).promise()

    const token = event.request?.challengeAnswer;
    const jwtSecret = response.SecretString
    const {confirmed,userId} = verifyJwt(token, jwtSecret);
    if (event.request.userAttributes.username !== userId) {
        event.response.answerCorrect = false;
    } else {
        event.response.answerCorrect = confirmed;
    }

    return event;
};

const verifyJwt = (token, jwtSecret) => {
    try {
        const decoded = verify(token, jwtSecret);
        return true,decoded.userId
    } catch {
        return false, ""
    }
};
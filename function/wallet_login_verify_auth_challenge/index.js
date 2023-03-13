const {verify} = require("jsonwebtoken")
const aws = require("aws-sdk")
export const handler = async (event) => {
    const secretsManager = new aws.SecretsManager({
        region: "ap-northeast-1",
    })
    const response = await secretsManager.getSecretValue({
        SecretId: process.env.SECRET_NAME,
    }).promise()

    const token = event.request?.challengeAnswer;
    const jwtSecret = response.SecretString
    const confirmed = verifyJwt(token, jwtSecret);
    event.response.answerCorrect = confirmed;

    return event;
};

const verifyJwt = (token, jwtSecret) => {
    try {
        const decoded = verify(token, jwtSecret);
    } catch {
        return false
    }
    return true;
};
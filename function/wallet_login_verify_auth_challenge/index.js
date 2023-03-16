const {verify} = require("jsonwebtoken")
const aws = require("aws-sdk")
exports.handler = async (event) => {
    const secretsManager = new aws.SecretsManager()
    const response = await secretsManager.getSecretValue({
        SecretId: process.env.SECRET_NAME,
    }).promise()

    const token = event.request?.challengeAnswer;
    const jwtSecret = response.SecretString
    const jwtResp = verifyJwt(token, jwtSecret);

    let cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});
    let params = {
        UserPoolId: process.env.USER_POOL_ID, /* required */
        Filter: 'sub="'+event.request.userAttributes.sub+'"',
        Limit: '1',
    };

    const resp = await cognitoidentityserviceprovider.listUsers(params, ).promise();

    if (resp.Users[0].Username !== jwtResp[1]) {
        event.response.answerCorrect = false;
    } else {
        event.response.answerCorrect = jwtResp[0];
    }

    return event;
};

const verifyJwt = (token, jwtSecret) => {
    try {
        const decoded = verify(token, jwtSecret);
        return [true,decoded.userId]
    } catch {
        return [false, ""]
    }
};
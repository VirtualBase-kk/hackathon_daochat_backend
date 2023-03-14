const { getCurrentInvoke } = require("@vendia/serverless-express");

async function auth() {
    const currentInvoke = getCurrentInvoke();
    let username =
        currentInvoke.event.requestContext.authorizer.claims["cognito:username"];
    return {
        status: true,
        user: {
            "cognito:username":username
        },
    };
}

module.exports = auth;
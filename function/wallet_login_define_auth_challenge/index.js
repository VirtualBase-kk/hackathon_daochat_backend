exports.handler = async (event) => {
    if (event.request.session.length > 0) {
        if (event.request.session[event.request.session.length - 1].challengeResult) {
            event.response.issueTokens = true;
            event.response.failAuthentication = false;
        } else {
            event.response.issueTokens = false;
            event.response.failAuthentication = true;
        }
    } else {
        event.response.issueTokens = false;
        event.response.failAuthentication = false;
        event.response.challengeName = 'CUSTOM_CHALLENGE';
    }

    console.log(event.response);
    return event;
};
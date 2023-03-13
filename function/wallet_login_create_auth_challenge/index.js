export const handler = async (event) => {
    event.response.publicChallengeParameters = {};
    event.response.publicChallengeParameters.NEXT_ACTION = 'respond-to-auth-challenge';

    return event;
};
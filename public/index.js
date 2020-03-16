function requestChatBot() {
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", initBotConversation);
    var path = "/chatBot";
    oReq.open("GET", path);
    oReq.send();
}

function initBotConversation() {
    if (this.status >= 400) {
        alert(this.statusText);
        return;
    }
    // extract the data from the JWT
    const jsonWebToken = this.response;
    const tokenPayload = JSON.parse(atob(jsonWebToken.split('.')[1]));
    const user = {
        id: tokenPayload.userId,
        name: tokenPayload.userName
    };
    let domain = undefined;
    if (tokenPayload.directLineURI) {
        domain =  "https://" +  tokenPayload.directLineURI + "/v3/directline";
    }
    var botConnection = window.WebChat.createDirectLine({
        token: tokenPayload.connectorToken,
        domain: domain
    });
    const styleOptions = {
        botAvatarImage: 'https://docs.microsoft.com/en-us/azure/bot-service/v4sdk/media/logo_bot.svg?view=azure-bot-service-4.0',
        // botAvatarInitials: '',
        // userAvatarImage: '',
        userAvatarInitials: 'You',
        hideSendBox: true
    };

    const store = window.WebChat.createStore(
        {},
        function(store) {
            return function(next) {
                return function(action) {
                    if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {

                        // Use the following activity to enable an authenticated end user experience
                        /*
                        store.dispatch({
                            type: 'WEB_CHAT/SEND_EVENT',
                            payload: {
                                name: "InitAuthenticatedConversation",
                                value: jsonWebToken
                            }
                        });
                        */

                        store.dispatch({
                            type: 'WEB_CHAT/SET_NOTIFICATION',
                            payload: {
                                id: 'powered-by-azure',
                                level: 'success',
                                message: 'Powered by Azure'
                            }
                        });

                        store.dispatch({
                            type: 'DIRECT_LINE/POST_ACTIVITY',
                            meta: {method: 'keyboard'},
                            payload: {
                                activity: {
                                    type: "message",
                                    text: 'echo Hello, World!'
                                }
                            }
                        });

                        // Use the following activity to proactively invoke a bot scenario
                        /*
                        store.dispatch({
                            type: 'DIRECT_LINE/POST_ACTIVITY',
                            meta: {method: 'keyboard'},
                            payload: {
                                activity: {
                                    type: "invoke",
                                    name: "TriggerScenario",
                                    value: {
                                        trigger: "{scenario_id}",
                                        args: {
                                            myVar1: "{custom_arg_1}",
                                            myVar2: "{custom_arg_2}"
                                        }
                                    }
                                }
                            }
                        });
                        */
                    }
                    return next(action);
                }
            }
        }
    );

    const webchatOptions = {
        directLine: botConnection,
        store: store,
        styleOptions: styleOptions,
        userID: user.id,
        username: user.name,
        locale: 'en',
        toastMiddleware: function () {
            return function (next) {
                return function (arg) {
                    const notification = arg.notification;

                    if (notification && notification.id === 'powered-by-azure') {
                        return (
                            window.React.createElement(
                                'div',
                                {
                                    className: 'microsoftToast'
                                },
                                window.React.createElement(
                                    'img',
                                    {
                                        'aria-label': 'Microsoft Azure logo',
                                        className: 'microsoftToast--azureLogo',
                                        src: 'azure.svg'
                                    }
                                ),
                                window.React.createElement(
                                    'div',
                                    {
                                        className: 'microsoftToast--filler',
                                    }
                                ),
                                window.React.createElement(
                                    'a',
                                    {
                                        'aria-label': 'Powered by Microsoft Azure',
                                        className: 'microsoftToast--azureLink',
                                        href: 'https://aka.ms/powered-ms-azure',
                                        target: '_blank'
                                    },
                                    undefined,
                                    'Powered by Microsoft Azure'
                                )
                            )
                        );
                    }

                    return next(arg);
                };
            }
        }
    };
    startChat(user, webchatOptions);
}

function startChat(user, webchatOptions) {
    const botContainer = document.getElementById('webchat');
    window.WebChat.renderWebChat(webchatOptions, botContainer);
}

/**
 * @typedef {Object} DialogResponses
 * @property {string} title
 * @property {string} description
 * @property {number} weight
 * @property {DialogContext} reply
 */

/**
 * @typedef {Object} Dialog
 * @property {DialogResponses[]} choices
 */

/**
 * @typedef {Object} DialogContext
 * @property {string[]} title
 * @property {string[]} description
 * @property {DialogResponses[]} responses
 */

/**
 * @typedef {Object} DialogResponseMap
 * @property {DialogContext} context
 */

/**
 * @typedef {Object} DialogScript
 * @property {DialogResponseMap[]} dialog
 */

/**
 * @type {DialogScript}
 */
const exampleScript = {
    dialog: [
        {
            context: {
                title: "Welcome to Dialogger",
                description: "Welcome to Dialogger. This app allows you to build dialogs that change based on the players responses.",
                responses: [
                    {
                        title: "Wow! Sounds cool!",
                        description: "This sounds like it's the coolest thing! Can you tell me more?",
                        weight: 10,
                        reply: {
                            title: "It is right!",
                            description: "It does, doesn't it! It's very simple actually. Just a bunch questions and answers with little magical touch to make it more natural!",
                            responses: [

                            ]
                        }
                    },
                    {
                        title: "I like this, it's interesting.",
                        description: "This sounds like an intriguing application, I'd like to know more",
                        weight: 8,
                        reply: {
                            title: "Thanks!",
                            description: "I generally find the act of conversing quite interesting myself. The dynamics, the good or poor choices.",
                            responses: [

                            ]
                        }
                    },
                    {
                        title: "Huh, I saw something similar.",
                        description: "I think someone else made something like this, what different in yours?",
                        weight: 4,
                        reply: {
                            title: "I guess there could be...",
                            description: "Well these nothing no new idea is really a new idea, you just have to do what you love. That my usually motto!",
                            responses: [

                            ]
                        }
                    },
                    {
                        title: "I see",
                        description: "Okay, I see what you mean. Could be a nice idea I guess. (Turn around and walk away)",
                        weight: 1,
                        reply: {
                            title: "Oh well...",
                            description: "It seems like we bored that person to death... I guess not everyone likes a good conversation. (Packs up and leaves)",
                            responses: []
                        }
                    }
                ]
            }
        }
    ]
}


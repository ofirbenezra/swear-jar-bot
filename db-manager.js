const { DynamoDB } = require("aws-sdk");
const AWS = require("aws-sdk");
const { table } = require("console");
const { resolve } = require("path/posix");
const { v4: uuidv4 } = require('uuid');

const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    accessSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "eu-central-1"
}

const ddb = new DynamoDB(config)
// Set the region 
AWS.config.update(config);

// Create the DynamoDB service object
// var db = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const docClient = new AWS.DynamoDB.DocumentClient()
const tableName = "users_info";
const swearsDicTableName = "swears_dict";

const getUser = (serverId, userId) => {
    const params = {
        TableName: tableName,
        Key: {
            'serverId': serverId,
            'userId': userId
        }
    };

    // Call DynamoDB to read the item from the table
    return new Promise((resolve, reject) => {
        docClient.get(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.hasOwnProperty('Item') ? data.Item : data);
            }
        })
    })
}

const getUsersByServerId = (serverId) => {
    const params = {
        TableName: tableName,
        KeyConditionExpression: "#serverId = :serverId",
        ExpressionAttributeValues: {
            ":serverId": serverId
        },
        ExpressionAttributeNames: {
            "#serverId": "serverId"
        }
    };

    // Call DynamoDB to read the item from the table
    return new Promise((resolve, reject) => {
        docClient.query(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.hasOwnProperty('Items') ? data.Items : data);
            }
        })
    })
}

const addUser = (userId, serverId, name, swearCount, swearsDic) => {
    const params = {
        TableName: tableName,
        Item: {
            'userId': userId,
            'serverId': serverId,
            'userName': name,
            'createTimestamp': new Date().toISOString(),
            'updateTimestamp': new Date().toISOString(),
            'swearCount': swearCount,
            swears: swearsDic
        }
    };

    return new Promise((resolve, reject) => {
        docClient.put(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(params.Item);
            }
        });
    })

}

const updateUser = (user, userName, swearsDic) => {
    let newDict;
    if (user.swears) {
        Object.keys(swearsDic).forEach(s => {
            if (user.swears.hasOwnProperty(s)) {
                user.swears[s]++;
            } else {
                user.swears[s] = 1;
            }
        })
        newDict = user.swears;
    } else {
        newDict = swearsDic;
    }

    const params = {
        TableName: tableName,
        Key: {
            'serverId': user.serverId,
            'userId': user.userId
        },
        UpdateExpression: "set swearCount = swearCount + :val, updateTimestamp = :ts, swears = :swearsDic, userName = :userName",
        ExpressionAttributeValues: {
            ":val": 1,
            ":ts": new Date().toISOString(),
            ":swearsDic": newDict,
            ":userName": userName
        },
        ReturnValues: "UPDATED_NEW"
    };

    return new Promise((resolve, reject) => {
        docClient.update(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.Attributes.swearCount);
            }
        });
    })
}

const deleteUser = (serverId) => {

    getUsersByServerId(serverId).then(users => {
        users.forEach(user => {
            const params = {
                TableName: tableName,
                Key: {
                    'serverId': user.serverId,
                    'userId': user.userId
                },
                ConditionExpression: "serverId = :serverId AND userId = :userId",
                ExpressionAttributeValues: {
                    ":userId": user.userId,
                    ":serverId": user.serverId
                }
            };

            const promises = [];

            promises.push(docClient.delete(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            }));
            return Promise.allSettled(promises);
        })


    })

}

const addServersDetails = (servers) => {
    const promises = [];
    servers.forEach(server => {
        const params = {
            // PutRequest: {
            //     Item: {
            //         "id": { "S": uuidv4() },
            //         "server_id": { "S": server.id },
            //         "server_name": { "S": server.name }
            //     }
            // }
            TableName: 'servers_info',
            Item: {
                // "id": uuidv4(),
                "server_id": server.id,
                "server_name": server.name,
                "donation_link": '',
                "swear_limit": 10
            },
            ConditionExpression: 'attribute_not_exists(server_id)'
        };

        promises.push(new Promise((resolve, reject) => {
            docClient.put(params, function (err, data) {
                if (err) {
                    if (err.code !== 'ConditionalCheckFailedException') {
                        reject(err);
                    }
                } else {
                    resolve(data);
                }
            })
        }));
    })
    return Promise.allSettled(promises);
}

const getServerInfo = (serverId) => {
    const params = {
        TableName: 'servers_info',
        Key: {
            'server_id': serverId
        }
    };

    // Call DynamoDB to read the item from the table
    return new Promise((resolve, reject) => {
        docClient.get(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.hasOwnProperty('Item') ? data.Item : data);
            }
        })
    })
}

const setDisabledChannel = (serverId, channelId) => {
    const params = {
        TableName: 'disabled_channels',
        Key: { 'server_id': serverId },
        UpdateExpression: 'set #channelIds = list_append(if_not_exists(#channelIds, :empty_list), :channelId)',
        ExpressionAttributeNames: {
            '#channelIds': 'channelIds'
        },
        ExpressionAttributeValues: {
            ':channelId': [channelId],
            ':empty_list': []
        }
    };

    return new Promise((resolve, reject) => {
        docClient.update(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(params.Item);
            }
        });
    })
}

const getDisabledChannels = (serverId) => {
    const params = {
        TableName: 'disabled_channels',
        Key: {
            'server_id': serverId
        }
    };

    // Call DynamoDB to read the item from the table
    return new Promise((resolve, reject) => {
        docClient.get(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.hasOwnProperty('Item') ? data.Item : data);
            }
        })
    })
}

const deleteDisabledChannel = (serverId, channelId) => {
    const channels = '[' + Number.parseInt(channelId) + ']';
    const params = {
        TableName: 'disabled_channels',
        Key: { 'server_id': serverId },
        // UpdateExpression: `DELETE ${channels} :channel`,
        UpdateExpression: `REMOVE channelIds[0]`,
        // ExpressionAttributeValues: {
        //     ':channel' : docClient.createSet(channelId)
        // },
    };

    return new Promise((resolve, reject) => {
        docClient.update(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(params.Item);
            }
        });
    })
}

const updateDisabledChannels = (serverId, channels) => {
    const params = {
        TableName: 'disabled_channels',
        Key: { 'server_id': serverId },
        UpdateExpression: "set channelIds = :ids",
        ExpressionAttributeValues: {
            ":ids": channels
        }
    };

    return new Promise((resolve, reject) => {
        docClient.update(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(params.Item);
            }
        });
    })
}

const getLeaderBoard = (serverId) => {
    return new Promise((resolve, reject) => {
        const top5Users = [];
        getUsersByServerId(serverId).then(users => {
            const ordered = users.sort(({ swearCount: a }, { swearCount: b }) => b - a);
            const res = [];
            for (let index = 0; index < 5; index++) {
                if(ordered[index]){
                    res.push({userName: ordered[index].userName, swearCount: ordered[index].swearCount})
                }
            }
            resolve(res);
        })
    })
    
}

const getSwearsDic = () => {
    const params = {
        TableName: swearsDicTableName,
        Key: {
            'id': 'bd2533cb-14fc-41e2-bf20-0a36f7c2d7ea'
        }
    };

    // Call DynamoDB to read the item from the table
    return new Promise((resolve, reject) => {
        docClient.get(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.hasOwnProperty('Item') ? data.Item.swears : data);
            }
        })
    })
}

module.exports = {
    addUser,
    getUser,
    updateUser,
    deleteUser,
    addServersDetails,
    getServerInfo,
    setDisabledChannel,
    getDisabledChannels,
    deleteDisabledChannel,
    updateDisabledChannels,
    getLeaderBoard,
    getSwearsDic
}
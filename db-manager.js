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
const tableName = "users";

const getUser = (key) => {
    const params = {
        TableName: tableName,
        Key: {
            'id': key
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

const addUser = (userId, serverId, swearCount) => {
    const params = {
        TableName: tableName,
        Item: {
            'id': userId,
            'serverId': serverId,
            'createTimestamp': new Date().toISOString(),
            'updateTimestamp': new Date().toISOString(),
            'swearCount': swearCount
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

const updateUser = (userId) => {
    const params = {
        TableName: tableName,
        Key: {
            'id': userId,
        },
        UpdateExpression: "set swearCount = swearCount + :val, updateTimestamp = :ts",
        ExpressionAttributeValues: {
            ":val": 1,
            ":ts": new Date().toISOString()
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

const deleteUser = (userId, serverId) => {
    const params = {
        TableName: tableName,
        Key: {
            'id': userId,
        },
        ConditionExpression: "userId = :userId AND serverId = :serverId",
        ExpressionAttributeValues: {
            ":userId": userId,
            ":serverId": serverId
        }
    };

    return new Promise((resolve, reject) => {
        docClient.delete(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
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
                "donation_link" : '',
                "swear_limit": 10
            },
            ConditionExpression: 'attribute_not_exists(server_id)'
        };

        promises.push(new Promise((resolve, reject) => {
            docClient.put(params, function (err, data) {
                if (err) {
                    if(err.code !== 'ConditionalCheckFailedException') {
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

module.exports = {
    addUser,
    getUser,
    updateUser,
    deleteUser,
    addServersDetails
}
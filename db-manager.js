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
const usersTableName = "users";
const swearsDicTableName = "swears_dict";

const getUser = (key) => {
    const params = {
        TableName: usersTableName,
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
        TableName: usersTableName,
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
        TableName: usersTableName,
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

const deleteServer = (serverId) => {
    const params = {
        TableName: usersTableName,
        Key: {
            'serverId': serverId,
        },
        ConditionExpression: "serverId = :serverId",
        ExpressionAttributeValues: {
            // ":userId": userId,
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

const addSwearsToDic = (dic) => {
    const params = {
        TableName: swearsDicTableName,
        Item: {
            'id': uuidv4(),
            'swears': dic
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
    deleteServer,
    addSwearsToDic,
    getSwearsDic
}
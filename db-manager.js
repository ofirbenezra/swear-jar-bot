const AWS = require("aws-sdk");
const { table } = require("console");
const { resolve } = require("path/posix");
const uuid = require('uuid');

// Set the region 
AWS.config.update(
    { 
        region: 'us-east-1',
        accessKeyId: process.env.AWS_SECRET_KEY,
        accessSecretKey: process.env.AWS_SECRET_KEY,
     });

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
                resolve(data.hasOwnProperty('Item')? data.Item : data);
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
            'updateTimestamp':new Date().toISOString(),
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
        ExpressionAttributeValues:{
            ":val": 1,
            ":ts": new Date().toISOString()
        },
        ReturnValues:"UPDATED_NEW"
    };

    return new Promise((resolve, reject) => {
        docClient.update(params, function(err, data) {
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
        ConditionExpression:"userId = :userId, serverId = :serverId",
        ExpressionAttributeValues: {
            ":userId": userId,
            ":serverId": serverId
        }
    };

    return new Promise((resolve, reject) => {
        docClient.delete(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    })
}
module.exports = {
    addUser,
    getUser,
    updateUser,
    deleteUser
}
const { Client, Pool } = require('pg');
var parse = require('pg-connection-string').parse;

let devDB = 'postgres://oiccrclqexuacu:a13fa0f3a0b64d44c63c23c3fe7731556843127809c1360400dc3ae2cf228808@ec2-54-216-17-9.eu-west-1.compute.amazonaws.com:5432/de92g5782s2hn1' ;

if (process.env.DATABASE_URL == undefined) {
    console.error(`DB connection string not found DATABASE_URL environment variable.`);
}
var config = parse( process.env.DATABASE_URL || devDB )

// console.log(`
//         Host: ${config.host}
//         DB : ${config.database}
//         User : ${config.user}
//         Password: ${config.password}
//         Port: ${config.port}
// `)

var pool = new Pool({
    user: config.user,
    host: config.host,
    database: config.database,
    password: config.password,
    port: config.port,
    max: 5,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 10000,
    ssl: {
        rejectUnauthorized: false
    },
    maxUses: 10000,
});


// User: nvibskmbyqefco
// Password : 8caf665358e275ac9bfb9eb23b5a4c6e2a34ddef75e98b4306a44b28b4b9c591
// Host: ec2-54-216-17-9.eu-west-1.compute.amazonaws.com
// DB: de92g5782s2hn1
//Uat db config
// var pool = new Pool({
//     user: "udc156qrcu6ilv",
//     host: "ec2-52-23-45-5.compute-1.amazonaws.com",
//     database: "d9dtt10i2gpng1",
//     password: "p0e8afc0c4bbd2ebe84cb9d6a2f8e91c618737f4d299743e16b71e91652e1de26",
//     port: "5432",
//     max: 5,
//     idleTimeoutMillis: 3000,
//     connectionTimeoutMillis: 10000,
//     ssl: {
//         rejectUnauthorized: false
//     },
//     maxUses: 10000,
// });


pool.on('connect', client => {
    console.info("Total connections ::", pool.totalCount);
});

pool.on('acquire', client => {
    console.info("Idle connections ::", pool.idleCount);
});

pool.on('error', client => {
    console.error("Error in the connection pool ::", error);
});

pool.on('remove', client => {
    console.info("Closed connection ::", pool.idleCount);
});

function getConnection() {
    /*
    dbConnectionURL = 'postgres://fjsbrbxppqqvvj:b9fd23c066e268899d1e2062e58a767d0b6a520aeb93e762e4a3e7418efeffe9@ec2-54-73-68-39.eu-west-1.compute.amazonaws.com:5432/d43i6d6j774qi2';

    let client = new Client({
        connectionString: dbConnectionURL,//process.env.DATABASE_URL ? process.env.DATABASE_URL : dbConnectionURL,
        ssl: {
            rejectUnauthorized: false
        }
    })
    return client;
    */
    try {
        return pool.connect();
    } catch (err) {
        console.log(`Error occure while connection to DB as : ${err}`)
    }
}


function getConnectionPool() {

    if (pool)
        return pool;
    // else  new Pool({
    //     user: "fjsbrbxppqqvvj",
    //     host: "ec2-54-73-68-39.eu-west-1.compute.amazonaws.com",
    //     database: "d43i6d6j774qi2",
    //     password: "b9fd23c066e268899d1e2062e58a767d0b6a520aeb93e762e4a3e7418efeffe9",
    //     port: "5432"
    // });


}

function endConnection(client) {
    client.end(err => {
        console.log('client has disconnected')
        if (err) {
            console.log('error during disconnection', err.stack)
        }
    })
}

module.exports = {
    getConnection,
    endConnection,
    getConnectionPool
}
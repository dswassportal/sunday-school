const { Client, Pool } = require('pg');

var pool = new Pool({
    user: "oiccrclqexuacu",
    host: "ec2-54-216-17-9.eu-west-1.compute.amazonaws.com",
    database: "de92g5782s2hn1",
    password: "a13fa0f3a0b64d44c63c23c3fe7731556843127809c1360400dc3ae2cf228808",
    port: "5432",
    max: 5,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 10000,
    ssl: {
        rejectUnauthorized: false
    },
    maxUses: 10000,
});

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
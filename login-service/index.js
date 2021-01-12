const express = require("express");
const app = express();
const PORT = 5001;
const amqp = require("amqplib");
const bp = require("body-parser");
var channel, connection;

app.use(bp.json());
connect();
async function connect() {
    try {
        const amqpServer = "amqp://localhost:5672";
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue("session");
    } catch (ex) {
        console.error(ex);
    }
}

const createSession = async user => {
    await channel.sendToQueue("session", Buffer.from(JSON.stringify(user)));
    await channel.close();
    await connection.close();
};

app.post("/login", (req, res) => {
    const { user } = req.body;
    createSession(user);
    res.send(user);
});

app.listen(PORT, () => {
    console.log(`Server at ${PORT}`);
});

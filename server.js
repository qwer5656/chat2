var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.use(express.static('public'));
let names = [];
let socketgroup = {};
let num = 0;
io.on('connection', (socket) => {

    socket.emit("init", socket.id);
    console.log("connection");
    if (socketgroup["g" + num] === undefined) {
        socketgroup["g" + num] = [];
        socketgroup["g" + num][0] = socket;
    }
    else {
        socketgroup["g" + num][1] = socket;
        for (var i = 0; i < 2; i++) {
            socketgroup["g" + num][i].emit("matching", { group: num });
        }
        num++;

    }
    socket.on('userinfo', (msg) => {

        socketgroup["g" + msg.group][0].emit('userinfo', "連線成功");
        socketgroup["g" + msg.group][1].emit('userinfo', "連線成功");

        // io.emit("userinfo", `welcome enter ${msg.user}to room`);
        // let id = socket.id;
        // socketgroup[msg.user] = socket;
        // names.push({ name: msg.user, id });

    });

    socket.on('disconnect', () => {

        console.log(socketgroup);
        // let arr = names.filter((e) => {

        //     return e.id === socket.id;
        // });
        // if (arr.length != 0) {
        //     io.emit("userinfo", `welcome exit ${arr[0].name}to room`);
        // }
    });
    socket.on('exit', (msg) => {
        if (socketgroup["g" + msg.group] != undefined) {
            socketgroup["g" + msg.group][0].emit('exit', "對方離開");
            socketgroup["g" + msg.group][1].emit('exit', "對方離開");
            delete socketgroup["g" + msg.group];
        }
    })
    socket.on('chat message', (msg) => {
        let data = {
            id: socket.id,
            msg: msg.data,
            name: msg.user,
        }
        //console.log(socketgroup["g" + msg.group]);

        socketgroup["g" + msg.group][0].emit('chat message', data);
        socketgroup["g" + msg.group][1].emit('chat message', data);
        //io.emit('chat message', data);
    });

});

http.listen(6105, () => {
    console.log('listening on *:6105');
});
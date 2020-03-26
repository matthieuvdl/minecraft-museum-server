const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path')
const io = require('socket.io')(server);
const port = 8081

server.listen(process.env.PORT || port)
console.log(`Minecraft Museum Server running on port ${port}`)

// Express define static dir
app.use(express.static(path.join(__dirname + '/static')))


// Express router on /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'))
})

// Event at connection / deconnection of the user + add / delete new player

const players = {}

io.on('connection', (socket) => {

    socket.on('new_player', (data) => {
        console.log('-> new player', socket.id)
        players[socket.id] = data
        players[socket.id].id = socket.id
        players[socket.id].skin = Math.floor(Math.random() * 8)
        console.log(players)
        socket.emit('init', players)
    })

    socket.on('update_my_position', (data) => {
        console.log('-> update_my_position', socket.id)
        const player = players[socket.id] || {}
        player.x = data.x
        player.z = data.z
        player.rotX = data.rotX
        player.rotY = data.rotY
        console.log(players)
        socket.broadcast.emit('positions_update', player)
    })

    socket.on('block_click', (data) => {
        console.log('-> block click', socket.id)
        socket.broadcast.emit('block_click', data)
    })

    socket.on('disconnect', () => {
        console.log('-> disconnect', socket.id)
        delete players[socket.id]
        console.log(players)
        socket.emit('player_disconnected', socket.id)
    })

})
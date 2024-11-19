const express = require('express');
const { SerialPort } = require("serialport")
const { ReadlineParser } = require('@serialport/parser-readline')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });

let port
let parser
const dataOut = {
    velocity: 0.0,
    kp: 0.0,
    ki: 0.0,
    kd: 0.0
}
let currentSettings = []
let motorOn = false
let previousTime = new Date().getTime()

const dataParse = (d) => {
    let parsed = d.split(",")
    parsed = parsed.map(p => p.replace(" ", ""))
    parsed.shift()
    parsed = parsed.join(":")
    return "<" + parsed + ">"
}

const startMotor = () => {
    motorOn = true
}

const stopMotor = () => {
    motorOn = false
}

const updateValues = (vals) => {
    console.log(vals)
    dataOut.velocity = vals[0]
    dataOut.kp = vals[1]
    dataOut.ki = vals[2]
    dataOut.kd = vals[3]
}

const selectPort = (p, res) => {
    port = new SerialPort({ path: p, baudRate: 115200 })
    parser = port.pipe(new ReadlineParser({ delimiter: '\r\n', encoding: 'ascii' }))
    parser.on('data', (data) => {
        if (data && currentSettings.length == 0) {
            currentSettings = data
            io.emit('currentSettings', currentSettings)
        }
        // console.log(data)
        const timeStamp = new Date().getTime()
        const arduinoVals = dataParse(data)
        const newVals = `<${dataOut.velocity}:${dataOut.kp}:${dataOut.ki}:${dataOut.kd}>`
        if (arduinoVals != newVals && motorOn) {
            port.write(newVals)
            let latestData = data.split(",")
            let signal_1 = latestData[0]
            let currentTimeStamp = (timeStamp - previousTime) / Math.pow(10, 3)
            io.emit('signalData', { time: currentTimeStamp.toFixed(2), signal_1: signal_1})
        }
        else if (arduinoVals != newVals && !motorOn) {
            const stopVals = `<0.0:${dataOut.kp}:${dataOut.ki}:${dataOut.kd}>`
            port.write(stopVals)
        }
    })
    res({
        connection: true
    })
    console.log("Serial port connected")
}

const portDisconnect = (res) => {
    parser = null
    port.close()
    res({
        connection: false
    })
    console.log("Serial port disconnected")
}

io.on('connection', (socket) => {
    socket.on('startMotor', startMotor)
    socket.on('stopMotor', stopMotor)
    socket.on('updateVals', updateValues)
    socket.on('selectPort', selectPort)
    socket.on('portDisconnect', portDisconnect)

    SerialPort.list()
        .then(ports => {
            let portPaths = ports.map(p => p.path)
            io.emit('portPaths', portPaths)
        })
});

server.listen(3001, () => {
    console.log('listening on *:3001');
});

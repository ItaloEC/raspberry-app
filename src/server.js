const express = require("express");
const app = express();
const fs = require("fs");
var cors = require("cors");
const fakeWeight = require("./utils/fakeWeight");
const SerialPort = require("serialport");
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const Readline = require("@serialport/parser-readline");
const parser = new Readline();
let config = require("./config.json");
var socketGlobal;
var pesoGlobal = "";
const socketClient = require("socket.io-client");
var socketServer = socketClient("http://192.168.0.104:3005");

const port = 3010;

socketServer.on("connection", (socket) => {
  console.log(`config.scaleName`, config.scaleName);
  console.log(`socket.id`, socket.id);
  console.log("connected socket server", socket.connected);
});

if (config.environment !== "dev") {
  const serialPort = new SerialPort(config.choosenPort, {
    baudRate: 2400,
    parity: "none",
    stopBits: 1,
    size: 16,
  });
  serialPort.pipe(parser);

  
let value = "";
// if (config.environment !== "dev") {
  console.log('entrou');
  serialPort.on("data", function (data) {
    console.log("Data:", data.toString());
  //   value.length == 16
  //     ? (pesoGlobal = value.substring(2, 9))
  //     : (value += data.toString());
  pesoGlobal = data.toString().substring(2, 3) + ',' + data.toString().substring(3, 6)
  });
// }
}

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

setInterval(() => {
  // console.log(socketServer.connected);
  config.environment === "dev"
    ? (() => {
      let peso = fakeWeight();
      socketGlobal?.emit("weight", { weight: peso });
      socketServer.emit("weight-server", { ...config, weight: peso });
    })()
    : (() => {
     console.log('peso global ===>', pesoGlobal);
      socketGlobal?.emit("weight", {
        weight: pesoGlobal ? pesoGlobal : "0.00",
      });
      socketServer.emit("weight-server", { ...config, weight:  pesoGlobal ? pesoGlobal : "Balanza conectada a la puerta incorrecta", });
    })();
}, 1000);







// console.log("\n\n\n\n`=  10.255B0`0F", "`, =  10.255B0`0F".substring(5, 12));
io.on("connection", (socket) => {
  /* socket object may be used to send specific messages to the new connected client */

  console.log("******************************************new client connected");
  socketGlobal = socket;


});

const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());

app.use(express.static("build"));

app.post("/setname", (req, res) => {
  let config = require("./config.json");

  let scaleName = req.body.scaleName;
  console.log(`scaleName`, scaleName);

  config.scaleName = scaleName;

  const data = JSON.stringify(config, null, 4);

  fs.writeFile("src/config.json", data, (err) => {
    if (err) {
      console.log(`err`, err);
    }
    console.log("JSON data is saved.");
    res.send({ scaleName }).status(200);
  });
});

app.get("/getname", (req, res) => {
  let config = require("./config.json");

  res.send({ scaleName: config.scaleName }).status(200);
});

app.get("/getipserver", (req, res) => {
  let config = require("./config.json");

  res.send({ ipServer: config.ipServer }).status(200);
});

app.post("/setipserver", (req, res) => {
  let config = require("./config.json");

  let ipServer = req.body.ipServer;

  config.ipServer = ipServer;

  const data = JSON.stringify(config, null, 4);

  fs.writeFile("config.json", data, (err) => {
    if (err) {
      console.log(`err`, err);
    }
    console.log("JSON data is saved.");
  });
  res.status(200).json({ ipServer });
});

http.listen(port, () => {
  console.log(`Server Raspberry listening at http://localhost:${port}`);
});

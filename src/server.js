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

const serialPort = new SerialPort(config.choosenPort, {
  baudRate: 2400,
  parity: "none",
  stopBits: 1,
  size: 16,
});
serialPort.pipe(parser);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

io.on("connection", (socket) => {
  /* socket object may be used to send specific messages to the new connected client */

  console.log("******************************************new client connected");

  let value = "";
  serialPort.on("data", function (data) {
    //console.log("Data:", data.toString());
    value.length == 16
      ? socket.emit("weight", { weight: value.substring(3, 9) })
      : (value += data.toString());
  });
});

// console.log("aquiiiiiiiiiiiiiiii");

const bodyParser = require("body-parser");
const { get } = require("http");

const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static("build"));

app.get("/serialportlist", async (req, res) => {
  // console.log(`SerialPort.list()`, await SerialPort.list());
  let list = await SerialPort.list();

  let names = list.map((port) => {
    // return port.path.replace("/dev/tty.", "");
    return port.path;
  });

  console.log(`list`, names);
  res.send({ list: names }).status(200);
});

/*
  '/dev/tty.debug-console',
  '/dev/tty.wlan-debug',
  '/dev/tty.Bluetooth-Incoming-Port',
  '/dev/tty.wireless-JL_SPP'
*/

app.post("/setname", (req, res) => {
  let config = require("./config.json");

  let name = req.body.name;

  config.name = name;

  // convert JSON object to string
  const data = JSON.stringify(config, null, 4);

  fs.writeFile("config.json", data, (err) => {
    if (err) {
      console.log(`err`, err);
    }
    console.log("JSON data is saved.");
  });
});

app.post("/setport", (req, res) => {
  let config = require("./config.json");

  let choosenPort = req.body.choosenPort;

  config.choosenPort = choosenPort;

  // convert JSON object to string
  const data = JSON.stringify(config, null, 4);
  console.log(`data`, data);

  // fs.writeFile("config.json", data, (err) => {
  //   if (err) {
  //     console.log(`err`, err);
  //   }
  //   console.log("\n\n\nJSON data is saved.");
  // });

  // const serialPort = new SerialPort(choosenPort, {
  //   baudRate: 2400,
  //   parity: "none",
  //   stopBits: 1,
  //   size: 16,
  // });
  // serialPort.pipe(parser);
  // let value = "";
  // serialPort.on("data", function (data) {
  //   //console.log("Data:", data.toString());
  //   value.length == 16
  //     ? socketGlobal?.emit("weight", { weight: value.substring(3, 9) })
  //     : (value += data.toString());
  // });
});

app.post("/setipserver", (req, res) => {
  let config = require("./config.json");

  let ipServer = req.body.ipServer;

  config.ipServer = ipServer;

  // convert JSON object to string
  const data = JSON.stringify(config, null, 4);

  fs.writeFile("config.json", data, (err) => {
    if (err) {
      console.log(`err`, err);
    }
    console.log("JSON data is saved.");
  });
});

app.get("/weight", (req, res) => {
  const serialPort = new SerialPort(choosenPort, { baudRate: 256000 });
  serialPort.on("data", function (data) {
    console.log("Data:", data);
  });

  res.send({ weight: fakeWeight() }).status(200);
});

http.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

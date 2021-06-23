const express = require("express");
const app = express();
const fs = require("fs");
var cors = require("cors");
const fakeWeight = require("./utils/fakeWeight");
const SerialPort = require("serialport");
const config = require("./modules/config");

const port = 3001;

var choosenPort = "Bluetooth-Incoming-Port";

app.use(cors());

app.use(express.static("build"));

app.get("/serialportlist", async (req, res) => {
  console.log(`SerialPort.list()`, await SerialPort.list());
  let list = await SerialPort.list();

  let names = list.map((port) => {
    return port.path.replace("/dev/tty.", "");
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

app.get("/setport", (req, res) => {
  choosenPort = req.params.port;

  config.choosenPort = choosenPort;

  // convert JSON object to string
  const data = JSON.stringify(config, null, 4);

  fs.writeFile("config.json", data, (err) => {
    if (err) {
      console.log(`err`, err);
    }
    console.log("JSON data is saved.");
  });
});

app.get("/setipserver", (req, res) => {
  ipserver = req.params.port;

  config.ipServer = ipserver;

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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

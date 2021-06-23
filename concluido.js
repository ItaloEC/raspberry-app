const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const parser = new Readline();

async function getPorts() {
  let list = await SerialPort.list();
  console.log(`list => `, list);

  const serialPort = new SerialPort(list[1].path, {
    baudRate: 2400,
    parity: "none",
    stopBits: 1,
    size: 16,
  });
  serialPort.pipe(parser);
  let value = "";
  serialPort.on("data", function (data) {
    //console.log("Data:", data.toString());
    value.length == 16
      ? console.log(value.substring(3, 9))
      : (value += data.toString());
  });
}

getPorts();

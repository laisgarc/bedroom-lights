var express = require('express');
var app = express();
var cors = require('cors');
const http = require('http').createServer(app);
const io = require("socket.io")(http, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"]
  }
});
const bodyParser = require('body-parser');
const TuyAPI = require("tuyapi");

const { device_keys } = require("./config.json");
let connectedDevices = [];
let disconnectedDevices = [];

app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});
app.use(bodyParser.json());

app.get('/', function (req, res) {
	return res.send('Hello Server!')
})

app.get('/turnOff', async function (req, res) {
    doTurnOff();
    if (disconnectedDevices.length > 0) {
        await connectAllDisconnected();
        doTurnOff();
    }
    res.send(true)
})

app.get('/turnOn', async function (req, res) {
    doTurnOn();
    if (disconnectedDevices.length > 0) {
        await connectAllDisconnected();
        doTurnOn();
    }
    res.send(true)
})

app.get('/colorMode', function (req, res) {
    setColorMode()
    res.send(true)
})

app.get('/whiteMode', function (req, res) {
    setWhiteMode()
    res.send(true)
})

http.listen(30061 || process.env.PORT, function () {
	console.log('App running on port 30061');
});


const makeStatus = dps => (
    {
      on: dps?.["20"],
      mode: dps?.["21"],
      brightnessWhite: dps?.["22"],
      warmth: dps?.["23"],
      color: dps?.["24"],
  });
  
  const getDevices = async () => {
      const devices = device_keys.map(async ({ Name, id, key }) => {
          const device = new TuyAPI({ id, key });
          console.log("connecting " + Name);
          await device.find().catch(e => { console.error(`Error with ${Name}`) });
          await device.connect();
          const status = makeStatus((await device.get({ schema: true })).dps)
          device.on('disconnected', () => onDisconnected(Name, device));
          device.on('error', e => onError(e, Name, device));
          device.on('dp-refresh', (data) => onData(data, Name, device));
          return ({ Name, device, status  })
      });
      connectedDevices = await Promise.all(devices);
  }
  
  getDevices();
  
  const connectAllDisconnected = async () => {
    if(disconnectedDevices.length === 0) {
        timeout = setTimeout(connectAllDisconnected, 10000);
        return;
    }
    const disconnectedNames = disconnectedDevices.map(({Name})=>Name); 
    const disconnectedKeys = device_keys.filter(({Name})=>disconnectedNames.includes(Name));
    
    for(let i = 0; i<disconnectedKeys.length; i++){
        const { Name, id, key } = disconnectedKeys[i];
        const device = new TuyAPI({ id, key });
        console.log("reconnecting " + Name);
        let error = false; 
        await device.find().catch(e => { console.error(`Error with ${Name}`); error = true});
        if(error) continue;
        await device.connect();
        const status = makeStatus((await device.get({ schema: true })).dps)
        device.on('disconnected', () => onDisconnected(Name, device));
        device.on('error', e => onError(e, Name, device));
        device.on('dp-refresh', (data) => onData(data, Name, device));
  
        connectedDevices = [...connectedDevices.filter(({ Name: currentName }) => Name !== currentName), { Name, device, status  }];
        disconnectedDevices = disconnectedDevices.filter(({ Name: currentName }) => Name !== currentName);
        if(i === disconnectedKeys.length - 1)
            timeout = setTimeout(connectAllDisconnected, 10000);
    }
  }
  
  let timeout = setTimeout(connectAllDisconnected, 10000);
  
  
  const onError = (e, Name, device) => {
    if(device.isConnected()) return; 
    connectedDevices = connectedDevices.filter(({ Name: currentName }) => Name !== currentName);
    disconnectedDevices = [...disconnectedDevices.filter(({ Name: currentName }) => Name !== currentName), { device, Name }];
  }
  
  const onDisconnected = (Name, device) => {
    connectedDevices = connectedDevices.filter(({ Name: currentName }) => Name !== currentName);
    disconnectedDevices = [...disconnectedDevices.filter(({ Name: currentName }) => Name !== currentName), { device, Name }];
  }
  
  const onData = ({ dps: data }, Name, device) => {
  
      status = connectedDevices.find(({ Name: currentName }) => Name === currentName)?.status;
  
      if( !("20" in data) && status) data["20"] = status.on; 
      if( !("21" in data) && status) data["21"] = status.mode; 
      if( !("22" in data) && status) data["22"] = status.brightnessWhite; 
      if( !("23" in data) && status) data["23"] = status.warmth; 
      if( !("24" in data) && status) data["24"] = status.color; 
  
      const newStatus = makeStatus(data);
      connectedDevices = connectedDevices.map(({ Name: currentName, device: currentDevice, status }) => Name !== currentName ? { Name: currentName, device: currentDevice, status } : { Name, device, status: newStatus })
      console.log("running onData");
      io.emit("update", { Name, ...newStatus });
  }
  
  const doTurnOff = () => {
    connectedDevices.forEach(({ device }, i) => {
        device.set({ dps: 20, set: false });
    });
  }
  
  const doTurnOn = () => {
    connectedDevices.forEach(({ device, Name }, i) => {
        console.log(`turning on ${Name}`);
        device.set({ dps: 20, set: true });
    })
  }
  
const setWhiteMode = () => {
    connectedDevices.forEach(({ device },i) => {
        device.set({
            multiple: true,
            data: {
                "21": "white"
            }
        });
    })
}

const setColorMode = () => {
    connectedDevices.forEach(({ device },i) => {
        device.set({
            multiple: true,
            data: {
                "21": "colour"
            }
        });
    })
}
  
const changeLights = (lghts,newState,original) => {
    const devicesToUpdate = connectedDevices.filter(({ Name }) => lghts.includes(Name));
    if(newState === "off"){
        let check = devicesToUpdate; 
        newState = check.reduce((acc,{status})=>{
            if (status.on) {
                acc.on++; 
                return acc;
            }
            acc.off++; 
            return acc;
        },{on:0,off:0});
        if (newState.on > newState.off) newState = "off";
        else newState = "on";
    }
    devicesToUpdate.forEach(({ device },i) => {
        if (newState === "white|warm") {
            // need to check for warmth and other parameters in the setting and newState
            device.set({
                multiple: true,
                data: {
                    "20": true,
                    "21": "white",
                    "22": 1000,
                    "23": 0,
                }
            });

        } else if (newState === "white|normal") { 
            device.set({
                multiple: true,
                data: {
                    "20": true,
                    "21": "white",
                    "22": 1000,
                    "23": 500,
                }
            });
        }
        else {
            device.set({
                multiple: true,
                data: {
                    "20": true,
                    "21": "colour",
                    "24": newState
                }
            });
        }
    });
}
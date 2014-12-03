/*
 Lectora de código de barras:0c2e:0206
 Conversor usb: 047e:1001
 Impresora: 1a86:7584
 USB: 80ee:0021
 */
//var MY_HID_VENDOR_ID = 0x80ee; // 4660 in hexadecimal!
//var MY_HID_PRODUCT_ID = 0x0021;
var MY_HID_VENDOR_ID = 0x1a86; // 4660 in hexadecimal!
var MY_HID_PRODUCT_ID = 0x7584;
var DEVICE_INFO = {"vendorId": MY_HID_VENDOR_ID, "productId": MY_HID_PRODUCT_ID};

var requestButton = document.getElementById("requestPermission");

var connectionId = null;

var usbConnection = null;

var device = null;

var onOpenCallback = function (connection) {
    console.log("onOpenCallback.");
    if (connection) {
        usbConnection = connection;
        console.log("Device opened.");
    } else {
        console.log("Device failed to open.");
    }
};

function arrayBufferToString(array) {
    return String.fromCharCode.apply(null, new Uint8Array(array));
}

var myDevicePoll = function () {
    var size = 64;

    chrome.hid.receive(connectionId, size, function (data) {
        if (data != null) {
            // Convert Byte into Ascii to follow the format of our device
            myText.value = arrayBufferToString(data);
            console.log('Data: ' + myText.value);
        }

        setTimeout(myDevicePoll, 0);
    });
};

var myDevicePollUsb = function () {
    var size = 64;

    chrome.usb.receive(connectionId, size, function (data) {
        if (data != null) {
            // Convert Byte into Ascii to follow the format of our device
            myText.value = arrayBufferToString(data);
            console.log('Data: ' + myText.value);
        }

        setTimeout(myDevicePollUsb, 0);
    });
};

function initializeHid(pollHid) {
    chrome.hid.getDevices(DEVICE_INFO, function (devices) {
        if (!devices || !devices.length) {
            var myText = document.getElementById("mydevice");
            myText.value = 'device not found ' + devices.length + " " + devices;
            console.log('device not found');
            return;
        }

        console.log('Found device: ' + devices[0].deviceId);
        myHidDevice = devices[0].deviceId;

        // Connect to the HID device
        chrome.hid.connect(myHidDevice, function (connection) {
            var myText = document.getElementById("mydevice");
            myText.value = 'Found device: ' + devices[0].deviceId + ' Connected to the HID device!';
            console.log('Connected to the HID device!');
            connectionId = connection.connectionId;

            // Poll the USB HID Interrupt pipe
            pollHid();
        });
    });
}

function initializeUsb(pollHid) {
    chrome.usb.findDevices(DEVICE_INFO,
            function (devices) {
                if (!devices || !devices.length) {
                    console.log('device usb not found');
                    return;
                }
                else {
                    device = devices[0];
                    console.log('Device');
                    console.log(device);
                    console.log('found');
                    getDevice();
                }
                
            });
}

function getDevice() {
    chrome.usb.getDevices(DEVICE_INFO, function (devices) {
        if (devices) {
            if (devices.length > 0) {
                device=devices[0];
                console.log("Device(s) found: " + devices.length);
                console.log(device);
                openDevice();
                
            } else {
                console.log("Device could not be found");
            }
        } else {
            console.log("Permission denied.");
        }
    }
    );
   
}

function openDevice() {
    console.log("openDevice");
    chrome.usb.openDevice(device, function (connection) {
        
        console.log(device);
        if (connection) {
            usbConnection = connection;
            console.log("Device opened.");
            listInterfaces();
            
        } else {
            console.log("Device failed to open.");
        }
    });
};

function listInterfaces(){
    console.log("listInterfaces");
    
    chrome.usb.listInterfaces(usbConnection, function(ifcs){
        console.log('interfaces '+ifcs.length);
        console.log(ifcs);
        claimInterface();
    });
}

function claimInterface(){
    console.log("claimInterface");
    
    chrome.usb.claimInterface(usbConnection, 0, function(){
        console.log("claimed Interface on");
        
        console.log(chrome.runtime);
        
        console.log(usbConnection);
        
       // transferData();
       // return;
        
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        transferData();
    });
    
}

function transferData() {
    //var message = "PRINT #1, \"AAAAA\";CHR$(&HA);";
    
    //var ini=["0x1B","c0","0x4"];
    var ini=[];
    var fin =["0x0A"];
    
    var message = ini +"BBBB"+fin;
    
    var datos = getBytes(message);
    
    var data = datos.buffer;
    
    var info = {
        "direction": "out",
        "endpoint": 2, // 2 is the Bulk OUT Endpoint. You may use chrome.usb.listInterfaces to figure which address to use for Outputing data.
        "data": data
    };
    
    console.log("transferData");
    console.log(data);

    chrome.usb.bulkTransfer(usbConnection, info, function (transferResult) {
        console.log("Send data");
        console.log(transferResult);
        /*chrome.usb.releaseInterface(DEVICE_INFO, 0, function () {
            if (chrome.runtime.lastError){
               // console.error(chrome.runtime.lastError);
           }
        });*/
    });
}

function getBytes(message){
    console.log(message.length);
    
    var bytes = new Uint8Array(message.length);
    
    for (var i=0; i<message.length; i++){
        bytes[i]=message.charCodeAt(i);
    }
    
    return bytes;
}


//initializeHid(myDevicePoll);
initializeUsb(myDevicePollUsb);


console.log("My App is running ...");

var myText = document.getElementById("mytext");
myText.value = "Youpi!";


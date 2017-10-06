/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
const app = {
    macAddress: "AA:BB:CC:DD:EE:FF",  // get your mac address from bluetoothSerial.list
    lastSpeed: 0,
    lastAngle: 0,
    intervalId: -1,
    nippleManager: {},
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        connectButton.addEventListener('touchend', this.manageConnection.bind(this), false);
        this.nippleManager = nipplejs.create({
            zone: document.getElementById("app"),
            color: "#bbaacc",
            mode: "static",
            position: {
                top: "50%",
                left: "50%"
            },
            restOpacity: 1
        });

        this.nippleManager.on("move", this.onJoystickMove.bind(this));
        this.nippleManager.on("end", () => this.transmitMovement(0, 0));
    },

    onJoystickMove: function (evt, data) {
        const degree = Math.floor(data.angle.degree - 90);
        const speed = Math.floor(Math.min(data.force, 4) * 25);
        if (degree <= 90) {
            if (Math.abs(degree) < 5) {
                this.transmitMovement(speed, 0);
            } else {
                this.transmitMovement(speed, degree);
            }
        } else {
            this.transmitMovement(0, 0);
        }
    },

    transmitMovement: function (speed, angle) {
        document.getElementById("joystick-debug").innerHTML = "Kurs:" + angle + "° Geschwindigkeit: " + speed + "%";
        this.lastAngle = angle;
        this.lastSpeed = speed;
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {

        // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            this.listBluetoothDevices.bind(this),
            this.bluetoothIsDisabled.bind(this)
        );
    },

    bluetoothIsDisabled: function () {
        bluetoothSerial.enable(() => {
            this.listBluetoothDevices();
        }, () => {
            alert("Activate Bluetooth and restart the app!");
        })
    },

    listBluetoothDevices: function () {
        bluetoothSerial.list(
            function (results) {
                app.display("Please select a Device.");
                const select = document.getElementById("devices");
                for (let i = 0; i < results.length; i++) {
                    const el = document.createElement("option");
                    el.textContent = results[i].name;
                    el.value = results[i].address;
                    select.appendChild(el);
                }
            },
            function (error) {
                app.display(JSON.stringify(error));
            }
        );
    },

    manageConnection: function () {
        console.log("toggling connection.");
        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(this.disconnectBluetooth, this.connectBluetooth);
    },

    connectBluetooth: function () {
        app.clear();
        app.display("Attempting to connect. " +
            "Make sure the serial port is open on the target device.");
        // attempt to connect:
        app.macAddress = document.getElementById("devices").value;
        bluetoothSerial.connect(
            app.macAddress,  // device to connect to
            app.openPort,    // start listening if you succeed
            app.showError    // show the error if you fail
        );
    },

    disconnectBluetooth: function () {
        app.display("attempting to disconnect");
        // if connected, do this:
        bluetoothSerial.disconnect(
            app.closePort,     // stop listening to the port
            app.showError      // show the error if you fail
        );
    },
    /*
        subscribes to a Bluetooth serial listener for newline
        and changes the button:
    */
    openPort: function () {
        // if you get a good Bluetooth serial connection:
        app.display("Connected to: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            console.log(data);
        });

        app.intervalId = setInterval(app.sendCommands, 50);
    },

    sendCommands: function () {
        // send speed
        bluetoothSerial.write("s" + app.lastSpeed + "\0", null, () => {
            console.warn("transmit failed");
        });
        bluetoothSerial.write("a" + app.lastAngle + "\0", null, () => {
            console.warn("transmit failed");
        });
    },

    /*
    unsubscribes from any Bluetooth serial listener and changes the button:
*/
    closePort: function () {
        clearInterval(app.intervalId);
        // if you get a good Bluetooth serial connection:
        app.display("Disconnected from: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
            function (data) {
                app.display(data);
            },
            app.showError
        );
    },
    /*
        appends @error to the message div:
    */
    showError: function (error) {
        app.display(error);
    },
    /*
        appends @message to the message div:
    */
    display: function (message) {
        const display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
    /*
        clears the message div:
    */
    clear: function () {
        const display = document.getElementById("message");
        display.innerHTML = "";
    }

};

app.initialize();

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
    chars: "",
    nippleManager: {},
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        connectButton.addEventListener('touchend', app.manageConnection, false);
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
         document.getElementById('app').style.display = "none";
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
      // check to see if Bluetooth is turned on.
      // this function is called only
      //if isEnabled(), below, returns success:
      var listPorts = function() {
          // list the available BT ports:
          bluetoothSerial.list(
              function(results) {
                  app.display("Please select a Device.");
                  var select = document.getElementById("devices");
                  for(var i = 0; i < results.length; i++) {
                    var opt = results[i];
                    var el = document.createElement("option");
                    el.textContent = results[i].name;
                    el.value = results[i].address;
                    select.appendChild(el);
                  }
              },
              function(error) {
                  app.display(JSON.stringify(error));
              }
          );
      }

      // if isEnabled returns failure, this function is called:
      var notEnabled = function() {
          app.display("Bluetooth is not enabled.")
      }

       // check if Bluetooth is on:
      bluetoothSerial.isEnabled(
          listPorts,
          notEnabled
      );
  },

  manageConnection: function() {

    // connect() will get called only if isConnected() (below)
    // returns failure. In other words, if not connected, then connect:
    var connect = function () {
        // if not connected, do this:
        // clear the screen and display an attempt to connect
        app.clear();
        app.display("Attempting to connect. " +
            "Make sure the serial port is open on the target device.");
        // attempt to connect:
        bluetoothSerial.connect(
            app.macAddress,  // device to connect to
            app.openPort,    // start listening if you succeed
            app.showError    // show the error if you fail
        );
    };

    // disconnect() will get called only if isConnected() (below)
    // returns success  In other words, if  connected, then disconnect:
    var disconnect = function () {
        app.display("attempting to disconnect");
        // if connected, do this:
        bluetoothSerial.disconnect(
            app.closePort,     // stop listening to the port
            app.showError      // show the error if you fail
        );
    };

    // here's the real action of the manageConnection function:
    bluetoothSerial.isConnected(disconnect, connect);
},
/*
    subscribes to a Bluetooth serial listener for newline
    and changes the button:
*/
    openPort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Connected to: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            app.clear();
            app.display(data);
        });
    },

    /*
    unsubscribes from any Bluetooth serial listener and changes the button:
*/
    closePort: function() {
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
    showError: function(error) {
        app.display(error);
    },
    /*
        appends @message to the message div:
    */
        display: function(message) {
            var display = document.getElementById("message"), // the message div
                lineBreak = document.createElement("br"),     // a line break
                label = document.createTextNode(message);     // create the label

            display.appendChild(lineBreak);          // add a line break
            display.appendChild(label);              // add the message node
        },
    /*
        clears the message div:
    */
        clear: function() {
            var display = document.getElementById("message");
            display.innerHTML = "";
        }

};

app.initialize();

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

    nippleManager: {},
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        this.nippleManager = nipplejs.create({
            zone: document.getElementById("app"),
            color: "#000",
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
        const degree = data.angle.degree - 90;
        const speed = Math.min(data.force, 4) * 25;
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
        console.log("Winkel:" + angle + " Speed: " + speed);
        document.getElementById("joystick-debug").innerHTML = "Winkel:" + angle + " Speed: " + speed;
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        console.log("Device ready");
    },

};

app.initialize();
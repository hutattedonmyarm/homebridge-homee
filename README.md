# Homebridge-homee

homee platform plugin for homebridge: https://github.com/nfarina/homebridge

This fork adds special support for the `Danfoss Living Connect Z Thermostat` and the `Fibaro Motion Sensor`. The former doesn't provide its temperature sensor data to homee and the latter is recognized as motion sensor only, without the temperature data.

HomeKit displays 0.0°C as temperature for the Living Connect Z, so this fork reads data from temperature sensors in the same homee group as the thermostat.

It also registers the Fibaro Motion Sensor as motion *and* temperature sensor.

## Installation
Follow the instruction in [NPM](https://www.npmjs.com/package/homebridge) for the homebridge server installation. The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-homee) and should be installed "globally" by typing:

    sudo npm install -g homebridge-homee
    
Alternatively you could use [**homeean**](https://himpler.com/homeean) to install homebridge-homee (including Homebridge) on a Raspberry Pi with a plain vanilla Raspbian installation. homeean is a web based buildtool, which generates an individual buildscript (Bash-Script) for user selected Smart Home Tools to be installed on a Raspberry Pi running on Raspbian. homebridge-homee (including its dependecy Homebridge) is provided as an homeean install option.

## Configuration

config.json

Example:

    {
        "bridge": {
            "name": "Homebridge",
            "username": "CC:22:3D:E3:CE:51",
            "port": 51826,
            "pin": "031-45-154"
        },
        "description": "This is an example configuration file for the homebridge-homee plugin",
        "hint": "Always paste into jsonlint.com validation page before starting your homebridge, saves a lot of frustration",
        "platforms": [
            {
                "platform": "homee",
                "name": "homee",
                "host": "192.168.178.1",
                "user": "your-username",
                "pass": "your-password",
                "groupName": "group-name"
            }
        ]
    }

## Exclude nodes or homeegrams
This plugin integrates all (known) devices to homebridge by default. You can limit the integration to certain devices by creating a group in homee and adding all the devices you want to use with homebridge. If not explicitly specified, the name of this group defaults to 'Homebridge'. It may be changed using the optional 'groupName' statement. Devices outside this group are ignored.

### Device Limit
Homekit cannot manage more than 100 devices per bridge. If you have together more than 100 devices and homeegrams, you have to filter some of them with a group.

## Tested devices
- Danfoss Living connect Thermostat
- Devolo Door/Window Sensor
- Devolo Motion Sensor
- Devolo Heizkörperthermostate
- Devolo Smart Metering Plug
- Everspring AN180 Wall Plug
- Fibaro Door/Window Sensor
- Fibaro Double Switch
- Fibaro Flood Sensor
- Fibaro Motion Sensor
- Fibaro Roller Shutter 2 (FGR-222)
- Fibaro Smoke Sensor 2
- Fibaro Wall Plug
- Greenwave Powernode
- Philips Hue White and Color Ambiance
- Philips Hue White
- Popp Rauchwarnmelder mit Sirene
- Qubino Flush Dimmer
- Sensative Stripes

## Donate the original author of the project!
<a href="https://www.buymeacoffee.com/himpler" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

const ENUMS = require('../lib/enums.js');

let Service, Characteristic;

class MotionTemperatureAccessory {
    // Motion sensor which also includes a temperature sensor, e.g. Fibaro Eye
    constructor(name, uuid, profile, node, platform) {
        this.name = name;
        this.uuid = uuid;
        this.platform = platform
        this.homee = platform.homee
        this.log = platform.log;
        this.nodeId = node.id;
        this.profile = profile;
        this.attributes = {};
        this.services = [];

        // There has to be a more elegant way...
        for (let attribute of node.attributes) {
            switch (attribute.type) {
                case ENUMS.CAAttributeType.CAAttributeTypeTemperature:
                    this.attributes.temperature = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeTemperatureOffset:
                    this.attributes.temperatureOffset = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeBatteryLevel:
                    this.attributes.batteryLevel = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeBrightness:
                    this.attributes.brightness = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeMotionAlarm:
                    this.attributes.motionAlarm = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeMotionSensitivity:
                    this.attributes.motionSensitivity = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeMotionAlarmCancelationDelay:
                    this.attributes.motionAlarmCancelationDelay = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeTamperAlarm:
                    this.attributes.tamperAlarm = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeTamperSensitivity:
                    this.attributes.tamperSensitivity = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeTamperAlarmCancelationDelay:
                    this.attributes.tamperAlarmCancelationDelay = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeFirmwareRevision:
                    this.attributes.firmwareRevision = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeSoftwareRevision:
                    this.attributes.softwareRevision = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeWakeUpInterval:
                    this.attributes.wakeupInterval = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeBrightnessReportInterval:
                    this.attributes.brightnessReportInterval = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeTemperatureReportInterval:
                    this.attributes.temperatureReportInterval = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeMotionAlarmIndicationMode:
                    this.attributes.motionAlarmIndicationMode = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeTamperAlarmIndicationMode:
                    this.attributes.tamperAlarmIndicationMode = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeLEDBrightness:
                    this.attributes.ledBrightness = attribute;
                    break;
                default:
                    this.log.debug("Unknown attribute %s for %s", attribute.type, this.name);
                    break;
            }
        }
    }

    /**
     * update attributes value
     * @param attribute
     */
    updateValue(attribute) {
        this.log.info('Updated fibaro attribute of type %s with id %s', attribute.type, attribute.id)
        if (attribute.current_value) {
            this.log.info('Current value: %s', attribute.current_value);
        }
        // This is not strictly neccessary an just makes for prettier logs
        // The Homee API takes care of actually readign the data
        switch (attribute.type) {
            case ENUMS.CAAttributeType.CAAttributeTypeTemperature:
                    this.log.debug('Updated temperature value: %s', attribute.current_value);
                    this.temperatureService.getCharacteristic(Characteristic.CurrentTemperature)
                        .updateValue(attribute.current_value, null, 'ws');
                    //this.temperatureService.setCharacteristic(Characteristic.CurrentTemperature, temperature);
                    break;
            case ENUMS.CAAttributeType.CAAttributeTypeBatteryLevel:
                    this.log.debug('Updated battery value: %s', attribute.current_value);
                    break;
            case ENUMS.CAAttributeType.CAAttributeTypeBrightness:
                    this.log.debug('Updated brightness value: %s', attribute.current_value);
                    break;
            case ENUMS.CAAttributeType.CAAttributeTypeMotionAlarm:
                    this.log.debug('Updated motion alarm value: %s', attribute.current_value);
                    break;
            case ENUMS.CAAttributeType.CAAttributeTypeTamperAlarm:
                    this.log.debug('Updated tamper alarm value: %s', attribute.current_value);
                    break;
            case ENUMS.CAAttributeType.CAAttributeTypeFirmwareRevision:
                    this.log.debug('Updated firmware revision value: %s', attribute.current_value);
                    break;
        }
    }

    getServices() {
        this.log.debug('Getting Fibaro Motion Sensor services');

        // Basic info about the accessory
        this.informationService = new Service.AccessoryInformation();
        this.informationService.getCharacteristic(Characteristic.FirmwareRevision)
            .updateValue(this.attributes.firmwareRevision.current_value);
        this.log.debug('Firmware revision: %s', this.attributes.firmwareRevision.current_value);
        this.informationService.getCharacteristic(Characteristic.SoftwareRevision)
            .updateValue(this.attributes.softwareRevision.current_value);
        this.log.debug('Software revision: %s', this.attributes.softwareRevision.current_value);
        this.services.push(this.informationService);

        // Motion data
        this.motionService = new Service.MotionSensor("Motion Sensor");
        this.motionService.getCharacteristic(Characteristic.MotionDetected)
            .updateValue(this.attributes.motionAlarm.current_value);
        this.log.debug('MotionAlarm: %s', this.attributes.motionAlarm.current_value);
        this.motionService.getCharacteristic(Characteristic.StatusTampered)
            .updateValue(this.attributes.tamperAlarm.current_value);
        this.log.debug('TamperAlarm: %s', this.attributes.motionAlarm.current_value);
        this.motionService.getCharacteristic(Characteristic.StatusTampered)
            .updateValue(this.attributes.tamperAlarm.current_value);
        this.log.debug('Motion Alarm Cancelation Delay: %s', this.attributes.motionAlarmCancelationDelay.current_value);
        this.services.push(this.motionService);

        // Temperature sensor
        this.temperatureService = new Service.TemperatureSensor("Temperatur Fenster");
        this.temperatureService.getCharacteristic(Characteristic.CurrentTemperature)
            .updateValue(this.attributes.temperature.current_value);
        this.log.debug('Temperature: %s', this.attributes.temperature.current_value);
        this.temperatureService.getCharacteristic(Characteristic.Brightness)
            .updateValue(this.attributes.brightness.current_value);
        this.log.debug('Brightness: %s', this.attributes.brightness.current_value);
        this.services.push(this.temperatureService);

        // Battery status
        this.batteryService = new Service.BatteryService("Bewegungsmelder Batteriestatus");
        this.batteryService.getCharacteristic(Characteristic.BatteryLevel)
            .updateValue(this.attributes.batteryLevel.current_value);
        this.services.push(this.batteryService);
        this.log.debug('Battery: %s', this.attributes.batteryLevel.current_value);

       return this.services;
    };
}

module.exports = function(oService, oCharacteristic) {
   Service = oService;
   Characteristic = oCharacteristic;

   return MotionTemperatureAccessory;
};

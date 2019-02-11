const ENUMS = require('../lib/enums.js');

let Service, Characteristic;

class ThermostatWithoutTemperature {
    // Thermostat accessory which doesn't have its own temperature sensor or doesn't provide the sensor data to homee
    // Example is the Danfoss Living Connect Z
    // Read current temperature from sensors in the same group
    constructor(name, uuid, profile, node, platform) {
        this.name = name;
        this.uuid = uuid;
        this.platform = platform;
        this.homee = platform.homee;
        this.log = platform.log;
        this.nodeId = node.id;
        this.profile = profile;
        this.attributes = {};
        this.services = [];
        this.tempNodes = [];

        // Find all groups this thermostat is part of
        const groups = this.homee._relationships.filter(r => r.node_id == this.nodeId).map(g => g.group_id);
        // Find accessories which have a temperature sensor in the groups
        for (const g of groups) {
            const nodesInGroup = this.homee.getNodesByGroup(g);
            this.tempNodes = this.tempNodes.concat(nodesInGroup.filter(n => n.attributes.filter(a => a.type == ENUMS.CAAttributeType.CAAttributeTypeTemperature).length > 0));
        }

        // Calculates the average of all temperature sensors
        const average = arr => arr.reduce( ( p, c ) => {
            this.log.debug("Temp sensor in group: %s", c.attributes.filter(a => a.type == ENUMS.CAAttributeType.CAAttributeTypeTemperature)[0].current_value);
            return p + c.attributes.filter(a => a.type == ENUMS.CAAttributeType.CAAttributeTypeTemperature)[0].current_value;
        }, 0 ) / arr.length;

        if (!this.tempNodes.length) {
            this.log.warn('%s does not have a temperature sensor included, and isn\'t in the same group as one.', this.name);
            this.attributes.temperature = {};
            this.attributes.temperature.current_value = 0.0;
        } else {            
            const result = average(this.tempNodes);
            this.log.debug("Average temp: %s", result);
            // Clone the basic info of the first found temperature sensor
            this.attributes.temperature = this.tempNodes[0].attributes.filter(a => a.type == ENUMS.CAAttributeType.CAAttributeTypeTemperature)[0];
            // Update its values with average
            this.attributes.temperature.current_value = result;
        }

        // Add the other attributes
        for (let attribute of node.attributes) {
            switch (attribute.type) {
                case ENUMS.CAAttributeType.CAAttributeTypeTargetTemperature:
                    this.attributes.targetTemperature = attribute;
                    break;
                case ENUMS.CAAttributeType.CAAttributeTypeBatteryLevel:
                    this.attributes.batteryLevel = attribute;
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
                case ENUMS.CAAttributeType.CAAttributeTypeManualOperation:
                    this.attributes.manualOperation = attribute;
                    break;
                default:
                    this.log.debug("[%s] Unknown attribute %s", this.name, attribute.type);
                    break;
            }
        }
    }

    /**
     * update attributes value
     * @param attribute
     */
    updateValue(attribute) {
        this.log.info('Updated thermostat attribute of type %s with id %s', attribute.type, attribute.id)
        if (attribute.type == ENUMS.CAAttributeType.CAAttributeTypeTemperature) {
            const average = arr => arr.reduce( ( p, c ) => {
                this.log.debug("Temp sensor in group: %s", c.attributes.filter(a => a.type == ENUMS.CAAttributeType.CAAttributeTypeTemperature)[0].current_value);
                return p + c.attributes.filter(a => a.type == ENUMS.CAAttributeType.CAAttributeTypeTemperature)[0].current_value;
            }, 0 ) / arr.length;

            if (!this.tempNodes.length) {
                this.log.warn('%s does not have a temperature sensor included, and isn\'t in the same group as one.', this.name);
                this.attributes.temperature = {};
                this.attributes.temperature.current_value = 0.0;
            } else {
                const result = average(this.tempNodes);
                this.log.debug("Average temp: %s", result);
                this.attributes.temperature = this.tempNodes[0].attributes.filter(a => a.type == ENUMS.CAAttributeType.CAAttributeTypeTemperature)[0];
                this.attributes.temperature.current_value = result;
            }
        }
        if (attribute.current_value) {
            this.log.info('Current value: %s', attribute.current_value);
        }
    }

    getServices() {
        this.log.info('If you want you can adjust the names of the services displayed in the Home app here');
        this.log.debug('Getting services for thermostat without temperature');
        
        // Basic accessory information (firmware and software revision)
        this.informationService = new Service.AccessoryInformation();
        this.informationService.getCharacteristic(Characteristic.FirmwareRevision)
            .updateValue(this.attributes.firmwareRevision.current_value);
        this.log.debug('Firmware revision: %s', this.attributes.firmwareRevision.current_value);
        this.informationService.getCharacteristic(Characteristic.SoftwareRevision)
            .updateValue(this.attributes.softwareRevision.current_value);
        this.log.debug('Software revision: %s', this.attributes.softwareRevision.current_value);
        this.services.push(this.informationService);

        // Thermostat service  (current, target temp, and target temp unit)
        this.thermostatService = new Service.Thermostat("Heizung");
        this.thermostatService.getCharacteristic(Characteristic.CurrentTemperature)
            .updateValue(this.attributes.temperature.current_value);
        this.log.debug('Current Temperature: %s', this.attributes.temperature.current_value);
        this.thermostatService.getCharacteristic(Characteristic.TargetTemperature)
            .updateValue(this.attributes.targetTemperature.current_value);
        this.log.debug('Target Temperature: %s', this.attributes.targetTemperature.current_value);
        const isFahrenheit = decodeURIComponent(this.attributes.targetTemperature.unit) === '°F' || this.attributes.targetTemperature.unit.toLowerCase().endsWith('f')
        this.thermostatService.getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .updateValue(isFahrenheit ? Characteristic.TemperatureDisplayUnits.FAHRENHEIT : Characteristic.TemperatureDisplayUnits.CELSIUS);
        this.log.debug('Target temp unit: %s', isFahrenheit ? Characteristic.TemperatureDisplayUnits.FAHRENHEIT : Characteristic.TemperatureDisplayUnits.CELSIUS);
        this.services.push(this.thermostatService);

        // Battery service (battery status)
        this.batteryService = new Service.BatteryService("Thermostat Batteriestatus");
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

   return ThermostatWithoutTemperature;
};

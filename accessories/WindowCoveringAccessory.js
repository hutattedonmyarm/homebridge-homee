const ENUMS = require('../lib/enums.js');

function WindowCoveringAccessory(name, uuid, profile, node, platform) {
    this.name = name;
    this.uuid = uuid;
    this.platform = platform
    this.log = platform.log;
    this.nodeId = node.id;
    this.profile = profile;
    this.attributes = {};
    this.positions = [2,2,2,0,1];

    for (let i=0; i<node.attributes.length; i++) {
        switch (node.attributes[i].type) {
            case ENUMS.CAAttributeType.CAAttributeTypePosition:
                this.attributes.position = node.attributes[i];
                break;
            case ENUMS.CAAttributeType.CAAttributeTypeUpDown:
                this.attributes.upDown = node.attributes[i];
                break;
            case ENUMS.CAAttributeTypeShutterOrientation:
                //this.positions = attribute.current_value ? [2,2,2,0,1] : [2,2,2,1,0];
                break;
        }
    }
}

WindowCoveringAccessory.prototype.updateValue = function (attribute) {
    switch (attribute.type) {
        case ENUMS.CAAttributeType.CAAttributeTypePosition:
            this.attributes.position = attribute;
            this.service.getCharacteristic(Characteristic.CurrentPosition)
                .updateValue(attribute.current_value, null, 'ws');
            if (this.platform.debug) this.log(this.name + ': CurrentPosition:' + attribute.current_value);
            this.service.getCharacteristic(Characteristic.TargetPosition)
                .updateValue(attribute.target_value, null, 'ws');
            if (this.platform.debug) this.log(this.name + ': TargetPosition:' + attribute.target_value);
            break;
        case ENUMS.CAAttributeType.CAAttributeTypeUpDown:
            this.attributes.upDown = attribute;
            this.service.getCharacteristic(Characteristic.PositionState)
                .updateValue(this.positions[this.attributes.upDown.current_value], null, 'ws');
            if (this.platform.debug) this.log(this.name + ': PositionState:' + attribute.current_value);
            break;
    }
}

WindowCoveringAccessory.prototype.setTargetPosition = function (value, callback, context) {
    if (context && context == 'ws') {
        callback(null, value);
        return;
    }

    if (this.platform.debug) this.log('Setting ' + this.name + ' to ' + value);
    this.platform.homee.send(
        'PUT:/nodes/' + this.nodeId + '/attributes/' + this.attributes.position.id + '?target_value=' + value
    );

    callback(null, value);
}

WindowCoveringAccessory.prototype.setPositionState = function (value, callback, context) {
    if (context && context == 'ws') {
        callback(null, value);
        return;
    }

    newValue = [1,0,2][value];

    if (this.platform.debug) this.log('Setting ' + this.name + ' to ' + newValue);
    this.platform.homee.send(
        'PUT:/nodes/' + this.nodeId + '/attributes/' + this.attributes.upDown.id + '?target_value=' + newValue
    );

    callback(null, value);
}

WindowCoveringAccessory.prototype.getServices = function () {
    let informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Manufacturer, "Homee")
        .setCharacteristic(Characteristic.Model, "WindowCovering")
        .setCharacteristic(Characteristic.SerialNumber, "");

    this.service = new Service.WindowCovering(this.name);

    this.service.getCharacteristic(Characteristic.CurrentPosition)
        .updateValue(this.attributes.position.current_value);

    this.service.getCharacteristic(Characteristic.TargetPosition)
        .updateValue(this.attributes.position.target_value)
        .on('set', this.setTargetPosition.bind(this));

    this.service.getCharacteristic(Characteristic.PositionState)
        .updateValue(this.positions[this.attributes.upDown.current_value])
        .on('set', this.setPositionState.bind(this));

    return [informationService, this.service];
};

module.exports = function(oService, oCharacteristic) {
    Service = oService;
    Characteristic = oCharacteristic;

    return WindowCoveringAccessory;
};

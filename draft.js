function EventEmitter() {}

function State() {}

var LT_VERSION = '0.0.1';
var CURRENT_CONFIG = null;

State.prototype.handle = function () {
  'use strict';
  throw new Error('Not implemented');
};

State.prototype.close = function () {
  'use strict';
  this._socket.disconnect();
};

State.prototype.setClient = function (client) {
  'use strict';
  this._client = client;
};

State.prototype.trigger = function (evnt, data) {
  'use strict';
  this._client.trigger(evnt, [data]);
};


function DisconnectedState() {
  'use strict';
  State.call(this);
}

DisconnectedState.prototype = Object.create(State.prototype);

function PageUpdateState() {
  'use strict';
  State.call(this);
}

PageUpdateState.prototype = Object.create(State.prototype);


function HandshakeState() {
  'use strict';
  State.call(this);
}

HandshakeState.prototype = Object.create(State.prototype);

HandshakeState.prototype.handle = function () {
  'use strict';
  this._socket.emit('lt.handshake-version', LT_VERSION)
    .then(function (data) {
      if (this._compareVersions(data, LT_VERSION) >= 0) {
        this._exchangeConfig(CURRENT_CONFIG);
      } else {
        throw new Error('Version not supported');
      }
    }.bind(this));
};

HandshakeState.prototype._exchangeConfig = function (config) {
  'use strict';
  this._socket.emit('lt.handshake-config', config)
    .then(function (data) {
      this.getClient().setConfig(data);
      this.getClient().setState(new PageUpdateState());
    }.bind(this));
};


function Client() {
  'use strict';
  this._state = new DisconnectedState();
  EventEmitter.call(this);
}

Client.prototype = Object.create(EventEmitter.prototype);

Client.prototype.setState = function (state) {
  'use strict';
  this._state = state;
  state.setClient(this);
  this._state.handle();
};

Client.prototype.getState = function () {
  'use strict';
  return this._state;
};


Client.prototype.connect = function (socket) {
  'use strict';
  this.setState(new HandshakeState(socket));
};

Client.prototype.disconnect = function () {
  'use strict';
  this.getState().close();
};

Client.prototype.setConfig = function (config) {
  'use strict';
  this._config = config;
};

Client.prototype.getConfig = function () {
  'use strict';
  return this._config;
};

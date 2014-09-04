function EventEmitter() {}

function State() {}

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


function HandshakeState() {
  'use strict';
  State.call(this);
}

HandshakeState.prototype = Object.create(State.prototype);


function PageUpdateState() {
  'use strict';
  State.call(this);
}

PageUpdateState.prototype = Object.create(State.prototype);

//-handle
//-close


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

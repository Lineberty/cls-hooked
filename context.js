'use strict';

var util = require('util');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

var namespaces = process.namespaces = Object.create(null);

function Context(namespace) {
  assert.ok(namespace, "Context must be associated with namespace!");
  EventEmitter.call(this);
  this.namespace = namespace;
  this.bag = Object.create(null);
}
util.inherits(Context, EventEmitter);

Context.prototype.enter = function () { this.namespace.active = this; };
Context.prototype.exit = function () { delete this.namespace.active; };
// TODO: Context.prototype.bind = function () {};
// TODO: Context.prototype.add = function () {};
Context.prototype.end = function () { this.emit('end'); };
Context.prototype.set = function (key, value) { this.bag[key] = value; };
Context.prototype.get = function (key) { return this.bag[key]; };
Context.prototype.run = function (callback) {
  this.enter();
  callback.call(this);
  this.exit();
  this.end();
};

function Namespace (name) {
  assert.ok(name, "Namespace must be given a name!");
  this.name = name;
  namespaces[name] = this;
}

// "class" method
Namespace.get = function (name) { return namespaces[name]; };

Namespace.prototype.createContext = function (name) {
  return new Context(this);
};

module.exports = {
  createNamespace : function (name) { return new Namespace(name); },
  getNamespace : function (name) { return Namespace.get(name); }
};

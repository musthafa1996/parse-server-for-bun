"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParsePubSub = void 0;
var _AdapterLoader = require("../Adapters/AdapterLoader");
var _EventEmitterPubSub = require("../Adapters/PubSub/EventEmitterPubSub");
var _RedisPubSub = require("../Adapters/PubSub/RedisPubSub");
const ParsePubSub = {};
exports.ParsePubSub = ParsePubSub;
function useRedis(config) {
  const redisURL = config.redisURL;
  return typeof redisURL !== 'undefined' && redisURL !== '';
}
ParsePubSub.createPublisher = function (config) {
  if (useRedis(config)) {
    return _RedisPubSub.RedisPubSub.createPublisher(config);
  } else {
    const adapter = (0, _AdapterLoader.loadAdapter)(config.pubSubAdapter, _EventEmitterPubSub.EventEmitterPubSub, config);
    if (typeof adapter.createPublisher !== 'function') {
      throw 'pubSubAdapter should have createPublisher()';
    }
    return adapter.createPublisher(config);
  }
};
ParsePubSub.createSubscriber = function (config) {
  if (useRedis(config)) {
    return _RedisPubSub.RedisPubSub.createSubscriber(config);
  } else {
    const adapter = (0, _AdapterLoader.loadAdapter)(config.pubSubAdapter, _EventEmitterPubSub.EventEmitterPubSub, config);
    if (typeof adapter.createSubscriber !== 'function') {
      throw 'pubSubAdapter should have createSubscriber()';
    }
    return adapter.createSubscriber(config);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXJzZVB1YlN1YiIsInVzZVJlZGlzIiwiY29uZmlnIiwicmVkaXNVUkwiLCJjcmVhdGVQdWJsaXNoZXIiLCJSZWRpc1B1YlN1YiIsImFkYXB0ZXIiLCJsb2FkQWRhcHRlciIsInB1YlN1YkFkYXB0ZXIiLCJFdmVudEVtaXR0ZXJQdWJTdWIiLCJjcmVhdGVTdWJzY3JpYmVyIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL0xpdmVRdWVyeS9QYXJzZVB1YlN1Yi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2FkQWRhcHRlciB9IGZyb20gJy4uL0FkYXB0ZXJzL0FkYXB0ZXJMb2FkZXInO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyUHViU3ViIH0gZnJvbSAnLi4vQWRhcHRlcnMvUHViU3ViL0V2ZW50RW1pdHRlclB1YlN1Yic7XG5cbmltcG9ydCB7IFJlZGlzUHViU3ViIH0gZnJvbSAnLi4vQWRhcHRlcnMvUHViU3ViL1JlZGlzUHViU3ViJztcblxuY29uc3QgUGFyc2VQdWJTdWIgPSB7fTtcblxuZnVuY3Rpb24gdXNlUmVkaXMoY29uZmlnOiBhbnkpOiBib29sZWFuIHtcbiAgY29uc3QgcmVkaXNVUkwgPSBjb25maWcucmVkaXNVUkw7XG4gIHJldHVybiB0eXBlb2YgcmVkaXNVUkwgIT09ICd1bmRlZmluZWQnICYmIHJlZGlzVVJMICE9PSAnJztcbn1cblxuUGFyc2VQdWJTdWIuY3JlYXRlUHVibGlzaGVyID0gZnVuY3Rpb24gKGNvbmZpZzogYW55KTogYW55IHtcbiAgaWYgKHVzZVJlZGlzKGNvbmZpZykpIHtcbiAgICByZXR1cm4gUmVkaXNQdWJTdWIuY3JlYXRlUHVibGlzaGVyKGNvbmZpZyk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgYWRhcHRlciA9IGxvYWRBZGFwdGVyKGNvbmZpZy5wdWJTdWJBZGFwdGVyLCBFdmVudEVtaXR0ZXJQdWJTdWIsIGNvbmZpZyk7XG4gICAgaWYgKHR5cGVvZiBhZGFwdGVyLmNyZWF0ZVB1Ymxpc2hlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgJ3B1YlN1YkFkYXB0ZXIgc2hvdWxkIGhhdmUgY3JlYXRlUHVibGlzaGVyKCknO1xuICAgIH1cbiAgICByZXR1cm4gYWRhcHRlci5jcmVhdGVQdWJsaXNoZXIoY29uZmlnKTtcbiAgfVxufTtcblxuUGFyc2VQdWJTdWIuY3JlYXRlU3Vic2NyaWJlciA9IGZ1bmN0aW9uIChjb25maWc6IGFueSk6IHZvaWQge1xuICBpZiAodXNlUmVkaXMoY29uZmlnKSkge1xuICAgIHJldHVybiBSZWRpc1B1YlN1Yi5jcmVhdGVTdWJzY3JpYmVyKGNvbmZpZyk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgYWRhcHRlciA9IGxvYWRBZGFwdGVyKGNvbmZpZy5wdWJTdWJBZGFwdGVyLCBFdmVudEVtaXR0ZXJQdWJTdWIsIGNvbmZpZyk7XG4gICAgaWYgKHR5cGVvZiBhZGFwdGVyLmNyZWF0ZVN1YnNjcmliZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93ICdwdWJTdWJBZGFwdGVyIHNob3VsZCBoYXZlIGNyZWF0ZVN1YnNjcmliZXIoKSc7XG4gICAgfVxuICAgIHJldHVybiBhZGFwdGVyLmNyZWF0ZVN1YnNjcmliZXIoY29uZmlnKTtcbiAgfVxufTtcblxuZXhwb3J0IHsgUGFyc2VQdWJTdWIgfTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUVBO0FBRUEsTUFBTUEsV0FBVyxHQUFHLENBQUMsQ0FBQztBQUFDO0FBRXZCLFNBQVNDLFFBQVEsQ0FBQ0MsTUFBVyxFQUFXO0VBQ3RDLE1BQU1DLFFBQVEsR0FBR0QsTUFBTSxDQUFDQyxRQUFRO0VBQ2hDLE9BQU8sT0FBT0EsUUFBUSxLQUFLLFdBQVcsSUFBSUEsUUFBUSxLQUFLLEVBQUU7QUFDM0Q7QUFFQUgsV0FBVyxDQUFDSSxlQUFlLEdBQUcsVUFBVUYsTUFBVyxFQUFPO0VBQ3hELElBQUlELFFBQVEsQ0FBQ0MsTUFBTSxDQUFDLEVBQUU7SUFDcEIsT0FBT0csd0JBQVcsQ0FBQ0QsZUFBZSxDQUFDRixNQUFNLENBQUM7RUFDNUMsQ0FBQyxNQUFNO0lBQ0wsTUFBTUksT0FBTyxHQUFHLElBQUFDLDBCQUFXLEVBQUNMLE1BQU0sQ0FBQ00sYUFBYSxFQUFFQyxzQ0FBa0IsRUFBRVAsTUFBTSxDQUFDO0lBQzdFLElBQUksT0FBT0ksT0FBTyxDQUFDRixlQUFlLEtBQUssVUFBVSxFQUFFO01BQ2pELE1BQU0sNkNBQTZDO0lBQ3JEO0lBQ0EsT0FBT0UsT0FBTyxDQUFDRixlQUFlLENBQUNGLE1BQU0sQ0FBQztFQUN4QztBQUNGLENBQUM7QUFFREYsV0FBVyxDQUFDVSxnQkFBZ0IsR0FBRyxVQUFVUixNQUFXLEVBQVE7RUFDMUQsSUFBSUQsUUFBUSxDQUFDQyxNQUFNLENBQUMsRUFBRTtJQUNwQixPQUFPRyx3QkFBVyxDQUFDSyxnQkFBZ0IsQ0FBQ1IsTUFBTSxDQUFDO0VBQzdDLENBQUMsTUFBTTtJQUNMLE1BQU1JLE9BQU8sR0FBRyxJQUFBQywwQkFBVyxFQUFDTCxNQUFNLENBQUNNLGFBQWEsRUFBRUMsc0NBQWtCLEVBQUVQLE1BQU0sQ0FBQztJQUM3RSxJQUFJLE9BQU9JLE9BQU8sQ0FBQ0ksZ0JBQWdCLEtBQUssVUFBVSxFQUFFO01BQ2xELE1BQU0sOENBQThDO0lBQ3REO0lBQ0EsT0FBT0osT0FBTyxDQUFDSSxnQkFBZ0IsQ0FBQ1IsTUFBTSxDQUFDO0VBQ3pDO0FBQ0YsQ0FBQyJ9
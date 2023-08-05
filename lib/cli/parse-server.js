"use strict";

var _index = _interopRequireDefault(require("../index"));
var _parseServer = _interopRequireDefault(require("./definitions/parse-server"));
var _cluster = _interopRequireDefault(require("cluster"));
var _os = _interopRequireDefault(require("os"));
var _runner = _interopRequireDefault(require("./utils/runner"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* eslint-disable no-console */

const help = function () {
  console.log('  Get Started guide:');
  console.log('');
  console.log('    Please have a look at the get started guide!');
  console.log('    http://docs.parseplatform.org/parse-server/guide/');
  console.log('');
  console.log('');
  console.log('  Usage with npm start');
  console.log('');
  console.log('    $ npm start -- path/to/config.json');
  console.log('    $ npm start -- --appId APP_ID --masterKey MASTER_KEY --serverURL serverURL');
  console.log('    $ npm start -- --appId APP_ID --masterKey MASTER_KEY --serverURL serverURL');
  console.log('');
  console.log('');
  console.log('  Usage:');
  console.log('');
  console.log('    $ parse-server path/to/config.json');
  console.log('    $ parse-server -- --appId APP_ID --masterKey MASTER_KEY --serverURL serverURL');
  console.log('    $ parse-server -- --appId APP_ID --masterKey MASTER_KEY --serverURL serverURL');
  console.log('');
};
(0, _runner.default)({
  definitions: _parseServer.default,
  help,
  usage: '[options] <path/to/configuration.json>',
  start: function (program, options, logOptions) {
    if (!options.appId || !options.masterKey) {
      program.outputHelp();
      console.error('');
      console.error('\u001b[31mERROR: appId and masterKey are required\u001b[0m');
      console.error('');
      process.exit(1);
    }
    if (options['liveQuery.classNames']) {
      options.liveQuery = options.liveQuery || {};
      options.liveQuery.classNames = options['liveQuery.classNames'];
      delete options['liveQuery.classNames'];
    }
    if (options['liveQuery.redisURL']) {
      options.liveQuery = options.liveQuery || {};
      options.liveQuery.redisURL = options['liveQuery.redisURL'];
      delete options['liveQuery.redisURL'];
    }
    if (options['liveQuery.redisOptions']) {
      options.liveQuery = options.liveQuery || {};
      options.liveQuery.redisOptions = options['liveQuery.redisOptions'];
      delete options['liveQuery.redisOptions'];
    }
    if (options.cluster) {
      const numCPUs = typeof options.cluster === 'number' ? options.cluster : _os.default.cpus().length;
      if (_cluster.default.isMaster) {
        logOptions();
        for (let i = 0; i < numCPUs; i++) {
          _cluster.default.fork();
        }
        _cluster.default.on('exit', (worker, code) => {
          console.log(`worker ${worker.process.pid} died (${code})... Restarting`);
          _cluster.default.fork();
        });
      } else {
        _index.default.startApp(options).then(() => {
          printSuccessMessage();
        }).catch(e => {
          console.error(e);
          process.exit(1);
        });
      }
    } else {
      _index.default.startApp(options).then(() => {
        logOptions();
        console.log('');
        printSuccessMessage();
      }).catch(e => {
        console.error(e);
        process.exit(1);
      });
    }
    function printSuccessMessage() {
      console.log('[' + process.pid + '] parse-server running on ' + options.serverURL);
      if (options.mountGraphQL) {
        console.log('[' + process.pid + '] GraphQL running on http://localhost:' + options.port + options.graphQLPath);
      }
      if (options.mountPlayground) {
        console.log('[' + process.pid + '] Playground running on http://localhost:' + options.port + options.playgroundPath);
      }
    }
  }
});

/* eslint-enable no-console */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJoZWxwIiwiY29uc29sZSIsImxvZyIsInJ1bm5lciIsImRlZmluaXRpb25zIiwidXNhZ2UiLCJzdGFydCIsInByb2dyYW0iLCJvcHRpb25zIiwibG9nT3B0aW9ucyIsImFwcElkIiwibWFzdGVyS2V5Iiwib3V0cHV0SGVscCIsImVycm9yIiwicHJvY2VzcyIsImV4aXQiLCJsaXZlUXVlcnkiLCJjbGFzc05hbWVzIiwicmVkaXNVUkwiLCJyZWRpc09wdGlvbnMiLCJjbHVzdGVyIiwibnVtQ1BVcyIsIm9zIiwiY3B1cyIsImxlbmd0aCIsImlzTWFzdGVyIiwiaSIsImZvcmsiLCJvbiIsIndvcmtlciIsImNvZGUiLCJwaWQiLCJQYXJzZVNlcnZlciIsInN0YXJ0QXBwIiwidGhlbiIsInByaW50U3VjY2Vzc01lc3NhZ2UiLCJjYXRjaCIsImUiLCJzZXJ2ZXJVUkwiLCJtb3VudEdyYXBoUUwiLCJwb3J0IiwiZ3JhcGhRTFBhdGgiLCJtb3VudFBsYXlncm91bmQiLCJwbGF5Z3JvdW5kUGF0aCJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvcGFyc2Utc2VydmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbmltcG9ydCBQYXJzZVNlcnZlciBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgZGVmaW5pdGlvbnMgZnJvbSAnLi9kZWZpbml0aW9ucy9wYXJzZS1zZXJ2ZXInO1xuaW1wb3J0IGNsdXN0ZXIgZnJvbSAnY2x1c3Rlcic7XG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHJ1bm5lciBmcm9tICcuL3V0aWxzL3J1bm5lcic7XG5cbmNvbnN0IGhlbHAgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKCcgIEdldCBTdGFydGVkIGd1aWRlOicpO1xuICBjb25zb2xlLmxvZygnJyk7XG4gIGNvbnNvbGUubG9nKCcgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0IHRoZSBnZXQgc3RhcnRlZCBndWlkZSEnKTtcbiAgY29uc29sZS5sb2coJyAgICBodHRwOi8vZG9jcy5wYXJzZXBsYXRmb3JtLm9yZy9wYXJzZS1zZXJ2ZXIvZ3VpZGUvJyk7XG4gIGNvbnNvbGUubG9nKCcnKTtcbiAgY29uc29sZS5sb2coJycpO1xuICBjb25zb2xlLmxvZygnICBVc2FnZSB3aXRoIG5wbSBzdGFydCcpO1xuICBjb25zb2xlLmxvZygnJyk7XG4gIGNvbnNvbGUubG9nKCcgICAgJCBucG0gc3RhcnQgLS0gcGF0aC90by9jb25maWcuanNvbicpO1xuICBjb25zb2xlLmxvZygnICAgICQgbnBtIHN0YXJ0IC0tIC0tYXBwSWQgQVBQX0lEIC0tbWFzdGVyS2V5IE1BU1RFUl9LRVkgLS1zZXJ2ZXJVUkwgc2VydmVyVVJMJyk7XG4gIGNvbnNvbGUubG9nKCcgICAgJCBucG0gc3RhcnQgLS0gLS1hcHBJZCBBUFBfSUQgLS1tYXN0ZXJLZXkgTUFTVEVSX0tFWSAtLXNlcnZlclVSTCBzZXJ2ZXJVUkwnKTtcbiAgY29uc29sZS5sb2coJycpO1xuICBjb25zb2xlLmxvZygnJyk7XG4gIGNvbnNvbGUubG9nKCcgIFVzYWdlOicpO1xuICBjb25zb2xlLmxvZygnJyk7XG4gIGNvbnNvbGUubG9nKCcgICAgJCBwYXJzZS1zZXJ2ZXIgcGF0aC90by9jb25maWcuanNvbicpO1xuICBjb25zb2xlLmxvZygnICAgICQgcGFyc2Utc2VydmVyIC0tIC0tYXBwSWQgQVBQX0lEIC0tbWFzdGVyS2V5IE1BU1RFUl9LRVkgLS1zZXJ2ZXJVUkwgc2VydmVyVVJMJyk7XG4gIGNvbnNvbGUubG9nKCcgICAgJCBwYXJzZS1zZXJ2ZXIgLS0gLS1hcHBJZCBBUFBfSUQgLS1tYXN0ZXJLZXkgTUFTVEVSX0tFWSAtLXNlcnZlclVSTCBzZXJ2ZXJVUkwnKTtcbiAgY29uc29sZS5sb2coJycpO1xufTtcblxucnVubmVyKHtcbiAgZGVmaW5pdGlvbnMsXG4gIGhlbHAsXG4gIHVzYWdlOiAnW29wdGlvbnNdIDxwYXRoL3RvL2NvbmZpZ3VyYXRpb24uanNvbj4nLFxuICBzdGFydDogZnVuY3Rpb24gKHByb2dyYW0sIG9wdGlvbnMsIGxvZ09wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMuYXBwSWQgfHwgIW9wdGlvbnMubWFzdGVyS2V5KSB7XG4gICAgICBwcm9ncmFtLm91dHB1dEhlbHAoKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJycpO1xuICAgICAgY29uc29sZS5lcnJvcignXFx1MDAxYlszMW1FUlJPUjogYXBwSWQgYW5kIG1hc3RlcktleSBhcmUgcmVxdWlyZWRcXHUwMDFiWzBtJyk7XG4gICAgICBjb25zb2xlLmVycm9yKCcnKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9uc1snbGl2ZVF1ZXJ5LmNsYXNzTmFtZXMnXSkge1xuICAgICAgb3B0aW9ucy5saXZlUXVlcnkgPSBvcHRpb25zLmxpdmVRdWVyeSB8fCB7fTtcbiAgICAgIG9wdGlvbnMubGl2ZVF1ZXJ5LmNsYXNzTmFtZXMgPSBvcHRpb25zWydsaXZlUXVlcnkuY2xhc3NOYW1lcyddO1xuICAgICAgZGVsZXRlIG9wdGlvbnNbJ2xpdmVRdWVyeS5jbGFzc05hbWVzJ107XG4gICAgfVxuICAgIGlmIChvcHRpb25zWydsaXZlUXVlcnkucmVkaXNVUkwnXSkge1xuICAgICAgb3B0aW9ucy5saXZlUXVlcnkgPSBvcHRpb25zLmxpdmVRdWVyeSB8fCB7fTtcbiAgICAgIG9wdGlvbnMubGl2ZVF1ZXJ5LnJlZGlzVVJMID0gb3B0aW9uc1snbGl2ZVF1ZXJ5LnJlZGlzVVJMJ107XG4gICAgICBkZWxldGUgb3B0aW9uc1snbGl2ZVF1ZXJ5LnJlZGlzVVJMJ107XG4gICAgfVxuICAgIGlmIChvcHRpb25zWydsaXZlUXVlcnkucmVkaXNPcHRpb25zJ10pIHtcbiAgICAgIG9wdGlvbnMubGl2ZVF1ZXJ5ID0gb3B0aW9ucy5saXZlUXVlcnkgfHwge307XG4gICAgICBvcHRpb25zLmxpdmVRdWVyeS5yZWRpc09wdGlvbnMgPSBvcHRpb25zWydsaXZlUXVlcnkucmVkaXNPcHRpb25zJ107XG4gICAgICBkZWxldGUgb3B0aW9uc1snbGl2ZVF1ZXJ5LnJlZGlzT3B0aW9ucyddO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmNsdXN0ZXIpIHtcbiAgICAgIGNvbnN0IG51bUNQVXMgPSB0eXBlb2Ygb3B0aW9ucy5jbHVzdGVyID09PSAnbnVtYmVyJyA/IG9wdGlvbnMuY2x1c3RlciA6IG9zLmNwdXMoKS5sZW5ndGg7XG4gICAgICBpZiAoY2x1c3Rlci5pc01hc3Rlcikge1xuICAgICAgICBsb2dPcHRpb25zKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ1BVczsgaSsrKSB7XG4gICAgICAgICAgY2x1c3Rlci5mb3JrKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2x1c3Rlci5vbignZXhpdCcsICh3b3JrZXIsIGNvZGUpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgd29ya2VyICR7d29ya2VyLnByb2Nlc3MucGlkfSBkaWVkICgke2NvZGV9KS4uLiBSZXN0YXJ0aW5nYCk7XG4gICAgICAgICAgY2x1c3Rlci5mb3JrKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgUGFyc2VTZXJ2ZXIuc3RhcnRBcHAob3B0aW9ucylcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBwcmludFN1Y2Nlc3NNZXNzYWdlKCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBQYXJzZVNlcnZlci5zdGFydEFwcChvcHRpb25zKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgbG9nT3B0aW9ucygpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICBwcmludFN1Y2Nlc3NNZXNzYWdlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRTdWNjZXNzTWVzc2FnZSgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbJyArIHByb2Nlc3MucGlkICsgJ10gcGFyc2Utc2VydmVyIHJ1bm5pbmcgb24gJyArIG9wdGlvbnMuc2VydmVyVVJMKTtcbiAgICAgIGlmIChvcHRpb25zLm1vdW50R3JhcGhRTCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAnWycgK1xuICAgICAgICAgICAgcHJvY2Vzcy5waWQgK1xuICAgICAgICAgICAgJ10gR3JhcGhRTCBydW5uaW5nIG9uIGh0dHA6Ly9sb2NhbGhvc3Q6JyArXG4gICAgICAgICAgICBvcHRpb25zLnBvcnQgK1xuICAgICAgICAgICAgb3B0aW9ucy5ncmFwaFFMUGF0aFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMubW91bnRQbGF5Z3JvdW5kKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICdbJyArXG4gICAgICAgICAgICBwcm9jZXNzLnBpZCArXG4gICAgICAgICAgICAnXSBQbGF5Z3JvdW5kIHJ1bm5pbmcgb24gaHR0cDovL2xvY2FsaG9zdDonICtcbiAgICAgICAgICAgIG9wdGlvbnMucG9ydCArXG4gICAgICAgICAgICBvcHRpb25zLnBsYXlncm91bmRQYXRoXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9LFxufSk7XG5cbi8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuIl0sIm1hcHBpbmdzIjoiOztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBb0M7QUFMcEM7O0FBT0EsTUFBTUEsSUFBSSxHQUFHLFlBQVk7RUFDdkJDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLHNCQUFzQixDQUFDO0VB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
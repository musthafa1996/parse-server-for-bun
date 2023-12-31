"use strict";

var _Check = require("../Check");
var _CheckGroup = _interopRequireDefault(require("../CheckGroup"));
var _Config = _interopRequireDefault(require("../../Config"));
var _node = _interopRequireDefault(require("parse/node"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * The security checks group for Parse Server configuration.
 * Checks common Parse Server parameters such as access keys
 * @memberof module:SecurityCheck
 */
class CheckGroupDatabase extends _CheckGroup.default {
  setName() {
    return 'Database';
  }
  setChecks() {
    const config = _Config.default.get(_node.default.applicationId);
    const databaseAdapter = config.database.adapter;
    const databaseUrl = databaseAdapter._uri;
    return [new _Check.Check({
      title: 'Secure database password',
      warning: 'The database password is insecure and vulnerable to brute force attacks.',
      solution: 'Choose a longer and/or more complex password with a combination of upper- and lowercase characters, numbers and special characters.',
      check: () => {
        const password = databaseUrl.match(/\/\/\S+:(\S+)@/)[1];
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasNonAlphasNumerics = /\W/.test(password);
        // Ensure length
        if (password.length < 14) {
          throw 1;
        }
        // Ensure at least 3 out of 4 requirements passed
        if (hasUpperCase + hasLowerCase + hasNumbers + hasNonAlphasNumerics < 3) {
          throw 1;
        }
      }
    })];
  }
}
module.exports = CheckGroupDatabase;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGVja0dyb3VwRGF0YWJhc2UiLCJDaGVja0dyb3VwIiwic2V0TmFtZSIsInNldENoZWNrcyIsImNvbmZpZyIsIkNvbmZpZyIsImdldCIsIlBhcnNlIiwiYXBwbGljYXRpb25JZCIsImRhdGFiYXNlQWRhcHRlciIsImRhdGFiYXNlIiwiYWRhcHRlciIsImRhdGFiYXNlVXJsIiwiX3VyaSIsIkNoZWNrIiwidGl0bGUiLCJ3YXJuaW5nIiwic29sdXRpb24iLCJjaGVjayIsInBhc3N3b3JkIiwibWF0Y2giLCJoYXNVcHBlckNhc2UiLCJ0ZXN0IiwiaGFzTG93ZXJDYXNlIiwiaGFzTnVtYmVycyIsImhhc05vbkFscGhhc051bWVyaWNzIiwibGVuZ3RoIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TZWN1cml0eS9DaGVja0dyb3Vwcy9DaGVja0dyb3VwRGF0YWJhc2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hlY2sgfSBmcm9tICcuLi9DaGVjayc7XG5pbXBvcnQgQ2hlY2tHcm91cCBmcm9tICcuLi9DaGVja0dyb3VwJztcbmltcG9ydCBDb25maWcgZnJvbSAnLi4vLi4vQ29uZmlnJztcbmltcG9ydCBQYXJzZSBmcm9tICdwYXJzZS9ub2RlJztcblxuLyoqXG4gKiBUaGUgc2VjdXJpdHkgY2hlY2tzIGdyb3VwIGZvciBQYXJzZSBTZXJ2ZXIgY29uZmlndXJhdGlvbi5cbiAqIENoZWNrcyBjb21tb24gUGFyc2UgU2VydmVyIHBhcmFtZXRlcnMgc3VjaCBhcyBhY2Nlc3Mga2V5c1xuICogQG1lbWJlcm9mIG1vZHVsZTpTZWN1cml0eUNoZWNrXG4gKi9cbmNsYXNzIENoZWNrR3JvdXBEYXRhYmFzZSBleHRlbmRzIENoZWNrR3JvdXAge1xuICBzZXROYW1lKCkge1xuICAgIHJldHVybiAnRGF0YWJhc2UnO1xuICB9XG4gIHNldENoZWNrcygpIHtcbiAgICBjb25zdCBjb25maWcgPSBDb25maWcuZ2V0KFBhcnNlLmFwcGxpY2F0aW9uSWQpO1xuICAgIGNvbnN0IGRhdGFiYXNlQWRhcHRlciA9IGNvbmZpZy5kYXRhYmFzZS5hZGFwdGVyO1xuICAgIGNvbnN0IGRhdGFiYXNlVXJsID0gZGF0YWJhc2VBZGFwdGVyLl91cmk7XG4gICAgcmV0dXJuIFtcbiAgICAgIG5ldyBDaGVjayh7XG4gICAgICAgIHRpdGxlOiAnU2VjdXJlIGRhdGFiYXNlIHBhc3N3b3JkJyxcbiAgICAgICAgd2FybmluZzogJ1RoZSBkYXRhYmFzZSBwYXNzd29yZCBpcyBpbnNlY3VyZSBhbmQgdnVsbmVyYWJsZSB0byBicnV0ZSBmb3JjZSBhdHRhY2tzLicsXG4gICAgICAgIHNvbHV0aW9uOlxuICAgICAgICAgICdDaG9vc2UgYSBsb25nZXIgYW5kL29yIG1vcmUgY29tcGxleCBwYXNzd29yZCB3aXRoIGEgY29tYmluYXRpb24gb2YgdXBwZXItIGFuZCBsb3dlcmNhc2UgY2hhcmFjdGVycywgbnVtYmVycyBhbmQgc3BlY2lhbCBjaGFyYWN0ZXJzLicsXG4gICAgICAgIGNoZWNrOiAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgcGFzc3dvcmQgPSBkYXRhYmFzZVVybC5tYXRjaCgvXFwvXFwvXFxTKzooXFxTKylALylbMV07XG4gICAgICAgICAgY29uc3QgaGFzVXBwZXJDYXNlID0gL1tBLVpdLy50ZXN0KHBhc3N3b3JkKTtcbiAgICAgICAgICBjb25zdCBoYXNMb3dlckNhc2UgPSAvW2Etel0vLnRlc3QocGFzc3dvcmQpO1xuICAgICAgICAgIGNvbnN0IGhhc051bWJlcnMgPSAvXFxkLy50ZXN0KHBhc3N3b3JkKTtcbiAgICAgICAgICBjb25zdCBoYXNOb25BbHBoYXNOdW1lcmljcyA9IC9cXFcvLnRlc3QocGFzc3dvcmQpO1xuICAgICAgICAgIC8vIEVuc3VyZSBsZW5ndGhcbiAgICAgICAgICBpZiAocGFzc3dvcmQubGVuZ3RoIDwgMTQpIHtcbiAgICAgICAgICAgIHRocm93IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEVuc3VyZSBhdCBsZWFzdCAzIG91dCBvZiA0IHJlcXVpcmVtZW50cyBwYXNzZWRcbiAgICAgICAgICBpZiAoaGFzVXBwZXJDYXNlICsgaGFzTG93ZXJDYXNlICsgaGFzTnVtYmVycyArIGhhc05vbkFscGhhc051bWVyaWNzIDwgMykge1xuICAgICAgICAgICAgdGhyb3cgMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICBdO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hlY2tHcm91cERhdGFiYXNlO1xuIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQStCO0FBRS9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQSxrQkFBa0IsU0FBU0MsbUJBQVUsQ0FBQztFQUMxQ0MsT0FBTyxHQUFHO0lBQ1IsT0FBTyxVQUFVO0VBQ25CO0VBQ0FDLFNBQVMsR0FBRztJQUNWLE1BQU1DLE1BQU0sR0FBR0MsZUFBTSxDQUFDQyxHQUFHLENBQUNDLGFBQUssQ0FBQ0MsYUFBYSxDQUFDO0lBQzlDLE1BQU1DLGVBQWUsR0FBR0wsTUFBTSxDQUFDTSxRQUFRLENBQUNDLE9BQU87SUFDL0MsTUFBTUMsV0FBVyxHQUFHSCxlQUFlLENBQUNJLElBQUk7SUFDeEMsT0FBTyxDQUNMLElBQUlDLFlBQUssQ0FBQztNQUNSQyxLQUFLLEVBQUUsMEJBQTBCO01BQ2pDQyxPQUFPLEVBQUUsMEVBQTBFO01BQ25GQyxRQUFRLEVBQ04scUlBQXFJO01BQ3ZJQyxLQUFLLEVBQUUsTUFBTTtRQUNYLE1BQU1DLFFBQVEsR0FBR1AsV0FBVyxDQUFDUSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsTUFBTUMsWUFBWSxHQUFHLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDSCxRQUFRLENBQUM7UUFDM0MsTUFBTUksWUFBWSxHQUFHLE9BQU8sQ0FBQ0QsSUFBSSxDQUFDSCxRQUFRLENBQUM7UUFDM0MsTUFBTUssVUFBVSxHQUFHLElBQUksQ0FBQ0YsSUFBSSxDQUFDSCxRQUFRLENBQUM7UUFDdEMsTUFBTU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDSCxJQUFJLENBQUNILFFBQVEsQ0FBQztRQUNoRDtRQUNBLElBQUlBLFFBQVEsQ0FBQ08sTUFBTSxHQUFHLEVBQUUsRUFBRTtVQUN4QixNQUFNLENBQUM7UUFDVDtRQUNBO1FBQ0EsSUFBSUwsWUFBWSxHQUFHRSxZQUFZLEdBQUdDLFVBQVUsR0FBR0Msb0JBQW9CLEdBQUcsQ0FBQyxFQUFFO1VBQ3ZFLE1BQU0sQ0FBQztRQUNUO01BQ0Y7SUFDRixDQUFDLENBQUMsQ0FDSDtFQUNIO0FBQ0Y7QUFFQUUsTUFBTSxDQUFDQyxPQUFPLEdBQUc1QixrQkFBa0IifQ==
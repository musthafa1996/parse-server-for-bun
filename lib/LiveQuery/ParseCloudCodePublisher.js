"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParseCloudCodePublisher = void 0;
var _ParsePubSub = require("./ParsePubSub");
var _node = _interopRequireDefault(require("parse/node"));
var _logger = _interopRequireDefault(require("../logger"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class ParseCloudCodePublisher {
  // config object of the publisher, right now it only contains the redisURL,
  // but we may extend it later.
  constructor(config = {}) {
    this.parsePublisher = _ParsePubSub.ParsePubSub.createPublisher(config);
  }
  async connect() {
    if (typeof this.parsePublisher.connect === 'function') {
      if (this.parsePublisher.isOpen) {
        return;
      }
      return Promise.resolve(this.parsePublisher.connect());
    }
  }
  onCloudCodeAfterSave(request) {
    this._onCloudCodeMessage(_node.default.applicationId + 'afterSave', request);
  }
  onCloudCodeAfterDelete(request) {
    this._onCloudCodeMessage(_node.default.applicationId + 'afterDelete', request);
  }
  onClearCachedRoles(user) {
    this.parsePublisher.publish(_node.default.applicationId + 'clearCache', JSON.stringify({
      userId: user.id
    }));
  }

  // Request is the request object from cloud code functions. request.object is a ParseObject.
  _onCloudCodeMessage(type, request) {
    _logger.default.verbose('Raw request from cloud code current : %j | original : %j', request.object, request.original);
    // We need the full JSON which includes className
    const message = {
      currentParseObject: request.object._toFullJSON()
    };
    if (request.original) {
      message.originalParseObject = request.original._toFullJSON();
    }
    if (request.classLevelPermissions) {
      message.classLevelPermissions = request.classLevelPermissions;
    }
    this.parsePublisher.publish(type, JSON.stringify(message));
  }
}
exports.ParseCloudCodePublisher = ParseCloudCodePublisher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXJzZUNsb3VkQ29kZVB1Ymxpc2hlciIsImNvbnN0cnVjdG9yIiwiY29uZmlnIiwicGFyc2VQdWJsaXNoZXIiLCJQYXJzZVB1YlN1YiIsImNyZWF0ZVB1Ymxpc2hlciIsImNvbm5lY3QiLCJpc09wZW4iLCJQcm9taXNlIiwicmVzb2x2ZSIsIm9uQ2xvdWRDb2RlQWZ0ZXJTYXZlIiwicmVxdWVzdCIsIl9vbkNsb3VkQ29kZU1lc3NhZ2UiLCJQYXJzZSIsImFwcGxpY2F0aW9uSWQiLCJvbkNsb3VkQ29kZUFmdGVyRGVsZXRlIiwib25DbGVhckNhY2hlZFJvbGVzIiwidXNlciIsInB1Ymxpc2giLCJKU09OIiwic3RyaW5naWZ5IiwidXNlcklkIiwiaWQiLCJ0eXBlIiwibG9nZ2VyIiwidmVyYm9zZSIsIm9iamVjdCIsIm9yaWdpbmFsIiwibWVzc2FnZSIsImN1cnJlbnRQYXJzZU9iamVjdCIsIl90b0Z1bGxKU09OIiwib3JpZ2luYWxQYXJzZU9iamVjdCIsImNsYXNzTGV2ZWxQZXJtaXNzaW9ucyJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9MaXZlUXVlcnkvUGFyc2VDbG91ZENvZGVQdWJsaXNoZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGFyc2VQdWJTdWIgfSBmcm9tICcuL1BhcnNlUHViU3ViJztcbmltcG9ydCBQYXJzZSBmcm9tICdwYXJzZS9ub2RlJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcblxuY2xhc3MgUGFyc2VDbG91ZENvZGVQdWJsaXNoZXIge1xuICBwYXJzZVB1Ymxpc2hlcjogT2JqZWN0O1xuXG4gIC8vIGNvbmZpZyBvYmplY3Qgb2YgdGhlIHB1Ymxpc2hlciwgcmlnaHQgbm93IGl0IG9ubHkgY29udGFpbnMgdGhlIHJlZGlzVVJMLFxuICAvLyBidXQgd2UgbWF5IGV4dGVuZCBpdCBsYXRlci5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBhbnkgPSB7fSkge1xuICAgIHRoaXMucGFyc2VQdWJsaXNoZXIgPSBQYXJzZVB1YlN1Yi5jcmVhdGVQdWJsaXNoZXIoY29uZmlnKTtcbiAgfVxuXG4gIGFzeW5jIGNvbm5lY3QoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnBhcnNlUHVibGlzaGVyLmNvbm5lY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmICh0aGlzLnBhcnNlUHVibGlzaGVyLmlzT3Blbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMucGFyc2VQdWJsaXNoZXIuY29ubmVjdCgpKTtcbiAgICB9XG4gIH1cblxuICBvbkNsb3VkQ29kZUFmdGVyU2F2ZShyZXF1ZXN0OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkNsb3VkQ29kZU1lc3NhZ2UoUGFyc2UuYXBwbGljYXRpb25JZCArICdhZnRlclNhdmUnLCByZXF1ZXN0KTtcbiAgfVxuXG4gIG9uQ2xvdWRDb2RlQWZ0ZXJEZWxldGUocmVxdWVzdDogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fb25DbG91ZENvZGVNZXNzYWdlKFBhcnNlLmFwcGxpY2F0aW9uSWQgKyAnYWZ0ZXJEZWxldGUnLCByZXF1ZXN0KTtcbiAgfVxuXG4gIG9uQ2xlYXJDYWNoZWRSb2xlcyh1c2VyOiBQYXJzZS5PYmplY3QpIHtcbiAgICB0aGlzLnBhcnNlUHVibGlzaGVyLnB1Ymxpc2goXG4gICAgICBQYXJzZS5hcHBsaWNhdGlvbklkICsgJ2NsZWFyQ2FjaGUnLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoeyB1c2VySWQ6IHVzZXIuaWQgfSlcbiAgICApO1xuICB9XG5cbiAgLy8gUmVxdWVzdCBpcyB0aGUgcmVxdWVzdCBvYmplY3QgZnJvbSBjbG91ZCBjb2RlIGZ1bmN0aW9ucy4gcmVxdWVzdC5vYmplY3QgaXMgYSBQYXJzZU9iamVjdC5cbiAgX29uQ2xvdWRDb2RlTWVzc2FnZSh0eXBlOiBzdHJpbmcsIHJlcXVlc3Q6IGFueSk6IHZvaWQge1xuICAgIGxvZ2dlci52ZXJib3NlKFxuICAgICAgJ1JhdyByZXF1ZXN0IGZyb20gY2xvdWQgY29kZSBjdXJyZW50IDogJWogfCBvcmlnaW5hbCA6ICVqJyxcbiAgICAgIHJlcXVlc3Qub2JqZWN0LFxuICAgICAgcmVxdWVzdC5vcmlnaW5hbFxuICAgICk7XG4gICAgLy8gV2UgbmVlZCB0aGUgZnVsbCBKU09OIHdoaWNoIGluY2x1ZGVzIGNsYXNzTmFtZVxuICAgIGNvbnN0IG1lc3NhZ2UgPSB7XG4gICAgICBjdXJyZW50UGFyc2VPYmplY3Q6IHJlcXVlc3Qub2JqZWN0Ll90b0Z1bGxKU09OKCksXG4gICAgfTtcbiAgICBpZiAocmVxdWVzdC5vcmlnaW5hbCkge1xuICAgICAgbWVzc2FnZS5vcmlnaW5hbFBhcnNlT2JqZWN0ID0gcmVxdWVzdC5vcmlnaW5hbC5fdG9GdWxsSlNPTigpO1xuICAgIH1cbiAgICBpZiAocmVxdWVzdC5jbGFzc0xldmVsUGVybWlzc2lvbnMpIHtcbiAgICAgIG1lc3NhZ2UuY2xhc3NMZXZlbFBlcm1pc3Npb25zID0gcmVxdWVzdC5jbGFzc0xldmVsUGVybWlzc2lvbnM7XG4gICAgfVxuICAgIHRoaXMucGFyc2VQdWJsaXNoZXIucHVibGlzaCh0eXBlLCBKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gIH1cbn1cblxuZXhwb3J0IHsgUGFyc2VDbG91ZENvZGVQdWJsaXNoZXIgfTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQStCO0FBRS9CLE1BQU1BLHVCQUF1QixDQUFDO0VBRzVCO0VBQ0E7RUFDQUMsV0FBVyxDQUFDQyxNQUFXLEdBQUcsQ0FBQyxDQUFDLEVBQUU7SUFDNUIsSUFBSSxDQUFDQyxjQUFjLEdBQUdDLHdCQUFXLENBQUNDLGVBQWUsQ0FBQ0gsTUFBTSxDQUFDO0VBQzNEO0VBRUEsTUFBTUksT0FBTyxHQUFHO0lBQ2QsSUFBSSxPQUFPLElBQUksQ0FBQ0gsY0FBYyxDQUFDRyxPQUFPLEtBQUssVUFBVSxFQUFFO01BQ3JELElBQUksSUFBSSxDQUFDSCxjQUFjLENBQUNJLE1BQU0sRUFBRTtRQUM5QjtNQUNGO01BQ0EsT0FBT0MsT0FBTyxDQUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDTixjQUFjLENBQUNHLE9BQU8sRUFBRSxDQUFDO0lBQ3ZEO0VBQ0Y7RUFFQUksb0JBQW9CLENBQUNDLE9BQVksRUFBUTtJQUN2QyxJQUFJLENBQUNDLG1CQUFtQixDQUFDQyxhQUFLLENBQUNDLGFBQWEsR0FBRyxXQUFXLEVBQUVILE9BQU8sQ0FBQztFQUN0RTtFQUVBSSxzQkFBc0IsQ0FBQ0osT0FBWSxFQUFRO0lBQ3pDLElBQUksQ0FBQ0MsbUJBQW1CLENBQUNDLGFBQUssQ0FBQ0MsYUFBYSxHQUFHLGFBQWEsRUFBRUgsT0FBTyxDQUFDO0VBQ3hFO0VBRUFLLGtCQUFrQixDQUFDQyxJQUFrQixFQUFFO0lBQ3JDLElBQUksQ0FBQ2QsY0FBYyxDQUFDZSxPQUFPLENBQ3pCTCxhQUFLLENBQUNDLGFBQWEsR0FBRyxZQUFZLEVBQ2xDSyxJQUFJLENBQUNDLFNBQVMsQ0FBQztNQUFFQyxNQUFNLEVBQUVKLElBQUksQ0FBQ0s7SUFBRyxDQUFDLENBQUMsQ0FDcEM7RUFDSDs7RUFFQTtFQUNBVixtQkFBbUIsQ0FBQ1csSUFBWSxFQUFFWixPQUFZLEVBQVE7SUFDcERhLGVBQU0sQ0FBQ0MsT0FBTyxDQUNaLDBEQUEwRCxFQUMxRGQsT0FBTyxDQUFDZSxNQUFNLEVBQ2RmLE9BQU8sQ0FBQ2dCLFFBQVEsQ0FDakI7SUFDRDtJQUNBLE1BQU1DLE9BQU8sR0FBRztNQUNkQyxrQkFBa0IsRUFBRWxCLE9BQU8sQ0FBQ2UsTUFBTSxDQUFDSSxXQUFXO0lBQ2hELENBQUM7SUFDRCxJQUFJbkIsT0FBTyxDQUFDZ0IsUUFBUSxFQUFFO01BQ3BCQyxPQUFPLENBQUNHLG1CQUFtQixHQUFHcEIsT0FBTyxDQUFDZ0IsUUFBUSxDQUFDRyxXQUFXLEVBQUU7SUFDOUQ7SUFDQSxJQUFJbkIsT0FBTyxDQUFDcUIscUJBQXFCLEVBQUU7TUFDakNKLE9BQU8sQ0FBQ0kscUJBQXFCLEdBQUdyQixPQUFPLENBQUNxQixxQkFBcUI7SUFDL0Q7SUFDQSxJQUFJLENBQUM3QixjQUFjLENBQUNlLE9BQU8sQ0FBQ0ssSUFBSSxFQUFFSixJQUFJLENBQUNDLFNBQVMsQ0FBQ1EsT0FBTyxDQUFDLENBQUM7RUFDNUQ7QUFDRjtBQUFDIn0=
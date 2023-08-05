"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PublicAPIRouter = void 0;
var _PromiseRouter = _interopRequireDefault(require("../PromiseRouter"));
var _Config = _interopRequireDefault(require("../Config"));
var _express = _interopRequireDefault(require("express"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _querystring = _interopRequireDefault(require("querystring"));
var _node = require("parse/node");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const public_html = _path.default.resolve(__dirname, '../../public_html');
const views = _path.default.resolve(__dirname, '../../views');
class PublicAPIRouter extends _PromiseRouter.default {
  verifyEmail(req) {
    const {
      username,
      token: rawToken
    } = req.query;
    const token = rawToken && typeof rawToken !== 'string' ? rawToken.toString() : rawToken;
    const appId = req.params.appId;
    const config = _Config.default.get(appId);
    if (!config) {
      this.invalidRequest();
    }
    if (!config.publicServerURL) {
      return this.missingPublicServerURL();
    }
    if (!token || !username) {
      return this.invalidLink(req);
    }
    const userController = config.userController;
    return userController.verifyEmail(username, token).then(() => {
      const params = _querystring.default.stringify({
        username
      });
      return Promise.resolve({
        status: 302,
        location: `${config.verifyEmailSuccessURL}?${params}`
      });
    }, () => {
      return this.invalidVerificationLink(req);
    });
  }
  resendVerificationEmail(req) {
    const username = req.body.username;
    const appId = req.params.appId;
    const config = _Config.default.get(appId);
    if (!config) {
      this.invalidRequest();
    }
    if (!config.publicServerURL) {
      return this.missingPublicServerURL();
    }
    if (!username) {
      return this.invalidLink(req);
    }
    const userController = config.userController;
    return userController.resendVerificationEmail(username).then(() => {
      return Promise.resolve({
        status: 302,
        location: `${config.linkSendSuccessURL}`
      });
    }, () => {
      return Promise.resolve({
        status: 302,
        location: `${config.linkSendFailURL}`
      });
    });
  }
  changePassword(req) {
    return new Promise((resolve, reject) => {
      const config = _Config.default.get(req.query.id);
      if (!config) {
        this.invalidRequest();
      }
      if (!config.publicServerURL) {
        return resolve({
          status: 404,
          text: 'Not found.'
        });
      }
      // Should we keep the file in memory or leave like that?
      _fs.default.readFile(_path.default.resolve(views, 'choose_password'), 'utf-8', (err, data) => {
        if (err) {
          return reject(err);
        }
        data = data.replace('PARSE_SERVER_URL', `'${config.publicServerURL}'`);
        resolve({
          text: data
        });
      });
    });
  }
  requestResetPassword(req) {
    const config = req.config;
    if (!config) {
      this.invalidRequest();
    }
    if (!config.publicServerURL) {
      return this.missingPublicServerURL();
    }
    const {
      username,
      token: rawToken
    } = req.query;
    const token = rawToken && typeof rawToken !== 'string' ? rawToken.toString() : rawToken;
    if (!username || !token) {
      return this.invalidLink(req);
    }
    return config.userController.checkResetTokenValidity(username, token).then(() => {
      const params = _querystring.default.stringify({
        token,
        id: config.applicationId,
        username,
        app: config.appName
      });
      return Promise.resolve({
        status: 302,
        location: `${config.choosePasswordURL}?${params}`
      });
    }, () => {
      return this.invalidLink(req);
    });
  }
  resetPassword(req) {
    const config = req.config;
    if (!config) {
      this.invalidRequest();
    }
    if (!config.publicServerURL) {
      return this.missingPublicServerURL();
    }
    const {
      username,
      new_password,
      token: rawToken
    } = req.body;
    const token = rawToken && typeof rawToken !== 'string' ? rawToken.toString() : rawToken;
    if ((!username || !token || !new_password) && req.xhr === false) {
      return this.invalidLink(req);
    }
    if (!username) {
      throw new _node.Parse.Error(_node.Parse.Error.USERNAME_MISSING, 'Missing username');
    }
    if (!token) {
      throw new _node.Parse.Error(_node.Parse.Error.OTHER_CAUSE, 'Missing token');
    }
    if (!new_password) {
      throw new _node.Parse.Error(_node.Parse.Error.PASSWORD_MISSING, 'Missing password');
    }
    return config.userController.updatePassword(username, token, new_password).then(() => {
      return Promise.resolve({
        success: true
      });
    }, err => {
      return Promise.resolve({
        success: false,
        err
      });
    }).then(result => {
      const params = _querystring.default.stringify({
        username: username,
        token: token,
        id: config.applicationId,
        error: result.err,
        app: config.appName
      });
      if (req.xhr) {
        if (result.success) {
          return Promise.resolve({
            status: 200,
            response: 'Password successfully reset'
          });
        }
        if (result.err) {
          throw new _node.Parse.Error(_node.Parse.Error.OTHER_CAUSE, `${result.err}`);
        }
      }
      const encodedUsername = encodeURIComponent(username);
      const location = result.success ? `${config.passwordResetSuccessURL}?username=${encodedUsername}` : `${config.choosePasswordURL}?${params}`;
      return Promise.resolve({
        status: 302,
        location
      });
    });
  }
  invalidLink(req) {
    return Promise.resolve({
      status: 302,
      location: req.config.invalidLinkURL
    });
  }
  invalidVerificationLink(req) {
    const config = req.config;
    if (req.query.username && req.params.appId) {
      const params = _querystring.default.stringify({
        username: req.query.username,
        appId: req.params.appId
      });
      return Promise.resolve({
        status: 302,
        location: `${config.invalidVerificationLinkURL}?${params}`
      });
    } else {
      return this.invalidLink(req);
    }
  }
  missingPublicServerURL() {
    return Promise.resolve({
      text: 'Not found.',
      status: 404
    });
  }
  invalidRequest() {
    const error = new Error();
    error.status = 403;
    error.message = 'unauthorized';
    throw error;
  }
  setConfig(req) {
    req.config = _Config.default.get(req.params.appId);
    return Promise.resolve();
  }
  mountRoutes() {
    this.route('GET', '/apps/:appId/verify_email', req => {
      this.setConfig(req);
    }, req => {
      return this.verifyEmail(req);
    });
    this.route('POST', '/apps/:appId/resend_verification_email', req => {
      this.setConfig(req);
    }, req => {
      return this.resendVerificationEmail(req);
    });
    this.route('GET', '/apps/choose_password', req => {
      return this.changePassword(req);
    });
    this.route('POST', '/apps/:appId/request_password_reset', req => {
      this.setConfig(req);
    }, req => {
      return this.resetPassword(req);
    });
    this.route('GET', '/apps/:appId/request_password_reset', req => {
      this.setConfig(req);
    }, req => {
      return this.requestResetPassword(req);
    });
  }
  expressRouter() {
    const router = _express.default.Router();
    router.use('/apps', _express.default.static(public_html));
    router.use('/', super.expressRouter());
    return router;
  }
}
exports.PublicAPIRouter = PublicAPIRouter;
var _default = PublicAPIRouter;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwdWJsaWNfaHRtbCIsInBhdGgiLCJyZXNvbHZlIiwiX19kaXJuYW1lIiwidmlld3MiLCJQdWJsaWNBUElSb3V0ZXIiLCJQcm9taXNlUm91dGVyIiwidmVyaWZ5RW1haWwiLCJyZXEiLCJ1c2VybmFtZSIsInRva2VuIiwicmF3VG9rZW4iLCJxdWVyeSIsInRvU3RyaW5nIiwiYXBwSWQiLCJwYXJhbXMiLCJjb25maWciLCJDb25maWciLCJnZXQiLCJpbnZhbGlkUmVxdWVzdCIsInB1YmxpY1NlcnZlclVSTCIsIm1pc3NpbmdQdWJsaWNTZXJ2ZXJVUkwiLCJpbnZhbGlkTGluayIsInVzZXJDb250cm9sbGVyIiwidGhlbiIsInFzIiwic3RyaW5naWZ5IiwiUHJvbWlzZSIsInN0YXR1cyIsImxvY2F0aW9uIiwidmVyaWZ5RW1haWxTdWNjZXNzVVJMIiwiaW52YWxpZFZlcmlmaWNhdGlvbkxpbmsiLCJyZXNlbmRWZXJpZmljYXRpb25FbWFpbCIsImJvZHkiLCJsaW5rU2VuZFN1Y2Nlc3NVUkwiLCJsaW5rU2VuZEZhaWxVUkwiLCJjaGFuZ2VQYXNzd29yZCIsInJlamVjdCIsImlkIiwidGV4dCIsImZzIiwicmVhZEZpbGUiLCJlcnIiLCJkYXRhIiwicmVwbGFjZSIsInJlcXVlc3RSZXNldFBhc3N3b3JkIiwiY2hlY2tSZXNldFRva2VuVmFsaWRpdHkiLCJhcHBsaWNhdGlvbklkIiwiYXBwIiwiYXBwTmFtZSIsImNob29zZVBhc3N3b3JkVVJMIiwicmVzZXRQYXNzd29yZCIsIm5ld19wYXNzd29yZCIsInhociIsIlBhcnNlIiwiRXJyb3IiLCJVU0VSTkFNRV9NSVNTSU5HIiwiT1RIRVJfQ0FVU0UiLCJQQVNTV09SRF9NSVNTSU5HIiwidXBkYXRlUGFzc3dvcmQiLCJzdWNjZXNzIiwicmVzdWx0IiwiZXJyb3IiLCJyZXNwb25zZSIsImVuY29kZWRVc2VybmFtZSIsImVuY29kZVVSSUNvbXBvbmVudCIsInBhc3N3b3JkUmVzZXRTdWNjZXNzVVJMIiwiaW52YWxpZExpbmtVUkwiLCJpbnZhbGlkVmVyaWZpY2F0aW9uTGlua1VSTCIsIm1lc3NhZ2UiLCJzZXRDb25maWciLCJtb3VudFJvdXRlcyIsInJvdXRlIiwiZXhwcmVzc1JvdXRlciIsInJvdXRlciIsImV4cHJlc3MiLCJSb3V0ZXIiLCJ1c2UiLCJzdGF0aWMiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvUm91dGVycy9QdWJsaWNBUElSb3V0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2VSb3V0ZXIgZnJvbSAnLi4vUHJvbWlzZVJvdXRlcic7XG5pbXBvcnQgQ29uZmlnIGZyb20gJy4uL0NvbmZpZyc7XG5pbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBxcyBmcm9tICdxdWVyeXN0cmluZyc7XG5pbXBvcnQgeyBQYXJzZSB9IGZyb20gJ3BhcnNlL25vZGUnO1xuXG5jb25zdCBwdWJsaWNfaHRtbCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wdWJsaWNfaHRtbCcpO1xuY29uc3Qgdmlld3MgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vdmlld3MnKTtcblxuZXhwb3J0IGNsYXNzIFB1YmxpY0FQSVJvdXRlciBleHRlbmRzIFByb21pc2VSb3V0ZXIge1xuICB2ZXJpZnlFbWFpbChyZXEpIHtcbiAgICBjb25zdCB7IHVzZXJuYW1lLCB0b2tlbjogcmF3VG9rZW4gfSA9IHJlcS5xdWVyeTtcbiAgICBjb25zdCB0b2tlbiA9IHJhd1Rva2VuICYmIHR5cGVvZiByYXdUb2tlbiAhPT0gJ3N0cmluZycgPyByYXdUb2tlbi50b1N0cmluZygpIDogcmF3VG9rZW47XG5cbiAgICBjb25zdCBhcHBJZCA9IHJlcS5wYXJhbXMuYXBwSWQ7XG4gICAgY29uc3QgY29uZmlnID0gQ29uZmlnLmdldChhcHBJZCk7XG5cbiAgICBpZiAoIWNvbmZpZykge1xuICAgICAgdGhpcy5pbnZhbGlkUmVxdWVzdCgpO1xuICAgIH1cblxuICAgIGlmICghY29uZmlnLnB1YmxpY1NlcnZlclVSTCkge1xuICAgICAgcmV0dXJuIHRoaXMubWlzc2luZ1B1YmxpY1NlcnZlclVSTCgpO1xuICAgIH1cblxuICAgIGlmICghdG9rZW4gfHwgIXVzZXJuYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkTGluayhyZXEpO1xuICAgIH1cblxuICAgIGNvbnN0IHVzZXJDb250cm9sbGVyID0gY29uZmlnLnVzZXJDb250cm9sbGVyO1xuICAgIHJldHVybiB1c2VyQ29udHJvbGxlci52ZXJpZnlFbWFpbCh1c2VybmFtZSwgdG9rZW4pLnRoZW4oXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHFzLnN0cmluZ2lmeSh7IHVzZXJuYW1lIH0pO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgICBzdGF0dXM6IDMwMixcbiAgICAgICAgICBsb2NhdGlvbjogYCR7Y29uZmlnLnZlcmlmeUVtYWlsU3VjY2Vzc1VSTH0/JHtwYXJhbXN9YCxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkVmVyaWZpY2F0aW9uTGluayhyZXEpO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICByZXNlbmRWZXJpZmljYXRpb25FbWFpbChyZXEpIHtcbiAgICBjb25zdCB1c2VybmFtZSA9IHJlcS5ib2R5LnVzZXJuYW1lO1xuICAgIGNvbnN0IGFwcElkID0gcmVxLnBhcmFtcy5hcHBJZDtcbiAgICBjb25zdCBjb25maWcgPSBDb25maWcuZ2V0KGFwcElkKTtcblxuICAgIGlmICghY29uZmlnKSB7XG4gICAgICB0aGlzLmludmFsaWRSZXF1ZXN0KCk7XG4gICAgfVxuXG4gICAgaWYgKCFjb25maWcucHVibGljU2VydmVyVVJMKSB7XG4gICAgICByZXR1cm4gdGhpcy5taXNzaW5nUHVibGljU2VydmVyVVJMKCk7XG4gICAgfVxuXG4gICAgaWYgKCF1c2VybmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZExpbmsocmVxKTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VyQ29udHJvbGxlciA9IGNvbmZpZy51c2VyQ29udHJvbGxlcjtcblxuICAgIHJldHVybiB1c2VyQ29udHJvbGxlci5yZXNlbmRWZXJpZmljYXRpb25FbWFpbCh1c2VybmFtZSkudGhlbihcbiAgICAgICgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgICAgc3RhdHVzOiAzMDIsXG4gICAgICAgICAgbG9jYXRpb246IGAke2NvbmZpZy5saW5rU2VuZFN1Y2Nlc3NVUkx9YCxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgICBzdGF0dXM6IDMwMixcbiAgICAgICAgICBsb2NhdGlvbjogYCR7Y29uZmlnLmxpbmtTZW5kRmFpbFVSTH1gLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgY2hhbmdlUGFzc3dvcmQocmVxKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IENvbmZpZy5nZXQocmVxLnF1ZXJ5LmlkKTtcblxuICAgICAgaWYgKCFjb25maWcpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkUmVxdWVzdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWNvbmZpZy5wdWJsaWNTZXJ2ZXJVUkwpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoe1xuICAgICAgICAgIHN0YXR1czogNDA0LFxuICAgICAgICAgIHRleHQ6ICdOb3QgZm91bmQuJyxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICAvLyBTaG91bGQgd2Uga2VlcCB0aGUgZmlsZSBpbiBtZW1vcnkgb3IgbGVhdmUgbGlrZSB0aGF0P1xuICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKHZpZXdzLCAnY2hvb3NlX3Bhc3N3b3JkJyksICd1dGYtOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKCdQQVJTRV9TRVJWRVJfVVJMJywgYCcke2NvbmZpZy5wdWJsaWNTZXJ2ZXJVUkx9J2ApO1xuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICB0ZXh0OiBkYXRhLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcmVxdWVzdFJlc2V0UGFzc3dvcmQocmVxKSB7XG4gICAgY29uc3QgY29uZmlnID0gcmVxLmNvbmZpZztcblxuICAgIGlmICghY29uZmlnKSB7XG4gICAgICB0aGlzLmludmFsaWRSZXF1ZXN0KCk7XG4gICAgfVxuXG4gICAgaWYgKCFjb25maWcucHVibGljU2VydmVyVVJMKSB7XG4gICAgICByZXR1cm4gdGhpcy5taXNzaW5nUHVibGljU2VydmVyVVJMKCk7XG4gICAgfVxuXG4gICAgY29uc3QgeyB1c2VybmFtZSwgdG9rZW46IHJhd1Rva2VuIH0gPSByZXEucXVlcnk7XG4gICAgY29uc3QgdG9rZW4gPSByYXdUb2tlbiAmJiB0eXBlb2YgcmF3VG9rZW4gIT09ICdzdHJpbmcnID8gcmF3VG9rZW4udG9TdHJpbmcoKSA6IHJhd1Rva2VuO1xuXG4gICAgaWYgKCF1c2VybmFtZSB8fCAhdG9rZW4pIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRMaW5rKHJlcSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZy51c2VyQ29udHJvbGxlci5jaGVja1Jlc2V0VG9rZW5WYWxpZGl0eSh1c2VybmFtZSwgdG9rZW4pLnRoZW4oXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHFzLnN0cmluZ2lmeSh7XG4gICAgICAgICAgdG9rZW4sXG4gICAgICAgICAgaWQ6IGNvbmZpZy5hcHBsaWNhdGlvbklkLFxuICAgICAgICAgIHVzZXJuYW1lLFxuICAgICAgICAgIGFwcDogY29uZmlnLmFwcE5hbWUsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgICBzdGF0dXM6IDMwMixcbiAgICAgICAgICBsb2NhdGlvbjogYCR7Y29uZmlnLmNob29zZVBhc3N3b3JkVVJMfT8ke3BhcmFtc31gLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRMaW5rKHJlcSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIHJlc2V0UGFzc3dvcmQocmVxKSB7XG4gICAgY29uc3QgY29uZmlnID0gcmVxLmNvbmZpZztcblxuICAgIGlmICghY29uZmlnKSB7XG4gICAgICB0aGlzLmludmFsaWRSZXF1ZXN0KCk7XG4gICAgfVxuXG4gICAgaWYgKCFjb25maWcucHVibGljU2VydmVyVVJMKSB7XG4gICAgICByZXR1cm4gdGhpcy5taXNzaW5nUHVibGljU2VydmVyVVJMKCk7XG4gICAgfVxuXG4gICAgY29uc3QgeyB1c2VybmFtZSwgbmV3X3Bhc3N3b3JkLCB0b2tlbjogcmF3VG9rZW4gfSA9IHJlcS5ib2R5O1xuICAgIGNvbnN0IHRva2VuID0gcmF3VG9rZW4gJiYgdHlwZW9mIHJhd1Rva2VuICE9PSAnc3RyaW5nJyA/IHJhd1Rva2VuLnRvU3RyaW5nKCkgOiByYXdUb2tlbjtcblxuICAgIGlmICgoIXVzZXJuYW1lIHx8ICF0b2tlbiB8fCAhbmV3X3Bhc3N3b3JkKSAmJiByZXEueGhyID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZExpbmsocmVxKTtcbiAgICB9XG5cbiAgICBpZiAoIXVzZXJuYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgUGFyc2UuRXJyb3IoUGFyc2UuRXJyb3IuVVNFUk5BTUVfTUlTU0lORywgJ01pc3NpbmcgdXNlcm5hbWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRva2VuKSB7XG4gICAgICB0aHJvdyBuZXcgUGFyc2UuRXJyb3IoUGFyc2UuRXJyb3IuT1RIRVJfQ0FVU0UsICdNaXNzaW5nIHRva2VuJyk7XG4gICAgfVxuXG4gICAgaWYgKCFuZXdfcGFzc3dvcmQpIHtcbiAgICAgIHRocm93IG5ldyBQYXJzZS5FcnJvcihQYXJzZS5FcnJvci5QQVNTV09SRF9NSVNTSU5HLCAnTWlzc2luZyBwYXNzd29yZCcpO1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWcudXNlckNvbnRyb2xsZXJcbiAgICAgIC51cGRhdGVQYXNzd29yZCh1c2VybmFtZSwgdG9rZW4sIG5ld19wYXNzd29yZClcbiAgICAgIC50aGVuKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnIsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHFzLnN0cmluZ2lmeSh7XG4gICAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgICAgICBpZDogY29uZmlnLmFwcGxpY2F0aW9uSWQsXG4gICAgICAgICAgZXJyb3I6IHJlc3VsdC5lcnIsXG4gICAgICAgICAgYXBwOiBjb25maWcuYXBwTmFtZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHJlcS54aHIpIHtcbiAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICAgICAgICBzdGF0dXM6IDIwMCxcbiAgICAgICAgICAgICAgcmVzcG9uc2U6ICdQYXNzd29yZCBzdWNjZXNzZnVsbHkgcmVzZXQnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyZXN1bHQuZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2UuRXJyb3IoUGFyc2UuRXJyb3IuT1RIRVJfQ0FVU0UsIGAke3Jlc3VsdC5lcnJ9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW5jb2RlZFVzZXJuYW1lID0gZW5jb2RlVVJJQ29tcG9uZW50KHVzZXJuYW1lKTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSByZXN1bHQuc3VjY2Vzc1xuICAgICAgICAgID8gYCR7Y29uZmlnLnBhc3N3b3JkUmVzZXRTdWNjZXNzVVJMfT91c2VybmFtZT0ke2VuY29kZWRVc2VybmFtZX1gXG4gICAgICAgICAgOiBgJHtjb25maWcuY2hvb3NlUGFzc3dvcmRVUkx9PyR7cGFyYW1zfWA7XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgICAgc3RhdHVzOiAzMDIsXG4gICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBpbnZhbGlkTGluayhyZXEpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgIHN0YXR1czogMzAyLFxuICAgICAgbG9jYXRpb246IHJlcS5jb25maWcuaW52YWxpZExpbmtVUkwsXG4gICAgfSk7XG4gIH1cblxuICBpbnZhbGlkVmVyaWZpY2F0aW9uTGluayhyZXEpIHtcbiAgICBjb25zdCBjb25maWcgPSByZXEuY29uZmlnO1xuICAgIGlmIChyZXEucXVlcnkudXNlcm5hbWUgJiYgcmVxLnBhcmFtcy5hcHBJZCkge1xuICAgICAgY29uc3QgcGFyYW1zID0gcXMuc3RyaW5naWZ5KHtcbiAgICAgICAgdXNlcm5hbWU6IHJlcS5xdWVyeS51c2VybmFtZSxcbiAgICAgICAgYXBwSWQ6IHJlcS5wYXJhbXMuYXBwSWQsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBzdGF0dXM6IDMwMixcbiAgICAgICAgbG9jYXRpb246IGAke2NvbmZpZy5pbnZhbGlkVmVyaWZpY2F0aW9uTGlua1VSTH0/JHtwYXJhbXN9YCxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkTGluayhyZXEpO1xuICAgIH1cbiAgfVxuXG4gIG1pc3NpbmdQdWJsaWNTZXJ2ZXJVUkwoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICB0ZXh0OiAnTm90IGZvdW5kLicsXG4gICAgICBzdGF0dXM6IDQwNCxcbiAgICB9KTtcbiAgfVxuXG4gIGludmFsaWRSZXF1ZXN0KCkge1xuICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgZXJyb3Iuc3RhdHVzID0gNDAzO1xuICAgIGVycm9yLm1lc3NhZ2UgPSAndW5hdXRob3JpemVkJztcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuXG4gIHNldENvbmZpZyhyZXEpIHtcbiAgICByZXEuY29uZmlnID0gQ29uZmlnLmdldChyZXEucGFyYW1zLmFwcElkKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICBtb3VudFJvdXRlcygpIHtcbiAgICB0aGlzLnJvdXRlKFxuICAgICAgJ0dFVCcsXG4gICAgICAnL2FwcHMvOmFwcElkL3ZlcmlmeV9lbWFpbCcsXG4gICAgICByZXEgPT4ge1xuICAgICAgICB0aGlzLnNldENvbmZpZyhyZXEpO1xuICAgICAgfSxcbiAgICAgIHJlcSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnZlcmlmeUVtYWlsKHJlcSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMucm91dGUoXG4gICAgICAnUE9TVCcsXG4gICAgICAnL2FwcHMvOmFwcElkL3Jlc2VuZF92ZXJpZmljYXRpb25fZW1haWwnLFxuICAgICAgcmVxID0+IHtcbiAgICAgICAgdGhpcy5zZXRDb25maWcocmVxKTtcbiAgICAgIH0sXG4gICAgICByZXEgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNlbmRWZXJpZmljYXRpb25FbWFpbChyZXEpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnJvdXRlKCdHRVQnLCAnL2FwcHMvY2hvb3NlX3Bhc3N3b3JkJywgcmVxID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmNoYW5nZVBhc3N3b3JkKHJlcSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnJvdXRlKFxuICAgICAgJ1BPU1QnLFxuICAgICAgJy9hcHBzLzphcHBJZC9yZXF1ZXN0X3Bhc3N3b3JkX3Jlc2V0JyxcbiAgICAgIHJlcSA9PiB7XG4gICAgICAgIHRoaXMuc2V0Q29uZmlnKHJlcSk7XG4gICAgICB9LFxuICAgICAgcmVxID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzZXRQYXNzd29yZChyZXEpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnJvdXRlKFxuICAgICAgJ0dFVCcsXG4gICAgICAnL2FwcHMvOmFwcElkL3JlcXVlc3RfcGFzc3dvcmRfcmVzZXQnLFxuICAgICAgcmVxID0+IHtcbiAgICAgICAgdGhpcy5zZXRDb25maWcocmVxKTtcbiAgICAgIH0sXG4gICAgICByZXEgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0UmVzZXRQYXNzd29yZChyZXEpO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBleHByZXNzUm91dGVyKCkge1xuICAgIGNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG4gICAgcm91dGVyLnVzZSgnL2FwcHMnLCBleHByZXNzLnN0YXRpYyhwdWJsaWNfaHRtbCkpO1xuICAgIHJvdXRlci51c2UoJy8nLCBzdXBlci5leHByZXNzUm91dGVyKCkpO1xuICAgIHJldHVybiBy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
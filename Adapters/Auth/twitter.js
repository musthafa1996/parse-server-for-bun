"use strict";

// Helper functions for accessing the twitter API.
var OAuth = require('./OAuth1Client');
var Parse = require('parse/node').Parse;

// Returns a promise that fulfills iff this user id is valid.
function validateAuthData(authData, options) {
  if (!options) {
    throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, 'Twitter auth configuration missing');
  }
  options = handleMultipleConfigurations(authData, options);
  var client = new OAuth(options);
  client.host = 'api.twitter.com';
  client.auth_token = authData.auth_token;
  client.auth_token_secret = authData.auth_token_secret;
  return client.get('/1.1/account/verify_credentials.json').then(data => {
    if (data && data.id_str == '' + authData.id) {
      return;
    }
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Twitter auth is invalid for this user.');
  });
}

// Returns a promise that fulfills iff this app id is valid.
function validateAppId() {
  return Promise.resolve();
}
function handleMultipleConfigurations(authData, options) {
  if (Array.isArray(options)) {
    const consumer_key = authData.consumer_key;
    if (!consumer_key) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Twitter auth is invalid for this user.');
    }
    options = options.filter(option => {
      return option.consumer_key == consumer_key;
    });
    if (options.length == 0) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Twitter auth is invalid for this user.');
    }
    options = options[0];
  }
  return options;
}
module.exports = {
  validateAppId,
  validateAuthData,
  handleMultipleConfigurations
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPQXV0aCIsInJlcXVpcmUiLCJQYXJzZSIsInZhbGlkYXRlQXV0aERhdGEiLCJhdXRoRGF0YSIsIm9wdGlvbnMiLCJFcnJvciIsIklOVEVSTkFMX1NFUlZFUl9FUlJPUiIsImhhbmRsZU11bHRpcGxlQ29uZmlndXJhdGlvbnMiLCJjbGllbnQiLCJob3N0IiwiYXV0aF90b2tlbiIsImF1dGhfdG9rZW5fc2VjcmV0IiwiZ2V0IiwidGhlbiIsImRhdGEiLCJpZF9zdHIiLCJpZCIsIk9CSkVDVF9OT1RfRk9VTkQiLCJ2YWxpZGF0ZUFwcElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJBcnJheSIsImlzQXJyYXkiLCJjb25zdW1lcl9rZXkiLCJmaWx0ZXIiLCJvcHRpb24iLCJsZW5ndGgiLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0FkYXB0ZXJzL0F1dGgvdHdpdHRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBIZWxwZXIgZnVuY3Rpb25zIGZvciBhY2Nlc3NpbmcgdGhlIHR3aXR0ZXIgQVBJLlxudmFyIE9BdXRoID0gcmVxdWlyZSgnLi9PQXV0aDFDbGllbnQnKTtcbnZhciBQYXJzZSA9IHJlcXVpcmUoJ3BhcnNlL25vZGUnKS5QYXJzZTtcblxuLy8gUmV0dXJucyBhIHByb21pc2UgdGhhdCBmdWxmaWxscyBpZmYgdGhpcyB1c2VyIGlkIGlzIHZhbGlkLlxuZnVuY3Rpb24gdmFsaWRhdGVBdXRoRGF0YShhdXRoRGF0YSwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICB0aHJvdyBuZXcgUGFyc2UuRXJyb3IoUGFyc2UuRXJyb3IuSU5URVJOQUxfU0VSVkVSX0VSUk9SLCAnVHdpdHRlciBhdXRoIGNvbmZpZ3VyYXRpb24gbWlzc2luZycpO1xuICB9XG4gIG9wdGlvbnMgPSBoYW5kbGVNdWx0aXBsZUNvbmZpZ3VyYXRpb25zKGF1dGhEYXRhLCBvcHRpb25zKTtcbiAgdmFyIGNsaWVudCA9IG5ldyBPQXV0aChvcHRpb25zKTtcbiAgY2xpZW50Lmhvc3QgPSAnYXBpLnR3aXR0ZXIuY29tJztcbiAgY2xpZW50LmF1dGhfdG9rZW4gPSBhdXRoRGF0YS5hdXRoX3Rva2VuO1xuICBjbGllbnQuYXV0aF90b2tlbl9zZWNyZXQgPSBhdXRoRGF0YS5hdXRoX3Rva2VuX3NlY3JldDtcblxuICByZXR1cm4gY2xpZW50LmdldCgnLzEuMS9hY2NvdW50L3ZlcmlmeV9jcmVkZW50aWFscy5qc29uJykudGhlbihkYXRhID0+IHtcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmlkX3N0ciA9PSAnJyArIGF1dGhEYXRhLmlkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRocm93IG5ldyBQYXJzZS5FcnJvcihQYXJzZS5FcnJvci5PQkpFQ1RfTk9UX0ZPVU5ELCAnVHdpdHRlciBhdXRoIGlzIGludmFsaWQgZm9yIHRoaXMgdXNlci4nKTtcbiAgfSk7XG59XG5cbi8vIFJldHVybnMgYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgaWZmIHRoaXMgYXBwIGlkIGlzIHZhbGlkLlxuZnVuY3Rpb24gdmFsaWRhdGVBcHBJZCgpIHtcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVNdWx0aXBsZUNvbmZpZ3VyYXRpb25zKGF1dGhEYXRhLCBvcHRpb25zKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KG9wdGlvbnMpKSB7XG4gICAgY29uc3QgY29uc3VtZXJfa2V5ID0gYXV0aERhdGEuY29uc3VtZXJfa2V5O1xuICAgIGlmICghY29uc3VtZXJfa2V5KSB7XG4gICAgICB0aHJvdyBuZXcgUGFyc2UuRXJyb3IoUGFyc2UuRXJyb3IuT0JKRUNUX05PVF9GT1VORCwgJ1R3aXR0ZXIgYXV0aCBpcyBpbnZhbGlkIGZvciB0aGlzIHVzZXIuJyk7XG4gICAgfVxuICAgIG9wdGlvbnMgPSBvcHRpb25zLmZpbHRlcihvcHRpb24gPT4ge1xuICAgICAgcmV0dXJuIG9wdGlvbi5jb25zdW1lcl9rZXkgPT0gY29uc3VtZXJfa2V5O1xuICAgIH0pO1xuXG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoID09IDApIHtcbiAgICAgIHRocm93IG5ldyBQYXJzZS5FcnJvcihQYXJzZS5FcnJvci5PQkpFQ1RfTk9UX0ZPVU5ELCAnVHdpdHRlciBhdXRoIGlzIGludmFsaWQgZm9yIHRoaXMgdXNlci4nKTtcbiAgICB9XG4gICAgb3B0aW9ucyA9IG9wdGlvbnNbMF07XG4gIH1cbiAgcmV0dXJuIG9wdGlvbnM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2YWxpZGF0ZUFwcElkLFxuICB2YWxpZGF0ZUF1dGhEYXRhLFxuICBoYW5kbGVNdWx0aXBsZUNvbmZpZ3VyYXRpb25zLFxufTtcbiJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBLElBQUlBLEtBQUssR0FBR0MsT0FBTyxDQUFDLGdCQUFnQixDQUFDO0FBQ3JDLElBQUlDLEtBQUssR0FBR0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDQyxLQUFLOztBQUV2QztBQUNBLFNBQVNDLGdCQUFnQixDQUFDQyxRQUFRLEVBQUVDLE9BQU8sRUFBRTtFQUMzQyxJQUFJLENBQUNBLE9BQU8sRUFBRTtJQUNaLE1BQU0sSUFBSUgsS0FBSyxDQUFDSSxLQUFLLENBQUNKLEtBQUssQ0FBQ0ksS0FBSyxDQUFDQyxxQkFBcUIsRUFBRSxvQ0FBb0MsQ0FBQztFQUNoRztFQUNBRixPQUFPLEdBQUdHLDRCQUE0QixDQUFDSixRQUFRLEVBQUVDLE9BQU8sQ0FBQztFQUN6RCxJQUFJSSxNQUFNLEdBQUcsSUFBSVQsS0FBSyxDQUFDSyxPQUFPLENBQUM7RUFDL0JJLE1BQU0sQ0FBQ0MsSUFBSSxHQUFHLGlCQUFpQjtFQUMvQkQsTUFBTSxDQUFDRSxVQUFVLEdBQUdQLFFBQVEsQ0FBQ08sVUFBVTtFQUN2Q0YsTUFBTSxDQUFDRyxpQkFBaUIsR0FBR1IsUUFBUSxDQUFDUSxpQkFBaUI7RUFFckQsT0FBT0gsTUFBTSxDQUFDSSxHQUFHLENBQUMsc0NBQXNDLENBQUMsQ0FBQ0MsSUFBSSxDQUFDQyxJQUFJLElBQUk7SUFDckUsSUFBSUEsSUFBSSxJQUFJQSxJQUFJLENBQUNDLE1BQU0sSUFBSSxFQUFFLEdBQUdaLFFBQVEsQ0FBQ2EsRUFBRSxFQUFFO01BQzNDO0lBQ0Y7SUFDQSxNQUFNLElBQUlmLEtBQUssQ0FBQ0ksS0FBSyxDQUFDSixLQUFLLENBQUNJLEtBQUssQ0FBQ1ksZ0JBQWdCLEVBQUUsd0NBQXdDLENBQUM7RUFDL0YsQ0FBQyxDQUFDO0FBQ0o7O0FBRUE7QUFDQSxTQUFTQyxhQUFhLEdBQUc7RUFDdkIsT0FBT0MsT0FBTyxDQUFDQyxPQUFPLEVBQUU7QUFDMUI7QUFFQSxTQUFTYiw0QkFBNEIsQ0FBQ0osUUFBUSxFQUFFQyxPQUFPLEVBQUU7RUFDdkQsSUFBSWlCLEtBQUssQ0FBQ0MsT0FBTyxDQUFDbEIsT0FBTyxDQUFDLEVBQUU7SUFDMUIsTUFBTW1CLFlBQVksR0FBR3BCLFFBQVEsQ0FBQ29CLFlBQVk7SUFDMUMsSUFBSSxDQUFDQSxZQUFZLEVBQUU7TUFDakIsTUFBTSxJQUFJdEIsS0FBSyxDQUFDSSxLQUFLLENBQUNKLEtBQUssQ0FBQ0ksS0FBSyxDQUFDWSxnQkFBZ0IsRUFBRSx3Q0FBd0MsQ0FBQztJQUMvRjtJQUNBYixPQUFPLEdBQUdBLE9BQU8sQ0FBQ29CLE1BQU0sQ0FBQ0MsTUFBTSxJQUFJO01BQ2pDLE9BQU9BLE1BQU0sQ0FBQ0YsWUFBWSxJQUFJQSxZQUFZO0lBQzVDLENBQUMsQ0FBQztJQUVGLElBQUluQixPQUFPLENBQUNzQixNQUFNLElBQUksQ0FBQyxFQUFFO01BQ3ZCLE1BQU0sSUFBSXpCLEtBQUssQ0FBQ0ksS0FBSyxDQUFDSixLQUFLLENBQUNJLEtBQUssQ0FBQ1ksZ0JBQWdCLEVBQUUsd0NBQXdDLENBQUM7SUFDL0Y7SUFDQWIsT0FBTyxHQUFHQSxPQUFPLENBQUMsQ0FBQyxDQUFDO0VBQ3RCO0VBQ0EsT0FBT0EsT0FBTztBQUNoQjtBQUVBdUIsTUFBTSxDQUFDQyxPQUFPLEdBQUc7RUFDZlYsYUFBYTtFQUNiaEIsZ0JBQWdCO0VBQ2hCSztBQUNGLENBQUMifQ==
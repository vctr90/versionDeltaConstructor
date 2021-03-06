var axios;
var Promise;

function DbInstance(payload) {
  Promise = payload.alreadyResolvedDependencies.bluebird || require('bluebird');
  this.DOMAIN_PROTOCOL = payload.connectionConfiguration.domainProtocol || '',
  this.HOST = payload.connectionConfiguration.host || '';
  this.PORT = payload.connectionConfiguration.port || '',
  this.RESOURCE_DIRECTORY = 'plugin';
  this.BASE_URL = payload.connectionConfiguration.baseUrl ||
    this.DOMAIN_PROTOCOL + this.HOST + ':' + this.PORT + '/' + this.RESOURCE_DIRECTORY + '/';
  this.headers = payload.connectionConfiguration.headers || undefined;
  this.JQUERY_NAME = 'jquery';
  this.AXIOS_NAME = 'axios';
  var isJqueryUnavailable = typeof $ === 'undefined';
  this.typeOfConfiguration = isJqueryUnavailable ? this.AXIOS_NAME : this.JQUERY_NAME;
  if (isJqueryUnavailable) {
    axios = require('axios');
    this.axiosConnection = this.getAxiosConnection();
  }
};

DbInstance.prototype.getAxiosConnection = function() {
  return axios.create({
    baseUrl: this.BASE_URL,
    headers: this.headers,
  });
};

DbInstance.prototype.performGet = function(url) {
  var getFunction = this.getFunctionReferenceToCall()[this.typeOfConfiguration].get;
  return getFunction.call(this, url);
};

DbInstance.prototype.getFunctionReferenceToCall = function() {
  return {
    axios: {
      get: this.axiosGet,
    },
    jquery: {
      get: this.jqueryGet,
    },
  };
},

DbInstance.prototype.axiosGet = function(url) {
  return new Promise(function(fulfill, reject) {
    this.axiosConnection.get(this.BASE_URL + url, {
      data: {},
    })
    .then(function(serverResponse) {
      fulfill(serverResponse.data);
    })
    .catch(function(error) {
      reject(error.stack);
    });
  }.bind(this));
},

DbInstance.prototype.jqueryGet = function(url) {
  return new Promise(function(fulfill, reject) {
    $.ajax({
      type: 'get',
      url: this.BASE_URL + url,
      success: function(serverResponse) {
        fulfill(serverResponse);
      },
      error: function(error) {
        reject(error.stack);
      },
    });
  }.bind(this));
},

module.exports = DbInstance;

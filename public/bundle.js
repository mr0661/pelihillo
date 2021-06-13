(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":3}],2:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var cookies = require('./../helpers/cookies');
var buildURL = require('./../helpers/buildURL');
var buildFullPath = require('../core/buildFullPath');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

},{"../core/buildFullPath":9,"../core/createError":10,"./../core/settle":14,"./../helpers/buildURL":18,"./../helpers/cookies":20,"./../helpers/isURLSameOrigin":23,"./../helpers/parseHeaders":25,"./../utils":27}],3:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

// Expose isAxiosError
axios.isAxiosError = require('./helpers/isAxiosError');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":4,"./cancel/CancelToken":5,"./cancel/isCancel":6,"./core/Axios":7,"./core/mergeConfig":13,"./defaults":16,"./helpers/bind":17,"./helpers/isAxiosError":22,"./helpers/spread":26,"./utils":27}],4:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],5:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":4}],6:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],7:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"../helpers/buildURL":18,"./../utils":27,"./InterceptorManager":8,"./dispatchRequest":11,"./mergeConfig":13}],8:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":27}],9:[function(require,module,exports){
'use strict';

var isAbsoluteURL = require('../helpers/isAbsoluteURL');
var combineURLs = require('../helpers/combineURLs');

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};

},{"../helpers/combineURLs":19,"../helpers/isAbsoluteURL":21}],10:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":12}],11:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":6,"../defaults":16,"./../utils":27,"./transformData":15}],12:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};

},{}],13:[function(require,module,exports){
'use strict';

var utils = require('../utils');

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};

},{"../utils":27}],14:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":10}],15:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":27}],16:[function(require,module,exports){
(function (process){(function (){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this)}).call(this,require('_process'))
},{"./adapters/http":2,"./adapters/xhr":2,"./helpers/normalizeHeaderName":24,"./utils":27,"_process":58}],17:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],18:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":27}],19:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],20:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);

},{"./../utils":27}],21:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],22:[function(require,module,exports){
'use strict';

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};

},{}],23:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);

},{"./../utils":27}],24:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":27}],25:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

},{"./../utils":27}],26:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],27:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};

},{"./helpers/bind":17}],28:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downVoteText = exports.upVoteText = exports.postNewText = exports.getTexts = void 0;
const axios_1 = require("axios");
const noteURI = 'http://localhost:3001/api/notes';
// Get notes by door ID.
const getTexts = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield axios_1.default.get(`${noteURI}/${id}`);
    return res.data;
});
exports.getTexts = getTexts;
// Post new note by door ID.
const postNewText = (id, msg) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield axios_1.default.post(`${noteURI}/${id}`, msg);
    return res.data;
});
exports.postNewText = postNewText;
// Upvote note by note ID.
const upVoteText = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield axios_1.default.patch(`${noteURI}/up/${id}`);
    return res.data;
});
exports.upVoteText = upVoteText;
// Downvote note by note ID.
const downVoteText = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield axios_1.default.patch(`${noteURI}/down/${id}`);
    return res.data;
});
exports.downVoteText = downVoteText;

},{"axios":1}],29:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downVoteNote = exports.upVoteNote = exports.postNewNote = exports.getNotes = void 0;
const api_1 = require("./api");
;
function getNotes(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let notes = new Array();
        let respond = yield api_1.getTexts(id);
        respond.map(oneNote => {
            let note = {
                id: oneNote.id,
                message: oneNote.note
            };
            notes.push(note);
        });
        return notes;
    });
}
exports.getNotes = getNotes;
;
function postNewNote(id, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = { note: msg };
        return yield api_1.postNewText(id, message);
    });
}
exports.postNewNote = postNewNote;
;
function upVoteNote(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield api_1.upVoteText(id);
    });
}
exports.upVoteNote = upVoteNote;
;
function downVoteNote(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield api_1.downVoteText(id);
    });
}
exports.downVoteNote = downVoteNote;
;

},{"./api":28}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coord_1 = require("./ui/coord");
const inputs_1 = require("./ui/inputs");
const ui_def_1 = require("./ui/ui_def");
const run_1 = require("./run");
const CANVAS_ID = "canvas";
function main(CANVAS_ID) {
    const WIDTH = document.body.clientWidth;
    const HEIGHT = Math.round(WIDTH * 7.5 / 16); // browser widescreen
    const CYCLE_MS = 1000 / 10; // ~30fps
    // Set canvas size
    let canvas = document.getElementById(CANVAS_ID);
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    inputs_1.addListeners(canvas, ui_def_1.ui);
    console.log("AAAA");
    run_1.startGame();
    // roomDemo(ui);
    // Set main loop
    setInterval(mainCycle, CYCLE_MS, canvas);
}
let iteration = 0;
function mainCycle(canvas) {
    let ctx = canvas.getContext("2d");
    const maxIter = 32;
    let iterationId = iteration % maxIter > maxIter / 2 ? maxIter - iteration % maxIter : iteration % maxIter;
    let colorCode = "" + iterationId.toString(16) + iterationId.toString(16);
    ctx.fillStyle = "#" + (colorCode) + (colorCode) + (colorCode);
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ui_def_1.ui.update();
    ui_def_1.ui.draw(ctx, new coord_1.Coord(canvas.width, canvas.height));
    iteration++;
}
main(CANVAS_ID);

},{"./run":48,"./ui/coord":50,"./ui/inputs":51,"./ui/ui_def":57}],31:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enterRoom = exports.dropIntoRoom = exports.getDoorId = exports.getTargetIfAllowed = exports.isAllowedMove = exports.isRoomCleared = exports.addClearedRoom = exports.getRoom = exports.getMessage = exports.reset = exports.ROOMS = exports.BLOCKED_ROOM = exports.BLOCKED = exports.RANDOM = exports.DEATH = exports.KEY7 = exports.KEY6 = exports.KEY5 = exports.KEY4 = exports.KEY3 = exports.KEY2 = exports.KEY1 = exports.TURN = exports.VERTICAL = exports.HORIZONTAL = exports.STANDARD = exports.RoomAction = void 0;
const apiportal_1 = require("../api/apiportal");
const ROOMS_DEBUG = true;
var EnterStrategy;
(function (EnterStrategy) {
    EnterStrategy[EnterStrategy["NORMAL"] = 0] = "NORMAL";
    EnterStrategy[EnterStrategy["EXIT_LEFT"] = 1] = "EXIT_LEFT";
    EnterStrategy[EnterStrategy["EXIT_RIGHT"] = 2] = "EXIT_RIGHT";
    EnterStrategy[EnterStrategy["EXIT_UP"] = 3] = "EXIT_UP";
    EnterStrategy[EnterStrategy["EXIT_DOWN"] = 4] = "EXIT_DOWN";
})(EnterStrategy || (EnterStrategy = {}));
const HORIZONTAL_AUTO = {
    fromDown: EnterStrategy.NORMAL,
    fromUp: EnterStrategy.NORMAL,
    fromLeft: EnterStrategy.EXIT_RIGHT,
    fromRight: EnterStrategy.EXIT_LEFT
};
const VERTICAL_AUTO = {
    fromDown: EnterStrategy.EXIT_UP,
    fromUp: EnterStrategy.EXIT_DOWN,
    fromLeft: EnterStrategy.NORMAL,
    fromRight: EnterStrategy.NORMAL
};
const TURN_LEFT_SKIP = {
    fromDown: EnterStrategy.EXIT_LEFT,
    fromUp: EnterStrategy.EXIT_RIGHT,
    fromLeft: EnterStrategy.EXIT_UP,
    fromRight: EnterStrategy.EXIT_DOWN
};
const NORMAL = {
    fromDown: EnterStrategy.NORMAL,
    fromUp: EnterStrategy.NORMAL,
    fromLeft: EnterStrategy.NORMAL,
    fromRight: EnterStrategy.NORMAL
};
var RoomAction;
(function (RoomAction) {
    RoomAction[RoomAction["NORMAL"] = 0] = "NORMAL";
    RoomAction[RoomAction["KEY1"] = 1] = "KEY1";
    RoomAction[RoomAction["KEY2"] = 2] = "KEY2";
    RoomAction[RoomAction["KEY3"] = 3] = "KEY3";
    RoomAction[RoomAction["KEY4"] = 4] = "KEY4";
    RoomAction[RoomAction["KEY5"] = 5] = "KEY5";
    RoomAction[RoomAction["KEY6"] = 6] = "KEY6";
    RoomAction[RoomAction["KEY7"] = 7] = "KEY7";
    RoomAction[RoomAction["REDRUM"] = 8] = "REDRUM";
    RoomAction[RoomAction["RANDOM"] = 9] = "RANDOM";
    RoomAction[RoomAction["BLOCKED"] = 10] = "BLOCKED";
})(RoomAction = exports.RoomAction || (exports.RoomAction = {}));
exports.STANDARD = { action: RoomAction.NORMAL, move: NORMAL };
exports.HORIZONTAL = { action: RoomAction.NORMAL, move: HORIZONTAL_AUTO };
exports.VERTICAL = { action: RoomAction.NORMAL, move: VERTICAL_AUTO };
exports.TURN = { action: RoomAction.NORMAL, move: TURN_LEFT_SKIP };
exports.KEY1 = { action: RoomAction.KEY1, move: NORMAL };
exports.KEY2 = { action: RoomAction.KEY2, move: NORMAL };
exports.KEY3 = { action: RoomAction.KEY3, move: NORMAL };
exports.KEY4 = { action: RoomAction.KEY4, move: NORMAL };
exports.KEY5 = { action: RoomAction.KEY5, move: NORMAL };
exports.KEY6 = { action: RoomAction.KEY6, move: NORMAL };
exports.KEY7 = { action: RoomAction.KEY7, move: NORMAL };
exports.DEATH = { action: RoomAction.REDRUM, move: NORMAL };
exports.RANDOM = { action: RoomAction.RANDOM, move: NORMAL };
exports.BLOCKED = { action: RoomAction.BLOCKED, move: NORMAL };
exports.BLOCKED_ROOM = { x: 4, y: 4, strategy: exports.BLOCKED };
exports.ROOMS = [
    { x: 0, y: 0, strategy: exports.HORIZONTAL } // HALLWAY-of-doom
    ,
    { x: 0, y: 1, strategy: exports.HORIZONTAL } // HALLWAY-of-doom
    ,
    { x: 0, y: 2, strategy: exports.HORIZONTAL } // HALLWAY-of-doom
    ,
    { x: 0, y: 3, strategy: exports.HORIZONTAL } // HALLWAY-of-doom
    ,
    { x: 0, y: 4, strategy: exports.HORIZONTAL } // HALLWAY-of-doom
    ,
    { x: 0, y: 5, strategy: exports.HORIZONTAL } // HALLWAY-of-doom
    ,
    { x: 0, y: 6, strategy: exports.HORIZONTAL } // HALLWAY-of-doom
    ,
    { x: 0, y: 7, strategy: exports.HORIZONTAL } // HALLWAY-of-doom
    ,
    { x: 0, y: 8, strategy: exports.HORIZONTAL } // HALLWAY-of-doom
    ,
    { x: 0, y: 9, strategy: exports.STANDARD },
    { x: 1, y: 0, strategy: exports.STANDARD },
    { x: 1, y: 1, strategy: exports.STANDARD },
    { x: 1, y: 2, strategy: exports.STANDARD },
    { x: 1, y: 3, strategy: exports.STANDARD },
    { x: 1, y: 4, strategy: exports.STANDARD },
    { x: 1, y: 5, strategy: exports.TURN },
    { x: 1, y: 6, strategy: exports.STANDARD },
    { x: 1, y: 7, strategy: exports.STANDARD },
    { x: 1, y: 8, strategy: exports.KEY2 },
    { x: 1, y: 9, strategy: exports.STANDARD },
    { x: 2, y: 0, strategy: exports.STANDARD },
    { x: 2, y: 1, strategy: exports.STANDARD },
    { x: 2, y: 2, strategy: exports.VERTICAL },
    { x: 2, y: 3, strategy: exports.KEY3 },
    { x: 2, y: 4, strategy: exports.STANDARD },
    { x: 2, y: 5, strategy: exports.HORIZONTAL },
    { x: 2, y: 6, strategy: exports.STANDARD },
    { x: 2, y: 7, strategy: exports.STANDARD },
    { x: 2, y: 8, strategy: exports.STANDARD },
    { x: 2, y: 9, strategy: exports.STANDARD },
    { x: 3, y: 0, strategy: exports.STANDARD },
    { x: 3, y: 1, strategy: exports.STANDARD },
    { x: 3, y: 2, strategy: exports.STANDARD },
    { x: 3, y: 3, strategy: exports.DEATH },
    { x: 3, y: 4, strategy: exports.STANDARD },
    { x: 3, y: 5, strategy: exports.STANDARD },
    { x: 3, y: 6, strategy: exports.TURN },
    { x: 3, y: 7, strategy: exports.STANDARD },
    { x: 3, y: 8, strategy: exports.STANDARD },
    { x: 3, y: 9, strategy: exports.STANDARD },
    { x: 4, y: 0, strategy: exports.STANDARD },
    { x: 4, y: 1, strategy: exports.STANDARD },
    { x: 4, y: 2, strategy: exports.STANDARD },
    { x: 4, y: 3, strategy: exports.STANDARD },
    { x: 4, y: 4, strategy: exports.KEY6 },
    { x: 4, y: 5, strategy: exports.KEY1 },
    { x: 4, y: 6, strategy: exports.RANDOM },
    { x: 4, y: 7, strategy: exports.STANDARD },
    { x: 4, y: 8, strategy: exports.STANDARD },
    { x: 4, y: 9, strategy: exports.VERTICAL },
    { x: 5, y: 0, strategy: exports.TURN },
    { x: 5, y: 1, strategy: exports.STANDARD },
    { x: 5, y: 2, strategy: exports.STANDARD },
    { x: 5, y: 3, strategy: exports.STANDARD },
    { x: 5, y: 4, strategy: exports.STANDARD },
    { x: 5, y: 5, strategy: exports.STANDARD },
    { x: 5, y: 6, strategy: exports.STANDARD },
    { x: 5, y: 7, strategy: exports.STANDARD },
    { x: 5, y: 8, strategy: exports.STANDARD },
    { x: 5, y: 9, strategy: exports.STANDARD },
    { x: 6, y: 0, strategy: exports.STANDARD },
    { x: 6, y: 1, strategy: exports.STANDARD },
    { x: 6, y: 2, strategy: exports.RANDOM },
    { x: 6, y: 3, strategy: exports.STANDARD },
    { x: 6, y: 4, strategy: exports.STANDARD },
    { x: 6, y: 5, strategy: exports.STANDARD },
    { x: 6, y: 6, strategy: exports.STANDARD },
    { x: 6, y: 7, strategy: exports.RANDOM },
    { x: 6, y: 8, strategy: exports.DEATH },
    { x: 6, y: 9, strategy: exports.STANDARD },
    { x: 7, y: 0, strategy: exports.STANDARD },
    { x: 7, y: 1, strategy: exports.STANDARD },
    { x: 7, y: 2, strategy: exports.STANDARD },
    { x: 7, y: 3, strategy: exports.KEY4 },
    { x: 7, y: 4, strategy: exports.VERTICAL },
    { x: 7, y: 5, strategy: exports.STANDARD },
    { x: 7, y: 6, strategy: exports.DEATH },
    { x: 7, y: 7, strategy: exports.STANDARD },
    { x: 7, y: 8, strategy: exports.STANDARD },
    { x: 7, y: 9, strategy: exports.STANDARD },
    { x: 8, y: 0, strategy: exports.KEY5 },
    { x: 8, y: 1, strategy: exports.VERTICAL },
    { x: 8, y: 2, strategy: exports.KEY7 },
    { x: 8, y: 3, strategy: exports.HORIZONTAL },
    { x: 8, y: 4, strategy: exports.STANDARD },
    { x: 8, y: 5, strategy: exports.STANDARD },
    { x: 8, y: 6, strategy: exports.STANDARD },
    { x: 8, y: 7, strategy: exports.STANDARD },
    { x: 8, y: 8, strategy: exports.STANDARD },
    { x: 8, y: 9, strategy: exports.STANDARD },
    { x: 9, y: 0, strategy: exports.STANDARD },
    { x: 9, y: 1, strategy: exports.STANDARD },
    { x: 9, y: 2, strategy: exports.STANDARD },
    { x: 9, y: 3, strategy: exports.STANDARD },
    { x: 9, y: 4, strategy: exports.STANDARD },
    { x: 9, y: 5, strategy: exports.STANDARD },
    { x: 9, y: 6, strategy: exports.VERTICAL },
    { x: 9, y: 7, strategy: exports.VERTICAL },
    { x: 9, y: 8, strategy: exports.VERTICAL },
    { x: 9, y: 9, strategy: exports.STANDARD }
];
let g_messages = new Array();
let g_roadsTravelled = new Array();
let g_roomsCleared = new Array();
function resetMessageText() {
    return __awaiter(this, void 0, void 0, function* () {
        if (ROOMS_DEBUG) {
            console.log("resetMessageText: start");
        }
        g_messages.length = 0;
        for (let i = 0; i < exports.ROOMS.length * 4; i++) {
            let messages = apiportal_1.getNotes(i); // TODO Add this back remove previous stuff
            messages.then(function (asd) {
                g_messages.push(asd);
            });
            yield messages;
        }
    });
}
function reset() {
    resetMessageText();
    g_roadsTravelled.length = 0;
    g_roomsCleared.length = 0;
}
exports.reset = reset;
function getMessage(from, to) {
    if (ROOMS_DEBUG) {
        console.log("getMessage: " + getDoorId(from, to).toString() + "/" + g_messages.length);
    }
    // TODO get actual message
    return g_messages[getDoorId(from, to)];
}
exports.getMessage = getMessage;
function getRoom(x, y) {
    let roomX = (x + 10) % 10;
    let roomY = (y + 10) % 10;
    if (ROOMS_DEBUG) {
        console.log("x: ", x, "y: ", y, "x: ", roomX, "y: ", roomY);
    }
    for (let i = 0; i < exports.ROOMS.length; i++) {
        if (roomX == exports.ROOMS[i].x && roomY == exports.ROOMS[i].y) {
            return exports.ROOMS[i];
        }
    }
    console.log("unknown error!");
    return { x: x, y: y, strategy: exports.RANDOM };
}
exports.getRoom = getRoom;
function addClearedRoom(room) {
    g_roomsCleared.push(room);
}
exports.addClearedRoom = addClearedRoom;
function isRoomCleared(room) {
    for (let i = 0; i < g_roomsCleared.length; i++) {
        if (room == g_roomsCleared[i]) {
            return true;
        }
    }
    return false;
}
exports.isRoomCleared = isRoomCleared;
function isAutoMove(from, to) {
    if (from.strategy == exports.HORIZONTAL) {
        return from.x != to.x;
    }
    else if (from.strategy == exports.VERTICAL) {
        return from.y != to.y;
    }
    return false;
}
function isAllowedMove(from, to) {
    if (isAutoMove(from, to)) {
        return false;
    }
    for (let i = 0; i < g_roadsTravelled.length; i++) {
        if (g_roadsTravelled[i].room1 == from && g_roadsTravelled[i].room2 == to) {
            console.log("not allowed", g_roadsTravelled);
            return false;
        }
    }
    return true;
}
exports.isAllowedMove = isAllowedMove;
function getTargetIfAllowed(from, to) {
    return isAllowedMove(from, to) ? to : exports.BLOCKED_ROOM;
}
exports.getTargetIfAllowed = getTargetIfAllowed;
function getDoorId(from, to) {
    let xDiff = from.x - to.x;
    let yDiff = from.y - to.y;
    let directionVal = 0;
    if (xDiff == -1) {
        directionVal = 0;
    }
    if (xDiff == 1) {
        directionVal = 1;
    }
    if (yDiff == -1) {
        directionVal = 2;
    }
    if (yDiff == 1) {
        directionVal = 3;
    }
    return ((from.x * 10 + from.y) << 2) + directionVal;
}
exports.getDoorId = getDoorId;
function resolveEnterStrategy(from, up, down, left, right, normal, enter) {
    if (enter == EnterStrategy.NORMAL) {
        return normal;
    }
    if (enter == EnterStrategy.EXIT_DOWN) {
        console.log("resolve move to down");
        return enterRoom(from, down);
    }
    if (enter == EnterStrategy.EXIT_UP) {
        console.log("resolve move to up");
        return enterRoom(from, up);
    }
    if (enter == EnterStrategy.EXIT_RIGHT) {
        console.log("resolve move to right");
        return enterRoom(from, right);
    }
    if (enter == EnterStrategy.EXIT_LEFT) {
        console.log("resolve move to left");
        return enterRoom(from, left);
    }
}
function dropIntoRoom(from, to) {
    // This does not mark paths travelled if dropped into normal room
    if (ROOMS_DEBUG) {
        console.log("dropping to room " + to.x.toString() + " " + to.y.toString());
    }
    const left = getRoom(to.x - 1, to.y);
    const right = getRoom(to.x + 1, to.y);
    const up = getRoom(to.x, to.y - 1);
    const down = getRoom(to.x, to.y + 1);
    const leftRefer = getTargetIfAllowed(to, left);
    const rightRefer = getTargetIfAllowed(to, right);
    const upRefer = getTargetIfAllowed(to, up);
    const downRefer = getTargetIfAllowed(to, down);
    if (from.x == down.x && from.y && down.y) {
        return resolveEnterStrategy(to, up, down, left, right, {
            left: leftRefer,
            front: upRefer,
            right: rightRefer,
            back: downRefer
        }, to.strategy.move.fromDown);
    }
    else if (from.x == left.x && from.y && left.y) {
        return resolveEnterStrategy(to, up, down, left, right, {
            left: upRefer,
            front: rightRefer,
            right: downRefer,
            back: leftRefer
        }, to.strategy.move.fromLeft);
    }
    else if (from.x == up.x && from.y && up.y) {
        return resolveEnterStrategy(to, up, down, left, right, {
            left: rightRefer,
            front: downRefer,
            right: leftRefer,
            back: upRefer
        }, to.strategy.move.fromUp);
    }
    else if (from.x == right.x && from.y && right.y) {
        return resolveEnterStrategy(to, up, down, left, right, {
            left: downRefer,
            front: leftRefer,
            right: upRefer,
            back: rightRefer
        }, to.strategy.move.fromRight);
    }
    // Lets pick random direction if we were not from correct room
    if (ROOMS_DEBUG) {
        console.log("Picking random direction enterRoom/dropRoom!");
    }
    const rnd = Math.random();
    if (rnd > 3 / 4) {
        return { left: leftRefer, front: upRefer, right: rightRefer, back: downRefer };
    }
    if (rnd > 2 / 4) {
        return { left: upRefer, front: rightRefer, right: downRefer, back: leftRefer };
    }
    if (rnd > 1 / 4) {
        return { left: rightRefer, front: downRefer, right: leftRefer, back: upRefer };
    }
    return { left: downRefer, front: leftRefer, right: upRefer, back: rightRefer };
}
exports.dropIntoRoom = dropIntoRoom;
function enterRoom(from, to) {
    // Marks path from->to and to->from travelled
    if (ROOMS_DEBUG) {
        console.log("entering room " + to.x.toString() + " " + to.y.toString());
    }
    g_roadsTravelled.push({ room1: from, room2: to });
    g_roadsTravelled.push({ room1: to, room2: from });
    return dropIntoRoom(from, to);
}
exports.enterRoom = enterRoom;

},{"../api/apiportal":29}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doomCountdown = exports.getRandomChallenge = exports.KeyRooms = void 0;
const yellow_dragon_1 = require("./challenges/yellow_dragon");
const purple_dragon_1 = require("./challenges/purple_dragon");
const Characters = require("./character");
const KeyRoom = require("./challenges/keyroom");
const red_dragon_1 = require("./challenges/red_dragon");
const blue_dragon_1 = require("./challenges/blue_dragon");
const green_dragon_1 = require("./challenges/green_dragon");
const red_ooze_1 = require("./challenges/red_ooze");
const yellow_ooze_1 = require("./challenges/yellow_ooze");
const blue_ooze_1 = require("./challenges/blue_ooze");
const green_ooze_1 = require("./challenges/green_ooze");
const ghost_spider_1 = require("./challenges/ghost_spider");
const Challenges = [yellow_dragon_1.Yellow_Dragon, red_dragon_1.Red_Dragon, blue_dragon_1.Blue_Dragon, green_dragon_1.Green_Dragon, purple_dragon_1.Purple_Dragon,
    yellow_ooze_1.Yellow_Ooze, red_ooze_1.Red_Ooze, blue_ooze_1.Blue_Ooze, green_ooze_1.Green_Ooze, ghost_spider_1.GhostSpider
];
exports.KeyRooms = [KeyRoom.WoodenKeyRoom,
    KeyRoom.CopperKeyRoom,
    KeyRoom.BrassKeyRoom,
    KeyRoom.BronzeKeyRoom,
    KeyRoom.SilverKeyRoom,
    KeyRoom.GoldenKeyRoom,
    KeyRoom.PlatinumKeyRoom
];
function getRandomChallenge() {
    return Challenges[Math.floor(Math.random() * Challenges.length)];
}
exports.getRandomChallenge = getRandomChallenge;
function doomCountdown() {
    let party_alive = false;
    if (Characters.Fighter.HP > 0 && !Characters.Fighter.countdownToDoom())
        party_alive = true;
    if (Characters.Ranger.HP > 0 && !Characters.Ranger.countdownToDoom())
        party_alive = true;
    if (Characters.Thinker.HP > 0 && !Characters.Thinker.countdownToDoom())
        party_alive = true;
    if (Characters.Tinkerer.HP > 0 && !Characters.Tinkerer.countdownToDoom())
        party_alive = true;
    return party_alive;
}
exports.doomCountdown = doomCountdown;

},{"./challenges/blue_dragon":33,"./challenges/blue_ooze":34,"./challenges/ghost_spider":36,"./challenges/green_dragon":37,"./challenges/green_ooze":38,"./challenges/keyroom":39,"./challenges/purple_dragon":40,"./challenges/red_dragon":41,"./challenges/red_ooze":42,"./challenges/yellow_dragon":43,"./challenges/yellow_ooze":44,"./character":45}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blue_Dragon = void 0;
const Core = require("../core");
const sprites_1 = require("../../ui/sprites");
let strength_result = { damage: 10,
    resolution: "The goblin didn't stand a chance against the dragon's magic and died. The dragon got bored and left."
};
let precision_result = { damage: 7,
    resolution: "Both launch their attacks at the same time! Arrow pierces dragons eye. Sadly dragons attack is also very strong."
};
let smarts_result = { damage: 2,
    resolution: "The goblin was able to harness the magical energies to kill the dragon, but his body got damaged from the wild power."
};
let craft_result = { damage: 5,
    resolution: "The goblin promises to build a magical instrument as tribute for the dragon. Dragon accepts the tribute. The goblin has to pour a lot of blood to make it actually magical."
};
let image_loc = sprites_1.SpriteName.BLUE_DRAGON;
let description = "The party encounters a formidable blue dragon. There's an abundance of magical energies swirling around the room.";
exports.Blue_Dragon = new Core.Challenge(strength_result, precision_result, smarts_result, craft_result, image_loc, description);

},{"../../ui/sprites":53,"../core":46}],34:[function(require,module,exports){
"use strict";
/**
 * Challenge template file. Copy this and change into a new challenge.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blue_Ooze = void 0;
const Core = require("../core");
const sprites_1 = require("../../ui/sprites");
let strength_result = { damage: 3,
    resolution: "The goblin delivers magnificent blow killing ooze with one hit. However, toxic matter from ooze spews onto the goblin"
};
let precision_result = { damage: 0,
    resolution: "The goblin shoots the hole and water bursts out, sweeping the ooze into a crack in the floor."
};
let smarts_result = { damage: 0,
    resolution: "The goblin pours water on the ground. Ooze naturally starts to follow where water goes."
};
let craft_result = { damage: 2,
    resolution: "The goblin closes carefully ooze and smashes it. Sadly, not careful enough as some ooze matter touches the goblins skin."
};
let image_loc = sprites_1.SpriteName.BLUE_OOZE;
let description = "A pool of blue ooze sits in the middle of the room. There's water dripping from a hole on the ceiling.";
exports.Blue_Ooze = new Core.Challenge(strength_result, precision_result, smarts_result, craft_result, image_loc, description);

},{"../../ui/sprites":53,"../core":46}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Full_Party_Doom = void 0;
const Characters = require("../character");
const Core = require("../core");
const sprites_1 = require("../../ui/sprites");
let strength_result = {
    damage: 0,
    resolution: "A curse is unleashed in the room, dooming every goblin to die after five challenges."
};
let precision_result = {
    damage: 0,
    resolution: "A curse is unleashed in the room, dooming every goblin to die after five challenges."
};
let smarts_result = {
    damage: 0,
    resolution: "A curse is unleashed in the room, dooming every goblin to die after five challenges."
};
let craft_result = {
    damage: 0,
    resolution: "A curse is unleashed in the room, dooming every goblin to die after five challenges."
};
let image_loc = sprites_1.SpriteName.DOOM_ROOM;
let description = "The room appears to be empty, but sinister aura seems to fill every shadow.";
class Full_Party_Doom_Room extends Core.Challenge {
    constructor(strength_result, precision_result, smarts_result, craft_result, image_sprite_name, description) {
        super(strength_result, precision_result, smarts_result, craft_result, image_sprite_name, description);
    }
    static doomEveryone(time_to_doom) {
        if (Characters.Fighter.HP > 0)
            Characters.Fighter.setDoom(time_to_doom);
        if (Characters.Ranger.HP > 0)
            Characters.Ranger.setDoom(time_to_doom);
        if (Characters.Thinker.HP > 0)
            Characters.Thinker.setDoom(time_to_doom);
        if (Characters.Tinkerer.HP > 0)
            Characters.Tinkerer.setDoom(time_to_doom);
    }
    getResult(skill) {
        Full_Party_Doom_Room.doomEveryone(5);
        return super.getResult(skill);
    }
}
exports.Full_Party_Doom = new Full_Party_Doom_Room(strength_result, precision_result, smarts_result, craft_result, image_loc, description);

},{"../../ui/sprites":53,"../character":45,"../core":46}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GhostSpider = void 0;
const Core = require("../core");
const sprites_1 = require("../../ui/sprites");
let strength_result = { damage: 4,
    resolution: "Unable to do anything against ghost spider, spider simply feeds and leaves."
};
let precision_result = { damage: 4,
    resolution: "Unable to do anything against ghost spider, spider simply feeds and leaves."
};
let smarts_result = { damage: 1,
    resolution: "Unable to do anything against ghost spider, spider simply feeds and leaves. Luckily, this goblin has strong spirit."
};
let craft_result = { damage: 4,
    resolution: "Unable to do anything against ghost spider, spider simply feeds and leaves."
};
let image_loc = sprites_1.SpriteName.GHOST_SPIDER;
let description = "The party sees, barely ghost spider. It want to feed on goblin soul!";
exports.GhostSpider = new Core.Challenge(strength_result, precision_result, smarts_result, craft_result, image_loc, description);

},{"../../ui/sprites":53,"../core":46}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Green_Dragon = void 0;
const Core = require("../core");
const sprites_1 = require("../../ui/sprites");
let strength_result = { damage: 2,
    resolution: "The dragon was imposing, but surprisingly weak. The goblin was able to defeat him with minor wounds."
};
let precision_result = { damage: 5,
    resolution: "The goblin was able to shoot out the dragon's eyes, but got a face full of dragon's breath for his efforts."
};
let smarts_result = { damage: 10,
    resolution: "The dragon ate half of the goblin, and left the room after having his fill."
};
let craft_result = { damage: 7,
    resolution: "The goblin was able to build a trap around the dragon and cage it, but was severely wounded in the process."
};
let image_loc = sprites_1.SpriteName.GREEN_DRAGON;
let description = "The party encounters an imposing green dragon. The magical energy of the room feels drained.";
exports.Green_Dragon = new Core.Challenge(strength_result, precision_result, smarts_result, craft_result, image_loc, description);

},{"../../ui/sprites":53,"../core":46}],38:[function(require,module,exports){
"use strict";
/**
 * Challenge template file. Copy this and change into a new challenge.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Green_Ooze = void 0;
const Core = require("../core");
const sprites_1 = require("../../ui/sprites");
let strength_result = { damage: 1,
    resolution: "Strong pushes to ooze seem to be enough to move ooze far enough so it is no longer a threat. It tickles."
};
let precision_result = { damage: 2,
    resolution: "Shooting ooze into vital spot seemed like good idea, but it just caused it to explode. Luckily you did not use more force than that."
};
let smarts_result = { damage: 3,
    resolution: "The goblin throws magical energy to ooze. Ooze blows up in huge explosion."
};
let craft_result = { damage: 0,
    resolution: "The goblin dug a ditch to direct the ooze into a hole. The ooze is unable to fight against the slope of the ditch."
};
let image_loc = sprites_1.SpriteName.GREEN_OOZE;
let description = "A pool of green ooze sits in the middle of the room. It doesn't seem to be able to hold itself together and move.";
exports.Green_Ooze = new Core.Challenge(strength_result, precision_result, smarts_result, craft_result, image_loc, description);

},{"../../ui/sprites":53,"../core":46}],39:[function(require,module,exports){
"use strict";
/**
 * Challenge template file. Copy this and change into a new challenge.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatinumKeyRoom = exports.GoldenKeyRoom = exports.SilverKeyRoom = exports.BronzeKeyRoom = exports.BrassKeyRoom = exports.CopperKeyRoom = exports.WoodenKeyRoom = void 0;
const Core = require("../core");
const core_1 = require("../core");
const sprites_1 = require("../../ui/sprites");
let unused_result = { damage: 0,
    resolution: "not in use"
};
let wooden_image_loc = sprites_1.SpriteName.KEY_1;
let copper_image_loc = sprites_1.SpriteName.BOX_2;
let brass_image_loc = sprites_1.SpriteName.BOX_3;
let bronze_image_loc = sprites_1.SpriteName.BOX_4;
let silver_image_loc = sprites_1.SpriteName.BOX_5;
let golden_image_loc = sprites_1.SpriteName.BOX_6;
let platinum_image_loc = sprites_1.SpriteName.BOX_7;
let wooden_description = "There's a wooden key sitting on a shelf.";
let copper_description = "There's a wooden box. A copper key can be seen within it.";
let brass_description = "There's a copper box. A brass key can be seen within it.";
let bronze_description = "There's a brass box. A bronze key can be seen within it.";
let silver_description = "There's a bronze box. A silver key can be seen within it.";
let golden_description = "There's a silver box. A golden key can be seen within it.";
let platinum_description = "There's a golden box. A platinum key can be seen within it.";
class KeyRoom extends Core.Challenge {
    constructor(strength_result, precision_result, smarts_result, craft_result, image_location, description, key) {
        super(strength_result, precision_result, smarts_result, craft_result, image_location, description);
        this.KeyName = key;
    }
    getResult(skill) {
        if ((core_1.Keys_Obtained.getKey() + 1) >= this.KeyName.key) {
            core_1.Keys_Obtained.setKey(this.KeyName.key);
            return { damage: 0, resolution: "The goblin was able to obtain the " + this.KeyName.name + " key." };
        }
        return { damage: 0, resolution: "The goblin couldn't obtain the " + this.KeyName.name + " key." };
    }
}
exports.WoodenKeyRoom = new KeyRoom(unused_result, unused_result, unused_result, unused_result, wooden_image_loc, wooden_description, { key: Core.Key.Wood, name: "wooden" });
exports.CopperKeyRoom = new KeyRoom(unused_result, unused_result, unused_result, unused_result, copper_image_loc, copper_description, { key: Core.Key.Copper, name: "copper" });
exports.BrassKeyRoom = new KeyRoom(unused_result, unused_result, unused_result, unused_result, brass_image_loc, brass_description, { key: Core.Key.Brass, name: "brass" });
exports.BronzeKeyRoom = new KeyRoom(unused_result, unused_result, unused_result, unused_result, bronze_image_loc, bronze_description, { key: Core.Key.Bronze, name: "bronze" });
exports.SilverKeyRoom = new KeyRoom(unused_result, unused_result, unused_result, unused_result, silver_image_loc, silver_description, { key: Core.Key.Silver, name: "silver" });
exports.GoldenKeyRoom = new KeyRoom(unused_result, unused_result, unused_result, unused_result, golden_image_loc, golden_description, { key: Core.Key.Gold, name: "golden" });
exports.PlatinumKeyRoom = new KeyRoom(unused_result, unused_result, unused_result, unused_result, platinum_image_loc, platinum_description, { key: Core.Key.Platinum, name: "platinum" });

},{"../../ui/sprites":53,"../core":46}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Purple_Dragon = void 0;
const Core = require("../core");
const sprites_1 = require("../../ui/sprites");
let strength_result = { damage: 10,
    resolution: "The goblin didn't stand a chance against the pure chaos dragon emits. Dragon grabbed the goblin and left to eat it in peace."
};
let precision_result = { damage: 0,
    resolution: "Careful shot land behind the dragon, and dragon thinks there is something significant behind it and leaves."
};
let smarts_result = { damage: 5,
    resolution: "The goblin challenges dragon to duel of wits. Dragon is not amused for losing to a mere goblin and spews chaos energy into the goblin before leaving."
};
let craft_result = { damage: 0,
    resolution: "The goblins shows gadget it has made to the dragon. Pure logical nature of the structure kills this chaotic dragon."
};
let image_loc = sprites_1.SpriteName.PURPLE_DRAGON;
let description = "The party encounters a formidable purple dragon. There's an abundance of chaos energies swirling around the room.";
exports.Purple_Dragon = new Core.Challenge(strength_result, precision_result, smarts_result, craft_result, image_loc, description);

},{"../../ui/sprites":53,"../core":46}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Red_Dragon = void 0;
const Core = require("../core");
const sprites_1 = require("../../ui/sprites");
let strength_result = { damage: 7,
    resolution: "The goblin battles bravely against the dragon and is able to subdue her, but is severely wounded."
};
let precision_result = { damage: 2,
    resolution: "The goblin was able to shoot an arrow into the dragon's weak spot, killing her with only minor wounds."
};
let smarts_result = { damage: 5,
    resolution: "The goblin outsmarted the dragon by having her breathe fire on the weak spot, but suffered moderate wounds from the efforts."
};
let craft_result = { damage: 10,
    resolution: "The goblin was able to collapse the ceiling on the dragon, but was also buried."
};
let image_loc = sprites_1.SpriteName.RED_DRAGON;
let description = "The party encounters a fearsome red dragon. A scale can be seen missing from the dragon's body.";
exports.Red_Dragon = new Core.Challenge(strength_result, precision_result, smarts_result, craft_result, image_loc, description);

},{"../../ui/sprites":53,"../core":46}],42:[function(require,module,exports){
"use strict";
/**
 * Challenge template file. Copy this and change into a new challenge.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Red_Ooze = void 0;
const Core = require("../core");
const sprites_1 = require("../../ui/sprites");
let strength_result = { damage: 0,
    resolution: "The goblin hits ooze with all its might. Ooze vanishes around the room."
};
let precision_result = { damage: 0,
    resolution: "Precise hit into the red oozes beating heart seems to dissolve it immediately."
};
let smarts_result = { damage: 4,
    resolution: "The goblin starts its incantations, but suddenly seems extremely weak, while ooze seems to grow. Any magic seems to feed it. The goblin decides to keep building up magical energy until ooze blows up. The goblin seems really weak after this."
};
let craft_result = { damage: 4,
    resolution: "The goblin approaches ooze carefully with small cage build out of scrap material. When the goblin is close to the ooze, it swallows goblin as a whole. After huge struggle goblin manages to escape and leave ooze inside the cage."
};
let image_loc = sprites_1.SpriteName.RED_OOZE;
let description = "A pool of red ooze sits in the middle of the room, its core close to the surface. There is odd beating sound coming from inside it.";
exports.Red_Ooze = new Core.Challenge(strength_result, precision_result, smarts_result, craft_result, image_loc, description);

},{"../../ui/sprites":53,"../core":46}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Yellow_Dragon = void 0;
const Core = require("../core");
const sprites_1 = require("../../ui/sprites");
let strength_result = { damage: 5,
    resolution: "The goblin utilizes dragons weakness by attacking only from one side. Battle is fierce, but eventually dragon draws its last breath."
};
let precision_result = { damage: 10,
    resolution: "The goblin aims and releases. However, dragons scales are not that easily pierced. The fate of the goblin is sealed. Others decide to move forward while dragon is distracted."
};
let smarts_result = { damage: 7,
    resolution: "The goblin challenged the dragon to a chess match, and won. The dragon was a sore loser. Goblin got badly damaged."
};
let craft_result = { damage: 2,
    resolution: "After initial aggression, the goblin built a splint for the dragon's leg. The dragon left happily."
};
let image_loc = sprites_1.SpriteName.YELLOW_DRAGON;
let description = "The party encounters a terrifying yellow dragon. The dragon seems to be keeping weight off of one leg.";
exports.Yellow_Dragon = new Core.Challenge(strength_result, precision_result, smarts_result, craft_result, image_loc, description);

},{"../../ui/sprites":53,"../core":46}],44:[function(require,module,exports){
"use strict";
/**
 * Challenge template file. Copy this and change into a new challenge.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Yellow_Ooze = void 0;
const Core = require("../core");
const sprites_1 = require("../../ui/sprites");
let strength_result = { damage: 2,
    resolution: "Touching ooze with the weapon seems to backfire as ooze quickly start to move though the weapon it and burns the goblins skin. After much running and hitting, ooze dies."
};
let precision_result = { damage: 3,
    resolution: "Good shot into ooze doesn't seem to do anything. Ooze advances towards the goblin. After much running and screaming, ooze no longer moves."
};
let smarts_result = { damage: 0,
    resolution: "The goblin blasts the ooze with a fire ball, destroying it."
};
let craft_result = { damage: 1,
    resolution: "Goblin starts to close in the Ooze. Ooze spits at goblin burning its skip. The goblin takes from their blanket and throws it over the ooze. Ooze doesn't seem aggressive any more."
};
let image_loc = sprites_1.SpriteName.YELLOW_OOZE;
let description = "A pool of yellow ooze sits in the middle of the room. It seems to resist physical damage.";
exports.Yellow_Ooze = new Core.Challenge(strength_result, precision_result, smarts_result, craft_result, image_loc, description);

},{"../../ui/sprites":53,"../core":46}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tinkerer = exports.Thinker = exports.Ranger = exports.Fighter = exports.Character = void 0;
const core_1 = require("./core");
class Character {
    constructor(skill) {
        this.Skill = skill;
        this.HP = 10;
    }
    setDoom(counter) {
        this.doom_track = counter;
    }
    getDoom() {
        if (this.doom_track == undefined)
            return "Not doomed yet.";
        return this.doom_track + " steps until DOOM!";
    }
    countdownToDoom() {
        if (this.doom_track == undefined)
            return false;
        if (this.doom_track == 0)
            return true;
        --this.doom_track;
        return (this.doom_track == 0);
    }
    loseHP(damage) {
        this.HP -= damage;
    }
    resetCharacter() {
        this.HP = 10;
        this.doom_track = undefined;
    }
}
exports.Character = Character;
exports.Fighter = new Character(core_1.Skill.Strength);
exports.Ranger = new Character(core_1.Skill.Precision);
exports.Thinker = new Character(core_1.Skill.Smarts);
exports.Tinkerer = new Character(core_1.Skill.Craft);

},{"./core":46}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Challenge = exports.Keys_Obtained = exports.Key = exports.Skill = void 0;
// What skills the characters have that can be used to resolve the obstacle
var Skill;
(function (Skill) {
    Skill[Skill["None"] = 0] = "None";
    Skill[Skill["Strength"] = 1] = "Strength";
    Skill[Skill["Precision"] = 2] = "Precision";
    Skill[Skill["Smarts"] = 3] = "Smarts";
    Skill[Skill["Craft"] = 4] = "Craft";
})(Skill = exports.Skill || (exports.Skill = {}));
var Key;
(function (Key) {
    Key[Key["None"] = 0] = "None";
    Key[Key["Wood"] = 1] = "Wood";
    Key[Key["Copper"] = 2] = "Copper";
    Key[Key["Brass"] = 3] = "Brass";
    Key[Key["Bronze"] = 4] = "Bronze";
    Key[Key["Silver"] = 5] = "Silver";
    Key[Key["Gold"] = 6] = "Gold";
    Key[Key["Platinum"] = 7] = "Platinum";
})(Key = exports.Key || (exports.Key = {}));
;
class Keys_Obtained_Class {
    constructor() {
        this.Key = Key.None;
    }
    resetKeys() {
        this.Key = Key.None;
    }
    setKey(new_key) {
        this.Key = new_key;
    }
    getKey() {
        return this.Key;
    }
}
exports.Keys_Obtained = new Keys_Obtained_Class();
class Challenge {
    constructor(strength_result, precision_result, smarts_result, craft_result, image_sprite_name, description) {
        this.strength_result = strength_result;
        this.precision_result = precision_result;
        this.smarts_result = smarts_result;
        this.craft_result = craft_result;
        this.image = image_sprite_name;
        this.description = description;
    }
    getResult(skill) {
        switch (skill) {
            case Skill.Strength:
                return this.strength_result;
            case Skill.Precision:
                return this.precision_result;
            case Skill.Smarts:
                return this.smarts_result;
            case Skill.Craft:
                return this.craft_result;
        }
    }
    getImage() {
        return this.image;
    }
    getDescription() {
        return this.description;
    }
}
exports.Challenge = Challenge;

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearRoom = exports.resolveChallenge = exports.resetCharacters = void 0;
const Characters = require("./character");
const UI = require("../ui/ui_def");
const animation_1 = require("../ui/animation");
const interface_1 = require("../ui/interface");
function resetCharacters() {
    Characters.Fighter.resetCharacter();
    Characters.Ranger.resetCharacter();
    Characters.Thinker.resetCharacter();
    Characters.Tinkerer.resetCharacter();
}
exports.resetCharacters = resetCharacters;
/* Resolve challenge. Gets the challenge resolution based on character's skill, and makes the character lose
 * HP accordingly.
 *
 * character: chosen character for resolving the challenge.
 * challenge: The challenge that needs to be cleared.
 *
 * returns: challenge resolution explanation to be displayed to the player.
 */
function resolveChallenge(character, challenge) {
    let result = challenge.getResult(character.Skill);
    character.loseHP(result.damage);
    return result.resolution;
}
exports.resolveChallenge = resolveChallenge;
/* Lets the player choose the character that clears the room.
 *
 * currentRoom: the challenge of the room that needs to be cleared
 *
 * callback: called with True if room is cleared successfully (there are still party members alive). False if TPK.
 */
function clearRoom(currentRoom, callback) {
    // Todo: names, proper aliveness check
    const characterNames = [
        new interface_1.TextDisplayObject("Thinker", "Choose Thinker", Characters.Thinker.HP <= 0),
        new interface_1.TextDisplayObject("Ranger", "Choose Ranger", Characters.Ranger.HP <= 0),
        new interface_1.TextDisplayObject("Tinkerer", "Choose Tinkerer", Characters.Tinkerer.HP <= 0),
        new interface_1.TextDisplayObject("Fighter", "Choose Fighter", Characters.Fighter.HP <= 0)
    ];
    const characters = [Characters.Thinker, Characters.Ranger, Characters.Tinkerer, Characters.Fighter];
    const chooseText = "Choose your character:";
    const preText = currentRoom.getDescription();
    UI.ui.display(preText, [], undefined, function (ix) {
        UI.ui.display(chooseText, characterNames, undefined, function (ix) {
            let chosenCharacter = characters[ix];
            let resolutionText = resolveChallenge(chosenCharacter, currentRoom);
            let anim = new animation_1.AnimationObject();
            anim.action(ix);
            UI.ui.updateCharacterStatus(characters);
            UI.ui.display(resolutionText, [], anim, function (ix) {
                // TODO: add check if there are still party members alive
                callback(true);
            });
        });
    });
}
exports.clearRoom = clearRoom;

},{"../ui/animation":49,"../ui/interface":52,"../ui/ui_def":57,"./character":45}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGame = void 0;
const ui_def_1 = require("./ui/ui_def");
const sprites_1 = require("./ui/sprites");
const gameplay_1 = require("./mechanics/gameplay");
const core_1 = require("./mechanics/core");
const map = require("./map/rooms");
const rooms_1 = require("./map/rooms");
const interface_1 = require("./ui/interface");
const challenges_1 = require("./mechanics/challenges");
const doomroom_1 = require("./mechanics/challenges/doomroom");
const animation_1 = require("./ui/animation");
const apiportal_1 = require("./api/apiportal");
const character_1 = require("./mechanics/character");
const RUN_DEBUG = true;
let g_votes_given;
let g_startRoom;
let g_currentRoom;
let g_nextRooms;
let g_isMessageAvailable;
let g_currentChallenge;
let g_currentDoor;
let g_messages_on_doors = new Array();
function isMessageAvailable() {
    return g_isMessageAvailable && (character_1.Fighter.HP <= 0 || character_1.Ranger.HP <= 0 || character_1.Thinker.HP <= 0 || character_1.Tinkerer.HP <= 0);
}
function setMessageUsed() {
    g_isMessageAvailable = false;
}
function resetMessageUsed() {
    g_isMessageAvailable = true;
}
function startGame() {
    // TODO add start screen
    // TODO reset other stuff?
    if (RUN_DEBUG) {
        console.log("startGame: start");
    }
    resetMessageUsed();
    map.reset();
    core_1.Keys_Obtained.resetKeys();
    gameplay_1.resetCharacters();
    g_votes_given = 0;
    g_messages_on_doors.length = 0;
    let roomIndex = Math.floor(Math.random() * map.ROOMS.length);
    g_startRoom = map.ROOMS[roomIndex];
    while (g_startRoom.strategy != map.STANDARD) {
        roomIndex = Math.floor(Math.random() * map.ROOMS.length);
        g_startRoom = map.ROOMS[roomIndex];
    }
    console.log("startGame: start " + roomIndex.toString());
    g_currentRoom = g_startRoom;
    g_nextRooms = rooms_1.dropIntoRoom(map.ROOMS[45], g_currentRoom);
    ui_def_1.ui.changeRoom([false, false, false], sprites_1.SpriteName.NO_SPRITE, chooseRoom);
}
exports.startGame = startGame;
const LEFT = 0;
const FRONT = 1;
const RIGHT = 2;
const BACK = 3;
const TEXT = 3;
const CANCEL = 4;
const MAX_TEXT_LENGTH = 25;
function joinMessages(messages) {
    let joined = "";
    for (let i = 0; i < messages.length; i++) {
        joined += messages[i].message + "\n";
    }
    return joined;
}
function chooseRoom() {
    if (RUN_DEBUG) {
        console.log("chooseRoom: start");
    }
    const left = new interface_1.TextDisplayObject("Left", joinMessages(rooms_1.getMessage(g_currentRoom, g_nextRooms.left)), g_nextRooms.left == map.BLOCKED_ROOM);
    const front = new interface_1.TextDisplayObject("Front", joinMessages(rooms_1.getMessage(g_currentRoom, g_nextRooms.front)), g_nextRooms.front == map.BLOCKED_ROOM);
    const right = new interface_1.TextDisplayObject("Right", joinMessages(rooms_1.getMessage(g_currentRoom, g_nextRooms.right)), g_nextRooms.right == map.BLOCKED_ROOM);
    const leave = new interface_1.TextDisplayObject("Leave Message", "", !isMessageAvailable());
    if (left.disable && front.disable && right.disable) {
        gameEnd("The goblins find that their only exit back has been locked. They do not have all the required 7 keys. They will surely starve to death!");
        return;
    }
    ui_def_1.ui.display("Where you want to go", [left, front, right, leave], new animation_1.AnimationObject(), roomSelect);
}
function roomSelect(index) {
    if (RUN_DEBUG) {
        console.log("roomSelect: start");
    }
    if (index == TEXT) {
        ui_def_1.ui.display("Which door you want to leave message", [
            new interface_1.TextDisplayObject("Left", joinMessages(rooms_1.getMessage(g_currentRoom, g_nextRooms.left)), false),
            new interface_1.TextDisplayObject("Front", joinMessages(rooms_1.getMessage(g_currentRoom, g_nextRooms.front)), false),
            new interface_1.TextDisplayObject("Right", joinMessages(rooms_1.getMessage(g_currentRoom, g_nextRooms.right)), false),
            new interface_1.TextDisplayObject("Back", joinMessages(rooms_1.getMessage(g_currentRoom, g_nextRooms.back)), false),
            new interface_1.TextDisplayObject("Cancel", "", false)
        ], new animation_1.AnimationObject(), selectRoomToLeaveNote);
    }
    else {
        // Move to new room
        const nextRoom = index == LEFT ? g_nextRooms.left : index == FRONT ? g_nextRooms.front : g_nextRooms.right;
        const messages = rooms_1.getMessage(g_currentRoom, nextRoom);
        for (let i = 0; i < messages.length; i++) {
            g_messages_on_doors.push(messages[i]);
        }
        g_nextRooms = map.enterRoom(g_currentRoom, nextRoom);
        g_currentRoom = nextRoom;
        enterRoom();
    }
}
function selectRoomToLeaveNote(index) {
    if (RUN_DEBUG) {
        console.log("selectRoomToLeaveNote: start");
    }
    if (index == LEFT)
        g_currentDoor = rooms_1.getDoorId(g_currentRoom, g_nextRooms.left);
    if (index == RIGHT)
        g_currentDoor = rooms_1.getDoorId(g_currentRoom, g_nextRooms.right);
    if (index == FRONT)
        g_currentDoor = rooms_1.getDoorId(g_currentRoom, g_nextRooms.front);
    if (index == BACK)
        g_currentDoor = rooms_1.getDoorId(g_currentRoom, g_nextRooms.back);
    if (index == CANCEL) {
        chooseRoom();
    }
    ui_def_1.ui.inputText("Leave message", "", MAX_TEXT_LENGTH, saveText);
}
function saveText(text) {
    apiportal_1.postNewNote(g_currentDoor, text); // TODO no return value handling, perhaps it went through
    setMessageUsed();
    chooseRoom();
}
function enterRoom() {
    if (RUN_DEBUG) {
        console.log("enterRoom: start");
    }
    // Get status from current room
    const leftOpen = g_nextRooms.left != map.BLOCKED_ROOM;
    const frontOpen = g_nextRooms.front != map.BLOCKED_ROOM;
    const rightOpen = g_nextRooms.right != map.BLOCKED_ROOM;
    let closedRooms = [!leftOpen, !frontOpen, !rightOpen];
    let challengeSprite;
    if (g_currentRoom == g_startRoom) {
        // TODO special handling for start room
        console.log("START ROOM!");
        roomCombatResolved(true);
        challengeSprite = sprites_1.SpriteName.NO_SPRITE;
    }
    else if (map.isRoomCleared(g_currentRoom)) {
        roomCombatResolved(true);
        challengeSprite = sprites_1.SpriteName.NO_SPRITE;
    }
    else if (g_currentRoom.strategy.action == map.RoomAction.NORMAL) {
        console.log("NORMAL ROOM!");
        g_currentChallenge = challenges_1.getRandomChallenge();
        challengeSprite = g_currentChallenge.getImage();
    }
    else if (g_currentRoom.strategy.action == map.RoomAction.REDRUM) {
        g_currentChallenge = doomroom_1.Full_Party_Doom;
        challengeSprite = g_currentChallenge.getImage();
    }
    else if (g_currentRoom.strategy.action == map.RoomAction.KEY1) {
        g_currentChallenge = challenges_1.KeyRooms[0];
        challengeSprite = g_currentChallenge.getImage();
    }
    else if (g_currentRoom.strategy.action == map.RoomAction.KEY2) {
        g_currentChallenge = challenges_1.KeyRooms[1];
        challengeSprite = g_currentChallenge.getImage();
    }
    else if (g_currentRoom.strategy.action == map.RoomAction.KEY3) {
        g_currentChallenge = challenges_1.KeyRooms[2];
        challengeSprite = g_currentChallenge.getImage();
    }
    else if (g_currentRoom.strategy.action == map.RoomAction.KEY4) {
        g_currentChallenge = challenges_1.KeyRooms[3];
        challengeSprite = g_currentChallenge.getImage();
    }
    else if (g_currentRoom.strategy.action == map.RoomAction.KEY5) {
        g_currentChallenge = challenges_1.KeyRooms[4];
        challengeSprite = g_currentChallenge.getImage();
    }
    else if (g_currentRoom.strategy.action == map.RoomAction.KEY6) {
        g_currentChallenge = challenges_1.KeyRooms[5];
        challengeSprite = g_currentChallenge.getImage();
    }
    else if (g_currentRoom.strategy.action == map.RoomAction.KEY7) {
        g_currentChallenge = challenges_1.KeyRooms[6];
        challengeSprite = g_currentChallenge.getImage();
    }
    else {
        // Room combat is normal for also if map.RoomAction.RANDOM
        g_currentChallenge = challenges_1.getRandomChallenge();
        challengeSprite = g_currentChallenge.getImage();
    }
    ui_def_1.ui.changeRoom(closedRooms, challengeSprite, roomCombat);
}
function roomCombat() {
    if (g_currentRoom == g_startRoom) {
        if (core_1.Keys_Obtained.getKey() == core_1.Key.Platinum)
            gameEnd("You escaped the dungeon!");
        else
            roomCombatResolved(true);
    }
    else if (map.isRoomCleared(g_currentRoom)) {
        roomCombatResolved(true);
    }
    else {
        gameplay_1.clearRoom(g_currentChallenge, roomCombatResolved);
    }
}
function roomCombatResolved(aliveCharacters) {
    if (RUN_DEBUG) {
        console.log("roomCombatResolved: start");
    }
    if (!aliveCharacters) {
        console.log("Game end!");
        gameEnd("Your party has fallen.");
    }
    else if (!challenges_1.doomCountdown()) {
        console.log("DOOMED!");
        gameEnd("The curse has claimed the party, killing everyone.");
    }
    else {
        chooseRoom();
    }
}
function voteNotes(index) {
    if (RUN_DEBUG) {
        console.log("voteNotes: start");
    }
    const message = g_messages_on_doors.pop();
    if (index == 0 || index == 1) {
        g_votes_given++;
        if (index == 0) {
            console.log("up vote:", message.message, message.id); // TODO use actual instead
            apiportal_1.upVoteNote(message.id); // TODO no return value handling, perhaps it went through
        }
        if (index == 1) {
            console.log("down vote:", message.message, message.id); // TODO use actual instead
            apiportal_1.downVoteNote(message.id); // TODO no return value handling, perhaps it went through
        }
    }
    if (g_votes_given > 3 || index == 3) {
        startGame();
        return;
    }
    const upVote = new interface_1.TextDisplayObject("Up vote", "Up vote this message so it will be more likely to show up later.", false);
    const downVote = new interface_1.TextDisplayObject("Down vote", "Down vote this message so it will be less likely to show up later.", false);
    const skipVote = new interface_1.TextDisplayObject("Skip vote", "Do not give vote for this message.", false);
    const stopVote = new interface_1.TextDisplayObject("End vote", "Stop voting messages", false);
    ui_def_1.ui.display("\"" + g_messages_on_doors[g_messages_on_doors.length - 1].message + "\"", [upVote, downVote, skipVote, stopVote], undefined, voteNotes);
}
function gameEnd(explanation) {
    if (RUN_DEBUG) {
        console.log("gameEnd: start");
    }
    const vote = new interface_1.TextDisplayObject("Vote on messages on doors", "Your fates are joined with those who come next!", false);
    const try_again = new interface_1.TextDisplayObject("Just try to escape dungeon again?", "Try again.", false);
    ui_def_1.ui.display(explanation, [vote, try_again], undefined, gameEndDecision);
}
function gameEndDecision(index) {
    if (RUN_DEBUG) {
        console.log("gameEndDecision: start");
    }
    if (index == 0) {
        voteNotes(2);
    }
    if (index == 1) {
        startGame();
    }
}

},{"./api/apiportal":29,"./map/rooms":31,"./mechanics/challenges":32,"./mechanics/challenges/doomroom":35,"./mechanics/character":45,"./mechanics/core":46,"./mechanics/gameplay":47,"./ui/animation":49,"./ui/interface":52,"./ui/sprites":53,"./ui/ui_def":57}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationObject = exports.RoomAnimation = exports.Animation = exports.CHARACTER_COUNT = void 0;
exports.CHARACTER_COUNT = 4;
var Animation;
(function (Animation) {
    Animation[Animation["NOTHING"] = 0] = "NOTHING";
    Animation[Animation["IDLE"] = 1] = "IDLE";
    Animation[Animation["DEAD"] = 2] = "DEAD";
    Animation[Animation["ACTION"] = 3] = "ACTION";
    Animation[Animation["DEATH"] = 4] = "DEATH";
})(Animation = exports.Animation || (exports.Animation = {}));
var RoomAnimation;
(function (RoomAnimation) {
    RoomAnimation[RoomAnimation["NONE"] = 0] = "NONE";
    RoomAnimation[RoomAnimation["ROOM_ENTER"] = 1] = "ROOM_ENTER"; // Slide-in
})(RoomAnimation = exports.RoomAnimation || (exports.RoomAnimation = {}));
class AnimationObject {
    constructor() {
        this.enemyAnimation = undefined;
        this.characterAnimations = [];
        for (let i = 0; i < exports.CHARACTER_COUNT; i++) {
            this.characterAnimations.push(Animation.IDLE);
        }
        this.roomAnimation = undefined;
    }
    // Reset actions, except the dead stay dead
    reset() {
        let oldAnims = this.characterAnimations;
        this.characterAnimations = [];
        for (let i = 0; i < exports.CHARACTER_COUNT; i++) {
            // Don't override if dead
            if (oldAnims.length < i || oldAnims[i] != Animation.DEAD) {
                this.characterAnimations.push(Animation.IDLE);
            }
            else {
                this.characterAnimations.push(oldAnims[i]);
            }
        }
        this.enemyAnimation = Animation.IDLE;
    }
    // Make characterIx'th character action mode, keep rest as they are
    action(characterIx) {
        let oldAnims = this.characterAnimations;
        this.characterAnimations = [];
        for (let i = 0; i < exports.CHARACTER_COUNT; i++) {
            // Don't override if dead
            if (characterIx == i && (oldAnims.length < i || oldAnims[i] == Animation.IDLE)) {
                this.characterAnimations.push(Animation.ACTION);
            }
            else if (oldAnims.length < i) {
                this.characterAnimations.push(Animation.IDLE);
            }
            else {
                this.characterAnimations.push(oldAnims[i]);
            }
        }
    }
}
exports.AnimationObject = AnimationObject;

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boxHit = exports.Coord = void 0;
class Coord {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    copy() {
        return new Coord(this.x, this.y);
    }
    add(o) {
        return new Coord(this.x + o.x, this.y + o.y);
    }
    subtract(o) {
        return new Coord(this.x - o.x, this.y - o.y);
    }
    multiply(mp) {
        return new Coord(this.x * mp, this.y * mp);
    }
}
exports.Coord = Coord;
function boxHit(testPos, boxPos, boxSize) {
    return testPos.x >= boxPos.x && testPos.y >= boxPos.y
        && testPos.x < boxPos.x + boxSize.x && testPos.y < boxPos.y + boxSize.y;
}
exports.boxHit = boxHit;

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addListeners = void 0;
const coord_1 = require("./coord");
// Add mouse click listeners (todo: keys)
function addListeners(canvas, ui) {
    canvas.addEventListener("mouseup", function (event) {
        ui.mouseClick(new coord_1.Coord(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop));
    });
    canvas.addEventListener("touchend", function (event) {
        ui.mouseClick(new coord_1.Coord(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop));
    });
    canvas.addEventListener("mousemove", function (event) {
        ui.mouseMove(new coord_1.Coord(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop));
    });
    document.addEventListener("keypress", function (event) {
        ui.key(event.key);
    });
}
exports.addListeners = addListeners;

},{"./coord":50}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextDisplayObject = void 0;
class TextDisplayObject {
    constructor(text, hoverText, disable) {
        this.text = text;
        this.hoverText = hoverText;
        this.disable = disable;
    }
}
exports.TextDisplayObject = TextDisplayObject;

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Drawer = exports.SpriteName = void 0;
const coord_1 = require("./coord");
var SpriteName;
(function (SpriteName) {
    SpriteName[SpriteName["NO_SPRITE"] = 0] = "NO_SPRITE";
    SpriteName[SpriteName["ROOM_BG"] = 1] = "ROOM_BG";
    SpriteName[SpriteName["DOOR_LEFT_OPEN"] = 2] = "DOOR_LEFT_OPEN";
    SpriteName[SpriteName["DOOR_MIDDLE_OPEN"] = 3] = "DOOR_MIDDLE_OPEN";
    SpriteName[SpriteName["DOOR_RIGHT_OPEN"] = 4] = "DOOR_RIGHT_OPEN";
    SpriteName[SpriteName["DOOR_LEFT_CLOSED"] = 5] = "DOOR_LEFT_CLOSED";
    SpriteName[SpriteName["DOOR_MIDDLE_CLOSED"] = 6] = "DOOR_MIDDLE_CLOSED";
    SpriteName[SpriteName["DOOR_RIGHT_CLOSED"] = 7] = "DOOR_RIGHT_CLOSED";
    SpriteName[SpriteName["CHAR_1_BACK"] = 8] = "CHAR_1_BACK";
    SpriteName[SpriteName["CHAR_2_BACK"] = 9] = "CHAR_2_BACK";
    SpriteName[SpriteName["CHAR_3_BACK"] = 10] = "CHAR_3_BACK";
    SpriteName[SpriteName["CHAR_4_BACK"] = 11] = "CHAR_4_BACK";
    SpriteName[SpriteName["CHAR_1_FRONT"] = 12] = "CHAR_1_FRONT";
    SpriteName[SpriteName["CHAR_2_FRONT"] = 13] = "CHAR_2_FRONT";
    SpriteName[SpriteName["CHAR_3_FRONT"] = 14] = "CHAR_3_FRONT";
    SpriteName[SpriteName["CHAR_4_FRONT"] = 15] = "CHAR_4_FRONT";
    SpriteName[SpriteName["CHAR_1_DEAD"] = 16] = "CHAR_1_DEAD";
    SpriteName[SpriteName["CHAR_2_DEAD"] = 17] = "CHAR_2_DEAD";
    SpriteName[SpriteName["CHAR_3_DEAD"] = 18] = "CHAR_3_DEAD";
    SpriteName[SpriteName["CHAR_4_DEAD"] = 19] = "CHAR_4_DEAD";
    SpriteName[SpriteName["HPBAR"] = 20] = "HPBAR";
    SpriteName[SpriteName["ENEMY_QUESTIONABLE"] = 21] = "ENEMY_QUESTIONABLE";
    SpriteName[SpriteName["BLUE_DRAGON"] = 22] = "BLUE_DRAGON";
    SpriteName[SpriteName["GREEN_DRAGON"] = 23] = "GREEN_DRAGON";
    SpriteName[SpriteName["RED_DRAGON"] = 24] = "RED_DRAGON";
    SpriteName[SpriteName["PURPLE_DRAGON"] = 25] = "PURPLE_DRAGON";
    SpriteName[SpriteName["YELLOW_DRAGON"] = 26] = "YELLOW_DRAGON";
    SpriteName[SpriteName["BLUE_OOZE"] = 27] = "BLUE_OOZE";
    SpriteName[SpriteName["GREEN_OOZE"] = 28] = "GREEN_OOZE";
    SpriteName[SpriteName["RED_OOZE"] = 29] = "RED_OOZE";
    SpriteName[SpriteName["YELLOW_OOZE"] = 30] = "YELLOW_OOZE";
    SpriteName[SpriteName["DOOM_ROOM"] = 31] = "DOOM_ROOM";
    SpriteName[SpriteName["BOX_1"] = 32] = "BOX_1";
    SpriteName[SpriteName["BOX_2"] = 33] = "BOX_2";
    SpriteName[SpriteName["BOX_3"] = 34] = "BOX_3";
    SpriteName[SpriteName["BOX_4"] = 35] = "BOX_4";
    SpriteName[SpriteName["BOX_5"] = 36] = "BOX_5";
    SpriteName[SpriteName["BOX_6"] = 37] = "BOX_6";
    SpriteName[SpriteName["BOX_7"] = 38] = "BOX_7";
    SpriteName[SpriteName["KEY_1"] = 39] = "KEY_1";
    SpriteName[SpriteName["KEY_2"] = 40] = "KEY_2";
    SpriteName[SpriteName["KEY_3"] = 41] = "KEY_3";
    SpriteName[SpriteName["KEY_4"] = 42] = "KEY_4";
    SpriteName[SpriteName["KEY_5"] = 43] = "KEY_5";
    SpriteName[SpriteName["KEY_6"] = 44] = "KEY_6";
    SpriteName[SpriteName["KEY_7"] = 45] = "KEY_7";
    SpriteName[SpriteName["GHOST_SPIDER"] = 46] = "GHOST_SPIDER";
})(SpriteName = exports.SpriteName || (exports.SpriteName = {}));
let SPRITE_URLS = [
    "empty.png",
    "room.png",
    "door1_open.png",
    "door2_open.png",
    "door3_open.png",
    "door1_closed.png",
    "door2_closed.png",
    "door3_closed.png",
    "shaman.png",
    "archer.png",
    "tinker.png",
    "fighter_1.png",
    "shaman_hyokkays.png",
    "archer_hyokkays.png",
    "tinker_hyokkays.png",
    "fighter_hyokkays.png",
    "char1_dead.png",
    "char1_dead.png",
    "char1_dead.png",
    "char1_dead.png",
    "hp.png",
    "lohikaarme_generic.png",
    "lohikaarme_blue.png",
    "lohikaarme_green.png",
    "lohikaarme_red.png",
    "lohikaarme_purple.png",
    "lohikaarme_yellow.png",
    "ooze_blue.png",
    "ooze_green.png",
    "ooze_red.png",
    "ooze_yellow.png",
    "kuolemanhuone.png",
    "kaappi_ja_varjot1.png",
    "kaappi_ja_varjot2.png",
    "kaappi_ja_varjot3.png",
    "kaappi_ja_varjot4.png",
    "kaappi_ja_varjot5.png",
    "kaappi_ja_varjot6.png",
    "kaappi_ja_varjot7.png",
    "avain1.png",
    "avain2.png",
    "avain3.png",
    "avain4.png",
    "avain5.png",
    "avain6.png",
    "avain7.png",
    "hamahakki_generic.png"
];
class Drawer {
    constructor() {
        this.sprites = [];
        this.spritesLoaded = 0;
        for (let i = 0; i < SPRITE_URLS.length; i++) {
            let sprite = new Image();
            let me = this;
            sprite.src = "images/" + SPRITE_URLS[i];
            sprite.onload = function () {
                me.spritesLoaded++;
            };
            this.sprites.push(sprite);
        }
    }
    /**
     * Return whether all sprites have been loaded.
     */
    allSpritesLoaded() {
        return this.spritesLoaded == SPRITE_URLS.length;
    }
    // Get scale which fits sprite to specified box
    fitSpriteToBox(spriteName, boxSize) {
        const image = this.sprites[spriteName];
        let imageSize = new coord_1.Coord(image.width, image.height);
        let ratio = new coord_1.Coord(boxSize.x / imageSize.x, boxSize.y / imageSize.y);
        if (ratio.x < ratio.y) {
            return new coord_1.Coord(ratio.x, ratio.x);
        }
        else {
            return new coord_1.Coord(ratio.y, ratio.y);
        }
    }
    getSpriteSize(spriteName, scale) {
        scale = scale || 1;
        let image = this.sprites[spriteName];
        let imageSize = new coord_1.Coord(image.width, image.height);
        return imageSize.multiply(scale);
    }
    drawSprite(context, spriteName, position, scale) {
        // Skip if sprite images don't exist
        if (!this.allSpritesLoaded()) {
            return;
        }
        let image = this.sprites[spriteName];
        let imageSize = new coord_1.Coord(image.width, image.height);
        context.drawImage(image, position.x, position.y, scale.x * imageSize.x, scale.y * imageSize.y);
    }
    drawSpriteHorizontalClipped(context, spriteName, position, scale, clipXRatio) {
        // Skip if sprite images don't exist
        if (!this.allSpritesLoaded()) {
            return;
        }
        let image = this.sprites[spriteName];
        let imageSize = new coord_1.Coord(image.width, image.height);
        context.drawImage(image, 0, 0, clipXRatio * imageSize.x, imageSize.y, position.x, position.y, scale.x * imageSize.x * clipXRatio, scale.y * imageSize.y);
    }
}
exports.Drawer = Drawer;

},{"./coord":50}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextBox = exports.TEXTBOX_VERT_RATIO = exports.BASE_TEXTBOX_HEIGHT = void 0;
const coord_1 = require("./coord");
const ui_def_1 = require("./ui_def");
const BASE_CHOICE_SIZE = 60;
exports.BASE_TEXTBOX_HEIGHT = 300;
exports.TEXTBOX_VERT_RATIO = 0.2;
const BASE_CHOICE_OFFSET = new coord_1.Coord(0, 80);
const BASE_MARGIN = new coord_1.Coord(100, 100);
function drawMultiline(context, text, pos, maxWidth, lineHeight) {
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        pos.y += wrapTextBlock(context, lines[i], pos.copy(), maxWidth, lineHeight);
    }
    function wrapTextBlock(context, text, pos, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = context.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, pos.x, pos.y);
                line = words[n] + ' ';
                pos.y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        context.fillText(line, pos.x, pos.y);
        return pos.y + lineHeight;
    }
}
class TextBox {
    constructor() {
        // Temp
        this.position = new coord_1.Coord(0, 500);
        this.choiceOffset = new coord_1.Coord(0, 50);
        this.currentText = "";
        this.currentChoices = [];
        this.hoverChoice = -1;
        this.margin = new coord_1.Coord(50, 50);
        this.choiceSize = new coord_1.Coord(50, 50);
        this.size = new coord_1.Coord(0, 0);
    }
    newText(text, choices) {
        this.currentText = text;
        this.currentChoices = choices;
    }
    draw(context, pos, scale, bgSize) {
        this.choiceSize.x = bgSize.x * 0.5;
        this.choiceSize.y = BASE_CHOICE_SIZE * scale.y;
        this.position.x = pos.x;
        this.position.y = pos.y + bgSize.y * (1 - exports.TEXTBOX_VERT_RATIO);
        this.size.x = bgSize.x;
        this.size.y = exports.BASE_TEXTBOX_HEIGHT * (bgSize.y / 0.8);
        this.choiceOffset = BASE_CHOICE_OFFSET.multiply(scale.x);
        this.margin = BASE_MARGIN.multiply(scale.x);
        // Temp text box draws
        let text = this.currentText;
        let choices = [];
        for (let i = 0; i < this.currentChoices.length; i++) {
            choices.push(this.currentChoices[i]);
        }
        context.globalAlpha = 0.8;
        context.fillStyle = "#111";
        context.fillRect(this.position.x, this.position.y, this.size.x, 10 * scale.y);
        context.fillStyle = "#aaa";
        context.fillRect(this.position.x, this.position.y + 10 * scale.y, this.size.x, this.size.y);
        context.globalAlpha = 1;
        const fontSize = Math.floor(50 * scale.x);
        context.font = fontSize + "px mainFont";
        context.fillStyle = "#333";
        let mainPos = new coord_1.Coord(this.position.x + this.margin.x, this.position.y + this.margin.y);
        drawMultiline(context, text, mainPos, this.size.x - this.margin.x * 2, fontSize);
        const boxHeight = this.choiceSize.y;
        let choicesOffset = this.choiceOffset.copy();
        for (let i = 0; i < this.currentChoices.length; i++) {
            context.fillStyle = "#ccc";
            if (this.hoverChoice == i) {
                context.fillStyle = "#fff";
            }
            let thisTextPos = this.getChoicePos(i);
            context.fillRect(thisTextPos.x, thisTextPos.y, this.choiceSize.x, boxHeight);
            context.fillStyle = this.currentChoices[i].disable ? "#999" : "#000";
            context.fillText(this.currentChoices[i].text, thisTextPos.x + 3, thisTextPos.y + this.choiceSize.y - 3);
            choicesOffset.add(this.choiceOffset);
        }
        if (this.hoverChoice != -1 && this.currentChoices.length > this.hoverChoice
            && !this.currentChoices[this.hoverChoice].disable) {
            let hoverText = this.currentChoices[this.hoverChoice].hoverText;
            context.font = fontSize + "px mainFont";
            context.fillStyle = "#333";
            let tpos = new coord_1.Coord(this.position.x + this.margin.x * 2 + this.size.x * 0.5, this.position.y + this.margin.y);
            drawMultiline(context, hoverText, tpos, this.size.x * 0.5 - this.margin.x * 4, fontSize);
        }
    }
    getPosition() {
        return this.position.copy();
    }
    getChoicePos(ix) {
        let pos = this.position.add(this.choiceOffset).add(this.margin).add(this.choiceOffset.multiply(ix));
        pos.y -= this.choiceSize.y;
        return pos;
    }
    getHoverChoice(coords) {
        for (let i = 0; i < this.currentChoices.length; i++) {
            if (this.currentChoices[i].disable) {
                continue;
            }
            let pos = this.getChoicePos(i);
            if (coord_1.boxHit(coords, pos, this.choiceSize)) {
                return i;
            }
        }
        return -1;
    }
    defaultHover() {
        return this.inputMode == ui_def_1.InputMode.INPUT_MOUSE ? -1 : 0;
    }
    setInputMode(mode) {
        this.inputMode = mode;
        if (mode == ui_def_1.InputMode.INPUT_MOUSE) {
            this.hoverChoice = -1;
        }
        else {
            this.hoverChoice = 0;
        }
    }
    mouseClick(coords) {
        if (this.currentChoices.length == 0) {
            return coord_1.boxHit(coords, this.position, this.choiceSize.multiply(100)) ? 0 : -1;
        }
        let hoverChoice = this.getHoverChoice(coords);
        this.hoverChoice = this.defaultHover();
        return hoverChoice;
    }
    mouseMove(coords) {
        this.hoverChoice = this.getHoverChoice(coords);
    }
    enter() {
        let choice = this.hoverChoice;
        if (this.currentChoices.length == 0) {
            choice = 0;
        }
        this.hoverChoice = this.defaultHover();
        return choice;
    }
    key(kc) {
        if (kc == "Enter") {
            return this.enter();
        }
        let hoverChoice = this.hoverChoice;
        if (kc == 'w') {
            hoverChoice--;
        }
        else if (kc == 's') {
            hoverChoice++;
        }
        if (hoverChoice < 0) {
            hoverChoice = 0;
        }
        else if (hoverChoice >= this.currentChoices.length) {
            hoverChoice = this.currentChoices.length - 1;
        }
        this.hoverChoice = hoverChoice;
        return -1;
    }
}
exports.TextBox = TextBox;

},{"./coord":50,"./ui_def":57}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInput = void 0;
const coord_1 = require("./coord");
class TextInput {
    constructor(baseText, maxLen) {
        this.maxLen = maxLen;
        this.box = document.createElement("Input");
        this.box.style.fontSize = "30px";
        this.box.maxLength = maxLen;
        this.box.value = baseText;
        this.box.style.border = "5px solid #111";
        this.box.style.background = "#999";
        this.box.style.color = "#881104";
        this.box.style.display = "none";
        this.box.style.padding = "15px";
        this.box.style.fontFamily = "bloodFont";
        document.body.appendChild(this.box);
    }
    getText() {
        return this.box.value;
    }
    delete() {
        document.body.removeChild(this.box);
    }
    position(bgPos, bgSize) {
        let size = new coord_1.Coord(bgSize.x / 2, 50);
        let pos = bgPos.add(bgSize.subtract(size).multiply(0.5));
        this.box.style.display = "inline";
        this.box.style.position = "absolute";
        this.box.style.left = pos.x + "px";
        this.box.style.top = pos.y + "px";
        this.box.style.width = size.x + "px";
        this.box.style.height = size.y + "px";
    }
}
exports.TextInput = TextInput;

},{"./coord":50}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInterface = exports.Screen = void 0;
const sprites_1 = require("./sprites");
const coord_1 = require("./coord");
const animation_1 = require("./animation");
const textbox_1 = require("./textbox");
const textinput_1 = require("./textinput");
const Characters = require("../mechanics/character");
const ui_def_1 = require("./ui_def");
var Screen;
(function (Screen) {
    Screen[Screen["ROOM"] = 0] = "ROOM";
    Screen[Screen["DEATH"] = 1] = "DEATH";
    Screen[Screen["MAINMENU"] = 2] = "MAINMENU";
})(Screen = exports.Screen || (exports.Screen = {}));
const ROOM_ENTER_DURATION = 1000;
const BASE_UI_HEIGHT = 1000;
const FLASH_DURATION = 300;
const characters = [Characters.Thinker, Characters.Ranger, Characters.Tinkerer, Characters.Fighter];
const MAXHP = 10;
class UserInterface {
    constructor() {
        this.drawer = new sprites_1.Drawer();
        this.screen = Screen.ROOM;
        this.doorsOpen = [true, true, true];
        this.animation = new animation_1.AnimationObject();
        this.enemySprite = sprites_1.SpriteName.ENEMY_QUESTIONABLE;
        this.textBox = new textbox_1.TextBox();
        this.textInput = undefined;
        this.roomCallback = function () { };
        this.actionCallback = function (choiceIndex) {
            console.log("Chose " + choiceIndex);
        };
        this.hps = [];
        for (let i = 0; i < animation_1.CHARACTER_COUNT; i++) {
            this.hps.push(MAXHP);
        }
        this.wallColor = "#333";
        this.inputMode = ui_def_1.InputMode.INPUT_MOUSE;
        this.wasAction = false;
    }
    /**
     * Display information on UI until user input or another call to display.
     * Callback on user input.
     * @param text Text to display in the text box.
     * @param choices Available choices for player. If empty, choices box is not drawn
     *                and any input is accepted as "proceed".
     * @param anim  AnimationObject with animation data. See struct details for options. If none, keep previous.
     * @param callback Will call this function on user input with the index of the selected choice
     *                 or 0 if no choices supplied.
     */
    display(text, choices, anim, callback) {
        if (anim) {
            if (anim.enemyAnimation) {
                this.animation.enemyAnimation = anim.enemyAnimation;
            }
            this.animation.roomAnimation = anim.roomAnimation;
            this.animation.characterAnimations = anim.characterAnimations;
        }
        this.actionCallback = callback;
        this.textBox.newText(text, choices);
        this.displaySet = Date.now();
        this.animation.roomAnimation = animation_1.RoomAnimation.NONE;
        this.wasAction = false;
        for (let i = 0; i < this.animation.characterAnimations.length; i++) {
            if (this.animation.characterAnimations[i] == animation_1.Animation.ACTION) {
                this.wasAction = true;
            }
        }
    }
    /**
     * Enter a new room. If rooms should be of consistent but different visuals, add an argument here.
     * (If they can re-randomize with no gameplay effects, it can be randomized here.)
     * @param doorsOpen Array of length 3 (left-middle-right), True if open door, false if not
     * @param enemySprite Enemy sprite to display
     * @param callback Called when enter-room-animation is finished
     */
    changeRoom(doorsOpen, enemySprite, callback) {
        this.doorsOpenOld = this.doorsOpen;
        this.enemySpriteOld = this.enemySprite;
        this.wallColorOld = this.wallColor;
        this.screen = Screen.ROOM;
        if (this.animation) {
            this.animation.roomAnimation = animation_1.RoomAnimation.ROOM_ENTER;
        }
        this.animation.reset();
        this.displaySet = Date.now();
        this.doorsOpen = doorsOpen;
        this.enemySprite = enemySprite;
        this.roomCallback = callback;
        this.wallColor = this.randomWallColor();
        this.wasAction = false;
    }
    /**
     * Ask user for text input.
     * @param prompt Leading text to ask for input
     * @param baseText Base text inside input box, can be erased
     * @param maxLen Maximum input character count
     * @param callback Called with the input text when finished
     */
    inputText(prompt, baseText, maxLen, callback) {
        if (this.textInput) {
            this.textInput.delete();
        }
        this.textInput = new textinput_1.TextInput(baseText, maxLen);
        this.textCallback = callback;
        this.textBox.newText(prompt, []);
    }
    updateCharacterStatus(chars) {
        // Todo
    }
    update() {
        if (this.animation.roomAnimation != animation_1.RoomAnimation.NONE) {
            if (this.animationElapsed(ROOM_ENTER_DURATION) == 1) {
                this.animation.roomAnimation = animation_1.RoomAnimation.NONE;
                this.roomCallback();
            }
        }
        if (this.wasAction && this.animationElapsed(FLASH_DURATION) == 1) {
            this.animation.enemyAnimation = animation_1.Animation.DEAD;
            this.wasAction = false;
        }
        const delta = 0.4;
        for (let i = 0; i < animation_1.CHARACTER_COUNT; i++) {
            if (Math.abs(this.hps[i] - characters[i].HP) < delta) {
                this.hps[i] = characters[i].HP;
            }
            else if (this.hps[i] < characters[i].HP - delta * 0.5) {
                this.hps[i] += delta;
            }
            else if (this.hps[i] > characters[i].HP + delta * 0.5) {
                this.hps[i] -= delta;
            }
            if (this.hps[i] < delta) {
                this.animation.characterAnimations[i] = animation_1.Animation.DEAD;
            }
        }
    }
    /**
     * Draw user interface.
     * @param context The rendering context object
     * @param canvasSize Canvas size for scaling
     */
    draw(context, canvasSize) {
        if (this.screen == Screen.ROOM) {
            this.drawRoom(context, canvasSize);
        }
    }
    animationElapsed(fullDuration) {
        const elapsed = Date.now() - this.displaySet;
        let animTime = elapsed / fullDuration;
        if (animTime < 0) {
            animTime = 0;
        }
        if (animTime > 1) {
            animTime = 1;
        }
        return animTime;
    }
    randomWallColor() {
        const randB = 100 + Math.floor(Math.random() * 100);
        const randG = randB - Math.floor(Math.random() * 50);
        const randR = randB - Math.floor(Math.random() * 50);
        return "rgb(" + randR + "," + randG + "," + randB + ")";
    }
    getBgPosition(canvasSize) {
        const topRectSize = new coord_1.Coord(canvasSize.x, canvasSize.y * (1 - textbox_1.TEXTBOX_VERT_RATIO));
        let scale = this.drawer.fitSpriteToBox(sprites_1.SpriteName.ROOM_BG, topRectSize);
        const bgSize = this.drawer.getSpriteSize(sprites_1.SpriteName.ROOM_BG, scale.x);
        const pos = new coord_1.Coord((canvasSize.x - bgSize.x) * 0.5, 0);
        return { pos: pos, scale: scale, bgSize: bgSize };
    }
    // Draw room background (Walls and doors)
    drawRoomBackground(context, canvasSize, color, doorsOpen) {
        // background
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvasSize.x, canvasSize.y);
        context.fillStyle = color;
        const posScale = this.getBgPosition(canvasSize);
        const pos = posScale.pos;
        const scale = posScale.scale;
        const bgSize = posScale.bgSize;
        context.fillRect(pos.x, pos.y, bgSize.x, bgSize.y);
        this.drawer.drawSprite(context, sprites_1.SpriteName.ROOM_BG, pos, scale);
        for (let i = 0; i < this.doorsOpen.length; i++) {
            const spriteName = sprites_1.SpriteName.DOOR_LEFT_OPEN + i + Number(doorsOpen[i]) * 3;
            this.drawer.drawSprite(context, spriteName, pos, scale);
        }
    }
    // Draw player characters idle
    drawCharacterBacks(context, canvasSize) {
        const posScale = this.getBgPosition(canvasSize);
        const scale = posScale.scale.x;
        let offsetY = posScale.pos.y + posScale.bgSize.y;
        let defaultStart = posScale.pos.x + 50 * scale;
        let elapsed = this.animationElapsed(ROOM_ENTER_DURATION);
        let offset = new coord_1.Coord(defaultStart, offsetY);
        if (this.animation.roomAnimation == animation_1.RoomAnimation.ROOM_ENTER) {
            if (elapsed < 0.25) {
                offset = new coord_1.Coord(defaultStart + (this.animationElapsed(ROOM_ENTER_DURATION) * 3800) * scale, offsetY);
            }
            else {
                offset = new coord_1.Coord(defaultStart - (750 -
                    750 * this.animationElapsed(ROOM_ENTER_DURATION)) * scale, offsetY);
            }
        }
        for (let i = 0; i < animation_1.CHARACTER_COUNT; i++) {
            let state = this.animation.characterAnimations.length > i ?
                this.animation.characterAnimations[i] : animation_1.Animation.IDLE;
            let pos = new coord_1.Coord((i * 330 + 100) * posScale.scale.x, posScale.bgSize.y - 500 * scale).add(offset);
            pos.y -= this.drawer.getSpriteSize(sprites_1.SpriteName.CHAR_1_BACK + i, scale).y;
            if (state == animation_1.Animation.IDLE) {
                const frame = state == animation_1.Animation.IDLE ? 0 : 2;
                this.drawer.drawSprite(context, sprites_1.SpriteName.CHAR_1_BACK + animation_1.CHARACTER_COUNT * frame + i, posScale.pos.add(new coord_1.Coord(0, 200 * scale)), posScale.scale);
                this.drawHP(context, i, pos, posScale.scale.x);
            }
            else if (state == animation_1.Animation.ACTION) {
                pos.y += 200 * scale;
                this.drawHP(context, i, pos, posScale.scale.x);
            }
        }
    }
    drawHP(context, ix, pos, scale) {
        if (this.animation.roomAnimation != animation_1.RoomAnimation.NONE
            || this.hps[ix] <= 0) {
            return;
        }
        this.drawer.drawSpriteHorizontalClipped(context, sprites_1.SpriteName.HPBAR, pos, new coord_1.Coord(scale * 0.5, scale * 0.5), this.hps[ix] / MAXHP);
    }
    drawFront(context, canvasSize, useOld) {
        let enemySprite = useOld ? this.enemySpriteOld : this.enemySprite;
        const posScale = this.getBgPosition(canvasSize);
        let time = Date.now();
        let isAction = false;
        for (let i = 0; i < this.animation.characterAnimations.length; i++) {
            if (this.animation.characterAnimations[i] == animation_1.Animation.ACTION &&
                time - this.displaySet < FLASH_DURATION) {
                isAction = true;
                break;
            }
        }
        const pos = posScale.pos;
        const scale = posScale.scale;
        if (this.animation.enemyAnimation != animation_1.Animation.DEAD && !useOld) {
            if (!isAction || Math.floor(time / 20) % 2 == 0) {
                this.drawer.drawSprite(context, enemySprite, pos, scale);
            }
        }
        for (let i = 0; i < animation_1.CHARACTER_COUNT; i++) {
            let state = this.animation.characterAnimations.length > i ?
                this.animation.characterAnimations[i] : animation_1.Animation.IDLE;
            if (state == animation_1.Animation.ACTION) {
                const spriteName = sprites_1.SpriteName.CHAR_1_FRONT + i;
                if (!isAction || Math.floor(time / 20) % 2 == 0) {
                    const sprPos = posScale.pos.add(new coord_1.Coord(0, 200 * scale.x));
                    this.drawer.drawSprite(context, spriteName, sprPos, scale);
                }
            }
        }
    }
    // Draw room screen
    drawRoom(context, canvasSize) {
        let elapsed = this.animationElapsed(ROOM_ENTER_DURATION);
        const useOld = this.animation.roomAnimation == animation_1.RoomAnimation.ROOM_ENTER && elapsed < 0.25;
        this.drawRoomBackground(context, canvasSize, useOld ? this.wallColorOld : this.wallColor, useOld ? this.doorsOpenOld : this.doorsOpen);
        this.drawFront(context, canvasSize, useOld);
        this.drawCharacterBacks(context, canvasSize);
        const bgPos = this.getBgPosition(canvasSize);
        // Draw black fade
        if (this.animation.roomAnimation == animation_1.RoomAnimation.ROOM_ENTER) {
            if (elapsed < 0.5) {
                context.fillStyle = "#000";
                context.globalAlpha = Math.sin(elapsed * 2 * Math.PI);
                context.fillRect(bgPos.pos.x, bgPos.pos.y, bgPos.bgSize.x, bgPos.bgSize.y);
                context.globalAlpha = 1;
            }
        }
        this.textBox.draw(context, bgPos.pos, bgPos.scale, bgPos.bgSize);
        if (this.textInput) {
            this.textInput.position(bgPos.pos, bgPos.bgSize);
        }
    }
    action(actionCode) {
        if (actionCode != -1 && this.textCallback && this.textInput) {
            this.textCallback(this.textInput.getText());
            this.textCallback = undefined;
            this.textInput.delete();
            this.textInput = undefined;
        }
        else if (actionCode != -1 && this.actionCallback) {
            let callback = this.actionCallback;
            this.actionCallback = undefined;
            callback(actionCode);
        }
    }
    mouseClick(coords) {
        if (this.inputMode == ui_def_1.InputMode.INPUT_MOUSE) {
            let res = this.textBox.mouseClick(coords);
            this.action(res);
        }
        else {
            this.inputMode = ui_def_1.InputMode.INPUT_MOUSE;
            this.textBox.setInputMode(this.inputMode);
        }
    }
    mouseMove(coords) {
        if (this.inputMode == ui_def_1.InputMode.INPUT_MOUSE) {
            this.textBox.mouseMove(coords);
        }
    }
    key(kc) {
        if (this.inputMode == ui_def_1.InputMode.INPUT_KB || (this.textInput && kc == "Enter")) {
            let res = this.textBox.key(kc);
            this.action(res);
        }
        else if (!this.textInput) {
            this.inputMode = ui_def_1.InputMode.INPUT_KB;
            this.textBox.setInputMode(this.inputMode);
        }
    }
}
exports.UserInterface = UserInterface;

},{"../mechanics/character":45,"./animation":49,"./coord":50,"./sprites":53,"./textbox":54,"./textinput":55,"./ui_def":57}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ui = exports.InputMode = void 0;
const ui_1 = require("./ui");
// Game input, textinput is separate
var InputMode;
(function (InputMode) {
    InputMode[InputMode["INPUT_MOUSE"] = 0] = "INPUT_MOUSE";
    InputMode[InputMode["INPUT_KB"] = 1] = "INPUT_KB";
})(InputMode = exports.InputMode || (exports.InputMode = {}));
exports.ui = new ui_1.UserInterface();

},{"./ui":56}],58:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[30]);

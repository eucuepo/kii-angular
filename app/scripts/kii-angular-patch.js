(function(window, undef){

  var angular = window.angular;
  var q = window.Q;

  //-------------------------------------
  // Structured object of what we need to update
  //-------------------------------------

  var methodsToUpdate = {
    "KiiACL":{
      prototype: [],
      static: []
    },
    "KiiACLEntry":{
      prototype: [],
      static: []
    },
    "KiiAnonymousUser":{
      prototype: [],
      static: []
    },
    "KiiAnyAuthenticatedUser":{
      prototype: [],
      static: []
    },
    "KiiAppAdminContext":{
      prototype: [],
      static: []
    },
    "KiiBucket":{
      prototype: [],
      static: []
    },
    "KiiClause":{
      prototype: [],
      static: []
    },
    "KiiGeoPoint":{
      prototype: [],
      static: []
    },
    "KiiGroup":{
      prototype: [],
      static: []
    },
    "KiiObject":{
      prototype: [],
      static: []
    },
    "KiiQuery":{
      prototype: [],
      static: []
    },
    "KiiSocialConnect":{
      prototype: [],
      static: []
    },
    "KiiUser": {
      prototype: ['register','update'],
      static: ['userWithUsername']
    }
  }

  /**
  Get parameter names
  **/
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var ARGUMENT_NAMES = /([^\s,]+)/g;
  function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '')
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
    if(result === null)
       result = []
    return result
  }


  function overrideMethods(qlib,Kii,methodsToUpdate) {
    
    // Let's loop over Kii objects
    for (var k in methodsToUpdate) {

      var currentClass = k;
      var currentObject = methodsToUpdate[k];

      var currentProtoMethods = currentObject.prototype;
      var currentStaticMethods = currentObject.static;


      /// Patching prototypes
      currentProtoMethods.forEach(function(method){

        var origMethod = Kii[currentClass].prototype[method];

        // Overwrite original function by wrapping it with $q
        Kii[currentClass].prototype[method+'Async'] = function() {
          var defer = qlib.defer();
          var newArgs = [];
          var params = getParamNames(origMethod);
          var argsArray = Array.prototype.slice.call(arguments);
          // tracks argsArray index
          var paramIndex = 0;
          for(var i=0; i<params.length; i++){
            // Intercept callback parameter and patch it with promises
            // We are fine as long as the argument is called 'callbacks'
            if(params[i] == "callbacks"){
              newArgs[i] = {
                success: function(data) {
                    // resolve data
                    defer.resolve(data);
                },
                failure: function(error, errorMessage) {
                    // return error response
                    defer.reject(error, errorMessage);
                }
              }
            } else {
              // no callbacks, put parameter as is
              newArgs[i] = argsArray[paramIndex];
              paramIndex++;
            }
          }
          // apply original methods
          origMethod.apply(this, newArgs)

          return defer.promise; 
        };

      });
    }
  }
  
  // Process only if Kii exist on the global window, do nothing otherwise
  if (window.KiiUser != undef){
    
    // wrap on global object
    var Kii = {
      KiiACL: window.KiiACL,
      KiiACLEntry: window.KiiACLEntry,
      KiiAnonymousUser: window.KiiAnonymousUser,
      KiiAnyAuthenticatedUser: window.KiiAnyAuthenticatedUser,
      KiiAppAdminContext: window.KiiAppAdminContext,
      KiiBucket: window.KiiBucket,
      KiiClause: window.KiiClause,
      KiiGeoPoint: window.KiiGeoPoint,
      KiiGroup: window.KiiGroup,
      KiiObject: window.KiiObject,
      KiiQuery: window.KiiQuery,
      KiiSocialConnect: window.KiiSocialConnect,
      KiiUser: window.KiiUser
    }

    // angular is present, bootstrap module
    if (angular !== undef) {
      var module = angular.module('kii-angular', []);
      module.run(['$q', '$window', function($q, $window) {
        var KiiAngular = {
          KiiACL: window.KiiACL,
          KiiACLEntry: window.KiiACLEntry,
          KiiAnonymousUser: window.KiiAnonymousUser,
          KiiAnyAuthenticatedUser: window.KiiAnyAuthenticatedUser,
          KiiAppAdminContext: window.KiiAppAdminContext,
          KiiBucket: window.KiiBucket,
          KiiClause: window.KiiClause,
          KiiGeoPoint: window.KiiGeoPoint,
          KiiGroup: window.KiiGroup,
          KiiObject: window.KiiObject,
          KiiQuery: window.KiiQuery,
          KiiSocialConnect: window.KiiSocialConnect,
          KiiUser: $window.KiiUser
        }
        overrideMethods($q,KiiAngular,methodsToUpdate);
      }]);
    } else if (q !== undef) {
      // Q is present, use Q
      overrideMethods(q,Kii,methodsToUpdate);
    }
  }
})(this);
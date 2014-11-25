angular.module('KiiServices', [])
.factory('KiiSDK', function() {

  Kii.initializeWithSite("b1a880b6", "e3f8c4af340176620df9b7f517920646", KiiSite.US);

});
'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope',function($scope) {

  $scope.createUser = function(username, password){
    var user = KiiUser.userWithUsername(username, password);
    // register(callbacks) converted to registerAsync().then...
    user.registerAsync().then(
      function(data) {
        alert('You created a new user:' + JSON.stringify(data));
        $scope.currentUser = data;
      },
      function(error,errorString) {
        alert('Error' + JSON.stringify(error)+ 'Errorstring'+JSON.stringify(errorString));
      }
    );
  }

  $scope.update = function(username,displayname){
    var user = $scope.currentUser;
    var identityData = { "username": username };
    var userFields = { "displayName":displayname };
    var removeFields = [];
    // update(identityData,userFields,callbacks, removeFields) converted to 
    // updateAsync(identityData,userFields,removeFields).then...
    user.updateAsync(identityData,userFields,removeFields).then(
      function(data) {
        alert('You updated a user' + JSON.stringify(data));
      },
      function(error,errorString) {
        alert('Error' + JSON.stringify(error)+ 'Errorstring'+JSON.stringify(errorString));
      }
    );
  }

}]);
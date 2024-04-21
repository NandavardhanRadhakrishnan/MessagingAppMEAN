myApp = angular.module("myApp",["ngRoute"]);

// TODO login path not working need to add .html at end, also page doesnt refresh automatically when routing need to refresh manually

myApp.config(function($routeProvider,$locationProvider){
    $routeProvider
    .when('/chat',{
        templateUrl: "chat.html",
        controller: "chatCtrl",
        resolve:{
            auth:function($location,AuthService){
                if(!AuthService.isAuthenticated()){
                    $location.path('/login');
                }
            }
        }
    })
    .when('/login',{
        templateUrl: "login.html",
        controller: "loginCtrl",
    })
    .when('/register',{
        templateUrl: "register.html",
        controller: "registerCtrl"
    })
    .otherwise({
        redirectTo:'/login'
    });

    $locationProvider.html5Mode(true);
});

// myApp.config(function($routeProvider){
//     $routeProvider
//     .when('/chat',{
//         templateUrl: 'chat.html',
//         controller:'loginCtrl'
//     })
    
//     .when('/login',{
//         templateUrl:'login.html',
//         controller:'loginCtrl'
//     })
//     .otherwise({redirectTo:'/login'});
// })


myApp.service('AuthService',function($http, $q, $window){

    this.login = function(username, password) {
        var deferred = $q.defer();
        $http.post('/api/login', { username: username, password: password })
          .then(function(response) {
            // Set current user and token in localStorage
            $window.localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            $window.localStorage.setItem('token', response.data.token);
            deferred.resolve(response.data.user);
          })
          .catch(function(error) {
            deferred.reject(error);
          });
        return deferred.promise;
      };
  
      this.logout = function() {
        // Clear current user and token from localStorage
        $window.localStorage.removeItem('currentUser');
        $window.localStorage.removeItem('token');
      };
  
      this.isAuthenticated = function() {
        // Check if token exists in localStorage
        return !!$window.localStorage.getItem('token');
      };
  
      this.getCurrentUser = function() {
        // Retrieve current user from localStorage
        return JSON.parse($window.localStorage.getItem('currentUser'));
      };
});

// TODO make it dynamically update when messages (mongodb) changes

myApp.controller('chatCtrl',function($scope,$http,AuthService){
    $scope.users=[
        {name:"def",avatar:"https://source.unsplash.com/random/200x200?sig=1"},
    ];
    for(var i=2;i<21;i++){
        $scope.users.push({name:`User ${i}`,avatar:`https://source.unsplash.com/random/200x200?sig=${i}`});
    };
    // $scope.messages = [
    //     {text:"hello a",from:"user",direction:"user-msg"},
    //     {text:"hello b",from:"us",direction:"recipent-msg"},
    // ];

    $scope.clickedUser = "def";
    $scope.currUser = AuthService.getCurrentUser().username;
    $scope.changeUser = function(userName) {
        $scope.clickedUser = userName;
        $http.post('/api/messages',{clickedUser:$scope.clickedUser,currUser:$scope.currUser})
        .then(function(response){
        $scope.messages = response.data;
        console.log(response.data);

    })
    };
    $http.post('/api/messages',{clickedUser:$scope.clickedUser,currUser:$scope.currUser})
    .then(function(response){
        $scope.messages = response.data;
        console.log(response.data);

    })
});

myApp.controller('loginCtrl', function($scope, $window, AuthService) {
    $scope.login = function(username,password) {
      AuthService.login(username, password)
        .then(function(user) {
          // Redirect to index after successful login
          $window.location.href = '/chat';
        })
        .catch(function(error) {
          console.error(error);
          // Handle login error
        });
    };
});

myApp.controller('registerCtrl', function($scope, $http) {
    $scope.error = '';

    $scope.register = function() {
        $http.post('/api/register', { username: $scope.username, password: $scope.password })
            .then(function(response) {
                // Successful registration
                // alert(response.data.message);
                $window.location.href = '/chat';
                // Redirect to another page or perform any other action after successful registration
            })
            .catch(function(error) {
                // Failed registration
                $scope.error = error.data.error;
            });
    };
});

myApp.controller("myCtrl",function($scope){});
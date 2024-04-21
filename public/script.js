myApp = angular.module("myApp", ["ngRoute"]);

myApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/chat', {
            templateUrl: "chat.html",
            controller: "chatCtrl",
            resolve: {
                auth: function ($location, AuthService) {
                    if (!AuthService.isAuthenticated()) {
                        $location.path('/login');
                    }
                }
            }
        })
        .when('/login', {
            templateUrl: "login.html",
            controller: "loginCtrl",
        })
        .when('/register', {
            templateUrl: "register.html",
            controller: "registerCtrl"
        })
        .otherwise({
            redirectTo: '/login'
        });

    $locationProvider.html5Mode(true);
});

myApp.service('AuthService', function ($http, $q, $window) {

    this.login = function (username, password) {
        var deferred = $q.defer();
        $http.post('/api/login', { username: username, password: password })
            .then(function (response) {
                // Set current user and token in localStorage
                $window.localStorage.setItem('currentUser', JSON.stringify(response.data.user));
                $window.localStorage.setItem('token', response.data.token);
                deferred.resolve(response.data.user);
            })
            .catch(function (error) {
                deferred.reject(error);
            });
        return deferred.promise;
    };

    this.register = function (username, password) {
        var deferred = $q.defer();
        $http.post('/api/register', { username: username, password: password })
            .then(function (response) {
                deferred.resolve(response.data.message);
            })
            .catch(function (error) {
                deferred.reject(error);
            });
        return deferred.promise;
    };

    this.logout = function () {
        // Clear current user and token from localStorage
        $window.localStorage.removeItem('currentUser');
        $window.localStorage.removeItem('token');
    };

    this.isAuthenticated = function () {
        // Check if token exists in localStorage
        return !!$window.localStorage.getItem('token');
    };

    this.getCurrentUser = function () {
        // Retrieve current user from localStorage
        return JSON.parse($window.localStorage.getItem('currentUser'));
    };
});

// TODO make it dynamically update when messages (mongodb) changes

myApp.controller('chatCtrl', function ($scope, $http, AuthService) {

    $scope.currUser = AuthService.getCurrentUser().username;
    $http.post('api/users', {}).then(function (response) {
        $scope.users = response.data.filter(item => item.username !== $scope.currUser);
        // console.log($scope.users[0]);
        $scope.clickedUser = $scope.users[0].username;
        updateMessage();

    })

    function updateMessage() {
        $http.post('/api/messages', { clickedUser: $scope.clickedUser, currUser: $scope.currUser })
            .then(function (response) {
                $scope.messages = response.data;
                $scope.$apply();
            })
    }

    $scope.changeUser = function (userName) {
        $scope.clickedUser = userName;
        updateMessage();
    };

    $scope.sendMsg = () => {
        $http.post('/api/sendMessage', { fromUser: $scope.currUser, toUser: $scope.clickedUser, message: $scope.msgTextbox })
            .then(function (response) {
                updateMessage();
                $scope.msgTextbox = '';
            });
    }

});

myApp.controller('loginCtrl', function ($scope, $window, AuthService) {
    $scope.login = function (username, password) {
        AuthService.login(username, password)
            .then(function () {
                $window.location.href = '/chat';
            })
            .catch(function (error) {
                $scope.error = error.data.error;
            });
    };
});

myApp.controller('registerCtrl', function ($scope, $window, AuthService) {
    $scope.error = '';

    $scope.register = function () {
        AuthService.register($scope.username, $scope.password)
            .then(function () {
                $window.location.href = '/login';
            })
            .catch(function (error) {
                $scope.error = error.data.error;
            });
    };
});

myApp.controller("myCtrl", function ($scope) { });
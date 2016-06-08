angular.module("ngTwidder", ['ngRoute', 'ui.bootstrap', 'ngMessages'])
  //---------------------------------
  // CONFIG ROUTES
  //---------------------------------
  .config(function ($routeProvider) {
      $routeProvider
        .when("/", {
            templateUrl: "/views/welcome.html",
            controller: "WelcomeController"
        })
        .when("/home", {
            controller: "HomeController",
            templateUrl: "/views/home.html"
        })
        .when("/browse", {
            controller: "BrowseController",
            templateUrl: "/views/browse.html"
        })
        .when("/logout", {
            controller: "LogoutController"
        })
        .when("/account", {
            controller: "AccountController",
            templateUrl: "/views/account.html"
        })
        .otherwise({
            redirectTo: "/"
        })
  })
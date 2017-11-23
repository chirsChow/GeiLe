var my_about_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.my_about', {
        url: '/my_about',
        hideTab: true,
        views: {
            'tab-mine': {
                templateUrl: 'component/my_about/my_about.html',
                controller: 'my_aboutCtrl'
            }
        }
    });
};
myapp.config(my_about_myConfig);

angular.module('starter.my_about',[])
.controller('my_aboutCtrl', function($scope) {
    $scope.$on('$ionicView.beforeEnter', function() {

    });
});

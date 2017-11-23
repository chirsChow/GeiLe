var my_cooperation_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.my_cooperation', {
        url: '/my_cooperation',
        views: {
            'tab-mine': {
                templateUrl: 'component/my_cooperation/my_cooperation.html',
                controller: 'my_cooperationCtrl'
            }
        }
    });
};
myapp.config(my_cooperation_myConfig);

angular.module('starter.my_cooperation',[])
.controller('my_cooperationCtrl', function($scope) {
    $scope.$on('$ionicView.beforeEnter', function() {

    });
});

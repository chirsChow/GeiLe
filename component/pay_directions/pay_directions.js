var pay_directions_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.pay_directions', {
        url: '/pay_directions',
        views: {
            'tab-index': {
                templateUrl: 'component/pay_directions/pay_directions.html',
                controller: 'pay_directionsCtrl'
            }
        }
    });
};
myapp.config(pay_directions_myConfig);

angular.module('starter.pay_directions',[])
.controller('pay_directionsCtrl', function($scope) {
    $scope.$on('$ionicView.beforeEnter', function() {

    });
});

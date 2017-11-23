var pay_success_info_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.pay_success_info', {
        url: '/pay_success_info/:num',
        views: {
            'tab-index': {
                templateUrl: 'component/pay_success_info/pay_success_info.html',
                controller: 'pay_success_infoCtrl'
            }
        }
    });
};
myapp.config(pay_success_info_myConfig);

angular.module('starter.pay_success_info',[])
.controller('pay_success_infoCtrl', function($scope,$stateParams) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.myCount = $stateParams.num;
    });
})
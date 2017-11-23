var tab_securityCenter_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.tab_securityCenter', {
        url: '/tab_securityCenter',
        views: {
            'tab-mine': {
                templateUrl: 'component/tab_securityCenter/tab_securityCenter.html',
                controller: 'tab_securityCenterCtrl'
            }
        }
    });
};
myapp.config(tab_securityCenter_myConfig);

angular.module('starter.tab_securityCenter',[])
.controller('tab_securityCenterCtrl', function($scope) {
    $scope.$on('$ionicView.beforeEnter', function() {

    });
});

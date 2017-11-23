var tab_checkTel_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.tab_checkTel', {
        url: '/tab_checkTel',
        views: {
            'tab-mine': {
                templateUrl: 'component/tab_checkTel/tab_checkTel.html',
                controller: 'tab_checkTelCtrl'
            }
        }
    });
};
myapp.config(tab_checkTel_myConfig);

angular.module('starter.tab_checkTel',[])
.controller('tab_checkTelCtrl', function($scope,Common) {
    $scope.$on('$ionicView.beforeEnter', function() {
    $scope.information = Common.getCache('information');

    });
});

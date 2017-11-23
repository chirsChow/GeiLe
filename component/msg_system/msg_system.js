var msg_system_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.msg_system', {
        url: '/msg_system',
        views: {
            'tab-index': {
                templateUrl: 'component/msg_system/msg_system.html',
                controller: 'msg_systemCtrl'
            }
        }
    });
};
myapp.config(msg_system_myConfig);

angular.module('starter.msg_system',[])
.controller('msg_systemCtrl', function($scope,Common) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.list = Common.getCache('msg_sys');
    });
});

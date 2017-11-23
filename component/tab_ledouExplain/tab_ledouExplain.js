var tab_ledouExplain_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.tab_ledouExplain', {
        url: '/tab_ledouExplain',
        views: {
            'tab-mine': {
                templateUrl: 'component/tab_ledouExplain/tab_ledouExplain.html',
                controller: 'tab_ledouExplainCtrl'
            }
        }
    });
};
myapp.config(tab_ledouExplain_myConfig);

angular.module('starter.tab_ledouExplain',[])
.controller('tab_ledouExplainCtrl', function($scope,Common) {
    $scope.$on('$ionicView.beforeEnter', function() {
        if(Common.getCache('Token') == null) {
            $scope.isLogin = true;
        } else {
            $scope.isLogin = false;
        }
    });
});

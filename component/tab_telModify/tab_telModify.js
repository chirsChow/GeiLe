var tab_telModify_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.tab_telModify', {
        url: '/tab_telModify',
        views: {
            'tab-index': {
                templateUrl: 'component/tab_telModify/tab_telModify.html',
                controller: 'tab_telModifyCtrl'
            }
        }
    });
};
myapp.config(tab_telModify_myConfig);

angular.module('starter.tab_telModify',[])
.controller('tab_telModifyCtrl', function($scope,toast) {
    $scope.use=false;
    $scope.unuse=true;
    $scope.chooseItem=function(i){
        if(i){
            $scope.use=!$scope.use;
            $scope.unuse=!$scope.unuse;
        }else{
            $scope.use=!$scope.use;
            $scope.unuse=!$scope.unuse;
        }
    }

    $scope.complete=function(){
        $scope.selected=$scope.use? 1:0;
        toast.show('当前手机号使用状态：'+$scope.selected);
    }

    $scope.$on('$ionicView.beforeEnter', function() {

    });
});

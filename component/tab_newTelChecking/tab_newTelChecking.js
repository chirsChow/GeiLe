var tab_newTelChecking_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.tab_newTelChecking', {
        url: '/tab_newTelChecking',
        views: {
            'tab-mine': {
                templateUrl: 'component/tab_newTelChecking/tab_newTelChecking.html',
                controller: 'tab_newTelCheckingCtrl'
            }
        }
    });
};
myapp.config(tab_newTelChecking_myConfig);

angular.module('starter.tab_newTelChecking',[])
.controller('tab_newTelCheckingCtrl', function($scope,$state,toast,Common) {
    $scope.isActive=true;
    //切换选中状态
    // $scope.toggle =  function(){
    //     $scope.isActive = !$scope.isActive;
    // }

    //完成
    $scope.next = function(){
        if($scope.isActive){
            $state.go('tab.tab_newTelCheck');

        }else{
            toast.show("请选中当前手机")
        }
    }

    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.information = Common.getCache('information');
    });
});

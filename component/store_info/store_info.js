var store_info_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.store_info', {
        url: '/store_info/:id',
        views: {
            'tab-index': {
                templateUrl: 'component/store_info/store_info.html',
                controller: 'store_infoCtrl'
            }
        }
    });
};
myapp.config(store_info_myConfig);

angular.module('starter.store_info',[])
.controller('store_infoCtrl', function($scope,actionSheetItem,$ionicHistory,Common,$stateParams) {
    //举报
    $scope.goBack=function () {
        window.history.back()
    }
    $scope.showTel=function () {
        if(!$scope.storeInfo.tel) return;
        actionSheetItem.showTel($scope.storeInfo.tel)
    }

    $scope.reportStore=function () {
        return false;
        actionSheetItem.showChoose({
            confirm:function (i) {
                console.log(i)
            },
            confirmButton:'确认举报',
            items:['服务不好','太贵','承诺跟实际返豆不同','就是不喜欢','任长得太丑']
        })
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.storeInfo = Common.getCache('storeInfo_'+$stateParams.id);  //缓存当前商铺信息
        console.log('storeInfo_'+$stateParams.id,$scope.storeInfo)
    });
});

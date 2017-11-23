var my_set_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.my_set', {
        url: '/my_set',
        views: {
            'tab-mine': {
                templateUrl: 'component/my_set/my_set.html',
                controller: 'my_setCtrl'
            }
        }
    });
};
myapp.config(my_set_myConfig);

angular.module('starter.my_set',[])
.controller('my_setCtrl', function($scope,cordovaPlug,Common,$state) {
    $scope.gotoSpitslot = function(){
        console.log('调用了吐槽')
        cordovaPlug.CommonPL(function(data){}, "spitslot", [])
    };
    // $scope.clearCache = function(){
    //     Common.showConfirm('','<p class="tc">您确定要清除缓存？</p>',function(){
    //         plus.runtime.quit();
    //     },{},'确认','取消')
        
    // };
    $scope.callPhone = function(){
        cordovaPlug.CommonPL(function() {}, "telephone", ['4000200365'])
    }
    $scope.gotoLogout = function(){
        Common.showConfirm('退出提醒','<p class="tc">您是否要退出当前账户？</p>',function(){
            Common.delete('lifeAPI/logout',{},function(data){
                Common.logout();
                $state.go("tab.index");
            },{})
        },{},'确定','取消')
        
    }
    $scope.$on('$ionicView.beforeEnter', function() {

    });
});

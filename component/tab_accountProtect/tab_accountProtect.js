var tab_accountProtect_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.tab_accountProtect', {
        url: '/tab_accountProtect',
        views: {
            'tab-mine': {
                templateUrl: 'component/tab_accountProtect/tab_accountProtect.html',
                controller: 'tab_accountProtectCtrl'
            }
        }
    });
};
myapp.config(tab_accountProtect_myConfig);

angular.module('starter.tab_accountProtect',[])
.controller('tab_accountProtectCtrl', function($scope,Common) {
    //开启帐号保护后，在不常用的手机上登录给乐生活，需要在常用设备上同意登录
    $scope.$on('$ionicView.beforeEnter', function() {
        var myData = Common.getCache("information");
        $scope.isChecked = myData.accountProtect;

        //一进入页面立即请求
        if($scope.isChecked) {
            Common.put('/lifeAPI/user/accountProtect',{
               "value":$scope.isChecked ? '1':'0'
            },function(res){
                $scope.myAccount = res.data;
            })
        }

        //账号保护开关
        $scope.useCheck =  function(){
            $scope.isChecked = !$scope.isChecked;
            var myChecked = $scope.isChecked ? '1':'0';
            Common.put('/lifeAPI/user/accountProtect',
                {
                   "value":myChecked
                },function(data){
                    myData.accountProtect = $scope.isChecked;
                    $scope.myAccount = data.data;
                    Common.setCache("information",myData);
                },
            {});
        }
    });
});

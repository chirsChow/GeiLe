var mine_setPassword_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.mine_setPassword', {
        url: '/mine_setPassword/:regToken/:tel',
        views: {
            'tab-mine': {
                templateUrl: 'component/mine_setPassword/mine_setPassword.html',
                controller: 'mine_setPasswordCtrl'
            }
        }
    });
};
myapp.config(mine_setPassword_myConfig);

angular.module('starter.mine_setPassword',[])
.controller('mine_setPasswordCtrl', function($scope,$stateParams,$state,toast,Common) {
    $scope.filled = false;
    $scope.$watch('inputData.pwd',function(){
        $scope.$watch('inputData.pwdConfirm',function(){
            var regPwd = /^[^/|\\|\s|\u4e00-\u9fa5]{6,12}$/;
            // if(($scope.inputData.pwd === $scope.inputData.pwdConfirm) && regPwd.test($scope.inputData.pwdConfirm)){
            if($scope.inputData.pwd || $scope.inputData.pwdConfirm){
                $scope.filled = true;
            }else{
                $scope.filled = false;
            }
        })
    })
    //确认修改
    $scope.confirm = function(){
        var pwd = $scope.inputData.pwd;
        var pwdConfirm = $scope.inputData.pwdConfirm;
        var regPwd = /^[^/|\\|\s|\u4e00-\u9fa5]{6,12}$/;
        var regAllNum = /^\d{6,12}$/;
        var regAllAlphabet = /^[a-zA-Z]{6,12}$/;
        var regAllSymbol = /^^[!@`~#\*^+-.%&<>()',;_"'=?\$\x22]{6,12}$/;
        if(pwd && pwdConfirm){
            if(pwd === pwdConfirm){
                if(regPwd.test(pwdConfirm)){
                    if(!regAllNum.test(pwdConfirm) && !regAllAlphabet.test(pwdConfirm) && !regAllSymbol.test(pwdConfirm)){
                         var myDevice = Common.getCache('getDeviceIdAndClientId') || {};

                            //确认密码，注册
                            Common.post_login('merchantAPI/register',
                              {
                                deviceName:myDevice.deviceName || "",
                                deviceVersion:myDevice.deviceVersion || "",
                                "username":$stateParams.tel,
                                "password":pwdConfirm,
                                "regToken":$stateParams.regToken
                              },function(data){
                                $state.go('tab.mine_goLogin');
                              },
                          {},1);
                    }else{
                        toast.show('密码过于简单，<br>请设置数字与字母密码组合')
                    }
                }else{
                    toast.show('密码格式错误')
                }
            }else{
                toast.show('两次密码输入不一致')
            }
        }else{
            toast.show('请输入密码和确认密码')
        }
    }


    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.inputData = {
            pwd:'',
            pwdConfirm:''
        }

    });
});

var tab_modifyPayPwd_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.tab_modifyPayPwd', {
        url: '/tab_modifyPayPwd',
        views: {
            'tab-mine': {
                templateUrl: 'component/tab_modifyPayPwd/tab_modifyPayPwd.html',
                controller: 'tab_modifyPayPwdCtrl'
            }
        }
    });
};
myapp.config(tab_modifyPayPwd_myConfig);

angular.module('starter.tab_modifyPayPwd',[])
.controller('tab_modifyPayPwdCtrl', function($scope,$ionicModal,toast,$state,Common) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.inputData={prevPwd:'',pwd:'',pwdConfirm:''};
        
        $ionicModal.fromTemplateUrl('my-modal.html', {
            scope: $scope,
            animation: 'slide-in-right'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        // $scope.openModal = function () {
        //     $scope.modal.show();
        // };

        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        //下一步
        $scope.next=function(){
            if($scope.inputData.prevPwd){
                if((/^\d{6}$/).test($scope.inputData.prevPwd)){
                    $scope.modal.show();
                }else{
                    toast.show('支付密码为6位数数字');
                }
            }else{
                toast.show('请输入密码');
            }
        }

        //完成修改
        $scope.modifyComplete = function(){
            var p1 = $scope.inputData.pwd;
            var p2 = $scope.inputData.pwdConfirm;
            if(p1 && p2){
                if((/^\d{6}$/).test(p1) && (/^\d{6}$/).test(p2)){
                    if(p1 === p2){
                        Common.checkMd5("GL_SALT_MD5_KEY"+$scope.inputData.prevPwd.toString(),function(data){
                            Common.checkMd5("GL_SALT_MD5_KEY"+$scope.inputData.pwdConfirm.toString(),function(_data){
                                Common.put('lifeAPI/user/password',
                                    {
                                        "oldPassword":data.MD5,
                                        "newPassword":_data.MD5
                                    },function(data){
                                        $scope.modal.hide();
                                        history.go(-2);
                                    },
                                {});
                            })
                        })
                    }else{
                        toast.show('两次密码输入不一致');
                    }
                }else{
                    toast.show('密码格式为6位数字');
                }
            }else{
                toast.show('请输入密码');
            }
        }
    });
});

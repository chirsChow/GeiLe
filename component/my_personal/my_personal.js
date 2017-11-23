var my_personal_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.my_personal', {
            url: '/my_personal',
            views: {
                'tab-mine': {
                    templateUrl: 'component/my_personal/my_personal.html',
                    controller: 'my_personalCtrl'
                }
            }
        });
};
myapp.config(my_personal_myConfig);

angular.module('starter.my_personal', [])
    .controller('my_personalCtrl', function($scope,$ionicModal, cordovaPlug, toast, $http, Common, $state,bindCardService,$timeout) {
        $scope.information = Common.getCache('information');
        $scope.bankList = Common.getCache('bankList');
        $scope.gotoCertification = function() {
            if ($scope.information.authStatus != 1) $scope.gotoCard();
        }
        $scope.gotoBankList = function() {
            if ($scope.bankList.length > 0) {
                $state.go("tab.mine_banklist");  
            } else if ($scope.information.authStatus != 1){
                $state.go('tab.my_certification');
            }else {
                $state.go("tab.mine_addNewBankCard");
                console.log('跳转到绑卡页面');
            }
        }
        var hasClickBoo = false;
        $scope.uploadImg = function(data) {
            if (!hasClickBoo) {
                hasClickBoo = true;
                Common.get('lifeAPI/user/aliyun/token', {}, function(_data) {
                    if (_data.data.accessKeyId == null || _data.data.accessKeySecret == null || _data.data.securityToken == null) {
                        toast.show('服务器异常，请稍后再试！');
                        return;
                    }
                    cordovaPlug.CommonPL(function(data) {
                        if (data.status == 1) {
                            Common.showLoading();
                            Common.put("lifeAPI/user/photo", { 'url': data.data.imageUrl }, function(_data) {
                                $scope.information.photo = data.data.imageUrl;
                                Common.setCache('information', $scope.information);
                                toast.show('头像上传成功！');
                                Common.hideLoading();
                                $scope.$apply();

                            }, {});
                        }
                    }, "headImageUpload", [_data.data.accessKeyId, _data.data.accessKeySecret, _data.data.securityToken, 'user/' + Common.getCache('Token').userId])
                }, function() {
                })
            }
            $timeout(function(){
                hasClickBoo = false;
            },2000)

        }
        //实名认证功能
        $scope.data = {
            userName: '',
            idCard: ''
        };
        $scope.gotoCard = function() {
            if($scope.clickDoubel) return;
            $scope.clickDoubel = true;
            $timeout(function(){
                 $scope.clickDoubel = false;
            },2000)
            console.log("调用摄像头")
            cordovaPlug.CommonPL(function(data) {
                if (data.status == 1) {
                    $scope.openModal();
                    $scope.data.userName = data.data.name;
                    $scope.data.idCard = data.data.code;
                    $scope.data.gender = data.data.gender;
                    $scope.data.birth = data.data.birth;
                    $scope.data.address = data.data.address;
                    $scope.$apply();
                }else if(data.status == 2){
                    $scope.openModal();
                    $scope.data.userName = '';
                    $scope.data.idCard = '';
                } else {
                    toast.show("插件调用失败！");
                }
            }, "scanIdCard", [])
        }
        //完成跳转
        var isCardID = function(sId) {
            var regIdCard = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
            if (!regIdCard.test(sId)) return "请输入正确的身份证号";
            return true;
        }
        $scope.subimit = function() {
            if ($scope.data.userName.length < 1) toast.show("请输入姓名");
            else if ($scope.data.idCard.length < 1) toast.show("请输入身份证号");
            else if (isCardID($scope.data.idCard) != true) toast.show(isCardID($scope.data.idCard));
            else {
                Common.post('lifeAPI/user/password', {
                    "name": $scope.data.userName,
                    "idCard": $scope.data.idCard,
                    "sex":$scope.data.gender,
                    "birth":$scope.data.birth,
                    "address":$scope.data.address
                }, function(data) {
                    var myData = Common.getCache("information");
                    myData.realName = $scope.data.userName;
                    if(data.data != null) myData.authStatus = data.data.authStatus;
                    myData.idCard = $scope.data.idCard;
                    Common.setCache("information", myData);
                    Common.showAlert('温馨提醒','恭喜您，已经认证成功！',function(){
                        $scope.modal.hide();
                        $scope.information = Common.getCache('information');
                    });
                }, {},1);
            }
        }
        $ionicModal.fromTemplateUrl('my-modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
        });
        $scope.openModal = function() {
          $scope.modal.show();
        }
        $scope.closeModal = function() {
            $scope.gotoCard();
            $scope.modal.hide();

          }

        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.information = Common.getCache('information');
        });
    });

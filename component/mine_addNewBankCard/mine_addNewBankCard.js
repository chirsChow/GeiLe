var mine_addNewBankCard_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.mine_addNewBankCard', {
            url: '/mine_addNewBankCard',
            views: {
                'tab-mine': {
                    templateUrl: 'component/mine_addNewBankCard/mine_addNewBankCard.html',
                    controller: 'mine_addNewBankCardCtrl'
                }
            }
        });
};
myapp.config(mine_addNewBankCard_myConfig);

angular.module('starter.mine_addNewBankCard', [])
    .controller('mine_addNewBankCardCtrl', function($scope, $state, Common, toast, $timeout,cordovaPlug,$timeout) {

        $scope.isFilled = false;
        var timer_loop;
        var myCount = 0;

        var isCardID = function(sId) {
            var regIdCard = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
            if (!regIdCard.test(sId)) return "您输入的身份证格式错误，请重新输入";
            return true;
        }

        $scope.$watch('inputData.userName', function() {
            $scope.$watch('inputData.cardNo', function() {
                $scope.$watch('inputData.idNo', function() {
                    if ($scope.inputData.userName && $scope.inputData.cardNo && isCardID($scope.inputData.idNo) == true) {
                        $scope.isFilled = true;
                    } else {
                        $scope.isFilled = false;
                    }
                })
            })
        })

        //轮循绑卡是否成功函数

        $scope.isAddCardOk = function() {
            Common.post('lifeAPI/payment/bindinfo/queryBindStatus', {
                "userId": Common.getCache('Token').userId,
                "cardNo": $scope.inputData.cardNo
            }, {}, {}, {}, function(res) {
                if (res.result == '000000') {
                    //TODO: 绑卡成功，跳转我的银行卡列表
                    $timeout.cancel(timer_loop);
                    myCount = 0;
                    toast.show('恭喜您绑卡成功，该卡在给乐合作商家使用POS刷卡支付，一样返乐豆哦~')
                    $state.go('tab.mine_banklist')
                    Common.hideLoading()
                } else if (res.result == '000201') {} else {
                    toast.show(res.description)
                    $timeout.cancel(timer_loop);
                    myCount = 0;
                    Common.hideLoading()
                }
            })

        }
        $scope.ocrClick = function(){
            if($scope.clickDoubel) return;
            $scope.clickDoubel = true;
            $timeout(function(){
                 $scope.clickDoubel = false;
            },2000)
              console.log("调用摄像头")
              cordovaPlug.CommonPL(function(data) {
                  if (data.status == 1) {
                      $scope.inputData.cardNo = data.data.code;
                      $scope.$apply();
                  } else if (data.status != 2){
                      toast.show("插件调用失败！");
                  }
              }, "scanBank", [])
        }

        //完成新增银行卡
        $scope.toAddCard = function() {
            if (myCount != 0) return;
            if (!$scope.inputData.userName) {
                toast.show('请输入开户名');
                return;
            }
            if (!$scope.inputData.cardNo) {
                toast.show('请输入银行卡号');
                return;
            }
            if (isCardID($scope.inputData.idNo) != true) {
                toast.show(isCardID($scope.inputData.idNo))
                return;
            }
            Common.showLoading()
                //TODO：向后台发送请求，并轮循
            Common.post('lifeAPI/user/bindBankForRegistForApp', {
                "bankNo": $scope.inputData.cardNo.replace(/\s+/g,""),
                "idCard": $scope.inputData.idNo.replace(/\s+/g,""),
                "name": $scope.inputData.userName.replace(/\s+/g,"")
            }, function() {
                //轮循有3种结果:成功，失败，等待中。$timeout.cancel(timer_loop);
                timer_loop = $timeout(function() {
                    myCount++;
                    if (myCount > 10) {
                        myCount = 0;
                        $state.go('tab.mine_failToAddBankCard');
                        $timeout.cancel(timer_loop);
                        Common.hideLoading()
                        return;
                    }

                    $scope.isAddCardOk();
                }, 3000)
            }, {})
        }
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.inputData = {
                userName: '',
                cardNo: '',
                idNo: ''
            }
            $scope.ocrClick();
        });
    });
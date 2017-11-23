var payment_comfirmReward_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.payment_comfirmReward', {
            url: '/payment_comfirmReward',
            params: { "merchantNo": null, "paymentNo": null, "staff": null, "tip": "0.00","beanTip":null },
            views: {
                'tab-index': {
                    templateUrl: 'component/payment_comfirmReward/payment_comfirmReward.html',
                    controller: 'payment_comfirmRewardCtrl'
                }
            }
        });
};
myapp.config(payment_comfirmReward_myConfig);
//确认打赏界面
angular.module('starter.payment_comfirmReward', [])
    .controller('payment_comfirmRewardCtrl', function($scope, $stateParams, $state, $ionicHistory, actionSheetItem, Common, cordovaPlug, $timeout,bindCardService) {

        $scope.obj = {
            leBen: true
        };

        //支付金额
        $scope.payMoney = $stateParams.tip;

        //更改支付银行卡
        $scope.changeBank = function() {
            actionSheetItem.changeBank($scope.bankList, $scope.mybankCheck.cardIndex, function(data) {
                $scope.mybankCheck = data;
            });
        };

        //确认支付
        $scope.pay = function() {
            Common.post('/lifeAPI/wxPay/tipPay',{
                "orderTitle":'打赏',
                "totalAmount":$scope.tip,
                "rewardUserId":$scope.staff.userId,
                "perOrderNo":$scope.paymentNo,
                "payLdMoney":$stateParams.beanTip,
                //'callbackUrl':''
                 'callbackUrl':'http://wxpay.com/#/tab/payment_reward_finish/0/'+$scope.tip
            },function(data){
                Common.UMclickEvent("gratuityEvent");
                Common.wxplayOpen(data.data.payUrl);
                $scope.queryBoo = true;
                $scope.gotoQuery(data.data.orderNo);
            },{},1)
            //$state.go('tab.payment_reward_finish', { money: $scope.tip });
        };
        $scope.gotoQuery = function(orderNo){
            if(!$scope.queryBoo) return;
            Common.get('lifeAPI/wxPay/wxPayFinish',{
                orderNo:orderNo
            },function(data){
                //orderStatus   0未付款，1完成付款，2付款中9付款失败
                if(data.data.orderStatus == 1){
                    window.location.href = '#/tab/payment_reward_finish/0/'+$scope.tip
                }else if(data.data.orderStatus == 9){
                    $scope.queryBoo = false;
                    Common.showAlert('','打赏失败，请稍后再试')
                }else{
                    $timeout(function(){
                        $scope.gotoQuery(orderNo);
                    },3000)
                }
            },{})
        }
        $scope.cancelPay = function(){
            $scope.queryBoo = false;
        }
        $scope.goBack = function() {
            $state.go('tab.index', {}, { reload: true });
        };
        $scope.$on('noWechat', function (event, res) {
            if (res) {
                $scope.queryBoo = false;
            }
        })
        $scope.checkNum = 0;
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.merchantNo = $stateParams.merchantNo;
            $scope.paymentNo = $stateParams.paymentNo;
            //打赏金额
            $scope.tip = $stateParams.tip;
            //员工信息
            $scope.staff = $stateParams.staff;
            $scope.queryBoo = false;
        });
        $scope.$on('$ionicView.beforeLeave', function() {
            $scope.queryBoo = false;
        })
        
    });
/*angular.module('starter.payment_comfirmReward', [])
    .controller('payment_comfirmRewardCtrl', function($scope, $stateParams, $state, $ionicHistory, actionSheetItem, Common, cordovaPlug, $timeout,bindCardService) {

        $scope.obj = {
            leBen: true
        };

        //支付金额
        $scope.payMoney = $stateParams.tip;

        //更改支付银行卡
        $scope.changeBank = function() {
            actionSheetItem.changeBank($scope.bankList, $scope.mybankCheck.cardIndex, function(data) {
                $scope.mybankCheck = data;
            });
        };

        //确认支付
        $scope.pay = function() {
            //支付订单流水号
            if ($scope.myClickBoo) {
                $scope.myClickBoo = false;
                Common.showLoading();
                $scope.rewardPay();
            }
        };
        //付费通打赏快捷支付接口
        $scope.rewardPay = function() {
            if ($scope.keybordStatus != 2) {
                var params = {
                    "orderNo": $scope.orderNo,
                    "permentNo": $scope.paymentNo, //支付订单流水号
                    "title": '打赏', //[可选]订单标题
                    "description": '员工打赏', //[可选]
                    "money": $scope.tip, //打赏总金额
                    "merchantNo": $scope.merchantNo, //商户编号
                    "toUserId": $scope.staff.userId, //打赏对象用户ID
                    "payCardIndex": $scope.mybankCheck.cardIndex, //[可选]支付银行卡索引号 不填将用用户默认卡支付
                    "beanAmount":$stateParams.beanTip
                };
                Common.post_pay('lifeAPI/payment/fft/quickTipPay', params, function(data) {
                    $scope.quickPay = data;
                    if (data.data.isNeedPayPwd) {
                        //调用密码token
                        Common.get('lifeAPI/payment/fft/keyboard', {
                            "type": '0',
                            "fftOrderid": data.data.fftOrderId
                        }, function(_data) {
                            //调用原生输入键盘,输入完成后调用方法 gotoPasswordPay
                            $scope.passwordData = _data;
                            Common.showLoading();
                            cordovaPlug.CommonPL(function(token) {
                                if (token.status == 2) {
                                    $scope.keybordStatus = 2;
                                    Common.hideLoading();
                                    $scope.myClickBoo = true;
                                } else {
                                    $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, token.data.password);
                                }
                            }, 'inputPassword', [$scope.passwordData.data.secSession]);
                        }, function(_data) {
                            $scope.myClickBoo = true;
                            Common.hideLoading();
                        });
                    } else {
                        $state.go('tab.payment_reward_finish', { money: $scope.tip });
                        Common.clearCache('scanDate');
                    }
                }, function() {
                    Common.showAlert('温馨提示', '密码错误', function() {
                        Common.showLoading();
                        cordovaPlug.CommonPL(function(respons) {
                            if (respons.status == 2) {
                                $scope.keybordStatus = 2;
                                Common.hideLoading();
                                $scope.myClickBoo = true;
                            } else {
                                $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, respons.data.password);
                            }
                        }, 'inputPassword', [$scope.passwordData.data.secSession]);
                    });
                }, function() {
                    checkOrderStatus();
                }, function(res) {
                    //支付错误回调
                    $state.go('tab.payment_finish', { result: "fail", failStatus: res.result, endNum: $scope.mybankCheck.cardNo.substr(-4, 4) });
                }, 1);
            } else {
                Common.showLoading();
                cordovaPlug.CommonPL(function(respons) {
                    if (respons.status == 2) {
                        $scope.keybordStatus = 2;
                        Common.hideLoading();
                        $scope.myClickBoo = true;
                    } else {
                        $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, respons.data.password);
                    }
                }, 'inputPassword', [$scope.passwordData.data.secSession]);
            }
        };

        $scope.gotoPasswordPay = function(data, _data, secPassword) {
            Common.post_pay('lifeAPI/payment/fft/passwordPay', {
                "fftOrderId": data,
                "payCardIndex": $scope.mybankCheck.cardIndex,
                "secIndex": _data.data.secIndex,
                "secPassword": secPassword
            }, function() {
                $state.go('tab.payment_reward_finish', { money: $scope.tip });
                Common.clearCache('scanDate');
            }, function() {
                Common.showAlert('温馨提示', '密码错误', function() {
                    Common.showLoading();
                    cordovaPlug.CommonPL(function(respons) {
                        if (respons.status == 2) {
                            $scope.keybordStatus = 2;
                            Common.hideLoading();
                            $scope.myClickBoo = true;
                        } else {
                            $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, respons.data.password);
                        }
                    }, 'inputPassword', [$scope.passwordData.data.secSession]);
                });
            }, function() {
                checkOrderStatus();
            }, function(res) {
                //支付错误回调
                $state.go('tab.payment_finish', { result: "fail", failStatus: res.result, endNum: $scope.mybankCheck.cardNo.substr(-4, 4) });
            }, 1);
        };

        $scope.goBack = function() {
            $state.go('tab.index', {}, { reload: true });
        };

        $scope.checkNum = 0;

        function checkOrderStatus() {
            $scope.checkNum++;

            if ($scope.checkNum > 20) {
                Common.hideLoading();
                $scope.checkNum = 0;
                Common.alert('网络繁忙');
                return;
            }
            Common.showLoading();
            Common.get('lifeAPI/payment/fft/OrderStatus', { glOrderId: $scope.orderNo }, function(res) {
                if (res.data.orderStatue == '01' || res.data.orderStatue == '02') {
                    $timeout(function() {
                        checkOrderStatus();
                    }, 2000);
                } else if (res.data.orderStatue == '03') {
                    Common.hideLoading();
                    $scope.myClickBoo = true;
                } else if (res.data.orderStatue == '00') {
                    Common.hideLoading();
                    $state.go('tab.payment_reward_finish', { money: $scope.tip });
                    Common.clearCache('scanDate');
                } else if (res.data.orderStatue == '04') {
                    // $scope.quickPay = {data:{}}
                    // $scope.quickPay.data.fftOrderid = 12
                    //调用原生输入键盘,输入完成后调用方法 gotoPasswordPay

                    Common.get('lifeAPI/payment/fft/keyboard', {
                        "type": '0',
                        "fftOrderid": $scope.quickPay.data.fftOrderId
                    }, function(_data) {
                        Common.showLoading();
                        //调用原生输入键盘,输入完成后调用方法 gotoPasswordPay
                        cordovaPlug.CommonPL(function(token) {
                            if (token.status == 2) {
                                $scope.keybordStatus = 2;
                                Common.hideLoading();
                                $scope.myClickBoo = true;
                            } else {
                                $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, _data, token.data.password);
                            }

                        }, 'inputPassword', [_data.data.secSession]);
                    }, {});

                } else if (res.data.orderStatue == '05') {
                    Common.hideLoading();
                    $scope.myClickBoo = true;
                }
            }, function() {
                $scope.myClickBoo = true;
                Common.hideLoading();
            }, 1);
        }
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.merchantNo = $stateParams.merchantNo;
            $scope.paymentNo = $stateParams.paymentNo;
            //打赏金额
            $scope.tip = $stateParams.tip;
            //员工信息
            $scope.staff = $stateParams.staff;

            $scope.keybordStatus = 0;
            // //更改允许乐豆支付
            // $scope.changeCoin = function() {
            //     Common.put('lifeAPI/user/enableHappyCoin', {
            //         "value": 0 //允许的值 0不允许 1允许
            //     }, function(data) {}, function(msg) {
            //         console.log(msg);
            //     });
            // };
            // $scope.changeCoin();
            $scope.myClickBoo = true;
            //进来先取orderNo
            Common.post('lifeAPI/payment/orderno', { merchantNo: $scope.merchantNo, scene: '0' }, function(data) {
                $scope.orderNo = data.data || '';
            }, function() {
                Common.hideLoading();
            }, 1);
            //获取当前用户乐豆数量
            // $scope.leBenNum = "0.00";
            // Common.get('lifeAPI/payment/user/happycoin/', {}, function(data) {
            //     $scope.leBenNum = parseFloat(data.data.amount).toFixed(2);
            //     if ($scope.leBenNum === 'NaN') {
            //         $scope.leBenNum = "0.00";
            //     }
            //     //默认使用乐豆

            // }, {});
            var myData = Common.getCache('banklistColor').data;
            var getBankList = function(_type){
                Common.get('lifeAPI/payment/fft/card/', {
                    'type': _type
                }, function(data) {
                    var oldData = data.data;
                    for (var i = 0; i < oldData.length; i++) {
                        oldData[i].bankImg = 'img/bank/' + myData[oldData[i].bankIndex].icon;
                        oldData[i].color = myData[oldData[i].bankIndex].color;
                        if (oldData[i].defaultFlag) {
                            $scope.mybankCheck = oldData[i];
                            break;
                        }
                    }
                    for(var i = 0 ; i< oldData.length; i++){
                        if(oldData[i].cardType == 'C') oldData.splice(i,1);
                    }
                    if(oldData.length == 0) {
                        Common.showConfirm("温馨提醒","打赏功能目前不支持信用卡！",function(){
                            //跳转到绑卡
                            bindCardService.fft(function() {
                                getBankList(1);
                            });
                           },function(){
                                $state.go('tab.index');
                           },"去绑卡","回首页");
                        
                    }else{
                        $scope.bankList = oldData;
                        if (!$scope.mybankCheck || $scope.mybankCheck.cardType == 'C') $scope.mybankCheck = $scope.bankList[0];
                    }
                }, {},1);
            }
            getBankList(1);
        });
    });
*/
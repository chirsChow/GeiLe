var group_pay_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.group_pay', {
            url: '/group_pay?{:personalPay}{:groupId}{:orderNo}{:participantPay}',
            hideTab: true,
            views: {
                'tab-index': {
                    templateUrl: 'component/group_pay/group_pay.html',
                    controller: 'group_payCtrl'
                }
            }
        });
};
myapp.config(group_pay_myConfig);

angular.module('starter.group_pay', [])

    .controller('group_payCtrl', function ($scope, actionSheetItem, Common, toast, $state, $stateParams, cordovaPlug, $timeout, $rootScope, $ionicPlatform, setIntervalGetData) {
        $scope.$on('$ionicView.beforeEnter', function () {
            //物理返回键
            $scope.debindBackButtonAction = $ionicPlatform.registerBackButtonAction(function (e) {
                e.preventDefault();
                $scope.refreshStatus();
                return false;
            }, 302);
            $scope.showIntervalBox = false;
        });
        $scope.participantPay = $stateParams.participantPay
        // $scope.refreshStatus = function () {  预留哪天他妈的付费通又要上线了
        //     Common.get('lifeAPI/groupPay/payBack', {
        //         groupId: $stateParams.groupId
        //     }, function () {
        //         if ($scope.keyboardStatus == 2) {
        //             $rootScope.groupOrderFlag = true;
        //         }
        //         history.back();
        //     }, {});
        // };

        $scope.refreshWxStatus = function () {
            history.back();
        };

        $scope.baseInfo = Common.getCache($stateParams.groupId) || {};

        $scope.IsParticipator = $scope.baseInfo.userType === 1; // 区分是发起者还是参与者
        $scope.titleTips = $scope.IsParticipator ? '个人支付金额' : '乐抢单总金额';

        var _personalPay = $stateParams.personalPay;  // 个人支付多少钱
        $scope.personalPayNum = $stateParams.personalPay;
        $scope.coinRate = $scope.baseInfo.saleRate;   // 返豆率
        $scope.giftCoin = (_personalPay * parseFloat($scope.coinRate) / 100).toFixed(2); // 返豆

        var myDataCoin = Common.getCache("information") || {};
        $scope.model = {isChecked: myDataCoin.enableHappyCoin} // 初始化乐豆开关
        var _coin = 0;
        Common.get('lifeAPI/payment/user/happycoin/', {}, function (data) {
            _coin = data.data.amount;
            checkCoin();
        });

        //乐豆开关
        $scope.beanChecked = function () {
            var myChecked = $scope.model.isChecked ? '1' : '0';
            Common.put("lifeAPI/user/enableHappyCoin", {
                "value": myChecked
            }, function () {
                myDataCoin.enableHappyCoin = $scope.model.isChecked;
                Common.setCache("information", myDataCoin);
                checkCoin();
            }, {}, 1);
        };
        /*---------------------------------------------------*/

        //银行卡
        /*var myData = Common.getCache('banklistColor').data;
        Common.get('lifeAPI/payment/fft/card/', {'type': 1}, function (data) {
            var oldData = data.data;
            for (var i = 0; i < oldData.length; i++) {
                if (myData[oldData[i].bankIndex] == null) continue;
                oldData[i].bankImg = 'img/bank/' + myData[oldData[i].bankIndex].icon;
                oldData[i].color = myData[oldData[i].bankIndex].color;
                if (oldData[i].defaultFlag) {
                    $scope.mybankCheck = oldData[i];
                }
            }
            if (!$scope.mybankCheck) $scope.mybankCheck = oldData[0];
            $scope.bankList = oldData;
        }, {}, 1);

        $scope.changeBank = function () {
            actionSheetItem.changeBank($scope.bankList, $scope.mybankCheck.cardIndex, function (data) {
                $scope.mybankCheck = data;
            });
        };*/
        /*---------------------------------------------------*/

        // 支付方法
        $scope.isAvaible = true;   // 是否可点击支付按钮

        $scope.pay = function () {
            if ($scope.isAvaible) {
                newTime = new Date().getTime();
                $scope.isAvaible = false;
                //确定下单之前先生成流水
                $scope.orderPay();
            }
        };

        // 微信支付
        $scope.wxPay = function () {
            if ($scope.isAvaible) {
                $scope.isAvaible = false;
                if (Common.getCache($stateParams.groupId).cancelPay) {
                    var total = Common.getCache($stateParams.groupId).userType === 0 ? Common.getCache($stateParams.groupId).totalAmount : $stateParams.personalPay
                    Common.post('lifeAPI/wxGroupPay/getOrderNo', {
                        merchantNo: Common.getCache($stateParams.groupId).merchantNo,
                        paymentConfig: Common.getCache($stateParams.groupId).userType === 0 ? '5' : '6',
                        groupId: $scope.baseInfo.groupId,
                        totalAmount: total,
                        operatorId: "",
                        rlAmount: Common.getCache($stateParams.groupId).rlAmount
                    }, function (res) {
                        var cache = Common.getCache($stateParams.groupId);
                        cache.orderNo = res.data.orderNo;
                        Common.setCache($stateParams.groupId, cache);
                        wechatPay();
                    })
                } else {
                    wechatPay();
                }
            } else {
                return;
            }

            $timeout(function () {
                $scope.isAvaible = true;
            }, 2000)
        }

        function wechatPay() {
            var postUrl = $scope.baseInfo.userType === 0 ? 'lifeAPI/wxGroupPay/ownerPay' : 'lifeAPI/wxGroupPay/memberPay';
            var data = {
                "groupId": $stateParams.groupId,
                "merchantNo": $scope.baseInfo.merchantNo,
                "orderNo": Common.getCache($stateParams.groupId).orderNo,
                "orderTitle": "乐抢单",
                "totalAmount": $stateParams.personalPay,
                'callbackUrl': 'http://wxpay.com/#/tab/group_pay_finish?orderNo=%s'
            };

            if ($scope.baseInfo.userType === 0) {
                data.operatorId = Common.getCache($stateParams.groupId).operatorId;
            }

            if ($stateParams.personalPay > 5000) {
                Common.showAlert('温馨提示','单笔限额不能超过5000元');
                return;
            }

            Common.post(postUrl, data, function (res) {
                var cache = Common.getCache($stateParams.groupId);
                cache.cancelPay = true;
                Common.setCache($stateParams.groupId, cache); // 预置重新生成orderNO标记，下次再点击支付按钮会重新生成orderNo
                // $scope.wxUrl = res.data.payUrl;
                // $scope.wxPayShow = true;
                Common.UMclickEvent("GroupPayEvent");
                Common.wxplayOpen(res.data.payUrl);
                $scope.showIntervalBox = true;
                setIntervalGetData.init('lifeAPI/wxGroupPay/groupPayFinish', function (resPay) {
                    // orderStatus   0未付款，1完成付款，2付款中9付款失败
                    if (resPay.data.orderStatus == 1) {
                        setIntervalGetData.end();
                        $state.go('tab.group_pay_finish', {
                            groupId: $stateParams.groupId,
                            orderNo: Common.getCache($stateParams.groupId).orderNo
                        })
                    } else if (resPay.data.orderStatus == 9) {
                        setIntervalGetData.end();
                        $scope.showIntervalBox = false;
                        Common.showAlert('温馨提示', '支付失败');
                    }
                })
                var role = Common.getCache($stateParams.groupId).userType === 0 ? '1' : '2';
                setIntervalGetData.start2({
                    orderNo: Common.getCache($stateParams.groupId).orderNo,
                    role: role // 角色；
                })
            }, function () {
                var cache = Common.getCache($stateParams.groupId);
                cache.cancelPay = true;
                Common.setCache($stateParams.groupId, cache);
            }, 1, null, function (res) {
                var cache = Common.getCache($stateParams.groupId);
                cache.cancelPay = true;
                Common.setCache($stateParams.groupId, cache);
            })
        }

        /*---------------------------------------------*/

        // 通用方法
        function checkCoin() {   // 乐豆开关支付金额变化
            console.log($scope.model.isChecked)
            if ($scope.model.isChecked) {
                if (_personalPay <= 1) {
                    $scope.personalPay = Number(_personalPay).toFixed(2);
                    $scope.coin = '0.00';
                } else if (_personalPay - _coin < 1 || _coin >= _personalPay) {
                    $scope.personalPay = '1.00';
                    $scope.coin = (_personalPay - 1).toFixed(2);
                } else {
                    $scope.personalPay = (_personalPay - _coin).toFixed(2);
                    $scope.coin = _coin.toFixed(2);
                }
            } else {
                $scope.personalPay = Number(_personalPay).toFixed(2);
                $scope.coin = _coin.toFixed(2);
            }
        }


        // 取消轮询
        $scope.cancelPay = function () {
            setIntervalGetData.end();
            var role = Common.getCache($stateParams.groupId).userType === 0 ? '1' : '2';
            $scope.showIntervalBox = false;
            Common.get('lifeAPI/wxGroupPay/groupPayFinish', {
                orderNo: Common.getCache($stateParams.groupId).orderNo,
                role: role // 角色；
            }, function (resPay) {
                // orderStatus   0未付款，1完成付款，2付款中9付款失败
                if (resPay.data.orderStatus == 1) {
                    setIntervalGetData.end();
                    $state.go('tab.group_pay_finish', {
                        groupId: $stateParams.groupId,
                        orderNo: Common.getCache($stateParams.groupId).orderNo
                    })
                } else if (resPay.data.orderStatus == 9) {
                    setIntervalGetData.end();
                    Common.showAlert('支付失败');
                }
            })
        };

        $scope.$on('noWechat', function (event, res) {
            if (res) {
                $scope.showIntervalBox = false;
            }
        })
        // $scope.checkNum = 0;  // 初始化轮询次数
        // $scope.keyboardStatus = 0; // 键盘状态
        $scope.$on('$ionicView.beforeLeave', function () {
            $scope.leave = true;  // 离开页面时候设置参数，结束轮询
            $scope.debindBackButtonAction(); //移除物理返回键监听

            if (setIntervalGetData.getLoop()) {
              //  setIntervalGetData.end();
            }
        });
        // 查询订单状态  (付费通）
        // function checkOrderStatus() {
        //     if ($scope.leave) return;
        //
        //     $scope.checkNum++;
        //
        //     if ($scope.checkNum > 30 || newTime - new Date().getTime() > 120000) {
        //         Common.hideLoading();
        //         $scope.checkNum = 0;
        //         Common.showAlert('超时提醒', '请求超时,请以账单消息为准！', function () {
        //             $state.go('tab.index');
        //         }, '退出');
        //         return;
        //     }
        //
        //     Common.get('lifeAPI/groupPay/queryOrderStatus', {
        //         groupId: $stateParams.groupId,
        //         glOrderId: $stateParams.orderNo
        //     }, function (res) {
        //         if (res.data.orderStatue == '01' || res.data.orderStatue == '02') {
        //             $timeout(function () {
        //                 checkOrderStatus();
        //             }, 5000);
        //         } else if (res.data.orderStatue == '03') {
        //             // toast.show('支付失败');
        //             $state.go("tab.payment_finish", {
        //                 result: "fail",
        //                 failStatus: res.result,
        //                 endNum: $scope.mybankCheck.cardNo.substr(-4, 4)
        //             });
        //             Common.hideLoading();
        //         } else if (res.data.orderStatue == '00') {
        //             toast.show('支付成功');
        //             Common.hideLoading();
        //             $state.go('tab.group_pay_finish', {
        //                 personalPay: Number(_personalPay).toFixed(2),
        //                 cashAmt: $scope.personalPay,
        //                 coin: $scope.model.isChecked ? $scope.coin : '0.00',
        //                 giftCoin: $scope.giftCoin,
        //                 totalAmount: $scope.baseInfo.totalAmount,
        //                 groupId: $stateParams.groupId,
        //                 orderNo: $stateParams.orderNo
        //             });
        //         } else if (res.data.orderStatue == '04') {
        //
        //             Common.get('lifeAPI/payment/fft/keyboard', {
        //                 "type": '0',
        //                 "fftOrderid": $scope.quickPay.data.fftOrderId
        //             }, function (_data) {
        //                 Common.showLoading();
        //                 //调用原生输入键盘,输入完成后调用方法 gotoPasswordPay
        //                 cordovaPlug.CommonPL(function (resp) {
        //                     if (resp.status == 2) {
        //                         $scope.keyboardStatus = 2;
        //                         Common.hideLoading();
        //                         $scope.isAvaible = true;
        //                     } else {
        //                         $scope.gotoPasswordPay(res.data.fftOrderId, _data, resp.data.password);
        //                     }
        //                 }, 'inputPassword', [_data.data.secSession]);
        //             }, function () {
        //                 $scope.isAvaible = true;
        //                 Common.hideLoading();
        //             });
        //
        //         } else if (res.data.orderStatue == '05') {
        //             toast.show('订单已撤销');
        //             Common.hideLoading();
        //             $scope.isAvaible = true;
        //         }
        //     }, function () {
        //         $scope.isAvaible = true;
        //         Common.hideLoading();
        //     });
        // }
        //
        // var postUrl = $scope.baseInfo.userType === 0 ? 'lifeAPI/groupPay/ownerQuickPay' : 'lifeAPI/groupPay/memberQuickPay';
        // var newTime; // 轮询时间
        // var money = $scope.baseInfo.userType === 0 ? $scope.baseInfo.totalAmount : $stateParams.personalPay;
        // var merChantNo = $scope.baseInfo.userType == 0 ? $scope.baseInfo.merchantNo : $scope.baseInfo.glMerchantNo;
        // //交易流程
        // $scope.orderPay = function () {
        //
        //     if ($scope.keyboardStatus != 2) {
        //         Common.showLoading();
        //         var data = {
        //             "description": "乐抢单",
        //             "groupId": $stateParams.groupId,
        //             "merchantNo": $scope.baseInfo.merchantNo,
        //             "money": money,
        //             "operatorId": $scope.baseInfo.operatorId,
        //             "orderNo": $stateParams.orderNo,
        //             "payCardIndex": $scope.mybankCheck.cardIndex,
        //             "subAmount": $stateParams.personalPay,
        //             "title": "乐抢单"
        //         };
        //
        //         Common.post_pay(postUrl, data, function (resp) {
        //             $scope.quickPay = resp;
        //             if ($scope.quickPay.data.isNeedPayPwd != null) {
        //                 //调用密码token
        //                 Common.get('lifeAPI/payment/fft/keyboard', {
        //                     "type": '0',
        //                     "fftOrderid": $scope.quickPay.data.fftOrderId
        //                 }, function (_data) {
        //                     $scope.passwordData = _data;
        //                     //调用原生输入键盘,输入完成后调用方法 gotoPasswordPay
        //                     Common.showLoading();
        //                     cordovaPlug.CommonPL(function (res) {
        //                         if (res.status == 2) {
        //                             $scope.keyboardStatus = 2;
        //                             Common.hideLoading();
        //                             $scope.isAvaible = true;
        //                         } else {
        //                             $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, res.data.password);
        //                         }
        //                     }, 'inputPassword', [$scope.passwordData.data.secSession]);
        //                 }, function () {
        //                     Common.hideLoading();
        //                 }, 1);
        //             } else {
        //                 $state.go('tab.group_pay_finish', {
        //                     personalPay: Number(_personalPay).toFixed(2),
        //                     cashAmt: $scope.personalPay,
        //                     coin: $scope.model.isChecked ? $scope.coin : '0.00',
        //                     giftCoin: $scope.giftCoin,
        //                     totalAmount: $scope.baseInfo.totalAmount,
        //                     groupId: $stateParams.groupId,
        //                     orderNo: $stateParams.orderNo
        //                 });
        //                 Common.hideLoading();
        //             }
        //         }, function () {
        //             Common.showAlert('温馨提示', '密码错误', function () {
        //                 Common.showLoading();
        //                 cordovaPlug.CommonPL(function (respons) {
        //                     if (respons.status == 2) {
        //                         $scope.keyboardStatus = 2;
        //                         Common.hideLoading();
        //                         $scope.isAvaible = true;
        //                     } else {
        //                         $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, respons.data.password);
        //                     }
        //                 }, 'inputPassword', [$scope.passwordData.data.secSession]);
        //             });
        //         }, function () {
        //             Common.showLoading(30000);
        //             checkOrderStatus();
        //         }, function (res) {
        //             //支付错误回调
        //             Common.showAlert('温馨提示', '支付失败', function () {
        //                 $rootScope.groupOrderFlag = true;
        //                 history.back();
        //             });
        //             Common.hideLoading();
        //         }, 1, function () {
        //             history.back();
        //         });
        //     } else {
        //         Common.showLoading();
        //         cordovaPlug.CommonPL(function (respons) {
        //             if (respons.status == 2) {
        //                 $scope.keyboardStatus = 2;
        //                 Common.hideLoading();
        //                 $scope.isAvaible = true;
        //             } else {
        //                 $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, respons.data.password);
        //             }
        //         }, 'inputPassword', [$scope.passwordData.data.secSession]);
        //     }
        // };
        //
        // //密码支付
        // $scope.gotoPasswordPay = function (fftOrderId, _data1, secPassword) {
        //     Common.showLoading();
        //     Common.post_pay('lifeAPI/groupPay/groupPwdPay', {
        //         "fftOrderId": fftOrderId,
        //         "payCardIndex": $scope.mybankCheck.cardIndex,
        //         "secIndex": _data1.data.secIndex,
        //         "secPassword": secPassword,
        //         "groupId": $stateParams.groupId,
        //         "orderNo": $stateParams.orderNo
        //     }, function () {
        //         $state.go('tab.group_pay_finish', {
        //             personalPay: Number(_personalPay).toFixed(2),
        //             cashAmt: $scope.personalPay,
        //             coin: $scope.model.isChecked ? $scope.coin : '0.00',
        //             giftCoin: $scope.giftCoin,
        //             totalAmount: $scope.baseInfo.totalAmount,
        //             groupId: $stateParams.groupId,
        //             orderNo: $stateParams.orderNo
        //         });
        //         Common.hideLoading();
        //     }, function () {
        //         Common.showAlert('温馨提示', '密码错误', function () {
        //             cordovaPlug.CommonPL(function (respons) {
        //                 if (respons.status == 2) {
        //                     $scope.keyboardStatus = 2;
        //                     Common.hideLoading();
        //                     $scope.isAvaible = true;
        //                 } else {
        //                     $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, respons.data.password);
        //                 }
        //             }, 'inputPassword', [$scope.passwordData.data.secSession]);
        //         });
        //     }, function () {
        //         Common.showLoading(30000);
        //         checkOrderStatus();
        //     }, function (res) {
        //         Common.hideLoading();
        //         Common.showAlert('温馨提示', '支付失败', function () {
        //             $rootScope.groupOrderFlag = true;
        //             history.back();
        //         })
        //     }, 1, function () {
        //         history.back();
        //     });
        // };
        /*----------------------------------------------------*/
    })
    .directive('payingBox', function () {
        return {
            restrict: 'E',
            template: '<div id="paying-wrapper">' +
            '             <div class="paying-container">' +
            '                 <div class="shop-info">' +
            '                     <img ng-src="{{shopImg || \'img/df-u-img.png\'}}" err-src="img/df-u-img.png" alt="">' +
            '                     <span>{{shopName}}</span> ' +
            '                 </div>' +
            '                 <div class="paying-money"> ' +
            '                     <span>￥</span>' +
            '                     <span>{{money | moneyUnit}}</span> ' +
            '                 </div> ' +
            '                 <p class="desc">支付查询中...</p> ' +
            '                 <div class="btn" ng-click="cancel()">取消</div> ' +
            '             </div> ' +
            '          </div>',
            scope: {
                shopImg: '=',
                shopName: '=',
                money: '=',
                cancelPay: '&'
            },
            link: function (scope, element, attrs) {
                //console.log(scope.cancelPay)
                scope.cancel = function () {
                    // element.remove()
                    if (scope.cancelPay) scope.cancelPay();
                }
            }
        }
    });

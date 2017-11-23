var payment_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.payment', {
            url: '/payment',
            views: {
                'tab-index': {
                    templateUrl: 'component/payment/payment.html',
                    controller: 'paymentCtrl'
                }
            }
        });
};
myapp.config(payment_myConfig);
angular.module('starter.payment', [])
    .controller('paymentCtrl', function($scope, actionSheetItem, $state, Common, cordovaPlug, $timeout, $interval) {
        $scope.showMadal = function() {
            actionSheetItem.showMadal(function() {
                console.log("调到说明页面")
                $state.go('tab.pay_directions');
            }, function() {
                console.log("执行关闭付款码逻辑")
            })
        }
        $scope.showCodeNum = function() {
            if ($scope.barCodeNum == $scope.myCode) $scope.barCodeNum = $scope.myCode.substr(0, 5) + '**************  ';
            else $scope.barCodeNum = $scope.myCode;
        }
        //调用扫一扫
        $scope.gotoscan = function() {
            Common.checkscan();
        }

        $scope.$on('$ionicView.beforeLeave',function(){
            $scope.intervalBool = false;
            Common.setCache('barCodeTime',new Date().getTime())
        })

        $scope.$on('$ionicView.beforeEnter', function() {
            var myData = Common.getCache('banklistColor').data;
            //获取卡列表
            Common.get('lifeAPI/payment/fft/card/', { 'type': 1 }, function(data) {
                var oldData = data.data;
                for (var i = 0; i < oldData.length; i++) {
                    oldData[i].bankImg = 'img/bank/' + myData[oldData[i].bankIndex].icon;
                    oldData[i].color = myData[oldData[i].bankIndex].color;
                }
                $scope.bankList = oldData;
                gotogetCode($scope.bankList);
            }, {});
            $scope.intervalBool = true;

            $scope.changeBank = function() {
                actionSheetItem.changeBank($scope.bankList, $scope.cardIndex, function(data) {
                    $scope.newBank = data;
                    $scope.cardIndex = data.cardIndex;
                    Common.get("lifeAPI/payment/fft/barCode", { "cardIndex": data.cardIndex }, function(data) {
                        Common.setCache('barCodeTime',new Date().getTime());
                        $scope.myCode = data.data.barCode;
                        $scope.barCodeNum = data.data.barCode.substr(0, 5) + '**************  ';
                        gotoCode(data.data);
                        $timeout(function(){
                            checkBarCode(data.data.barCode);
                        },5000);
                    }, {});
                });
            };


            function gotogetCode(_data) {
                
                for (var i = 0; i < _data.length; i++) {
                    console.log(_data[i]);
                    $scope.checkNum = 0;
                    if(_data[i].defaultFlag == true) $scope.checkNum= i;
                    $scope.newBank = _data[$scope.checkNum];
                }
                $scope.cardIndex = _data[$scope.checkNum].cardIndex;
                Common.get("lifeAPI/payment/fft/barCode", { "cardIndex": _data[$scope.checkNum].cardIndex }, function(data) {
                    
                    $scope.myCode = data.data.barCode;
                    $scope.barCodeNum = data.data.barCode.substr(0, 5) + '**************  ';
                    gotoCode(data.data);

                    $timeout(function() {
                        checkBarCode(data.data.barCode);
                    },5000);
                }, function(res){
                    Common.hideLoading();
                });
            }

            function gotoCode(_data) {
                cordovaPlug.CommonPL(function(data) {
                    if (data.status == 1) {
                        $scope.QRCode = data.data.QRCodeImage;
                        $scope.BarCode = data.data.BarCodeImage;
                        $scope.$apply();
                    } else {
                        toast.show("插件调用失败！");
                    }
                }, "generateCode", [_data.barCode+"|"+Common.getCache('Token').userId]);
            }

            function checkBarCode(code) {
                if(!$scope.intervalBool) {
                    return;
                }

                if (new Date().getTime() - Common.getCache('barCodeTime') < 5000){
                    return;
                }

                Common.get('lifeAPI/payment/fft/barCodeStatus', { barCode: code }, function(res) {
                    // res.data = {};
                    // res.data.barCodeStatus = 2;
                    // res.data.fftOrderId = 121211212;
                    if (res.data.barStatue == 1) {
                        gotogetCode($scope.bankList);
                    } else if (res.data.barStatue == 2) {

                        checkOrderStatus(res.data.fftOrderId);
                    } else if (res.data.barStatue == 0) {
                        $timeout(function(){
                            checkBarCode(code);
                        },5000);
                    }
                }, {});
            }

            $scope.intervalNum = 0;
            function checkOrderStatus(fftOrderId) {

                $scope.intervalNum++;

                if($scope.intervalNum > 30) {
                    return;
                }
                Common.get('lifeAPI/payment/fft/OrderStatus', { fftOrderId: fftOrderId}, function(res) {
                    if (res.data.orderStatue == '01' || res.data.orderStatue == '02') {
                        $timeout(function() {
                            checkOrderStatus(fftOrderId);
                        }, 5000);
                    } else if (res.data.orderStatue == '03') {
                        // console.log('支付失败');
                        $state.go("tab.payment_finish",{result:"fail",failStatus:res.result,endNum:$scope.newBank.cardNo.substr(-4,4)});
                    } else if (res.data.orderStatue == '00') {
                        $state.go('tab.payment_finish', { paymentNo: res.data.merOrderId,fftOrderId:fftOrderId,result:"success"});
                    } else if (res.data.orderStatue == '04') {
                        // $scope.quickPay = {data:{}}
                        // $scope.quickPay.data.fftOrderid = 12
                        Common.get('lifeAPI/payment/fft/keyboard', {
                            "type": '0',
                            "fftOrderid": fftOrderId
                        }, function(_data) {
                            //调用原生输入键盘,输入完成后调用方法 gotoPasswordPay
                            cordovaPlug.CommonPL(function(respons) {
                                $scope.gotoPasswordPay(fftOrderId, _data, respons.data.password,res.data.merOrderId);

                            }, 'inputPassword', [_data.data.secSession]);
                        }, {});
                    } else if (res.data.orderStatue == '05') {
                        console.log('订单已撤销');
                    }
                }, {});
            }

            //密码支付
            $scope.gotoPasswordPay = function(fftOrderId, _data, secPassword,merOrderId) {
                Common.post_pay('lifeAPI/payment/fft/passwordPay', {
                    "fftOrderId": fftOrderId,
                    "payCardIndex": $scope.newBank.cardIndex,
                    "secIndex": _data.data.secIndex,
                    "secPassword": secPassword,
                }, function() {
                    //actionSheetItem.successPay(12);
                    $state.go('tab.payment_finish', { paymentNo: merOrderId,fftOrderId:fftOrderId,result:"success"});
                }, function() {
                    Common.showAlert('温馨提示', '密码错误', function() {
                        cordovaPlug.CommonPL(function(respons) {
                            $scope.gotoPasswordPay(fftOrderId, _data, respons.data.password,merOrderId);

                        }, 'inputPassword', [_data.data.secSession]);
                    });
                }, function() {
                    checkOrderStatus(fftOrderId);
                }, function (res) {
                    //支付错误回调
                    $state.go('tab.payment_finish', {result:"fail",failStatus:res.result,endNum:$scope.newBank.cardNo.substr(-4,4)});
                });
            };
        });
    });

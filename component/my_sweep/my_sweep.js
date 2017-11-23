var my_sweep_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.my_sweep', {
            url: '/my_sweep/:merchantNo/:userId/:cash',
            hideTab: true,
            views: {
                'tab-mine': {
                    templateUrl: 'component/my_sweep/my_sweep.html',
                    controller: 'my_sweep_newCtrl'
                }
            }
        });
};
myapp.config(my_sweep_myConfig);
angular.module('starter.my_sweep', [])
    .controller('my_sweep_newCtrl', function($scope, actionSheetItem, Common, toast, $state, $stateParams, cordovaPlug, $timeout) {
        $scope.showInput = false;
            //土豪认领
        $scope.showAlert = function() {
                if ($scope.data.price == '' || $scope.data.price == '0' || $scope.data.price == "0.00" || $scope.data.price == "0.0") {
                    toast.show("请输入支付金额，支付金额需大于"+$scope.rlAmountPro.totalAmountMin+"元");
                    return;
                }
                if ($scope.data.price < Number($scope.rlAmountPro.totalAmountMin)) {
                    toast.show("乐抢单支付金额需大于"+$scope.rlAmountPro.totalAmountMin+"元，请重新输入");
                    return;
                }
                $scope.showInput = true;
                if (!$scope.hasInputPrice) $scope.data.inputPrice = Math.ceil($scope.data.price * $scope.rlAmountPro.min);
            }
            //发起乐抢单
        $scope.gotoGroup = function() {
        		if ($scope.data.price == '' || $scope.data.price == '0' || $scope.data.price == "0.00" || $scope.data.price == "0.0") {
                    toast.show("请输入支付金额，支付金额需大于"+$scope.rlAmountPro.totalAmountMin+"元");
                    return;
                }
                if ($scope.data.price < Number($scope.rlAmountPro.totalAmountMin)) {
                    toast.show("乐抢单支付金额需大于"+$scope.rlAmountPro.totalAmountMin+"元，请重新输入");
                    return;
                }

                if ($scope.data.price > 5000) {
                    Common.showAlert('温馨提示','单笔限额不能超过5000元');
                    return;
                }

                var myData = {
                    "imgUrl": $scope.information.photo || './img/df-u-img.png',
                    "merchantImgUrl": $scope.storeInfo.image || './img/df-u-img.png',
                    "merchantName": $scope.storeInfo.shortName,
                    "merchantNo": $scope.merchantNo,
                    "rlAmount": $scope.data.inputPrice || 0,
                    "totalAmount": $scope.data.price,
                    "userId": Common.getCache("Token").userId,
                    "userName": $scope.information.realName,
                    "apiVersion": "V1.1.0"
                }
                Common.post('lifeAPI/groupManagement/buildGroup', myData, function(data) {
                    var url = data.data + '&saleRate='+$scope.storeInfo.saleRate;
                    var param = {
                        groupId: '',        //群id
                        userId: '',         //建群人的ID
                        userName: '',       //发起人
                        totalAmount:'',     //总金额
                        rlAmount : '',      //认领金额
                        mainOrderNo : '',   //主订单号
                        merchantNo : '',    //商户号
                        glMerchantNo : '',  //给乐订单号
                        merchantName : '',  //商户简称
                        merchantImgUrl : '',//商户头像
                        saleRate : '',       //返豆率
                        userType : '',       // 0 -- 发起人，1==参与者
                        operatorId : $stateParams.userId,       //扫描支付人的id
                        url:'',           //完整地址
                        countDownSec : $scope.rlAmountPro.countDownSec*1000 || 60000    //抽奖倒计时（毫秒）
                    }
                    var regs = url.split("?")[1].split("&");
                    regs.forEach(function(v) {
                        var d = v.split("=");
                        param[d[0]] = d[1]
                    })
                    param.url = url.split("?")[0]+ "?groupId="+param.groupId+"&saleRate="+param.saleRate
                    param.userType = 0;
                    Common.setCache(param.groupId,param);
                    $state.go('tab.group_pay_start',{groupId:param.groupId})
                }, function() {
                }, 0);

            }
            //隐藏认领弹框
        $scope.hideInput = function() {
                $scope.showInput = false;
            }
            //取消认领金额
        $scope.cancelInput = function() {
                $scope.showInput = false;
                $scope.showTip = false;
                $scope.hasInputPrice = false;
                $scope.data.inputPrice = '';
            }

        //切换支付模式
        $scope.typeSelect = function(_num) {
                $scope.imgActive = _num == 0 ? false : true;
                if(_num == 1){
                    Common.get('lifeAPI/groupManagement/rlAmountPro',{},function(data){
                        $scope.rlAmountPro = data.data;
                    },{})
                }
            }
            //确定认领金额
        $scope.sureInput = function() {
            if ($scope.data.inputPrice < $scope.data.price * ($scope.rlAmountPro != undefined && $scope.rlAmountPro.min != undefined && $scope.rlAmountPro.min || 0.5)) {
                $scope.showTip = true;
                $scope.showTipText = "认领金额不能低于总金额的"+$scope.rlAmountPro.min*100+"%";
            } else if ($scope.data.inputPrice > $scope.data.price * ($scope.rlAmountPro != undefined && $scope.rlAmountPro.max != undefined && $scope.rlAmountPro.max || 0.8)) {
                $scope.showTip = true;
                $scope.showTipText = "认领金额不能高于总金额的"+$scope.rlAmountPro.max*100+"%";
            } else {
                $scope.showInput = false;
                $scope.showTip = false;
                $scope.hasInputPrice = true;
            }
        }
        $scope.$on('noWechat', function (event, res) {
            if (res) {
                $scope.queryBoo = false;
            }
        })
        $scope.checkNum = 0;
        $scope.$on('$ionicView.beforeLeave', function() {
            $scope.leave = true;
            $scope.queryBoo = false;
        })
        $scope.$on('$ionicView.beforeEnter', function() {
            //actionSheetItem.wxPayModel('https://www.baidu.com')
           	var myOpenNum = 0;
            $scope.queryBoo = false;
            $scope.leave = false;
            $scope.imgActive = false;
            $scope.hasInputPrice = false;
            $scope.mybalanceNum = 0;
            $scope.payTypeActive = false;
            var preMybalanceNum = 0;
            $scope.information = Common.getCache('information');
            $scope.data = {
                price: '',
                inputPrice: ''
            };
            $scope.keyboardStatus = 0;
            $scope.isAvaible = true;

            $scope.merchantNo = $stateParams.merchantNo;
            $scope.operatorId = $stateParams.userId;
            $scope.cash = parseFloat($stateParams.cash);
            if ($scope.cash) {
                $scope.isCash = true;
                $scope.data.price = $scope.cash;
            }

            $scope.$watch('data.inputPrice', function(n) {
                var reg = /^\d+?$/;
                if (!reg.test(n)) $scope.data.inputPrice = n.toString().substr(0,n.length-1);
            });
            //乐豆开关
            var myDataCoin = Common.getCache("information");
            $scope.isChecked = myDataCoin.enableHappyCoin;
            $scope.balanceNumText = $scope.isChecked ? '乐豆支付' : '可用乐豆';
			
            Common.get('lifeAPI/payment/user/happycoin/', {}, function(data) {
                $scope.mybalanceNum = data.data.amount;
                preMybalanceNum = data.data.amount;

                $scope.$watch('data.price', function(n) {
//              	console.log(myOpenNum)
                    $scope.hasInputPrice = false;
                    $scope.data.inputPrice = '';
                    var reg = /^\d+(\.\d{0,2})?$/;
                    if (!reg.test(n)) $scope.data.price = n.substr(0, n.length - 1);
                    $scope.backRate = (n * $scope.saleRate / 100).to_Fixed(2).toFixed(2);
                    if ($scope.isChecked) {
                        if ($scope.data.price == '' || $scope.data.price <= 1) {
                            $scope.mybalanceNum = 0;
                            $scope.payCash = n;
                        } else if ($scope.data.price - preMybalanceNum < 1) {
                            $scope.payCash = 1;
                            $scope.mybalanceNum = ($scope.data.price - 1).toFixed(2);
                        } else if (preMybalanceNum >= n) {
                            $scope.payCash = 1;
                            $scope.mybalanceNum = ($scope.data.price - 1).toFixed(2);
                        } else {
                            $scope.mybalanceNum = preMybalanceNum;
                            $scope.payCash = ($scope.data.price - $scope.mybalanceNum).toFixed(2);
                        }
                        // 控制tips提示
//                      if ($scope.imgActive) return;
//                      if(myOpenNum == 0) return;
//              		else myOpenNum++;
//                      if ($scope.data.price <= 1) {
//                          toast.show('支付金额大于一元才能使用乐豆')
//                      } else if ($scope.data.price - preMybalanceNum < 1) {
//                          toast.show('使用乐豆，银行卡支付需要大于一元')
//                      } else if (preMybalanceNum >= n) {
//                          toast.show('使用乐豆，银行卡支付需要大于一元')
//                      }
                    } else {
                        $scope.mybalanceNum = preMybalanceNum;
                        $scope.payCash = n;
                    }
                });
            }, {});


            $scope.beanChecked = function() {
                $scope.isChecked = !$scope.isChecked;
//              if ($scope.data.price <= 1) {
//                  toast.show('支付金额大于一元才能使用乐豆')
//                  return;
//              }
                var myChecked = $scope.isChecked ? '1' : '0';
                $scope.balanceNumText = $scope.isChecked ? '乐豆支付' : '可用乐豆';
                Common.put("lifeAPI/user/enableHappyCoin", {
                    "value": myChecked
                }, function(data) {
                    myDataCoin.enableHappyCoin = $scope.isChecked;
                    $scope.payCash = $scope.data.price;
                    if ($scope.isChecked) {
                        if ($scope.data.price == '' || $scope.data.price <= 1) {
                            $scope.mybalanceNum = 0;
                        } else if (preMybalanceNum >= $scope.payCash) {
                            $scope.payCash = 1;
                            $scope.mybalanceNum = ($scope.data.price - 1).toFixed(2);
                        } else if ($scope.data.price - preMybalanceNum < 1) {
                            $scope.payCash = 1;
                            $scope.mybalanceNum = ($scope.data.price - 1).toFixed(2);
                        } else {
                            $scope.payCash = ($scope.data.price - preMybalanceNum).toFixed(2);
                            $scope.mybalanceNum = preMybalanceNum;
                        }
                    } else {
                        $scope.mybalanceNum = preMybalanceNum;
                    }

                    Common.setCache("information", myDataCoin);
                }, {}, 1);
            };
            $scope.saleRate = 0;
            $scope.backRate = 0;
            $scope.payCash = 0;
            Common.get('lifeAPI/merchant/detail/' + $scope.merchantNo, {}, function(data) {
                $scope.storeInfo = data.data;
                $scope.saleRate = parseFloat($scope.storeInfo.saleRate);
                $scope.backRate = ($scope.data.price * $scope.saleRate / 100).to_Fixed(2).toFixed(2);
                $scope.merchantNo = data.data.merchantNo;
                if ($scope.isChecked) {
                    if ($scope.mybalanceNum >= $scope.data.price) $scope.payCash = 0;
                    else $scope.payCash = ($scope.data.price - $scope.mybalanceNum).toFixed(2);
                } else {
                    $scope.payCash = $scope.data.price;
                }
            }, function() {}, 0);
            //补全小数点两位
            function changeTwoDecimal(x) {
                var f_x = parseFloat(x);
                if (isNaN(f_x)) {
                    return false;
                }
                var f_x = Math.round(x * 100) / 100;
                var s_x = f_x.toString();
                var pos_decimal = s_x.indexOf('.');
                if (pos_decimal < 0) {
                    pos_decimal = s_x.length;
                    s_x += '.';
                }
                while (s_x.length <= pos_decimal + 2) {
                    s_x += '0';
                }
                return s_x;
            }
            var newTime;
            $scope.gotoPay = function() {
                if ($scope.data.price === '' || !$scope.data.price) {
                    Common.showAlert('温馨提示','请输入支付金额');
                    return;
                }

                if ($scope.data.price > 5000) {
                    Common.showAlert('温馨提示','单笔限额不能超过5000元');
                    return;
                }

                Common.post('/lifeAPI/wxPay/commonPay',{
                    'orderTitle':$scope.storeInfo.shortName + '_消费',
                    'totalAmount':$scope.data.price,
                    'operatorId':$scope.operatorId,
                    'merchantNo':$scope.merchantNo,
                    'callbackUrl':'https://pay.365gl.com/quick/test/wxpayh5/wx_pay.html#/tab/payment_finish/'+$scope.merchantNo+'?orderNo=%s'
                    // 'callbackUrl':'https://pay.365gl.com/quick/test/wxpayh5/wx_pay.html#/tab/payment_finish/'+$scope.merchantNo+'?orderNo=%s'
                },function(data){
                    Common.UMclickEvent("paymentEvent");
                    Common.wxplayOpen(data.data.payUrl);
                    $scope.queryBoo = true;
                    $scope.gotoQuery(data.data.orderNo);
                },{},1)
            };
            $scope.gotoQuery = function(orderNo){
                if(!$scope.queryBoo) return;
                Common.get('lifeAPI/wxPay/wxPayFinish',{
                    orderNo:orderNo
                },function(data){
                    //orderStatus   0未付款，1完成付款，2付款中9付款失败
                    if(data.data.orderStatus == 1){
                        window.location.href = '#/tab/payment_finish/'+$scope.merchantNo+'?orderNo='+orderNo;
                    }else if(data.data.orderStatus == 9){
                        $scope.queryBoo = false;
                        Common.showAlert('','支付失败，请稍后再试')
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
        });
    });
// angular.module('starter.my_sweep', [])
//     .controller('my_sweepCtrl', function($scope, actionSheetItem, Common, toast, $state, $stateParams, cordovaPlug, $timeout) {
//         $scope.showInput = false;
        

//         $scope.changeBank = function() {
//             actionSheetItem.changeBank($scope.bankList, $scope.mybankCheck.cardIndex, function(data) {
//                 $scope.mybankCheck = data;
//             });
//         };
//         //切换支付模式
//         $scope.typeSelect = function(_num) {
//                 $scope.imgActive = _num == 0 ? false : true;
//                 if(_num == 1){
//                     Common.get('lifeAPI/groupManagement/rlAmountPro',{},function(data){
//                         $scope.rlAmountPro = data.data;
//                     },{})
//                 }
//             }
//             //土豪认领
//         $scope.showAlert = function() {
//                 if ($scope.data.price == '' || $scope.data.price == '0' || $scope.data.price == "0.00" || $scope.data.price == "0.0") {
//                     toast.show("请输入正确金额");
//                     return;
//                 }
//                 if ($scope.data.price < Number($scope.rlAmountPro.totalAmountMin)) {
//                     toast.show("乐抢单金额不能小于"+$scope.rlAmountPro.totalAmountMin+"元");
//                     return;
//                 }
//                 $scope.showInput = true;
//                 if (!$scope.hasInputPrice) $scope.data.inputPrice = Math.ceil($scope.data.price * $scope.rlAmountPro.min);
//             }
//             //发起乐抢单
//         $scope.gotoGroup = function() {
//                 if ($scope.data.price < Number($scope.rlAmountPro.totalAmountMin)) {
//                     toast.show("乐抢单金额不能小于"+$scope.rlAmountPro.totalAmountMin+"元");
//                     return;
//                 }
//                 var myData = {
//                     "imgUrl": $scope.information.photo || './img/df-u-img.png',
//                     "merchantImgUrl": $scope.storeInfo.image || './img/df-u-img.png',
//                     "merchantName": $scope.storeInfo.shortName,
//                     "merchantNo": $scope.merchantNo,
//                     "rlAmount": $scope.data.inputPrice || 0,
//                     "totalAmount": $scope.data.price,
//                     "userId": Common.getCache("Token").userId,
//                     "userName": $scope.information.realName
//                 }
//                 Common.post('lifeAPI/groupManagement/buildGroup', myData, function(data) {
//                     var url = data.data + '&saleRate='+$scope.storeInfo.saleRate;
//                     var param = {
//                         groupId: '',        //群id
//                         userId: '',         //建群人的ID
//                         userName: '',       //发起人
//                         totalAmount:'',     //总金额
//                         rlAmount : '',      //认领金额
//                         mainOrderNo : '',   //主订单号
//                         merchantNo : '',    //商户号
//                         glMerchantNo : '',  //给乐订单号
//                         merchantName : '',  //商户简称
//                         merchantImgUrl : '',//商户头像
//                         saleRate : '',       //返豆率
//                         userType : '',       // 0 -- 发起人，1==参与者
//                         operatorId : $stateParams.userId,       //扫描支付人的id
//                         url:'',           //完整地址
//                         countDownSec : $scope.rlAmountPro.countDownSec*1000 || 60000    //抽奖倒计时（毫秒）
//                     }
//                     var regs = url.split("?")[1].split("&");
//                     regs.forEach(function(v) {
//                         var d = v.split("=");
//                         param[d[0]] = d[1]
//                     })
//                     param.url = url.split("?")[0]+ "?groupId="+param.groupId+"&saleRate="+param.saleRate
//                     param.userType = 0;
//                     Common.setCache(param.groupId,param)
//                     $state.go('tab.group_pay_start',{groupId:param.groupId})
//                 }, function() {
//                 }, 0);

//             }
//             //隐藏认领弹框
//         $scope.hideInput = function() {
//                 $scope.showInput = false;
//             }
//             //取消认领金额
//         $scope.cancelInput = function() {
//                 $scope.showInput = false;
//                 $scope.showTip = false;
//                 $scope.hasInputPrice = false;
//                 $scope.data.inputPrice = '';
//             }
//             //确定认领金额
//         $scope.sureInput = function() {
//             if ($scope.data.inputPrice < $scope.data.price * ($scope.rlAmountPro != undefined && $scope.rlAmountPro.min != undefined && $scope.rlAmountPro.min || 0.5)) {
//                 $scope.showTip = true;
//                 $scope.showTipText = "认领金额不能低于总金额的"+$scope.rlAmountPro.min*100+"%";
//             } else if ($scope.data.inputPrice > $scope.data.price * ($scope.rlAmountPro != undefined && $scope.rlAmountPro.max != undefined && $scope.rlAmountPro.max || 0.8)) {
//                 $scope.showTip = true;
//                 $scope.showTipText = "认领金额不能高于总金额的"+$scope.rlAmountPro.max*100+"%";
//             } else {
//                 $scope.showInput = false;
//                 $scope.showTip = false;
//                 $scope.hasInputPrice = true;
//             }
//         }
//         //更换支付方式
//         $scope.changeType = function(num){
//             if(!$scope.payTypeLength) return;
//             $scope.payTypeActive = num == 0 ? false : true;
//         }

//         $scope.checkNum = 0;
//         $scope.$on('$ionicView.beforeLeave', function() {
//             $scope.leave = true;
//         })
//         $scope.$on('$ionicView.beforeEnter', function() {
//             //actionSheetItem.wxPayModel('https://www.baidu.com')
//             // $scope.wxPayShow = true;
//             // $scope.wxUrl = "https://www.baidu.com/index.html#/tab/index"
//             $scope.leave = false;
//             $scope.imgActive = false;
//             $scope.hasInputPrice = false;
//             $scope.mybalanceNum = 0;
//             $scope.payTypeActive = false;
//             var preMybalanceNum = 0;
//             $scope.information = Common.getCache('information');
//             $scope.payType = Common.getCache('onLinepayType');
//             if($scope.payType.length>1) $scope.payTypeLength = true;
//             $scope.data = {
//                 price: '',
//                 inputPrice: ''
//             };
//             $scope.keyboardStatus = 0;
//             $scope.isAvaible = true;

//             $scope.merchantNo = $stateParams.merchantNo;
//             $scope.operatorId = $stateParams.userId;
//             $scope.cash = parseFloat($stateParams.cash);
//             if ($scope.cash) {
//                 $scope.isCash = true;
//                 $scope.data.price = $scope.cash;
//             }

//             $scope.$watch('data.inputPrice', function(n) {
//                 var reg = /^\d+?$/;
//                 if (!reg.test(n)) $scope.data.inputPrice = n.toString().substr(0,n.length-1);
//             });
//             //乐豆开关
//             var myDataCoin = Common.getCache("information");
//             $scope.isChecked = myDataCoin.enableHappyCoin;
//             $scope.balanceNumText = $scope.isChecked ? '乐豆支付' : '可用乐豆';

//             Common.get('lifeAPI/payment/user/happycoin/', {}, function(data) {
//                 $scope.mybalanceNum = data.data.amount;
//                 preMybalanceNum = data.data.amount;

//                 $scope.$watch('data.price', function(n) {
//                     $scope.hasInputPrice = false;
//                     $scope.data.inputPrice = '';
//                     var reg = /^\d+(\.\d{0,2})?$/;
//                     if (!reg.test(n)) $scope.data.price = n.substr(0, n.length - 1);
//                     $scope.backRate = (n * $scope.saleRate / 100).to_Fixed(2).toFixed(2);
//                     if ($scope.isChecked) {
//                         if ($scope.data.price == '' || $scope.data.price <= 1) {
//                             $scope.mybalanceNum = 0;
//                             $scope.payCash = n;
//                         } else if ($scope.data.price - preMybalanceNum < 1) {
//                             $scope.payCash = 1;
//                             $scope.mybalanceNum = ($scope.data.price - 1).toFixed(2);
//                         } else if (preMybalanceNum >= n) {
//                             $scope.payCash = 1;
//                             $scope.mybalanceNum = ($scope.data.price - 1).toFixed(2);
//                         } else {
//                             $scope.mybalanceNum = preMybalanceNum;
//                             $scope.payCash = ($scope.data.price - $scope.mybalanceNum).toFixed(2);
//                         }
//                         // 控制tips提示
//                         if ($scope.imgActive) return;
//                         if ($scope.data.price <= 1) {
//                             toast.show('支付≤1元不能使用乐豆')
//                         } else if ($scope.data.price - preMybalanceNum < 1) {
//                             toast.show('使用乐豆，银行卡支付需要≥1元')
//                         } else if (preMybalanceNum >= n) {
//                             toast.show('使用乐豆，银行卡支付需要≥1元')
//                         }
//                     } else {
//                         $scope.mybalanceNum = preMybalanceNum;
//                         $scope.payCash = n;
//                     }
//                 });
//             }, {});


//             $scope.beanChecked = function() {
//                 $scope.isChecked = !$scope.isChecked;
//                 if ($scope.data.price <= 1) {
//                     toast.show('支付≤1元不能使用乐豆')
//                     return;
//                 }
//                 var myChecked = $scope.isChecked ? '1' : '0';
//                 $scope.balanceNumText = $scope.isChecked ? '乐豆支付' : '可用乐豆';
//                 Common.put("lifeAPI/user/enableHappyCoin", {
//                     "value": myChecked
//                 }, function(data) {
//                     myDataCoin.enableHappyCoin = $scope.isChecked;
//                     $scope.payCash = $scope.data.price;
//                     if ($scope.isChecked) {
//                         if ($scope.data.price == '' || $scope.data.price <= 1) {
//                             $scope.mybalanceNum = 0;
//                         } else if (preMybalanceNum >= $scope.payCash) {
//                             $scope.payCash = 1;
//                             $scope.mybalanceNum = ($scope.data.price - 1).toFixed(2);
//                         } else if ($scope.data.price - preMybalanceNum < 1) {
//                             $scope.payCash = 1;
//                             $scope.mybalanceNum = ($scope.data.price - 1).toFixed(2);
//                         } else {
//                             $scope.payCash = ($scope.data.price - preMybalanceNum).toFixed(2);
//                             $scope.mybalanceNum = preMybalanceNum;
//                         }
//                     } else {
//                         $scope.mybalanceNum = preMybalanceNum;
//                     }

//                     Common.setCache("information", myDataCoin);
//                 }, {}, 1);
//             };


//             $scope.saleRate = 0;
//             $scope.backRate = 0;
//             $scope.payCash = 0;

//             Common.get('lifeAPI/merchant/detail/' + $scope.merchantNo, {}, function(data) {
//                 $scope.storeInfo = data.data;
//                 $scope.saleRate = parseFloat($scope.storeInfo.saleRate);
//                 $scope.backRate = ($scope.data.price * $scope.saleRate / 100).to_Fixed(2).toFixed(2);
//                 $scope.merchantNo = data.data.merchantNo;
//                 if ($scope.isChecked) {
//                     if ($scope.mybalanceNum >= $scope.data.price) $scope.payCash = 0;
//                     else $scope.payCash = ($scope.data.price - $scope.mybalanceNum).toFixed(2);
//                 } else {
//                     $scope.payCash = $scope.data.price;
//                 }
//             }, function() {}, 0);
//             //补全小数点两位
//             function changeTwoDecimal(x) {
//                 var f_x = parseFloat(x);
//                 if (isNaN(f_x)) {
//                     return false;
//                 }
//                 var f_x = Math.round(x * 100) / 100;
//                 var s_x = f_x.toString();
//                 var pos_decimal = s_x.indexOf('.');
//                 if (pos_decimal < 0) {
//                     pos_decimal = s_x.length;
//                     s_x += '.';
//                 }
//                 while (s_x.length <= pos_decimal + 2) {
//                     s_x += '0';
//                 }
//                 return s_x;
//             }
//             //银行卡
//             var myData = Common.getCache('banklistColor').data;
//             Common.get('lifeAPI/payment/fft/card/', {
//                 'type': 1
//             }, function(data) {
//                 var oldData = data.data;
//                 for (var i = 0; i < oldData.length; i++) {
//                     if (myData[oldData[i].bankIndex] == null) continue;
//                     oldData[i].bankImg = 'img/bank/' + myData[oldData[i].bankIndex].icon;
//                     oldData[i].color = myData[oldData[i].bankIndex].color;
//                     if (oldData[i].defaultFlag) {
//                         $scope.mybankCheck = oldData[i];
//                     }
//                 }
//                 if (!$scope.mybankCheck) $scope.mybankCheck = oldData[0];
//                 $scope.bankList = oldData;
//             }, {}, 1);
//             var newTime;
//             //交易流程
//             $scope.orderPay = function() {
//                     var myPayDate = {
//                         photo: $scope.storeInfo.image, // 头像 
//                         shortName: $scope.storeInfo.shortName, //商户名称
//                         payCash: changeTwoDecimal($scope.payCash), //支付金额
//                         price: changeTwoDecimal($scope.data.price), //总金额
//                         backRate: changeTwoDecimal($scope.backRate) //返豆
//                     }
//                     Common.setCache('payDate', myPayDate);
//                     if ($scope.keyboardStatus != 2) {
//                         Common.showLoading();
//                         var data = {
//                             "orderNo": $scope.orderNo,
//                             "title": $scope.storeInfo.shortName + '_消费',
//                             "operatorId": $scope.operatorId,
//                             "description": $scope.storeInfo.shortName + '_消费',
//                             "money": $scope.data.price,
//                             "merchantNo": $scope.merchantNo,
//                             "payCardIndex": $scope.mybankCheck.cardIndex
//                         };
//                         var myReg = /\d/g;
//                         if (myReg.test($scope.data.price) && $scope.orderNo) {
//                             Common.post_pay('lifeAPI/payment/fft/quickPay', data, function(resp) {
//                                 $scope.quickPay = resp;
//                                 if ($scope.quickPay.data.isNeedPayPwd != null) {
//                                     //调用密码token
//                                     Common.get('lifeAPI/payment/fft/keyboard', {
//                                         "type": '0',
//                                         "fftOrderid": $scope.quickPay.data.fftOrderId
//                                     }, function(_data) {
//                                         $scope.passwordData = _data;
//                                         //调用原生输入键盘,输入完成后调用方法 gotoPasswordPay
//                                         Common.showLoading();
//                                         cordovaPlug.CommonPL(function(res) {
//                                             if (res.status == 2) {
//                                                 $scope.keyboardStatus = 2;
//                                                 Common.hideLoading();
//                                                 $scope.isAvaible = true;
//                                             } else {
//                                                 $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, res.data.password);
//                                             }
//                                         }, 'inputPassword', [$scope.passwordData.data.secSession]);
//                                     }, function() {
//                                         Common.hideLoading();
//                                     }, 1);
//                                 } else {
//                                     $state.go('tab.payment_finish', {
//                                         count: $scope.backRate,
//                                         merchantNo: $scope.merchantNo,
//                                         paymentNo: $scope.orderNo,
//                                         money: $scope.data.price,
//                                         result: "success"
//                                     });
//                                     Common.hideLoading();
//                                     // actionSheetItem.successPay(12);
//                                 }
//                             }, function() {
//                                 Common.showAlert('温馨提示', '密码错误', function() {
//                                     Common.showLoading();
//                                     cordovaPlug.CommonPL(function(respons) {
//                                         if (respons.status == 2) {
//                                             $scope.keyboardStatus = 2;
//                                             Common.hideLoading();
//                                             $scope.isAvaible = true;
//                                         } else {
//                                             $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, respons.data.password);
//                                         }
//                                     }, 'inputPassword', [$scope.passwordData.data.secSession]);
//                                 });
//                             }, function() {
//                                 Common.showLoading(30000);
//                                 checkOrderStatus();

//                             }, function(res) {
//                                 //支付错误回调
//                                 $state.go('tab.payment_finish', {
//                                     result: "fail",
//                                     failStatus: res.result,
//                                     endNum: $scope.mybankCheck.cardNo.substr(-4, 4)
//                                 });
//                                 Common.hideLoading();
//                             }, 1);
//                         } else if (!$scope.orderNo) {
//                             toast.show('生成订单号失败');
//                             Common.hideLoading();
//                             $scope.isAvaible = true;
//                         } else {
//                             toast.show('请输入支付金额');
//                             Common.hideLoading();
//                             $scope.isAvaible = true;
//                         }
//                     } else {
//                         Common.showLoading();
//                         cordovaPlug.CommonPL(function(respons) {
//                             if (respons.status == 2) {
//                                 $scope.keyboardStatus = 2;
//                                 Common.hideLoading();
//                                 $scope.isAvaible = true;
//                             } else {
//                                 $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, respons.data.password);
//                             }
//                         }, 'inputPassword', [$scope.passwordData.data.secSession]);
//                     }
//                 }
//                 //点击支付预下单
//             $scope.gotoPay = function() {
//                 Common.post('/lifeAPI/wxPay/commonPay',{
//                     'orderTitle':$scope.storeInfo.shortName + '_消费',
//                     'totalAmount':$scope.data.price,
//                     'operatorId':$scope.operatorId,
//                     'merchantNo':$scope.merchantNo,
//                     'callbackUrl':'http://wxpay.com/#/tab/payment_finish?orderNo=%s'
//                 },function(data){
                    
//                 },{},1)
//                 // actionSheetItem.successPay(12);
//                 // if ($scope.isAvaible) {
//                 //     newTime = new Date().getTime();
//                 //     $scope.isAvaible = false;
//                 //     if (parseFloat($scope.data.price) <= 0 || $scope.data.price == '') {
//                 //         toast.show('请输入正确金额');
//                 //         $scope.isAvaible = true;
//                 //         return;
//                 //     }
//                 //     if($scope.payTypeActive){
//                 //         var payScene = Common.getCache('payScene');
//                 //         //确定下单之前先生成流水
//                 //         Common.post('lifeAPI/payment/orderno', {
//                 //             merchantNo: $scope.merchantNo,
//                 //             scene: payScene
//                 //         }, function(data) {
//                 //             $scope.orderNo = data.data;
//                 //             $scope.orderPay();
//                 //         }, function() {
//                 //             $scope.isAvaible = true;
//                 //         },1);
//                 //     }else{
//                 //         Common.post('/lifeAPI/wxPay/commonPay',{
//                 //             'orderTitle':$scope.storeInfo.shortName + '_消费',
//                 //             'totalAmount':$scope.data.price,
//                 //             'operatorId':$scope.operatorId,
//                 //             'merchantNo':$scope.merchantNo,
//                 //             'callbackUrl':'http://wxpay.com/#/tab/payment_finish?orderNo=%s'
//                 //         },function(data){
                            
//                 //         },{},1)
//                 //     }
                    
//                 // }
//             };
//             //密码支付
//             $scope.gotoPasswordPay = function(fftOrderid, _data1, secPassword) {
//                 Common.showLoading();
//                 Common.post_pay('lifeAPI/payment/fft/passwordPay', {
//                     "fftOrderId": fftOrderid,
//                     "payCardIndex": $scope.mybankCheck.cardIndex,
//                     "secIndex": _data1.data.secIndex,
//                     "secPassword": secPassword,
//                 }, function() {
//                     //actionSheetItem.successPay(12);
//                     $state.go('tab.payment_finish', {
//                         count: $scope.backRate,
//                         merchantNo: $scope.merchantNo,
//                         paymentNo: $scope.orderNo,
//                         money: $scope.data.price,
//                         result: "success"
//                     });
//                     Common.hideLoading();
//                 }, function() {
//                     Common.showAlert('温馨提示', '密码错误', function() {
//                         cordovaPlug.CommonPL(function(respons) {
//                             if (respons.status == 2) {
//                                 $scope.keyboardStatus = 2;
//                                 Common.hideLoading();
//                                 $scope.isAvaible = true;
//                             } else {
//                                 $scope.gotoPasswordPay($scope.quickPay.data.fftOrderId, $scope.passwordData, respons.data.password);
//                             }
//                         }, 'inputPassword', [$scope.passwordData.data.secSession]);
//                     });
//                 }, function() {
//                     Common.showLoading(30000);
//                     checkOrderStatus();
//                 }, function(res) {
//                     $state.go("tab.payment_finish", {
//                         result: "fail",
//                         failStatus: res.result,
//                         endNum: $scope.mybankCheck.cardNo.substr(-4, 4)
//                     });
//                     Common.hideLoading();
//                 }, 1);
//             };


//             function checkOrderStatus() {
//                 if ($scope.leave) return;
//                 $scope.checkNum++;
//                 if ($scope.checkNum > 30 || newTime - new Date().getTime() > 120000) {
//                     Common.hideLoading();
//                     $scope.checkNum = 0;
//                     Common.showAlert('超时提醒', '请求超时,请以账单消息为准！', function() {
//                         $state.go('tab.index');
//                     }, '退出');
//                     return;
//                 }
//                 Common.get('lifeAPI/payment/fft/OrderStatus', {
//                     glOrderId: $scope.orderNo
//                 }, function(res) {
//                     if (res.data.orderStatue == '01' || res.data.orderStatue == '02') {
//                         $timeout(function() {
//                             checkOrderStatus();
//                         }, 5000);
//                     } else if (res.data.orderStatue == '03') {
//                         // toast.show('支付失败');
//                         $state.go("tab.payment_finish", {
//                             result: "fail",
//                             failStatus: res.result,
//                             endNum: $scope.mybankCheck.cardNo.substr(-4, 4)
//                         });
//                         Common.hideLoading();
//                     } else if (res.data.orderStatue == '00') {
//                         toast.show('支付成功');
//                         Common.hideLoading();
//                         $state.go('tab.payment_finish', {
//                             count: $scope.backRate,
//                             merchantNo: $scope.merchantNo,
//                             paymentNo: $scope.orderNo,
//                             money: $scope.data.price,
//                             result: "success"
//                         });
//                     } else if (res.data.orderStatue == '04') {
//                         // $scope.quickPay = {data:{}}
//                         // $scope.quickPay.data.fftOrderid = 12
//                         //调用原生输入键盘,输入完成后调用方法 gotoPasswordPay

//                         Common.get('lifeAPI/payment/fft/keyboard', {
//                             "type": '0',
//                             "fftOrderid": $scope.quickPay.data.fftOrderId
//                         }, function(_data) {
//                             Common.showLoading();
//                             //调用原生输入键盘,输入完成后调用方法 gotoPasswordPay
//                             cordovaPlug.CommonPL(function(resp) {
//                                 if (resp.status == 2) {
//                                     $scope.keyboardStatus = 2;
//                                     Common.hideLoading();
//                                     $scope.isAvaible = true;
//                                 } else {
//                                     $scope.gotoPasswordPay(res.data.fftOrderId, _data, resp.data.password);
//                                 }
//                             }, 'inputPassword', [_data.data.secSession]);
//                         }, function() {
//                             $scope.isAvaible = true;
//                             Common.hideLoading();
//                         });

//                     } else if (res.data.orderStatue == '05') {
//                         toast.show('订单已撤销');
//                         Common.hideLoading();
//                         $scope.isAvaible = true;
//                     }
//                 }, function() {
//                     $scope.isAvaible = true;
//                     Common.hideLoading();
//                 });
//             }

//         });
//     });
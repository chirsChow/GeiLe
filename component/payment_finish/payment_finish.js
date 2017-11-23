var payment_finish_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.payment_finish', {
            url: '/payment_finish/:merchantNo',
            views: {
                'tab-index': {
                    templateUrl: 'component/payment_finish/payment_finish.html',
                    controller: 'payment_finishCtrl'
                }
            }
        });
};
myapp.config(payment_finish_myConfig);
//完成支付（成功 | 失败）
//paymentNo -- 给乐订单流水号
angular.module('starter.payment_finish', [])
    .controller('payment_finishCtrl', function ($scope, $stateParams, $state, Common, $ionicHistory,$location) {
        $scope.$on('$ionicView.beforeEnter', function () {
            Common.get('lifeAPI/wxPay/wxPayFinish',{
                orderNo:$location.search().orderNo
            },function(data){
                $scope.finishData = data.data;
                //打赏
                $scope.gotoExcep = function () {
                    $state.go('tab.payment_exceptional', {
                        'merchantNo': $stateParams.merchantNo,
                        'paymentNo': $location.search().orderNo,
                        'money': $scope.finishData.totalAmount,
                        'backRate' : $scope.finishData.giftAmount
                    });
                };
            },{},1)
            // if ($stateParams.result === "success") {
            //     $scope.myDate = Common.getCache('payDate') || {};
            //     // $scope.myCount = $stateParams.count;

            //      var merchantNo = $stateParams.merchantNo;
            //      $scope.money = money = parseFloat($stateParams.money);

            //     if (!merchantNo) {
            //         Common.get('lifeAPI/payment/orderInfo', {merOrderNo: $stateParams.paymentNo}, function (res) {
            //             $scope.myDate.payCash = res.data.cashAmount;
            //             $scope.myDate.price = res.data.totalAmount;
            //             $scope.myDate.backRate = res.data.giftAmount;
            //             // $scope.myPayDate = {
            //             //     photo : $scope.storeInfo.image,         // 头像 
            //             //     shortName : $scope.storeInfo.shortName,     //商户名称
            //             //     payCash : $scope.payCash,               //支付金额
            //             //     price : $scope.data.price,              //总金额
            //             //     backRate : $scope.backRate              //返豆
            //             // }
            //             merchantNo = res.data.merchantNo;
            //             $scope.money = money = res.data.totalAmount;
            //             Common.get('lifeAPI/merchant/detail/' + merchantNo, {}, function (resp) {
            //                 $scope.myDate.photo = resp.data.image;
            //                 $scope.myDate.shortName = resp.data.shortName;
            //             }, {}, 1);

            //         }, {});
            //     }
            //     //打赏
            //     $scope.gotoExcep = function () {
            //         Common.clearCache('payDate')
            //         $state.go('tab.payment_exceptional', {
            //             'merchantNo': merchantNo,
            //             'paymentNo': $stateParams.paymentNo,
            //             'money': money,
            //             'backRate' : $scope.myDate.backRate
            //         });
            //     };
            // }
        });
        // //银行卡尾号
        // $scope.endNum = $stateParams.endNum || false;
        // //支付成功 success | 失败 fail
        // $scope.result = $stateParams.result || "fail";

        // if ($stateParams.result === "fail") {
        //     var _bankCodeEnd = '';
        //     if ($scope.endNum) {
        //         _bankCodeEnd = '<span class="end-num">您的 ' + $scope.endNum + ' 结尾的</span>';
        //     }
        //     switch ($stateParams.failStatus) {
        //         case "300025":
        //             $scope.failResult = _bankCodeEnd + '银行卡余额不足，无法支付！';
        //             Common.showAlert("支付失败", "银行卡余额不足，请更换银行卡支付", function () {
        //                 window.history.back();//注意:返回进入上一个界面，需要重新生成订单流水
        //             });
        //             break;
        //         case "300026":
        //             $scope.failResult = '账户状态异常，支付失败';
        //             break;
        //         case "300027":
        //             $scope.failResult = '日交易限额超限，支付失败';
        //             break;
        //         case "300028":
        //             $scope.failResult = '商家收款额度超限，支付失败';
        //             break;
        //         case "300029":
        //             $scope.failResult = '商家账号被冻结，支付失败';
        //             break;
        //         case "300030":
        //             $scope.failResult = '您的账户未通过人行认证，支付失败';
        //             break;
        //         case "300031":
        //             $scope.failResult = _bankCodeEnd + '银行卡不支持当前支付！';
        //             Common.showAlert("支付失败", "该银行卡不支持当前支付，请更换银行卡支付", function () {
        //                 window.history.back();//注意:返回进入上一个界面，需要重新生成订单流水
        //             });
        //             break;
        //         case "300032":
        //             $scope.failResult = '支付失败，付款方不能与收款方相同';
        //             break;
        //         case "300033":
        //             $scope.failResult = '输入支付密码错误次数超限，账户被冻结24小时，无法进行交易';
        //             break;
        //         case "300011":
        //             $scope.failResult = "支付失败，请重新支付";
        //             break;
        //         default:
        //             $scope.failResult = '支付失败';
        //             break;
        //     }
        // }
        //返回
        $scope.gotoBack = function () {
            $state.go('tab.index');
        }
    });

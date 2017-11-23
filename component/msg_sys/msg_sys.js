var msg_sys_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.msg_sys', {
            url: '/msg_sys',
            hideTabs: true,
            views: {
                'tab-index': {
                    templateUrl: 'component/msg_sys/msg_sys.html',
                    controller: 'msg_sysCtrl'
                }
            }
        });
};
myapp.config(msg_sys_myConfig);

angular.module('starter.msg_sys', [])
    .controller('msg_sysCtrl', function ($scope, $ionicHistory, Common, $state) {

        $scope.goBack = function () {
            window.history.back()
        };

        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.list = Common.getCache('msg_sys');
            if ($scope.list.tranType == 2100 && $scope.list.orderType == 7) {
                Common.get('lifeAPI/groupPay/queryMainOrderStatue', {
                    orderNo: $scope.list.orderNo
                }, function (res) {
                    $scope.groupId = res.data.groupId;

                    if (res.data.payStatue == 7 || res.data.payStatue == 5) {
                        Common.post('lifeAPI/turnTable/getCancelOrderStatus',{
                            groupId:$scope.groupId
                        },function(resp) {
                            $scope.isFinish = resp.data.isAllCancelOrder;
                        })
                    }
                });
            }

        });

        $scope.linkGroupDetail = function () {
            $state.go('tab.msg_group_pay_refund', {groupId: $scope.groupId})
        }
    })
    .filter('cashAmt', function () {
        return function (type) {
            switch (type) {
                case '1000':
                    return '现金支付';
                case '1001':
                    return '冲正现金支付';
                case '1100':
                    return '现金支付';
                case '1101':
                    return '冲正现金支付';
                case '2000':
                    return '退回现金支付';
                case '2001':
                    return '冲正现金支付';
                case '2100':
                    return '退回现金支付';
                case '2101':
                    return '冲正现金支付';
                case '3000':
                    return '退回现金支付';
                case '3100':
                    return '退回现金支付';
                case '3200':
                    return '退回现金支付';
                case '3300':
                    return '退回现金支付';
                case '4100':
                    return '现金支付';
                case '4101':
                    return '冲正现金支付';
            }
        };
    })
    .filter('beanAmt', function () {
        return function (type) {
            switch (type) {
                case '1000':
                    return '乐豆支付';
                case '1001':
                    return '冲正乐豆支付';
                case '1100':
                    return '乐豆支付';
                case '1101':
                    return '冲正乐豆支付';
                case '2000':
                    return '退回乐豆支付';
                case '2001':
                    return '冲正乐豆支付';
                case '2100':
                    return '退回乐豆支付';
                case '2101':
                    return '冲正乐豆支付';
                case '3000':
                    return '退回乐豆支付';
                case '3100':
                    return '退回乐豆支付';
                case '3200':
                    return '退回乐豆支付';
                case '3300':
                    return '退回现金支付';
                case '4100':
                    return '乐豆支付';
                default:
                    return '乐豆支付';
            }
        };
    })
    .filter('giftAmt', function () {
        return function (type) {
            switch (type) {
                case '1000':
                    return '赠送乐豆';
                case '1001':
                    return '冲正赠送乐豆';
                case '1100':
                    return '赠送乐豆';
                case '1101':
                    return '冲正赠送乐豆';
                case '2000':
                    return '收回消费抵扣';
                case '2001':
                    return '冲正赠送乐豆';
                case '2100':
                    return '收回消费抵扣';
                case '2101':
                    return '冲正赠送乐豆';
                case '3000':
                    return '收回消费抵扣';
                case '3100':
                    return '收回消费抵扣';
                case '3200':
                    return '收回消费抵扣';
                case '3300':
                    return '收回消费抵扣';
                case '4100':
                    return '赠送乐豆';
                case '4101':
                    return '收回消费抵扣';
            }
        };
    })
    .filter('payTitle', function () {
        return function (type) {
            switch (type) {
                case '1000':
                    return '交易单号';
                case '1001':
                    return '冲正单号';
                case '1100':
                    return '交易单号';
                case '1101':
                    return '冲正单号';
                case '1102':
                    return '交易单号';
                case '2000':
                    return '退款单号';
                case '2001':
                    return '冲正单号';
                case '2100':
                    return '退款单号';
                case '2101':
                    return '冲正单号';
                case '3000':
                    return '退货单号';
                case '3100':
                    return '退货单号';
                case '3200':
                    return '退货单号';
                case '3300':
                    return '退货单号';
                case '4100':
                    return '交易单号';
                case '4101':
                    return '冲正单号';
            }
        };
    })
    .filter('payTypeFilter', function () {
        return function (type) {
            if (type == 0) {
                return '快捷支付';
            } else if (type == 1) {
                return '付款码支付';
            } else if (type == 2) {
                return 'C扫B支付';
            } else if (type == 3) {
                return 'POS支付';
            } else if (type == 4 || type == 5) {
                return '微信支付'
            }
        };
    })
    .filter('orderTypeFilter', function () {
        return function (type) {
            if (type == 1) {
                return '个人买单';
            } else if (type == 2) {
                return '打赏';
            } else if (type == 3) {
                return '达人订单';
            } else if (type == 4) {
                return '网购订单';
            } else if (type == 5) {
                return '打赏';
            } else if (type == 6) {
                return 'C到C乐豆支付';
            } else if (type == 7) {
                return '乐抢单';
            } else {
                return '个人买单';
            }
        };
    })
    .filter('moneyUnit', function () {
        return function (input, bool) {
            if (!input) {
                return '0.00';
            }
            input = parseFloat(input);
            input = input.toFixed(2);
            if (bool) {
                return '￥' + input;
            } else {
                return input;
            }
        };
    })
// orderType:
//     1：正常订单
//     2：打赏订单（现金）
//     3：达人订单
//     4：网购订单
//     5：乐豆打赏
//     6：C到C乐豆支付
//     7：群支付
;

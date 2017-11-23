var mine_bill_groupPay_detail_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.mine_bill_groupPay_detail', {
            url: '/mine_bill_groupPay_detail?{orderNo}',
            views: {
                'tab-mine': {
                    templateUrl: 'component/mine_bill_groupPay_detail/mine_bill_groupPay_detail.html',
                    controller: 'mine_bill_groupPay_detailCtrl'
                }
            }
        });
};
myapp.config(mine_bill_groupPay_detail_myConfig);

angular.module('starter.mine_bill_groupPay_detail', [])
    .controller('mine_bill_groupPay_detailCtrl', function ($scope, Common, $state, $stateParams) {
        $scope.$on('$ionicView.beforeEnter', function () {

            $scope.comment = null;
            $scope.baseInfo = Common.getCache('billDetails');

            if ($scope.baseInfo.orderType == 7 && $scope.baseInfo.operationName == '乐抢单') { // 乐抢单正常账单查询是否有详情入口
                Common.get('lifeAPI/groupPay/queryMainOrderStatue', {
                    orderNo: $stateParams.orderNo
                }, function (res) {
                    $scope.groupId = res.data.groupId;
                    if (res.data.payStatue == 1) {
                        $scope.isFinish = true;
                    } else if ((res.data.payStatue == 7 || res.data.payStatue == 5) && $scope.baseInfo.operationName == '退款') {
                        Common.post('lifeAPI/turnTable/getCancelOrderStatus',{
                            groupId:$scope.groupId
                        },function(resp) {
                            $scope.isFinish2 = resp.data.isAllCancelOrder;
                        })
                    }
                });
            }

            if ($scope.baseInfo.orderType == 7 && $scope.baseInfo.operationName == '退款') { // 乐抢单撤单账单查询是否有撤单详情入口
                if($scope.baseInfo.perOrderNo) {
                    Common.get('lifeAPI/groupPay/queryMainOrderStatue', {
                        orderNo: $scope.baseInfo.perOrderNo
                    }, function (res) {
                        $scope.groupId = res.data.groupId;
                        if (res.data.payStatue == 7 || res.data.payStatue == 5) {
                            Common.post('lifeAPI/turnTable/getCancelOrderStatus',{
                                groupId:$scope.groupId
                            },function(resp) {
                                $scope.isFinish2 = resp.data.isAllCancelOrder;
                            })
                        }
                    });
                }
            }

            Common.get('lifeAPI/merchant/detail/' + $scope.baseInfo.merchantNo, {}, function (data) {
                $scope.img = data.data.images[0];
                $scope.shortName = data.data.shortName;
            }, function () {
                $scope.img = 'img/df-u-img.png';
            });

            $scope.linkDetail = function () {
                $state.go('tab.group_pay_detail', {groupId: $scope.groupId})
            };

            $scope.linkDetail2 = function () {
                $state.go('tab.group_pay_refund_detail', {groupId: $scope.groupId})
            };

            $scope.linkDaShang = function ($event, list) {
                $event.stopPropagation();
                $state.go("tab.payment_exceptional", {
                    merchantNo: list.merchantNo,
                    paymentNo: list.orderNo,
                    money: list.money,
                    isScore: 'N',
                    backRate: list.returnHappyCoin
                });
            };
        });
    })
    .filter('billPayNoFilter', function () {
        return function (type, obj) {
            if (type === '退款') {
                return obj.returnNo;
            } else {
                return obj.orderNo || obj.paymentNo;
            }
        };
    })
    .filter('substrSceneName', function () {
        return function (type, obj) {
            if (!obj.sceneName) {
                return;
            }
            if (type === '退款') {
                return obj.sceneName.replace('支付','退款');
            } else {
                return obj.sceneName;
            }
        };
    })
;

var group_pay_detail_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.group_pay_detail', {
            url: '/group_pay_detail/{groupId}',
            hideTab: true,
            views: {
                'tab-mine': {
                    templateUrl: 'component/group_pay_detail/group_pay_detail.html',
                    controller: 'group_pay_detailCtrl'
                }
            }
        })
        .state('tab.group_pay_refund_detail', {
            url: '/group_pay_refund_detail/{groupId}',
            hideTab: true,
            views: {
                'tab-mine': {
                    templateUrl: 'component/group_pay_detail/group_pay_refund_detail.html',
                    controller: 'group_pay_refund_detailCtrl'
                }
            }
        });
};
myapp.config(group_pay_detail_myConfig);

angular.module('starter.group_pay_detail', [])
    .controller('group_pay_detailCtrl', function ($scope, Common, $state, $stateParams) {
        $scope.$on('$ionicView.beforeEnter', function () {
            Common.post('lifeAPI/turnTable/getByOrderGroupId', {
                groupId: $stateParams.groupId
            }, function (res) {
                res.data.list.forEach(function (item) {
                    if (item.paymentConfig == 5) {
                        item.cashAmount = res.createCash;
                        item.beanAmount = res.createBean;
                        item.giftAmount = res.createGift;
                    } else {
                        return false;
                    }
                });
                $scope.lists = res.data.list;
                $scope.totalAmount = res.totalAmount;
                $scope.orderNo = res.orderSn;
                $scope.payTime = res.paymentTime;
                $scope.isCreate = res.isCreate;
                $scope.merchantNo = res.merchantNo;
                $scope.createMoney = res.createMoney;

                Common.get('lifeAPI/merchant/detail/' + $scope.merchantNo, {}, function (data) {
                    $scope.img = data.data.images[0];
                    var saleRate = data.data.saleRate;
                    $scope.backRate = ($scope.totalAmount * parseFloat(saleRate) / 100).toFixed(2);
                    $scope.shortName = data.data.shortName;
                }, function () {
                    $scope.img = 'img/df-u-img.png';
                });

                Common.post('/lifeAPI/payment/commentPersonal/status', {
                    paymentNo: $scope.orderNo
                }, function (response) {
                    if(response.data.length > 0) {
                        if(response.data[0].status == 0) {
                            $scope.isReward = true;  //true的时候可以去打赏
                        }
                    } else {
                        $scope.isReward = false;
                    }
                }, function () {
                }, 1);

                if (Common.getCache('Token')) {
                    Common.post('lifeAPI/merchant/comment/bills/groupPay', {
                        "groupId": $stateParams.groupId,
                        "merchantNo" : $scope.merchantNo
                    }, function (data) {
                        if (data.data.createTime) {
                            $scope.isCommentStore = true
                        }
                    }, function (msg) {
                    })
                }
            })
        });

        // $scope.baseInfo = Common.getCache($stateParams.groupId) || {};


        $scope.linkComment = function () {
            $state.go('tab.payment_exceptional', {
                merchantNo: $scope.merchantNo,
                paymentNo: $scope.orderNo,
                money: $scope.createMoney,
                backRate: $scope.backRate
            })
        };

        $scope.linkCreatComment = function () {
            $state.go('tab.group_create_comment', {merchantNo: $scope.merchantNo, hash: new Date().getTime(), groupId:$stateParams.groupId})
        };
    })
    .controller('group_pay_refund_detailCtrl', function ($scope, Common, $state, $stateParams) {
        $scope.$on('$ionicView.beforeEnter', function () {
            Common.post('lifeAPI/turnTable/getByOrderGroupId', {
                groupId: $stateParams.groupId,
                orderStatus: '5'
            }, function (res) {
                res.data.list.forEach(function (item) {
                    if (item.paymentConfig == 5) {
                        item.cashAmount = res.createCash;
                        item.beanAmount = res.createBean;
                        item.giftAmount = res.createGift;
                    } else {
                        return false;
                    }
                });
                $scope.lists = res.data.list;
                $scope.totalAmount = res.totalAmount;
                $scope.orderNo = res.orderSn;
                $scope.payTime = res.paymentTime;
                $scope.isCreate = res.isCreate;
                $scope.merchantNo = res.merchantNo;
                $scope.createMoney = res.createMoney;

                Common.get('lifeAPI/merchant/detail/' + $scope.merchantNo, {}, function (data) {
                    $scope.img = data.data.images[0];
                    var saleRate = data.data.saleRate;
                    $scope.backRate = ($scope.totalAmount * parseFloat(saleRate) / 100).toFixed(2);
                    $scope.shortName = data.data.shortName;
                }, function () {
                    $scope.img = 'img/df-u-img.png';
                });

                Common.post('/lifeAPI/payment/commentPersonal/status', {
                    paymentNo: $scope.orderNo
                }, function (response) {
                    if(response.data.length > 0) {
                        if(response.data[0].status == 0) {
                            $scope.isReward = true;  //true的时候可以去打赏
                        }
                    } else {
                        $scope.isReward = false;
                    }
                }, function () {
                }, 1);

                if (Common.getCache('Token')) {
                    Common.post('lifeAPI/merchant/comment/bills/groupPay', {
                        "groupId": $stateParams.groupId,
                        "merchantNo" : $scope.merchantNo
                    }, function (data) {
                        if (data.data.createTime) {
                            $scope.isCommentStore = true
                        }
                    }, function (msg) {
                    })
                }
            })
        });

        // $scope.baseInfo = Common.getCache($stateParams.groupId) || {};


        $scope.linkComment = function () {
            $state.go('tab.payment_exceptional', {
                merchantNo: $scope.merchantNo,
                paymentNo: $scope.orderNo,
                money: $scope.createMoney,
                backRate: $scope.backRate
            })
        };

        $scope.linkCreatComment = function () {
            $state.go('tab.group_create_comment', {merchantNo: $scope.merchantNo, hash: new Date().getTime(), groupId:$stateParams.groupId})
        };
    });

var group_pay_finish_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.group_pay_finish', {
            url: '/group_pay_finish?{personalPay}{cashAmt}{coin}{giftCoin}{totalAmount}{orderNo}{groupId}',
            hideTab: true,
            views: {
                'tab-mine': {
                    templateUrl: 'component/group_pay_finish/group_pay_finish.html',
                    controller: 'group_pay_finishCtrl'
                }
            }
        });
};
myapp.config(group_pay_finish_myConfig);

angular.module('starter.group_pay_finish', [])
    .controller('group_pay_finishCtrl', function ($scope, actionSheetItem, $timeout, $stateParams, $state, Common, $ionicPlatform) {
        $scope.$on('$ionicView.beforeEnter', function () {
            var role = Common.getCache($stateParams.groupId).userType === 0 ? '1' : '2';
            //var role = 2;
            Common.get('lifeAPI/wxGroupPay/groupPayFinish', {
                orderNo:$stateParams.orderNo,
                role:role
            }, function (res) {
                if (role === '1') {
                    $scope.personalPay = res.data.groupMainuserPay;
                } else {
                    $scope.personalPay = res.data.totalAmount;
                }
                $scope.cashAmt = res.data.cashAmount;
                $scope.coin = res.data.beanAmount;
                $scope.giftCoin = res.data.giftAmount;
                $scope.totalAmount = res.data.totalAmount;
                actionSheetItem.successPay($scope.giftCoin);

            }, {});
            // $scope.personalPay = $stateParams.personalPay;
            // $scope.cashAmt = $stateParams.cashAmt;
            // $scope.coin = $stateParams.coin;
            // $scope.giftCoin = $stateParams.giftCoin;
            // $scope.totalAmount = $stateParams.totalAmount;
            //物理返回键
            $scope.debindBackButtonAction = $ionicPlatform.registerBackButtonAction(function (e) {
                e.preventDefault();
                $scope.back();
                return false;
            }, 302);
        });
        $scope.$on('$ionicView.beforeLeave', function () {
            var body = document.getElementById('test');
            var container = document.getElementById('tab_store_action-sheet-container');
            if (container) {
                body.removeChild(container);
            }
            $scope.debindBackButtonAction();

        });
        $scope.back = function () {
            if ($scope.baseInfo.userType == 0) {
                $state.go('tab.index');
            } else {
                window.history.go(-2);
                // $state.go('tab.group_pay_active', {type: $stateParams.groupId, hash: new Date().getTime()})
            }
        };

        var baseInfo = Common.getCache($stateParams.groupId) || {};

        $scope.baseInfo = baseInfo;

        $scope.IsParticipator = $scope.baseInfo.userType === 1; // 区分是发起者还是参与者
        $scope.titleTips = $scope.IsParticipator ? '个人支付金额' : '乐抢单总金额';

        $scope.linkComment = function () {
            $state.go('tab.payment_exceptional', {
                merchantNo: baseInfo.merchantNo,
                paymentNo: $stateParams.orderNo,
                money: $stateParams.personalPay,
                backRate: $scope.giftCoin
            })
        };

        $scope.linkDetail = function () {
            $state.go('tab.group_pay_detail', {
                groupId: $stateParams.groupId
            })
        };

    });

var mine_bill_details_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.mine_bill_details', {
            url: '/mine_bill_details',
            hideTab:true,
            views: {
                'tab-mine': {
                    templateUrl: 'component/mine_bill_groupPay_detail/mine_bill_groupPay_detail.html',
                    controller: 'mine_bill_detailsCtrl'
                }
            }
        });
};
myapp.config(mine_bill_details_myConfig);

angular.module('starter.mine_bill_details', [])
    .controller('mine_bill_detailsCtrl', function($scope, Common, $state, $ionicHistory) {
        $scope.$on('$ionicView.beforeEnter', function() {

            $scope.baseInfo = Common.getCache('billDetails');
            console.log($scope.baseInfo)
            var userId = Common.getCache('Token').userId;

            Common.get('lifeAPI/merchant/detail/' + $scope.baseInfo.merchantNo, {}, function(data) {
                $scope.img = data.data.images[0];
            }, function() {
                $scope.img = 'img/df-u-img.png';
            });

            Common.post('/lifeAPI/payment/OrderCommentStatus', {
                "merchantNo": $scope.baseInfo.merchantNo,
                "paymentNo": $scope.baseInfo.paymentNo,
                "userId": userId
            }, function(res) {
                $scope.comment = res.data.status;
            });

            $scope.isFinish = false;

            $scope.linkComment = function() {
                $state.go('tab.create_comment', {merchantNo: $scope.baseInfo.merchantNo, hash: new Date().getTime()})
            };

            $scope.linkDaShang = function($event, list) {
                $event.stopPropagation();
                $state.go("tab.payment_exceptional", { merchantNo: list.merchantNo, paymentNo: list.orderNo, money: list.money, isScore: 'N',backRate:list.returnHappyCoin});
            };

            $scope.goBack = function() {
                window.history.back()
            };
        });
    })
    .filter('scenceFilter', function() {
        return function(type) {
            if (type == 0) {
                return '快捷支付';
            } else if (type == 1) {
                return '付款码支付';
            } else if (type == 2) {
                return 'C扫B支付';
            } else if (type == 3) {
                return 'POS支付';
            } else if(type == 5 || type == 4){
                return '微信支付';
            }else {
                return type;
            }
        };
    });

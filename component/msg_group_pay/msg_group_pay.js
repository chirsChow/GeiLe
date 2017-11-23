var msg_group_pay_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.msg_group_pay', {
            url: '/msg_group_pay?{orderNo}',
            views: {
                'tab-index': {
                    templateUrl: 'component/msg_group_pay/msg_group_pay.html',
                    controller: 'msg_group_payCtrl'
                }
            }
        });
};
myapp.config(msg_group_pay_myConfig);

angular.module('starter.msg_group_pay', [])
    .controller('msg_group_payCtrl', function ($scope, Common, $stateParams,$state) {
        $scope.$on('$ionicView.beforeEnter', function () {

        });

        Common.get('lifeAPI/groupPay/queryMainOrderStatue', {
            orderNo: $stateParams.orderNo
        },function(res){
            if (res.data.payStatue == 1) {
                $scope.isFinish = true;
            }
            // $scope.isFinish = res.data.payStatue;
            $scope.groupId = res.data.groupId;
        });

        $scope.baseInfo = Common.getCache('msg_sys');

        Common.get('lifeAPI/merchant/detail/' + $scope.baseInfo.merchantNo, {}, function(data) {
            $scope.img = data.data.images[0];
            $scope.shortName = data.data.shortName;
        }, function() {
            $scope.img = 'img/df-u-img.png';
        });

        $scope.linkDetail = function() {
            $state.go('tab.group_pay_detail',{groupId:$scope.groupId})
        }
    });

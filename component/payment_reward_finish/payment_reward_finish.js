var payment_reward_finish_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.payment_reward_finish', {
            url: '/payment_reward_finish/:type/:money',
            views: {
                'tab-index': {
                    templateUrl: 'component/payment_reward_finish/payment_reward_finish.html',
                    controller: 'payment_reward_finishCtrl'
                }
            }
        });
};
myapp.config(payment_reward_finish_myConfig);
//完成打赏
angular.module('starter.payment_reward_finish', [])
    .controller('payment_reward_finishCtrl', function ($scope, $stateParams, $ionicHistory,$state) {
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.myType = $stateParams.type || 0;//默认为打赏
            $scope.money = parseFloat($stateParams.money);
        });
        //返回
        $scope.gotoBack = function () {
            $state.go('tab.index');
        };
    });

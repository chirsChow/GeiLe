var mine_beanfun_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.mine_beanfun', {
            url: '/mine_beanfun',
            views: {
                'tab-mine': {
                    templateUrl: 'component/mine_beanfun/mine_beanfun1.html',
                    controller: 'mine_beanfunCtrl'
                }
            }
        });
};
myapp.config(mine_beanfun_myConfig);

angular.module('starter.mine_beanfun', [])
    .controller('mine_beanfunCtrl', function ($scope, Common, $timeout) {

        $scope.press = function (num) {
            $scope.navNum = num;
            if(num == 0) {
                $scope.left = false;
            } else {
                $scope.left = true;
            }
        };

        $scope.mvRight = function () {
            $scope.left = false;
            $scope.navNum = 0;
        };
        $scope.mvLeft = function () {
            $scope.left = true;
            $scope.navNum = 1;
        };
        $scope.press(1);
        $scope.press(0);
        //加载数据
        var returnPage = 1,
            consumptionPage = 1;
        $scope.returnLists = [];
        $scope.consumptionLists = [];
        //初始化数据
        $scope.noMoreReturn = false;
        $scope.noMoreConsumption = false;
        $scope.loadMoreReturn = function () {
            Common.get('lifeAPI/payment/happycoin/wastebook', {
                queryType: 0,
                curPage: returnPage,
                pageSize: 10
            }, function (data) {
                data.data.list = data.data.list || [];

                $scope.returnLists = $scope.returnLists.concat(data.data.list);

                if (data.data.totalPage == data.data.curPage || data.data.totalPage == 0) {
                    $scope.noMoreReturn = false;
                } else {
                    $scope.noMoreReturn = true;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
                returnPage++;
            });

        };

        $scope.loadMoreReturn();

        $scope.loadMoreConsumption = function () {
            Common.get('lifeAPI/payment/happycoin/wastebook', {
                queryType: 1,
                curPage: consumptionPage,
                pageSize: 10
            }, function (data) {
                data.data.list = data.data.list || [];

                $scope.consumptionLists = $scope.consumptionLists.concat(data.data.list);

                if (data.data.totalPage == data.data.curPage || data.data.totalPage == 0) {
                    $scope.noMoreConsumption = false;
                } else {
                    $scope.noMoreConsumption = true;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
                consumptionPage++;
            });
        };

        $scope.loadMoreConsumption();

        $scope.$on('$ionicView.beforeEnter', function () {

            //获取余额
            Common.get('lifeAPI/payment/user/happycoin/', {}, function (data) {
                $scope.balanceNum = data.data.amount;
            }, {});


        });
    }).filter('operateTypeFilter', function () {
    return function (type) {
        if (!type) {
            return;
        }
        switch (type) {
            case '1000':
                return '-POS消费';
            case '1100':
                return '-网上消费';
            case '2000':
                return '-POS撤销';
            case '2100':
                return '-网上消费撤销';
            case '3000':
                return '-POS退货';
            case '3100':
                return '-POS退货';
            case '3200':
                return '-网上退货';
            case '3300':
                return '-网上退货';
            case '4100':
                return '-预授权完成确认';
            case '6010':
                return '打赏';
            case '6011':
                return '打赏';
            default:
                return;
        }
    }
});

var mine_deductions_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.mine_deductions', {
            url: '/mine_deductions',
            views: {
                'tab-mine': {
                    templateUrl: 'component/mine_deductions/mine_deductions.html',
                    controller: 'mine_deductionsCtrl'
                }
            }
        });
};
myapp.config(mine_deductions_myConfig);

angular.module('starter.mine_deductions', [])
    .controller('mine_deductionsCtrl', function($scope, Common, $http, $state, $ionicHistory) {
        $scope.serverSideChange = function(_item) {
            console.log("选择了" + _item.bankName);
            Common.put('lifeAPI/payment/fft/card', {
                "cardIndex": _item.cardIndex,
                "cardNo": _item.cardNo
            }, function(data) {
                Common.clearCache("bankList");
                window.history.back()
            }, {});
        }
        var myData = Common.getCache('banklistColor').data;
        Common.get('lifeAPI/payment/fft/card/', {
            type: 0
        }, function(data) {
            var oldData = data.data;
            for (var i = 0; i < oldData.length; i++) {
                oldData[i].bankImg = 'img/bank/' + myData[oldData[i].bankIndex].icon;
                oldData[i].color = myData[oldData[i].bankIndex].color;
                if (oldData[i].defaultFlag) {
                    $scope.mybankCheck = oldData[i].bankIndex;
                }
            }
            $scope.bankList = oldData;
        }, {},1);
        $scope.$on('$ionicView.beforeEnter', function() {});
    });
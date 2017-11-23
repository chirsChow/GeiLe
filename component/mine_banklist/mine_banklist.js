var mine_banklist_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.mine_banklist', {
            url: '/mine_banklist',
            views: {
                'tab-mine': {
                    templateUrl: 'component/mine_banklist/mine_banklist.html',
                    controller: 'mine_banklistCtrl'
                }
            }
        });
};
myapp.config(mine_banklist_myConfig);

angular.module('starter.mine_banklist', [])
    .controller('mine_banklistCtrl', function($scope, Common, $http, cordovaPlug, toast,bindCardService,$state) {

        $scope.gotoAddBank = function() {
            $state.go("tab.mine_addNewBankCard");
           // bindCardService.fft(function(){
           //      $scope.bankList = Common.getCache("bankList");
           //      Common.showAlert('温馨提示','绑定成功');
           // }); 
        };
        $scope.$on('$ionicView.beforeEnter', function() {
            var myData = Common.getCache('banklistColor').data;
            Common.get('lifeAPI/payment/fft/card/', { 'type': 1,'isNeedPos':true,"apiVersion":"V1.1.0" }, function(data) {
                var oldData = data.data;
                for (var i = 0; i < oldData.length; i++) {
                    if (myData[oldData[i].bankIndex] == null) continue;
                    oldData[i].bankImg = 'img/bank/' + myData[oldData[i].bankIndex].icon;
                    oldData[i].color = myData[oldData[i].bankIndex].color;
                }
                $scope.bankList = oldData;
                //Common.setCache("bankList", oldData);
            }, {},1);
            $scope.delCard = function(idx, cardIdx) {
                Common.showConfirm("移除银行卡", "是否要移除该银行卡？", function() {
                    Common.post('lifeAPI/user/unbindBankForRegistForApp', {
                        cardIndex: cardIdx
                    }, function(res) {
                        $scope.bankList.splice(idx, 1);
                        //Common.setCache("bankList", $scope.bankList);
                    });
                }, function() {}, '确认', '取消');

            };
        });
    });

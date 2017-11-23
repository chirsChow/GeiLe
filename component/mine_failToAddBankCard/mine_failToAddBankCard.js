var mine_failToAddBankCard_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.mine_failToAddBankCard', {
        url: '/mine_failToAddBankCard',
        views: {
            'tab-index': {
                templateUrl: 'component/mine_failToAddBankCard/mine_failToAddBankCard.html',
                controller: 'mine_failToAddBankCardCtrl'
            }
        }
    });
};
myapp.config(mine_failToAddBankCard_myConfig);

angular.module('starter.mine_failToAddBankCard',[])
.controller('mine_failToAddBankCardCtrl', function($scope) {
    $scope.$on('$ionicView.beforeEnter', function() {

    });
});

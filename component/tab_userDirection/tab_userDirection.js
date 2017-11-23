var tab_userDirection_myConfig = function($stateProvider) {
  $stateProvider
    .state('tab.tab_userDirection', {
      url: '/tab_userDirection',
      hideTab:true,
      views: {
        'tab-index': {
          templateUrl: 'component/tab_userDirection/tab_userDirection.html',
          controller: 'tab_userDirectionCtrl'
        }
      }
    });
};
myapp.config(tab_userDirection_myConfig);

angular.module('starter.tab_userDirection', [])
  .controller('tab_userDirectionCtrl', function($scope, actionSheetItem) {
    $scope.showTel = function() {
      actionSheetItem.showTel("4000200365");
    }
    $scope.$on('$ionicView.beforeEnter', function() {

    });
  });
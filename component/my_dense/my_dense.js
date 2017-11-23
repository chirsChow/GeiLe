var my_dense_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.my_dense', {
        url: '/my_dense',
        views: {
            'tab-mine': {
                templateUrl: 'component/my_dense/my_dense.html',
                controller: 'my_denseCtrl'
            }
        }
    });
};
myapp.config(my_dense_myConfig);

angular.module('starter.my_dense',[])
.controller('my_denseCtrl', function($scope) {
    $scope.$on('$ionicView.beforeEnter', function() {

    });
});

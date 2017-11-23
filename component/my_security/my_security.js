var my_security_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.my_security', {
        url: '/my_security',
        views: {
            'tab-mine': {
                templateUrl: 'component/my_security/my_security.html',
                controller: 'my_securityCtrl'
            }
        }
    });
};
myapp.config(my_security_myConfig);

angular.module('starter.my_security',[])
.controller('my_securityCtrl', function($scope) {
    $scope.$on('$ionicView.beforeEnter', function() {

    });
});

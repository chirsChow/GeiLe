var my_surface_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.my_surface', {
        url: '/my_surface',
        views: {
            'tab-index': {
                templateUrl: 'component/my_surface/my_surface.html',
                controller: 'my_surfaceCtrl'
            }
        }
    });
};
myapp.config(my_surface_myConfig);

angular.module('starter.my_surface',[])
.controller('my_surfaceCtrl', function($scope) {
    $scope.$on('$ionicView.beforeEnter', function() {

    });
});

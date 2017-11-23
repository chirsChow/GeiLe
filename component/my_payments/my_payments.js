var my_payments_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.my_payments', {
        url: '/my_payments',
        views: {
            'tab-mine': {
                templateUrl: 'component/my_payments/my_payments.html',
                controller: 'my_paymentsCtrl'
            }
        }
    });
};
myapp.config(my_payments_myConfig);

angular.module('starter.my_payments',[])
.controller('my_paymentsCtrl', function($scope,Common,$timeout) {
    $scope.$on('$ionicView.beforeEnter', function() {
         var myData = Common.getCache("information");
        $scope.isChecked = myData.enableHappyCoin;
        $scope.beanChecked = function(){
            $scope.isChecked = !$scope.isChecked;
            var myChecked = $scope.isChecked ? '1' : '0';
            Common.put("lifeAPI/user/enableHappyCoin",{
                "value":myChecked
            },function(data){
                myData.enableHappyCoin = $scope.isChecked;
                Common.setCache("information",myData);
            },{});
        }
    });
});

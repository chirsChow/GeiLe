var my_message_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.my_message', {
            url: '/my_message',
            views: {
                'tab-mine': {
                    templateUrl: 'component/my_message/my_message.html',
                    controller: 'my_messageCtrl'
                }
            }
        });
};
myapp.config(my_message_myConfig);

angular.module('starter.my_message', [])
    .controller('my_messageCtrl', function($scope, cordovaPlug, $state, Common) {
        //刚刚进来的时候默认是1开的状态，点击按钮时0关闭
        //获取用户Id 读取主页返回的状态
        
        $scope.$on('$ionicView.beforeEnter', function() {
			var userId = Common.getCache("Token").userId;
	        $scope.isPay = Common.getCache("payMsgStatus" + userId);
	        if($scope.isPay === null||$scope.isPay===undefined){
	            $scope.isPay = true;
	        }else if($scope.isPay === false){
	            $scope.isPay = false;
	        }
	        //$scope.isPay = $scope.isPay === null;
	        $scope.isChecked = Common.getCache("billMsgStatus" + userId);
	        if($scope.isChecked === null||$scope.isChecked===undefined){
	            $scope.isChecked = true;
	        }else if($scope.isChecked === false){
	            $scope.isChecked = false;
	        }
	       // $scope.isChecked = $scope.isChecked === null;
	        // //切换关闭
	        $scope.payCheck = function() {
	            $scope.isPay = !$scope.isPay;
	            $scope.isPay != null ? true : false;
	            if (!$scope.isPay) {
	                Common.showConfirm("", "关闭支付消息通知你将无法在首页收到支付、打赏等系统服务和资金变动提醒", function () {
	                    Common.setCache("payMsgStatus" + userId, false);
	                },function () {
	                    $scope.isPay = true;
	                });
	            }else{
	                Common.setCache("payMsgStatus" + userId, true);
	            }
	        };
	
	        $scope.billu = function () {
	            $scope.isChecked = !$scope.isChecked;
	            $scope.isChecked != null ? true : false;
	            if (!$scope.isChecked) {
	                Common.showConfirm("", "关闭账单消息通知你将无法在首页收到用户的月账单消息提醒", function () {
	                    Common.setCache("billMsgStatus" + userId, false);
	                }, function () {
	                    $scope.isChecked = true;
	                });
	            }else{
	                Common.setCache("billMsgStatus" + userId, true);
	            }
	        };

        });
    });
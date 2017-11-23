var group_pay_start_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.group_pay_start', {
            url: '/group_pay_start/:groupId',
            views: {
                'tab-mine': {
                    templateUrl: 'component/group_pay_start/group_pay_start.html',
                    controller: 'group_pay_startCtrl'
                }
            }
        });
};
myapp.config(group_pay_start_myConfig);

angular.module('starter.group_pay_start', [])
    .controller('group_pay_startCtrl', function($scope, $rootScope, $http, $stateParams, Common, $state, $timeout, $ionicPlatform) {
        //撤销群/退出群
        $rootScope.groupOrderFlag = false; // 初始化是否重新需要重新生成订单标志为false;
        $scope.setshowGuiZes=false
        $scope.setshowGuiZe=function(){
            $scope.setshowGuiZes=!$scope.setshowGuiZes
        }
        $scope.gotoOut = function() {
            if ($scope.myGroup.userType == 0) {
                Common.showConfirm('撤销提醒', '乐抢单这么好玩，确认要退出吗', function() {
                    Common.get('lifeAPI/groupManagement/disMissGroup', {
                        groupId: $stateParams.groupId
                    }, function(data) {
                        $state.go('tab.index');
                        Common.clearCache($stateParams.groupId)
                    }, function() {}, 1)
                }, {}, '确定', '取消')

            } else {
                Common.showConfirm('撤销提醒', '乐抢单这么好玩，确认要退出吗', function() {
                    Common.get('lifeAPI/groupManagement/outGroup', {
                        groupId: $stateParams.groupId
                    }, function(data) {
                        $state.go('tab.index')
                    }, function() {}, 1)
                }, {}, '确定', '取消')
            }
        }
        var qrcode;
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.destroy = $scope.$on("lightUp", function(event, data) {
                $scope.stopPolling = true;
                $timeout(function() {
                    $scope.stopPolling = false;
                    $scope.polling();
                }, 3000)
            });
            $scope.myGroup = Common.getCache($stateParams.groupId);
            $scope.stopPolling = false;
            $timeout(function() {
                qrcode = new QRCode(document.getElementsByClassName("qrcode")[document.getElementsByClassName("qrcode").length - 1], {
                    text: $scope.myGroup.url,
                    width: 180,
                    height: 180,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
            }, 50)

            $scope.polling = function() {
                if ($scope.stopPolling) return;

                Common.get('lifeAPI/groupManagement/queryGroupMember', {
                    groupId: $stateParams.groupId
                }, function(data) {
                    $scope.groupImgArr = data.data;
                    if (data.data.status == "INIT") {
                        $timeout(function() {
                            $scope.polling();
                        }, 3000)
                    } else if (data.data.status == "DISMISS") {
                        Common.showAlert('乐抢单提醒', '乐抢单已经解散，点击确定返回首页', function() {
                            $state.go('tab.index')
                        })
                    } else {
                        $scope.stopPolling = true;
                        if (data.data.status == "BUILD_COMPLETE" && $scope.myGroup.userType == 1) {
                            $state.go('tab.group_pay_active', {
                                type: $stateParams.groupId,
                                hash: new Date().getTime()
                            })
                        }
                    }
                }, function() {})

            }
            $scope.polling();
            $scope.gotoPay = function() {
                Common.post('/lifeAPI/turnTable/allocationAmount', {
                    groupId: $stateParams.groupId,
                }, function(rst) {
                    $state.go('tab.group_pay_active', {
                        type: $stateParams.groupId,
                        hash: new Date().getTime(),
                        goBackNum : '-2'
                    })
                })
            }
            $scope.debindBackButtonAction = $ionicPlatform.registerBackButtonAction(function(e) {
                e.preventDefault();
                $scope.gotoOut();
                return false;
            }, 302);
        });
        $scope.$on('$ionicView.beforeLeave', function() {
            document.getElementsByClassName("qrcode")[document.getElementsByClassName("qrcode").length - 1].innerHTML = '';
            $scope.stopPolling = true;
            $scope.debindBackButtonAction();
            $scope.destroy();
        });
    });
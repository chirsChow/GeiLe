var tabs_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab', {
            url: '/tab',
            cache: false,
            abstract: true,
            views: {
                'tab': {
                    templateUrl: "component/tabs/tabs.html",
                    controller: "tabCtrl"
                }
            }
        });
};
myapp.config(tabs_myConfig);

angular.module('starter.tabs', [])
    .controller('tabCtrl', function($scope, $location, Common, $timeout, $state,$ionicHistory) {
        if (ionic.Platform.isAndroid()) {
            $scope.tabLayerStyle = {
                "height": "1.03rem"
            };
        }
        
        $scope.indexClick = function() {
            window.location.href = "#/tab/index";
        };
        $scope.merchantsClick = function() {
            if (Common.isDebug){
                window.location.href = "#/tab/store_nearby/"+new Date().getTime();
                return;
            } 
            Common.isNetwordConnected(function() {
                if (location.href.indexOf('#/tab/store_nearby/') !== -1) {
                    return;
                } else {
                    window.location.href = "#/tab/store_nearby/"+new Date().getTime();
                }
            });
        };
        $scope.mineClick = function() {
            if (Common.isLogin()) {
                if ($state.current.name === 'tab.tab_mine') {
                    return false;
                } else {
                    window.location.href = "#/tab/tab_mine?time=" + new Date().getTime();
                }
            }
        };
        Common.checkDevice();

        window.broadcastLogout = function(res) {
            Common.get('lifeAPI/isLogin',function(resp){
                console.log(resp)
            })
        };
        //支付完成回调
        window.h5OpenApp = function(data){
            // alert(data)
            // alert('#/'+data.split('#/')[1])
            // window.location.href = '#/'+data.split('#/')[1]
            $scope.$broadcast('noWechat',true);
            Common.showAlert('温馨提示', '请先下载安装微信');
        }

        $timeout(function() {
            Common.checkDevice();
        }, 1000);
        document.addEventListener("resume", function(){
            $scope.$broadcast("lightUp", {}); 
        }, false);
    });

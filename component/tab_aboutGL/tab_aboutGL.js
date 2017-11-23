var tab_aboutGL_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.tab_aboutGL', {
            url: '/tab_aboutGL',
            views: {
                'tab-mine': {
                    templateUrl: 'component/tab_aboutGL/tab_aboutGL.html',
                    controller: 'tab_aboutGLCtrl'
                }
            }
        });
};
myapp.config(tab_aboutGL_myConfig);

angular.module('starter.tab_aboutGL', [])
    .controller('tab_aboutGLCtrl', function($scope, actionSheetItem, Common, $http, cordovaPlug, $timeout) {
        $scope.uploadShow = false;
        $scope.iosShow = false;
        var isClick = false;
        $scope.showTel = function() {
            actionSheetItem.showTel("4000200365");
        }
        $scope.callPhone = function(){
            cordovaPlug.CommonPL(function() {}, "telephone", ['4000200365'])
        }
        $scope.gotoUpload = function() {
            if ($scope.uploadShow) {
                if (!isClick) {
                    isClick = true;
                    cordovaPlug.CommonPL(function() {}, "updateApk", []);
                    $timeout(function() {
                        isClick = false;
                    }, 500);
                }
            } else {
                Common.showAlert("升级提醒", "暂无更新")
            }
        };
        var myClientId = Common.getCache('getDeviceIdAndClientId').ClientId;
        if (myClientId.indexOf('android') != -1) {
            $scope.iosShow = true;
            $http.get('https://upgrade.365gl.com/upgrade/config/android/member-upgrade.json').success(function(_data) {
                $scope.myCode = _data.version;
                cordovaPlug.CommonPL(function(data) {
                    if (data.status == 1) {
                        $scope.newClientVer = data.data.versionName;
                        if (data.data.versionCode < _data.lastVersion) {
                            $scope.uploadShow = true;
                            $scope.$apply();
                        }
                    } else {
                        toast.show("插件调用失败！");
                    }
                }, "getVersionCode", [])
            })
        } else {
            cordovaPlug.CommonPL(function(data) {
                if (data.status == 1) {
                    $scope.newClientVer = data.data.versionName;
                    $scope.$apply();
                } else {
                    toast.show("插件调用失败！");
                }
            }, "getVersionCode", [])
        }
        $scope.$on('$ionicView.beforeEnter', function() {

        });
    });
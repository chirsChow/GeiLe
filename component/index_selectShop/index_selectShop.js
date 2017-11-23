var index_selectShop_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.index_selectShop', {
            url: '/index_selectShop',
            views: {
                'tab-index': {
                    templateUrl: 'component/index_selectShop/index_selectShop.html',
                    controller: 'index_selectShopCtrl'
                }
            }
        });
};
myapp.config(index_selectShop_myConfig);

angular.module('starter.index_selectShop', [])
    .controller('index_selectShopCtrl', function($scope, commonConfigsJson, $rootScope, $http, Common, $state, bindCardService) {
        $scope.searchInput = '';
        //进入买单页面
        $scope.gotoPay = function(id) {
                //商铺详情
                Common.showLoading();
                Common.get('lifeAPI/merchant/detail/' + id, {}, function(data) {
                    if (data.data == null) {
                        toast.show('请求失败，请稍后再试');
                        Common.hideLoading();
                        return;
                    }
                    if (data.data.onlinePay) $scope.pay(id);
                    else {
                        Common.showAlert('温馨提示', '该商户尚未开通在线支付');
                        Common.hideLoading();
                    }
                }, function() {
                    Common.hideLoading();
                })
            }
            //进入乐抢单记录
        $scope.gotoSponsor = function() {
                if (!Common.isLogin()) return;
                $state.go('tab.group_sponsor')
            }
            //买单
        $scope.pay = function(id) {
            Common.hideLoading();
            if (!Common.isLogin()) return;
            if (Common.getCache('information').authStatus == 0) $state.go("tab.my_certification", {
                "nextStep": 1
            })
            else {
                Common.setCache('payScene', '0');
                $state.go('tab.my_sweep', {
                    merchantNo: id,
                    operatorId: '',
                    cash: ''
                });
                // Common.get('lifeAPI/payment/fft/card/', {
                //     'type': 1
                // }, function(data) {
                //     var oldData = data.data;
                //     if (oldData.length == 0) {
                //         //跳转到绑卡
                //         bindCardService.fft(function() {
                //             Common.showAlert('温馨提示', '绑卡成功！');
                //         });
                //     } else {
                //         Common.setCache('payScene','0');
                //         $state.go('tab.my_sweep', {
                //             merchantNo: id,
                //             operatorId: '',
                //             cash: ''
                //         });
                //     }
                // }, {},1);

            }
        }
        $scope.doRefresh = function() {
            $scope.searchInput = '';
            $scope.setLists();
        }
        $scope.searchClick = function() {
            $scope.setLists($scope.searchInput);
        }
        $scope.setLists = function(_name) {
            if ($rootScope.myCity == null) return;
            var urlDis = 'http://api.map.baidu.com/geosearch/v3/nearby?ak=' + commonConfigsJson.baiduAk.ak + '&geotable_id=' + commonConfigsJson.baiduAk.id + '&' +
                'location=' + $rootScope.myCity.longitude + ',' + $rootScope.myCity.latitude + '&page_size=30&page_index=0&tags=&sortby=distance:1&radius=500&q=' + $scope.searchInput;
            $http({
                url: urlDis,
                type: 'get',
            }).success(function(data) {
                $scope.storeListItems = data.contents;
                $scope.$broadcast('scroll.refreshComplete');
            }).error(function() {})
        }
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.searchInput = '';
            $scope.setLists()
        });
    });
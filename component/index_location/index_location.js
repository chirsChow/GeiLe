var index_location_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.index_location', {
        url: '/index_location/:title',
        views: {
            'tab-merchants': {
                templateUrl: 'component/index_location/index_location.html',
                controller: 'index_locationCtrl'
            }
        }
    });





};
myapp.config(index_location_myConfig);

angular.module('starter.index_location',[])
.controller('index_locationCtrl', function($scope,Common,$state,$rootScope,toast,$stateParams,$window,$ionicHistory) {
    //历史记录
     var locationHistory;
     var firstSearch = true;
    $scope.searchInput ="";
    $scope.myCity = false
    $scope.reLocationNewing = false;
    $scope.reLocationNew = function(){
        if($scope.reLocationNewing) return
        $scope.reLocationNewing = true;
        Common.checkLocation(function(data){
            $scope.myCity= data;
            $scope.mylocation = data.address;
            $scope.reLocationNewing = false;
            $scope.$apply();
        })
   }
   $scope.goBack = function(){
        window.history.back()
   }
    $scope.changeInupt = function(){
        $scope.hasfocus = true;
    }
    $scope.blurInput = function(){
        //if($scope.searchInput =='') $scope.hasfocus = false;
    }
    $scope.showClose=false
    $scope.$watch('searchInput',function (n) {
        if(n.length<1){
            $scope.showClose = false
        }else {
            $scope.showClose=true
        }
    })
    $scope.emptyInput = function(e){
        $scope.searchInput =''
    }
    $scope.searchClick = function(){
        if($scope.searchInput ==''){
            Common.showAlert("温馨提示","请输入地址！",{},"确定");
            return false;
        }
        if(!Common.isnetwork()){
            toast.show('网络连接错误，请检查网络连接');
            return;
        }
        $scope.inputAdd = $scope.searchInput;
        try {if(BMap)  console.log('成功');
        }catch (e){
            $window.location.reload();
        }
        Common.showLoading();
        setTimeout(function () {
            Common.hideLoading()
        },3000)
        var myArr = locationHistory.indexOf($scope.searchInput);
        if(myArr !== -1) locationHistory.splice(myArr,1);
        locationHistory.unshift($scope.searchInput);
        firstSearch = false;
        if(locationHistory.length > 6) locationHistory.length = 6;
        Common.setCache("locationHistory",locationHistory);
    }
    //清空历史记录
    $scope.clearHistory = function(){
        Common.clearCache("locationHistory");
        locationHistory = [];
         $scope.hasHistory = false;
    }
    //点击历史记录进入列表
    $scope.gotoAddress = function(_title){
        try {if(BMap)  console.log('成功');
        }catch (e){
            return;
        }
        Common.showLoading();
        $scope.inputAdd = _title;
        firstSearch = false;
    }
   // 百度地图API功能
   //$scope.address = $rootScope.myCity1;
   $scope.address = "全国";
   $scope.$on("addressList",function(e,data){
    console.log(data)
        Common.hideLoading();
        if(data.length>0){
            $scope.searchList = true;
            $scope.noLocationList = false;
            $scope.addressItem = data;
        }else if(!firstSearch){
            $scope.searchList = true;
            $scope.noLocationList = true;
        }
   })
   
   $scope.chackAddress = function(data){
        $rootScope.refreshCurrentPosition = {
            "cityId" : data,
            "city" : data.city,
            "address" : data.address,
            "latitude" : data.point?data.point.lat:data.latitude,
            "longitude" : data.point?data.point.lng:data.longitude,
            "streetName" : data.title ? data.title : data.streetName
        }
        $state.go('tab.store_nearby');
        
   }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.reLocationNewing = false;
        $scope.searchInput ="";
        $scope.searchList = false;
        $scope.hasfocus = true;
        $scope.noLocationList = false;
        $scope.inputAdd = '';
        firstSearch = true;
        locationHistory= Common.getCache("locationHistory");
        if(locationHistory != null){
            $scope.hasHistory = true;
            $scope.locationHistory = locationHistory;
        }else locationHistory = [];
        if($stateParams.title){
            $scope.gotoAddress($stateParams.title)
        }
        $scope.reLocationNew();
    });
});

    var collect_list_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.collect_list', {
        url: '/collect_list',
        hideTab:true,
        views: {
            'tab-mine': {
                templateUrl: 'component/collect_list/collect_list.html',
                controller: 'collect_listCtrl'
            }
        }
    });
};
myapp.config(collect_list_myConfig);
angular.module('starter.collect_list',[])
.controller('collect_listCtrl', function($scope,Common,$timeout,commonConfigsJson,$rootScope,$http ) {
    $scope.collectItems=[]
    $scope.index=0
    $scope.isHasMore=false
    $scope.firstLoad=true
    var doRefreshing = false
    $scope.doRefresh=function () {
        if(doRefreshing) return
        doRefreshing=true
        $scope.collectItems = []
        $scope.isHasMore=true;
        $scope.index = 1
        getDate(1,function () {
            $scope.$broadcast('scroll.refreshComplete');
        })
    }
    $scope.loadMore=function () {
        $scope.index++
        getDate($scope.index,function () {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
    }
    function getDate(index,bak) {
        Common.post('lifeAPI/merchant/getFavoritesList',{
            "curPage": index,
            "pageSize": 15
        },function (data) {
            var list = data.data.list?data.data.list:[]
            var urlDis = 'http://api.map.baidu.com/geosearch/v3/nearby?ak='+commonConfigsJson.baiduAk.ak+'&geotable_id='+commonConfigsJson.baiduAk.id+'&' +
                'location='+$scope.currentPosition.longitude+','+$scope.currentPosition.latitude+'&' +
                'radius=1000000000&sortby=distance:1&filter=' +
                'merchantNo:[';
            var ids = [];
            for (var i =0 ;i<list.length;i++){
                ids.push(list[i].merchantNo)
            }
            urlDis += ids.join(',')
            urlDis +=']'
            $http({
                url:urlDis,
                type:'get',
            }).success(function (data) {
                var list = data.contents,idLists=[]
                if(list.length>0){
                    data.contents.forEach(function (v) {
                        idLists.push(v.merchantNo)
                    })
                    Common.post('lifeAPI/merchant/baidu/getMerchant',{
                        merchantNo: idLists
                    },function (data) {
                        var rst = data.data;
                        for (var i=0;i<list.length;i++){
                            for (var j =0;j<rst.length;j++){
                                if(list[i].merchantNo == rst[j].merchantNo){
                                    list[i].saleRate=parseInt(rst[j].saleRate)
                                }
                            }

                        }
                        setList(list)
                    })
                }else {
                    setList(list)
                }
                function setList(list) {
                    data.contents = list?list: data.contents
                    if(index ==1){
                        $scope.collectItems = data.contents;
                    }
                    else $scope.collectItems = $scope.collectItems.concat(data.contents);
                    $scope.noItem = false;
                    if($scope.collectItems.length<1)  $scope.noItem = true;
                    $timeout(function(){
                        $scope.isHasMore=true;
                        $scope.firstLoad=false
                        if(data.contents.length<15) $scope.isHasMore=false;
                        if(bak) bak()
                        doRefreshing=false
                    },2000)
                    if($scope.isGetCurrentPosition){
                        $scope.isGetCurrentPosition =false;
                        $scope.$apply();
                    }
                }

            }).error(function () {
                doRefreshing=false
            })
        },function (msg) {
            if(bak) bak()
            doRefreshing=false
            $scope.isHasMore=false;
        })
    }
    if(!commonConfigsJson.isApp){
        $rootScope.myCity = {"cityId" : "77", "city" : "深圳市", "address" : "广东省深圳市南山区高新南一道9-南门", "latitude" : "22.543544", "longitude" : "113.959062", "streetName" : "高新9道",}
        $scope.currentPosition= $rootScope.myCity;
    }
    if($rootScope.myCity){
        $scope.currentPosition= $rootScope.myCity;
    }
    $scope.isGetCurrentPosition =false
    function getCurrentPosition(bak) {
        $timeout(function () {
            Common.checkLocation(function(data) {
                $scope.isGetCurrentPosition = true
                $scope.currentPosition = $rootScope.myCity = data;
                if(bak) bak()
                // $scope.$apply();
            });
        },1500)
    }


    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.index=0
        if($scope.currentPosition){
            $scope.loadMore()
        }else {
            getCurrentPosition(function () {
                $scope.loadMore()
            })
        }
        

    });
});

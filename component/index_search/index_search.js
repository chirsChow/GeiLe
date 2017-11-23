var index_search_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.index_search', {
        url: '/index_search',
        views: {
            'tab-index': {
                templateUrl: 'component/index_search/index_search.html',
                controller: 'index_searchCtrl'
            }
        }
    });
};
myapp.config(index_search_myConfig);

angular.module('starter.index_search',[])
.controller('index_searchCtrl', function($scope,Common,$http,$rootScope,commonConfigsJson,$timeout,$ionicHistory,$ionicScrollDelegate) {
    $scope.searchInput ="",$scope.searchResult=[];
    var searchHistory;
    $scope.changeInupt = function(){
        $scope.hasfocus = true;
    }
    $scope.gotoAddress =function (item) {
        $scope.searchInput = item;
        $scope.searchClick();
    }
    $scope.blurInput = function(){
        if($scope.searchInput =='') $scope.hasfocus = false;
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
        console.log($scope.currentPosition)
        if(!$scope.currentPosition){
            getCurrentPosition(function () {
                doSearch()
            })
            return false
        }
        doSearch()

    }
    document.getElementById("cjc_search_input").addEventListener("search", function(){
    	console.log(123123)
    	if(!$scope.currentPosition){
            getCurrentPosition(function () {
                doSearch()
            })
            return false
        }
        doSearch()
    });
    $scope.goBack = function(){
        window.history.back()
    }
    function doSearch() {
        $scope.searchResult = [];
        if($scope.searchInput ==''){
            Common.showAlert("温馨提示","请输入您需要查找商家的名称！",{},"确定");
            return false;
        }
        $scope.searchList = true;
        var myArr = searchHistory.indexOf($scope.searchInput);
        if(myArr !== -1) searchHistory.splice(myArr,1);
        searchHistory.unshift($scope.searchInput);
        if(searchHistory.length > 6) searchHistory.length = 6;
        Common.setCache("searchHistory",searchHistory);
        getData()
    }

    var currentPositioned =false
    function getData() {
        $scope.searchInputNew = $scope.searchInput;
        if(Common.ClientVer != '6.2.0'){
        	searchSure();
        	return;
        }
        Common.post('lifeAPI/member/translation/searchName',{
            "searchName": $scope.searchInputNew
        },function (dataRst) {
            if(dataRst.data && dataRst.data.translationName) {
                $scope.searchInputNew = dataRst.data.translationName
            }
            console.log($scope.searchInputNew)
            searchSure();
        })
    }
    function searchSure(){
    	var url = 'http://api.map.baidu.com/geosearch/v3/local?region=%E5%85%A8%E5%9B%BD&' +
                    'ak='+commonConfigsJson.baiduAk.ak+'&geotable_id&' +
                    'geotable_id='+commonConfigsJson.baiduAk.id+'&' +
                    'q='+$scope.searchInputNew,
                urlDis = 'http://api.map.baidu.com/geosearch/v3/nearby?ak='+commonConfigsJson.baiduAk.ak+'&geotable_id='+commonConfigsJson.baiduAk.id+'&' +
                    'location='+$scope.currentPosition.longitude+','+$scope.currentPosition.latitude+'&' +
                    'radius=1000000000&sortby=distance:1&filter=' +
                    'merchantNo:[';
            Common.showLoading()
            setTimeout(function () {
                Common.hideLoading()
            },3000)
            $http({
                method:'get',
                url:url,
            }).success(function (data) {
                if(data.status == 0){
                    var ids = [];
                    for (var i =0 ;i<data.contents.length;i++){
                        ids.push(data.contents[i].merchantNo)
                    }
                    urlDis += ids.join(',')
                    urlDis +=']'
                    $http({
                        url:urlDis,
                        method:'get',
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
                                console.log(list)
                                setList(list)
                            })
                        }else {
                            setList(list)
                        }
                        function setList(list) {
                            data.contents = list?list: data.contents
                            $scope.searchResult=$scope.searchResult.concat(data.contents)
                            Common.hideLoading()
                            if($scope.isGetCurrentPosition){
                                $scope.isGetCurrentPosition=false;
                                $scope.$apply();
                            }
                        }
                    }).error(function () {

                    })
                }else {}
            }).error(function () {
                $scope.searchResult=[]
                Common.hideLoading()
            })
    }

    if(!commonConfigsJson.isApp){
        $rootScope.myCity = {"cityId" : "77", "city" : "深圳市", "address" : "广东省深圳市南山区高新南一道9-南门", "latitude" : "22.543544", "longitude" : "113.959062", "streetName" : "高新9道",}
       // $scope.currentPosition= $rootScope.myCity;
    }
    if($rootScope.myCity){
        $scope.currentPosition= $rootScope.myCity;
        currentPositioned = true
    }
    else {
        getCurrentPosition(function () {
            currentPositioned = true
        })
    }

    //获取当前位置
    $scope.isGetCurrentPosition =false;
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

    //清空历史记录
    $scope.clearHistory = function(){
        Common.clearCache("searchHistory");
        searchHistory = [];
         $scope.hasHistory = false;
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $ionicScrollDelegate.scrollTop();
        $scope.searchInput ="";
        $scope.searchList = false;
        //$scope.hasfocus = true;
        searchHistory= Common.getCache("searchHistory");
        if(searchHistory != null){
            $scope.hasHistory = true;
            $scope.searchHistory = searchHistory;
        }else searchHistory = [];
        // $timeout(function(){
        //     $scope.hasfocus = true;
        //     document.getElementById('cjc_search_input').focus();
        // })

    });
}).filter('distanceFilter',function () {
    return function (input) {
        var distance = parseFloat(input);
        if(distance>1000){
            distance = distance - distance%100
            distance = parseFloat(distance/1000,2) + 'k'
        }
        return distance
    }
})

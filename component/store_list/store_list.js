var store_list_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.store_list', {
        url: '/store_list/:tag/:sub',
        hideTab:true,
        views: {
            'tab-index': {
                templateUrl: 'component/store_list/store_list.html',
                controller: 'store_listCtrl'
            }
        }
    });
};
myapp.config(store_list_myConfig);

angular.module('starter.store_list',[])
.controller('store_listCtrl', function($scope,Common,$http,$stateParams,$rootScope,$ionicScrollDelegate,commonConfigsJson,$state,$timeout,$window,cordovaPlug) {
    $scope.showMenuBg=false;
    $scope.currentMenu=0
    $scope.storeListItems=[]
    var index=1
    $scope.isHasMore=false

    if(!commonConfigsJson.isApp){
        $rootScope.myCity = {"cityId" : "77", "city" : "深圳市", "address" : "广东省深圳市南山区高新南一道9-南门",
            "latitude" : "22.543544", "longitude" : "113.959062", "streetName" : "高新9道",}
        $scope.currentPosition= $rootScope.myCity;
    }
    if($rootScope.myCity){
        $scope.currentPosition= $rootScope.myCity;
    }

    //是否已定位
    function isHasPosition(bak) {
        if(!$scope.currentPosition){
            getCurrentPosition(function () {
                getAllAreas()
                getAllClassifies(function () {
                    if(bak) bak()
                   // $scope.$broadcast('scroll.refreshComplete');
                })
            })
            return true;
        }
    }

    //是否以获取分类
    function isHasClassifies(bak) {
        if(!$scope.allClassifies || $scope.allClassifies.length<1){
            getAllAreas()
            getAllClassifies(function () {
                if(bak) bak()
               // $scope.$broadcast('scroll.refreshComplete');
            })
            return true;
        }
    }


    $scope.doRefresh=function () {
        if(!Common.isnetwork()){
            toast.show('网络连接错误，请检查网络连接');
            $scope.$broadcast('scroll.refreshComplete');
            return;
        }
        try {
            if(BMap)  console.log('成功');
        }catch (e){
            $window.location.reload();
        }
        $scope.storeListItems = []
        if(isHasPosition(function () {
                reloadData(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                })
            })) return false;
        if(isHasClassifies(function () {
                reloadData(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                })
            })) return false;
        reloadData(function () {
            $scope.$broadcast('scroll.refreshComplete');
        })
    }
    $scope.loadMore=function () {
        console.log()
        if(!Common.isnetwork()){
            toast.show('网络连接错误，请检查网络连接');
            $scope.$broadcast('scroll.infiniteScrollComplete');
            return;
        }
        if(isHasPosition(function () {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                // reloadData(function () {
                //     $scope.$broadcast('scroll.infiniteScrollComplete');
                // },true)
            })) return false;
        if(isHasClassifies(function () {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                // reloadData(function () {
                //     $scope.$broadcast('scroll.infiniteScrollComplete');
                // },true)
            })) return false;

        reloadData(function () {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        },true)
    }
    $scope.loadMore()

    $scope.linkMsg = function() {
        if (Common.isLogin()) $state.go("tab.index_msg",{enter:2});
    }
    var pageLength = 10;
    function getDate(index,area,tag,sub,sort,bak) {
        if(!$scope.allAreas || $scope.allAreas.length<1){
            getAllAreas()
        }
        if(!$scope.searchItem.selectAreasName){  //未选中区，以当前位置为中心
            var rst = {
                level:'城市',
                location:{
                    lng:$scope.currentPosition.longitude,
                    lat:$scope.currentPosition.latitude
                }
            }
            if(sub=="汽车服务") sub="汽车"
            setLists(rst,index,tag,sub,sort,bak)
            return false;
        }
        $http({
            method:'get',
            url:'http://api.map.baidu.com/geocoder/v2/?output=json&' +
            'address='+area+'&' +  //选中区，以区位置为中心
            'city=' +$scope.currentPosition.city+
            '&ak='+commonConfigsJson.baiduAk.ak
        }).then(function (data) {
            var rst = data.data.result
            setLists(rst,index,tag,sub,sort,bak)
        })
    }

    function setLists(rst,index,tag,sub,sort,bak) {
        if($scope.searchItem.firstLoad){
            Common.showLoading();
        }
        var urlDis = 'http://api.map.baidu.com/geosearch/v3/nearby?ak='+commonConfigsJson.baiduAk.ak+'&geotable_id='+commonConfigsJson.baiduAk.id+'&' +
            'location='+rst.location.lng+','+rst.location.lat+'&page_size='+pageLength+'&page_index='+index
        urlDis += '&tags=' +tag
        if(sub){urlDis += '&q='+sub}
        if(sort == 'distance'){
            urlDis += '&sortby=distance:1'
        }else if(sort == 'saleRate'){
            urlDis += '&sortby=saleRate:-1'
        }
        else if(sort == 'paymentCount'){
            urlDis += '&sortby=paymentCount:-1'
        }
        //排序
        if(rst.level == '城市'){
            urlDis += '&radius=50000'
        }else {
            urlDis += '&radius=20000'
        }
        console.log(urlDis)


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
                $scope.isHasMore = true;
                $scope.searchItem.firstLoad = false;
                $scope.searchItem.noItem = false;
                if (data.contents.length < pageLength) $scope.isHasMore = false;
                if(index == 0){  //加载
                    $scope.storeListItems = data.contents;
                }else {  //加载更多
                    $scope.storeListItems = $scope.storeListItems.concat(data.contents)
                }
                if($scope.storeListItems.length<1) $scope.searchItem.noItem = true;
                if(bak) bak()
                Common.hideLoading()
                $scope.selectClassifiesName =$scope.searchItem.selectClassifiesName !=''?$scope.searchItem.selectClassifiesName:'全部分类'
                if($scope.isGetCurrentPosition){
                    $scope.isGetCurrentPosition=false;
                    $scope.$apply();
                }
            }

        }).error(function () {
            if(bak) bak()
            $scope.isHasMore=false;
        })
    }

    $scope.selectClassifiesId = 0;
    $scope.selectClassifiesItemId = 0;
    $scope.cityId = 0;
    $scope.areaId = 0;
    $scope.sortId = 1;
    $scope.selectClassifiesName =$stateParams.tag?$stateParams.tag:'全部分类'
    $scope.selectAreasName=''
    $scope.selectSortName='智能排序'
    //选择分类
    $scope.selectClassifies = function (index,id,name) {

        $scope.selectClassifiesId = id;
        $scope.selectClassifiesItemId = 0;
        if(index == null){
            $scope.subClassifies = []
            $scope.searchItem.selectClassifiesName=''
            $scope.searchItem.selectClassifiesItemName=''
            reloadData()
            return false;
        }
        $scope.searchItem.selectClassifiesName = $scope.allClassifies[index].name
        $scope.subClassifies = [].concat($scope.allClassifies[index].sub);
        $scope.subClassifies.unshift({id:0,name:''})
    }
    $scope.selectClassifiesItem = function (index,name) {
        $scope.selectClassifiesItemId = index;
        $scope.searchItem.selectClassifiesItemName = name
        reloadData()
    }
    //选择城市
    $scope.selectArea = function (name,id) {
        $scope.searchItem.selectAreasName = name
        reloadData()
    }
    //选择排序
    $scope.selectSortName='附近优先'
    $scope.selectSort = function (name,id) {
        $scope.selectSortName=name
        $scope.searchItem.selectSort = id
        reloadData()
    }
    $scope.allClassifies=[]   //一级分类
    $scope.allAreas=[]    //所有地区
    $scope.allSort=[
        // {name:'智能排序',id:''},
        {name:'返豆优先',id:'saleRate'},
        {name:'附近优先',id:'distance'},
        {name:'人气优先',id:'paymentCount'}
    ]   //排序列表
    $scope.subClassifies =  [];  //二级分类
    $scope.searchItem = {
        selectClassifiesName:'',    //一级分类名称
        selectClassifiesItemName:'',  //二级分类名称
        selectAreasName:'',   //地区名称
        selectSort:'distance',  //排序名称
        index:'-1',   //当前页码
        firstLoad:true,
        noItem:false
    }
    $scope.showMenu = function (i) {
        if(!i || ($scope.currentMenu == i && $scope.showMenuBg)){
            $scope.showMenuBg=false;
            $scope.currentMenu=0
        }else {
            $scope.currentMenu=i
            $scope.showMenuBg=true;
        }
    }
    function reloadData(bak,isMore) {
        angular.element(document.querySelectorAll('.item-box')).addClass('transition_0')
        if(isMore){
            $scope.searchItem.index++
        }else {
            $ionicScrollDelegate.scrollTop();
            $scope.searchItem.index=0
        }
        getDate($scope.searchItem.index,
            $scope.searchItem.selectAreasName,
            $scope.searchItem.selectClassifiesName,
            $scope.searchItem.selectClassifiesItemName,
            $scope.searchItem.selectSort,bak)
        $scope.showMenu();
    }
    $scope.searchItem.selectClassifiesName = $stateParams.tag?$stateParams.tag:null
    $scope.searchItem.selectClassifiesItemName = $stateParams.sub

    //获取当前位置
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

    //获取分类
    function getAllClassifies(bak) {
        // $scope.allClassifies = Common.getCache('industry_lifeAPI_allClassifies')
        // if(!$scope.allClassifies || true){
            Common.get('lifeAPI/industry',{},function (data) {
                $scope.allClassifies=data.data.sub
                $scope.allClassifies.forEach(function (item,i) {
                    if(item.name == decodeURIComponent($stateParams.tag)){
                        $scope.selectClassifies(i,item.id)
                    }
                })
                Common.setCache('industry_lifeAPI_allClassifies',$scope.allClassifies)
                setInitClassifies(bak)
            })
        // }else {
        //     setInitClassifies(bak)
        // }
    }

    //初始化分类,获取第一页
    function setInitClassifies(bak) {
        $scope.allClassifies.forEach(function (item,i) {
            if(item.name == decodeURIComponent($stateParams.tag)){
                $scope.selectClassifies(i,item.id)
            }
            if(!decodeURIComponent($stateParams.tag)){
                $scope.selectClassifies(null,item.id)
                $scope.selectClassifiesId=0
                return
            }
        })
        $scope.subClassifies.forEach(function (item,i) {
            if(item.name == decodeURIComponent($stateParams.sub)){
                $scope.selectClassifiesItem(item.id,item.name)
            }
        })
        if(bak) bak();
        // $scope.isHasMore=true
        // getDate(0,$scope.currentPosition.city,
        //     $scope.searchItem.selectClassifiesName ,
        //     $scope.searchItem.selectClassifiesItemName,
        //     $scope.searchItem.selectSort,bak
        // )
    }

    //获取地区
    function getAllAreas() {
        var listArea = Common.getCache('industry_lifeAPI_allAreas')
        if(!listArea){
            $http({
                method:'get',
                url:'./data/city.json'
            }).then(function (data) {
                var data = data.data.list
                var parent = {}
                data.forEach(function (item) {
                    if(!parent[item.parentAreaId]){
                        parent[item.parentAreaId]=[item]
                    }else {
                        parent[item.parentAreaId].push(item)
                    }
                })
                Common.setCache('industry_lifeAPI_allAreas',parent)
                $scope.allAreas = parent[$scope.currentPosition.cityId]

            })
        }else {
                $scope.allAreas = listArea[$scope.currentPosition.cityId]
        }
    }


    $scope.isGetCurrentPosition = false
    $scope.getetCurrentPositioning = false
    $scope.refreshPosition =function() {
        if($scope.getetCurrentPositioning) return
        $scope.getetCurrentPositioning = true;
        if($scope.searchItem.selectAreasName != "" ){
            getCurrentPosition(function () {
                getDate(0,$scope.currentPosition.city,
                    $scope.searchItem.selectClassifiesName ,
                    $scope.searchItem.selectClassifiesItemName,
                    $scope.searchItem.selectSort
                )
                $scope.getetCurrentPositioning = false
            })
        }else {
            getCurrentPosition(function(){
                getDate(0,$scope.searchItem.selectAreasName,
                    $scope.searchItem.selectClassifiesName ,
                    $scope.searchItem.selectClassifiesItemName,
                    $scope.searchItem.selectSort
                )
                $scope.getetCurrentPositioning = false
			})
        }

    }

    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.getetCurrentPositioning = false
        $scope.nativeBroadcastMsg = {unRead:0};
        window.broadcastMsgNum = function(obj) { //obj参数为APP返回的字符串，{"num":1,"type":0||1},num为未读消息条数，type是消息类型
            if (typeof(obj) == "object") {
                $scope.nativeBroadcastMsg = obj.data;
            } else {
                $scope.nativeBroadcastMsg = angular.fromJson(obj).data;
            }
            $scope.$apply();
        };
        $timeout(function() {
            if (Common.getCache('Token') != null) {
                cordovaPlug.CommonPL(function(data) {
                    $scope.nativeBroadcastMsg.unRead = data.data.count;
                    $scope.$apply();
                }, 'getUnreadMessageCount', []);
            }
        });
    });
});

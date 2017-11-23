var store_nearby_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.store_nearby', {
            url: '/store_nearby/:hash',
            views: {
                'tab-merchants': {
                    templateUrl: 'component/store_nearby/store_nearby_2.html',
                    controller: 'store_nearbyCtrl'
                }
            }
        });
};
myapp.config(store_nearby_myConfig);

angular.module('starter.store_nearby', [])
    .controller('store_nearbyCtrl', function($scope, Common, $http, $ionicScrollDelegate, $rootScope, commonConfigsJson, $timeout, toast,$state,$window) {

        $scope.selectClassifiesId = 0; //一级分类Id
        $scope.selectClassifiesName = ''; //一级分类名
        $scope.selectClassifiesItemName = ''; //二级分类名
        $scope.selectClassifiesItemId = 0; //二级分类ID
        $scope.selectClassifiesItem = [] //二级分类列表
        $scope.storeListItems = []
        $scope.showSubChoose=function (type) {
            $rootScope.hideTabsBg=type
            $scope.showSubChooseList=type
        }
       function getDateCollect(index,bak) {
            index=index+1
            Common.post('lifeAPI/merchant/getFavoritesList',{
                "curPage": index,
                "pageSize": pageLength
            },function (data) {

                var list = data.data.list?data.data.list:[]
                // var list = [{merchantNo:1000001000528},{merchantNo:1000001000530},{merchantNo:1708041000132}]
                var urlDis = 'https://api.map.baidu.com/geosearch/v3/nearby?ak='+commonConfigsJson.baiduAk.ak+'&geotable_id='+commonConfigsJson.baiduAk.id+'&' +
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
                        $scope.isHasMore=true;
                        if(data.contents.length<pageLength) $scope.isHasMore=false;
                        if (index == 0) {
                            $scope.storeListItems = []
                            $scope.storeListItems = data.contents;
                        } else {
                            $scope.storeListItems = $scope.storeListItems.concat(data.contents);
                        }
                        $scope.noItem = false;
                        if($scope.storeListItems.length<1)  $scope.noItem = true;
                        $timeout(function(){
                            if(bak) bak()
                        },2000)
                    }
                }).error(function () {
                })
            },function (msg) {
                $scope.isHasMore=false;
            })
        }

        $scope.selectClassifiesIng = false
        $scope.selectClassifies = function(index, isRefresh) {
            if(index == 3 ){
                if(!Common.isLogin() || $scope.selectClassifiesIng){
                    return
                }
            }

            $ionicScrollDelegate.scrollTop();
            $scope.showSubChoose(false)
            $scope.storeListItems = []
            $scope.pageIndex = 0
            $scope.selectClassifiesId = index
            $scope.selectClassifiesItemId = 0
            $scope.selectClassifiesItemName = ''
            if(index==3){
                $scope.selectClassifiesName = ''
                if (!isRefresh) {
                    $scope.selectClassifiesIng = true
                    getDateCollect($scope.pageIndex,function () {
                        $scope.selectClassifiesIng = false
                        $scope.$broadcast('scroll.refreshComplete');
                    })
                }
                return false;
            }
            if (index == null) {
                $scope.selectClassifiesName = ''
                if (!isRefresh) {
                    getDate(0, $scope.selectClassifiesName, $scope.selectClassifiesItemName)
                }
                return false;
            }
            $scope.selectClassifiesName = $scope.allClassifies[index].name
            var list = $scope.allClassifies[index].sub.slice(0, 9)
            $scope.selectClassifiesItem = list
            if (!isRefresh) {
                getDate(0, $scope.selectClassifiesName, $scope.selectClassifiesItemName)
            }
        }


        $scope.reloadList = function(id, name, more) {
            $scope.showSubChoose(false)
            $ionicScrollDelegate.$getByHandle('hot-list-box').scrollTop();
            $scope.storeListItems = []
            $scope.pageIndex = 0
            $scope.selectClassifiesItemId = id
            $scope.selectClassifiesItemName = name
            getDate(0, $scope.selectClassifiesName, $scope.selectClassifiesItemName)
        }
        $scope.pageIndex = -1;
        $scope.firstLoad = true;
        $scope.isHasMore = false
        $scope.noItem = false;

    if(!commonConfigsJson.isApp){
        $rootScope.myCity = {
            "cityId" : "77",
            "city" : "深圳市",
            "address" : "广东省深圳市南山区高新南一道9-南门",
            "latitude" : "22.543544",
            "longitude" : "113.959062",
            "streetName" : "高新9道",
        }
        $scope.currentPosition= $rootScope.myCity;
    }
    if($rootScope.myCity){
        $scope.currentPosition= $rootScope.myCity;
    }


        //是否已定位
        function isHasPosition(bak) {
            if (!$scope.currentPosition) {
                getCurrentPosition(function() {
                    getAllClassifies(function() {
                        if (bak) bak()
                    })
                })
                return true;
            }
            return false;
        }
        //是否以获取分类
        function isHasClassifies(bak) {
            if (!$scope.allClassifies || $scope.allClassifies.length < 1) {
                getAllClassifies(function() {
                    if (bak) bak()
                })
                return true;
            }
            return false;
        }
        $scope.doRefresh = function() {
            if (!Common.isnetwork()) {
                Common.showAlert('温馨提示', "网络连接错误，请检查网络连接");
                $scope.$broadcast('scroll.refreshComplete');
                return;
            }
            try {
                if(BMap)  console.log('成功');
            }catch (e){
                $window.location.reload();
            }
            $ionicScrollDelegate.scrollTop();
            $scope.storeListItems = []
            $scope.isHasMore = false
            $scope.pageIndex = 0
            if (isHasPosition(function() {
                    getDate(0, $scope.selectClassifiesName, $scope.selectClassifiesItemName, function() {
                        $scope.$broadcast('scroll.refreshComplete');
                    })
                })) return false
            if (isHasClassifies(function() {
                    getDate(0, $scope.selectClassifiesName, $scope.selectClassifiesItemName, function() {
                        $scope.$broadcast('scroll.refreshComplete');
                    })
                })) return false
            getDate(0, $scope.selectClassifiesName, $scope.selectClassifiesItemName, function() {
                $scope.$broadcast('scroll.refreshComplete');
            })
        }
        $scope.loadMore = function() {
            if (!Common.isnetwork()) {
                Common.showAlert('温馨提示', "网络连接错误，请检查网络连接");
                $scope.$broadcast('scroll.infiniteScrollComplete');
                return;
            }
            $scope.pageIndex++
            if($scope.selectClassifiesId==3){
                getDateCollect($scope.pageIndex,function () {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                })
                return
            }
            if (isHasPosition(function() {
                    getDate($scope.pageIndex, $scope.selectClassifiesName, $scope.selectClassifiesItemName, function() {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    })
                })) return false
            if (isHasClassifies(function() {
                    getDate($scope.pageIndex, $scope.selectClassifiesName, $scope.selectClassifiesItemName, function() {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    })
                })) return false

            getDate($scope.pageIndex, $scope.selectClassifiesName, $scope.selectClassifiesItemName, function() {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            })
        }

        $scope.loadMore();
        var pageLength = 10;

        function getDate(index, tag, sub, bak) {
            angular.element(document.querySelectorAll('.item-box')).addClass('transition_0')
            if($scope.firstLoad) Common.showLoading();
            var current = $scope.currentPosition.longitude + ',' +
                $scope.currentPosition.latitude
            var urlDis = 'http://api.map.baidu.com/geosearch/v3/nearby?ak=' + commonConfigsJson.baiduAk.ak + '&geotable_id=' + commonConfigsJson.baiduAk.id + '&' +
                'location=' + current + '&radius=150000&sortby=distance:1&page_size=' + pageLength + '&page_index=' + index
            urlDis += '&tags=' + tag + '&q=' + sub
            $http({
                url: urlDis,
                type: 'get',
            }).success(function(data) {
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
                // setList()
                function setList(list) {
                    data.contents = list?list: data.contents
                    Common.hideLoading();
                    if(data.contents == null || data.contents == undefined) return;
                    $scope.isHasMore = true;
                    $scope.noItem = false;
                    if(data.contents.length<1)  $scope.noItem = true;
                    $scope.firstLoad = false;
                    if (data.contents.length < pageLength) $scope.isHasMore = false;
                    if (index == 0) {
                        $scope.storeListItems = data.contents;
                    } else {
                        $scope.storeListItems = $scope.storeListItems.concat(data.contents);
                    }
                    if (bak) bak()
                    if ($scope.isGetCurrentPosition) {
                        $scope.isGetCurrentPosition = false;
                        $scope.$apply();
                    }
                    Common.hideLoading()
                }

            }).error(function() {
                if (bak) bak()
                $scope.isHasMore = false;
            })
        }

        //获取当前位置
        function getCurrentPosition(bak) {
            $timeout(function() {
                Common.checkLocation(function(data) {
                    $scope.isGetCurrentPosition = true
                    $scope.currentPosition = $rootScope.myCity = data;
                    if (bak) bak()
                });
            }, 1500)
        }

        $scope.isRefreshCurrentPosition = false;
        $rootScope.$watch('refreshCurrentPosition', function(myCity) {
            if (myCity) {
                $scope.currentPosition = myCity;
                $rootScope.currentPositionCity = myCity
                getDate(0, $scope.selectClassifiesName, $scope.selectClassifiesItemName)
                setTimeout(function(){
                    $rootScope.refreshCurrentPosition=null
                },100)
            }
        })

        //获取分类
        function getAllClassifies(bak) {
            $scope.allClassifies = []
            Common.get('lifeAPI/industry', {}, function(data) {
                $scope.allClassifies = data.data.sub ? data.data.sub : []
                Common.setCache('industry_lifeAPI_allClassifies', $scope.allClassifies)
                $scope.selectClassifies(0, true)
                if (bak) {
                    bak()
                    return false
                }
            })
        }
        $scope.$on('$ionicView.beforeLeave', function() {
            $scope.showSubChoose(false)
        })
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.noItem = false;
            if(Common.getCache('store_nearby_no_cache')){
                $ionicScrollDelegate.scrollTop();
                $scope.selectClassifiesId = 0; //一级分类Id
                $scope.selectClassifiesItemId = 0; //二级分类ID
                $scope.storeListItems = []
                $scope.selectClassifiesName = $scope.allClassifies[0].name
                $scope.selectClassifiesItemName='';
                $scope.pageIndex = -1;
                $scope.firstLoad = true;
                $scope.isHasMore = false
                $scope.loadMore();
                Common.setCache('store_nearby_no_cache',false)
            }
            if($scope.currentPosition){
                $rootScope.currentPositionCity = $scope.currentPosition
            }

        });
    }).filter('ellipsisFilter', function() {
        return function(input, length) {
            if (input && input.length > length) {
                input = input.slice(0, length) + '...'
            }
            return input
        }
    }).directive('storeItem',function () {
        return {
            restrict: 'E',
            template: '<div class="img-box" tile-img="1" tile-src="{{item.images||icon_60}}">' +
            '<img err-src="./img/store_list/mo_icon_1.png" src="{{item.images||icon_60}}" alt=""></div>' +
            '<div class="info-box">' +
            '<p class="title">{{item.shortName}}</p>' +
            '<div >' +
            '<div class="start"><p class="no"><span></span><span></span><span></span><span></span><span></span></p>' +
            '<p class="yes"><span ng-if="item.commentGrade>0"></span><span ng-if="item.commentGrade>1"></span><span ng-if="item.commentGrade>2"></span><span ng-if="item.commentGrade>3"></span><span ng-if="item.commentGrade>4"></span></p></div>' +
            '<p class="fen">{{item.commentGrade}}分&nbsp;&nbsp;{{item.paymentCount | personNumberFilter}}人已消费 </p><div style="clear: both"></div></div>' +
            '<p class="types">{{item.areaName.length>0?item.areaName+"·":""}}{{item.categoryName | ellipsisFilter:5}} ' +
            '<span ng-if="item.perCapita">&nbsp;|&nbsp;¥{{item.perCapita}}元/人&nbsp;</span>' +
            '<span style="color: #A4A9AD;font-size: .22rem;">＜{{item.distance | distanceFilter}}m</span></p>' +
            // '<div class="extra-item">' +
            // '<i ng-if="item.specialService.indexOf(3) != -1" class="po"></i><i ng-if="item.specialService.indexOf(1) != -1" class="wf"></i>' +
            // '<i ng-if="item.specialService.indexOf(2) != -1" class="tc"></i><i ng-if="item.specialService.indexOf(4) != -1" class="hs"></i></div>' +
            '<div class="foucs-info"><p><span class="font">{{item.saleRate | number}}%</span></p><span>赠豆</span></div></div>',
            scope:{
                'item':'='
            },
            link:function ($scope) {
                $scope.icon_60 = './img/store_list/mo_icon_1.png'
                $scope.perCapitaInfo = './img/store_list/mo_icon_1.png'
            }

        };
    })

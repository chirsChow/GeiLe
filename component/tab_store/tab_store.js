var tab_store_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.tab_store', {
            url: '/tab_store/:id/:num',
            hideTab: true,
            views: {
                'tab-merchants': {
                    templateUrl: 'component/tab_store/tab_store_2.html',
                    controller: 'tab_storeCtrl'
                }
            }
        });
};
myapp.config(tab_store_myConfig);
myapp.run(['$rootScope', '$state', function($rootScope, $state) {
    var locationChangeStartOff = $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
        var hideTab = toState.hideTab ? toState.hideTab : false;
        //console.log(toState,hideTab)
        if (hideTab) {
            angular.element(document.querySelectorAll('#iontabs')).addClass('tab_store_hide_tab');
        } else {
            angular.element(document.querySelectorAll('#iontabs')).removeClass('tab_store_hide_tab');
        }
    });

}])
angular.module('starter.tab_store', [])
    .controller('tab_storeCtrl', function($scope, $stateParams, Common,
        $ionicScrollDelegate, $ionicModal, $sce, actionSheetItem, toast,
        $document, $http, $rootScope, commonConfigsJson, $ionicSlideBoxDelegate, $state,bindCardService,$ionicHistory) {
        	//进入我的评论
        	$scope.gotoCommentList = function(){
        		if(!Common.isLogin()) return;
        		$state.go('tab.comment_list',{id:$scope.storeInfo.merchantNo})
	        }
        $scope.storeInfo = {
                saleRate: 0,
                images:['./img/tab_store/store_bg.png']
            }
            //收藏商家
        $scope.saveStoring = false
        $scope.saveStore = function() {
                if ($scope.saveStoring) return;
                if(!Common.isLogin()) return;
                $scope.saveStoring = true;
                if (!$scope.storeInfo.favorite) {
                    Common.post('lifeAPI/merchant/favorites', {
                        "merchantNo": $stateParams.id
                    }, function(data) {
                        $scope.storeInfo.favorite = true
                        toast.show('收藏成功！')
                        $scope.saveStoring = false
                    }, function() {
                        $scope.saveStoring = false
                    })
                } else {
                    Common.post('lifeAPI/merchant/deleteFavorites', {
                        "merchantNo": $stateParams.id
                    }, function(data) {
                        $scope.storeInfo.favorite = false
                        toast.show('取消收藏！')
                        $scope.saveStoring = false
                    }, function() {
                        $scope.saveStoring = false
                    })
                }
            }
            $scope.goBack = function(){
                window.history.back()
            }
            //评论商家
        $scope.paymentCountNum = $stateParams.num;
            console.log( $scope.paymentCountNum)
        $scope.CommentStore = function() {
                // if (!commonConfigsJson.isLogin('请先登录！')) return
                location.href = '#/tab/create_comment/' + $scope.storeInfo.merchantNo + '/' + $scope.storeInfo.industry+'/'+ (new Date().getTime())
            }
            //举报商家
        $scope.reportStore = function() {
                // if(!$scope.storeInfo.isConsume){
                //     toast.show('没有举报权限！')
                //     return false;
                // }
                actionSheetItem.showChoose({
                    confirm: function(i) {
                        if (i.length < 1) {
                            setTimeout(function() {
                                toast.show('请选择举报内容！')
                            }, 200)
                            return false;
                        }
                        Common.post('lifeAPI/merchant/report', {
                            merchantNo: $stateParams.id,
                            content: i.join(',')
                        }, function(data) {
                            toast.show('举报成功！')
                        })
                    },
                    confirmButton: '确认举报',
                    items: ['服务不好', '太贵', '承诺跟实际返豆不同', '就是不喜欢', '任长得太丑']
                })
            }
            //拨打电话
        $scope.showTel = function() {
            actionSheetItem.showTel($scope.storeInfo.tel)
        }

        //买单
        $scope.pay = function() {
            if(!$scope.storeInfo.onlinePay) return
            if(!Common.isLogin()) return;
            var myData = Common.getCache('banklistColor').data;
            if (Common.getCache('LoggedOn') != null && Common.getCache('Token') == null) $state.go("tab.tab_login", {
                'nextStep': 1
            });
            else if (Common.getCache('Token') == null) $state.go("tab.tab_register", {
                'nextStep': 1
            });
            else if (Common.getCache('information').authStatus == 0) $state.go("tab.my_certification")
            else{
                Common.post('lifeAPI/merchant/queryOnPayInfo',{
                    'merchantNo':$stateParams.id
                },function(data){
                    
                    if(data.data == null){
                        Common.showAlert('', '该商户暂不支持在线支付！');
                        return;
                    }
                    Common.setCache('onLinepayType',data.data)
                    if(data.data.length==1 && data.data.organCode == "10001"){
                        Common.showAlert('', '该商户暂不支持在线支付！');
                    }else{
                        Common.setCache('payScene','0');            //设置付费通支付场景
                        $state.go('tab.my_sweep', {
                            merchantNo: $stateParams.id,
                            operatorId: '',
                            cash: ''
                        });
                    }
                },{},1)
            } 
        }


        //header 背景变化
        var bannerHeight = 230,
            opacity;
        $scope.scrollDown = false;
        $scope.contentScroll = function(e) {
            var scrollTop = $ionicScrollDelegate.$getByHandle('tab_store_con').getScrollPosition()
            if (!scrollTop) return;
            opacity = scrollTop.top / bannerHeight
            if (opacity > .94) opacity = .94;
            if (opacity > .7 && !$scope.scrollDown) {
                $scope.scrollDown = true
                angular.element(document.querySelectorAll('#tab_store_2 .store-header')).addClass('scroll-down')
            } else if (opacity <= .7 && $scope.scrollDown) {
                $scope.scrollDown = false
                angular.element(document.querySelectorAll('#tab_store_2 .store-header')).removeClass('scroll-down')
            }
            angular.element(document.querySelectorAll('#tab_store_2 .store-header')).css({
                    backgroundColor: "rgba(56,171,237," + opacity + ")"
                })
                // document.querySelectorAll('#tab_store .store-header .df').style.backgroundColor="rgba(255,255,255,"+opacity+")"
            if (opacity < .05) {
                angular.element(document.querySelectorAll('#tab_store_2 .store-header')).css({
                    backgroundColor: "none"
                })
            }
        }
        $scope.slideDotsIndex = 1
        $scope.slideChange = function(index) {
            $scope.slideDotsIndex = index + 1
        }



        //地图
        var distancesEle, hasMap

        //获取当前位置
        if (!commonConfigsJson.isApp) {
            $rootScope.myCity = {
                "cityId": "77",
                "city": "深圳市",
                "address": "广东省深圳市南山区高新南一道9-南门",
                "latitude": "22.543544",
                "longitude": "113.959062",
                "streetName": "高新9道",
            }
        }

        var getCurrentLocationed = false,
            isNeedApply = false;
        if ($rootScope.myCity) {
            $scope.currentPosition = $rootScope.myCity;
            getDistances()
            getCurrentLocationed = true;
        } else {
            getCurrentPosition(function() {
                isNeedApply = true;
                getDistances()
                getCurrentLocationed = true;
            })
        }

        //获取当前位置
        function getCurrentPosition(bak) {
            Common.checkLocation(function(data) {

                $scope.currentPosition = $rootScope.myCity = data;
                if (bak) bak()
                    // $scope.$apply();
            });
        }

        //商家位置
        $scope.openModal = function() {
            if (hasMap) return false;
            hasMap = true;
            $scope.storeName = $scope.storeInfo.shortName
            $scope.iframeUrl = "./component/tab_store/map.html?" +
                "city=" + $scope.currentPosition.city +
                "&start=我的位置," + $scope.currentPosition.longitude + "," + $scope.currentPosition.latitude +
                "&end=" + $scope.storeInfo.shortName + "," + $scope.storeInfo.longitude + "," + $scope.storeInfo.latitude + "," + $scope.storeInfo.address +
                "&type=" + 1+($scope.storeInfoDistances>200?"":"&hide=1")
            $scope.myURL = $sce.trustAsResourceUrl($scope.iframeUrl);
            if (getCurrentLocationed) {
                actionSheetItem.showPage({
                    scope: $scope,
                    templateUrl: 'component/tab_store/bd-map.html',
                    success: function() {}
                })
                return
            }
        };
        $scope.myURL = ''

        //到那去
        $scope.goThere = function() {
            if (hasMap) return false;
            hasMap = true;
            $scope.storeName = $scope.storeInfo.shortName
            $scope.iframeUrl = "./component/tab_store/map.html?" +
                "city=" + $scope.currentPosition.city +
                "&start=我的位置," + $scope.currentPosition.longitude + "," + $scope.currentPosition.latitude +
                "&end=" + $scope.storeInfo.shortName + "," + $scope.storeInfo.longitude + "," + $scope.storeInfo.latitude + "," + $scope.storeInfo.address +
                "&type=" + 2 + 1+($scope.storeInfoDistances>500?"":"&hide=1")
            $scope.myURL = $sce.trustAsResourceUrl($scope.iframeUrl);
            if (getCurrentLocationed) {
                actionSheetItem.showPage({
                    scope: $scope,
                    templateUrl: 'component/tab_store/bd-map.html',
                    success: function() {},
                    error: function() {
                        hasMap = false
                    }
                })
            }
        }
        $scope.closeModal = function() {
            // $scope.modal.hide();
            $scope.isShowOptions = false;
            $scope.isTransits = false;
            currentType = false;
            hasMap = false
        };



        //获取距离
        $scope.storeInfoDistances = 0.01

        function getDistances() {
            var urlDis = 'http://api.map.baidu.com/geosearch/v3/nearby?ak=' + commonConfigsJson.baiduAk.ak + '&geotable_id=' + commonConfigsJson.baiduAk.id + '&' +
                'location=' + $scope.currentPosition.longitude +
                ',' + $scope.currentPosition.latitude + '&' +
                'radius=100000000&sortby=distance:1&filter=' +
                'merchantNo:[' + $stateParams.id + ']';
            $http({
                url: urlDis,
                type: 'get',
            }).success(function(data) {
                if (data.contents[0]) {
                    $scope.paymentCountNum = data.contents[0].paymentCount;
                    $scope.storeInfoDistances = data.contents[0].distance;}
                if (isNeedApply) {
                    isNeedApply = false;
                    $scope.$apply()
                }
            }).error(function() {

            })
        }

        //评论列表
        $scope.labelsName = commonConfigsJson.commentList
        $scope.commentList = {}

        $scope.$watch('storeInfo', function(oldV, newV) {
            $ionicSlideBoxDelegate.update();
        });

        $scope.$on('$ionicView.beforeLeave', function() {
            if($scope.cancel){
                $scope.cancel()
            }
        })
        $scope.$on('$ionicView.afterEnter', function() {
            document.querySelector('#tab_store_2 .store-header').className = 'store-header';
        })
        $scope.$on('$ionicView.beforeEnter', function() {
            //商铺详情
            $ionicScrollDelegate.scrollTop();
            $scope.saveStoring = false
            Common.get('lifeAPI/merchant/detail/' + $stateParams.id, {}, function(data) {
                if(data.data == null){
                    toast.show('请求失败，请稍后再试');
                    return;
                } 
                $scope.storeInfo = data.data?data.data:{};
                if ($scope.storeInfo.specialService && $scope.storeInfo.specialService.length > 4) {
                    $scope.storeInfo.specialService = $scope.storeInfo.specialService.slice(0, 4)
                }
                if(!$scope.storeInfo.images || $scope.storeInfo.images.length<1){
                    $scope.storeInfo.images=['./img/store_list/store_750_525.png']
                }
                Common.setCache('storeInfo_' + $stateParams.id, data.data)
            }, function() {},1)
            $scope.isCommentStore = false, $scope.commentGradeList = 0
                //是否可评论
            if (Common.getCache('Token')) {
                Common.post('lifeAPI/merchant/comment/bills', {
                    "curPage": 1,
                    "merchantNo": +$stateParams.id,
                    "pageSize": 2
                }, function(data) {
                    if (data.data.list && data.data.list.length > 0) {
                        $scope.isCommentStore = true
                    }
                }, function(msg) {})
            }
            //得到位置

            if($rootScope.currentPositionCity){
                $scope.currentPosition = $rootScope.currentPositionCity;
                $rootScope.currentPositionCity = ""
            }else {
                if ($rootScope.myCity) {
                    $scope.currentPosition = $rootScope.myCity;
                }
            }

            if ($scope.currentPosition) {
                getDistances()
            }


            //获取评论列表
            var commentsIndex=1;$scope.commentsIsMore = false;commentsPageSize=5
            $scope.commentLists=[]
            Common.post('lifeAPI/merchant/comments', {
                merchantNo: $stateParams.id,
                curPage: commentsIndex,
                pageSize: commentsPageSize
            }, function(data) {
                if(data.data.list.length==commentsPageSize){
                    $scope.commentsIsMore = true
                }
                $scope.commentLists = data.data.list
                $scope.commentGradeList = data.data.dataMap.commentGrade
            }, function() {})
            $scope.loadMoreComments=function () {
                commentsIndex++
                Common.post('lifeAPI/merchant/comments', {
                    merchantNo: $stateParams.id,
                    curPage: commentsIndex,
                    pageSize: commentsPageSize
                }, function(data) {
                   if(data.data.list.length<commentsPageSize){
                       $scope.commentsIsMore = false
                   }
                    $scope.commentLists = $scope.commentLists.concat(data.data.list)
                    $scope.commentGradeList = data.data.dataMap.commentGrade
                    setTimeout(function () {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    },1000)
                }, function() {})
            }
        });
    })
    .directive('tileImg', function() {
        return {
            restrict: 'A',
            scope: {
                tileImg: "@",
                tileSrc: "@"
            },
            link: function($scope, $element, $attr) {
                var scale = eval($scope.tileImg),
                    imgTarget = $element.find('img'),
                    maxHeight = $element[0].offsetHeight,
                    maxWidth = $element[0].offsetWidth
                $element.css({
                    position: 'relative',
                    overflow: 'hidden'
                });
                imgTarget.css({
                    position: 'relative'
                })

                function reSizeImage() {
                    var img = new Image();
                    img.src = $scope.tileSrc;
                    img.onload = function() {
                        setPosition(img.naturalWidth, img.naturalHeight, img.src)
                        delete img;
                    }
                    img.onerror=function () {
                        imgTarget.css({
                            height: '100%',
                            width: "100%",
                            left: 0,
                            top:0
                        })
                        delete img;
                    }
                }

                function setPosition(w, h, src) {
                    imgTarget.attr('src', src)
                    if (w / h > scale) {
                        imgTarget.css({
                            height: '100%',
                            width: 'auto',
                            top: 0
                        }).css({
                            left: (maxWidth - imgTarget[0].offsetWidth) / 2 + 'px'
                        })
                    } else {
                        imgTarget.css({
                            height: 'auto',
                            width: "100%",
                            left: 0
                        }).css({
                            top: (maxHeight - imgTarget[0].offsetHeight) / 2 + 'px'
                        })
                    }

                }
                $scope.$watch('tileSrc', function(oldV, newV) {
                    reSizeImage()
                });
            }
        };
    }).service('commonConfigsJson', function(Common, $state, $timeout, toast) {
        return {
            commentList: {
                101: '非常好',
                102: '赞',
                103: '不错',
                104: '总体一般',
                201: '价格实惠',
                202: '性价比高',
                203: '有点小贵',
                301: '环境优雅',
                302: '安静',
                303: '有点吵',
                401: '交通便利',
                402: '交通稍不便',
                501: '服务热情',
                502: '服务一般',
            },
            isApp: true,
            baiduAk: {
                 ak: 'HIF9z3sj78rvtXQVtKl3S1oQ9dU2ZgyD',
                 id: '170475'
                 // ak: '5c386b41caecdd8f9003871d2660ef2d',
                 // id: '172778'
            },
            //判断用户是否登录
            isLogin: function(msg) {
                return true;
            }
        }
    }).filter('gradeFilter', function() {
        return function(input) {
            return Math.ceil(parseFloat(input) / 20) * 20
        }
    }).filter('personNumberFilter', function() {
        return function(input) {
            if (!input) input = 0;
            if (input > 9999) {
                input = input - input % 100
                input = parseFloat(input / 10000, 2) + '万';
            }
            return input
        }
    })
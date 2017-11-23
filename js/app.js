var myRun = function($ionicPlatform, $templateCache, cordovaPlug, Common, $rootScope, $timeout,$state,$location,$ionicHistory,$interval) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) StatusBar.styleDefault();
        $timeout(function(){
          cordovaPlug.CommonPL(function(data) {
                        if (data.status == 1) {
                        } else {
                            toast.show("插件调用失败！");
                        }
                    }, "showMainContent", [])
        },1000)
        $interval(function(){
            if(!$rootScope.IntervalBoo) return;
            if($rootScope.chooseCity == undefined || $rootScope.chooseCity ==$rootScope.myCity.city){
                Common.checkLocation(function(data) {
                    $rootScope.myCity1 = data.city;
                    $rootScope.setBanner(data.cityId);
                    $scope.$apply();
                  });
            }
        },300000)
        document.addEventListener("pause", function(){
            $rootScope.IntervalBoo = false;
        }, false);
        document.addEventListener("resume", function(){
            $rootScope.IntervalBoo = true;
        }, false);
    });
    $ionicPlatform.registerBackButtonAction(function (e) {
        e.preventDefault();
        if ($location.path().indexOf('/tab/pay_success_info') != -1 || $location.path().indexOf('/tab/payment_finish') != -1||$location.path().indexOf('/tab/payment_reward_finish') != -1||$location.path().indexOf('/tab/payment_exceptional') != -1) {
            $state.go("tab.index");
        }else if($location.path()== '/tab/index'){
          Common.showConfirm("退出提醒","您确定要退出？",function(){
            ionic.Platform.exitApp();
           },{},"确定","取消");
        }else if($location.path()== '/tab/payment_comfirmReward'){
            Common.showConfirm("消息提醒","您确定要取消打赏？",function(){
                $state.go("tab.index");
            },{},"确定","取消");
        }else if($ionicHistory.backView() == null){
            $state.go("tab.index")
        }else{
            window.history.back();
        }
        return false;
    }, 301);
};
var myConfig = function($urlRouterProvider, $ionicConfigProvider) {
    /*
     *配置选项卡，让tab在iOS和Android都显示在底部
     */
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.views.maxCache(20);
    $urlRouterProvider.otherwise('/tab/index');
};
myapp
//图片出错时显示
    .directive('errSrc', function() {
        return {
            link: function(scope, element, attrs) {
                element.bind('error', function() {
                    if (attrs.src != attrs.errSrc) {
                        attrs.$set('src', attrs.errSrc);
                    }
                });
            }
        }
    })
    //图片懒加载
    .directive('lazyScroll', ['$rootScope',
        function($rootScope) {
            return {
                restrict: 'A',
                link: function($scope, $element) {
                    var origEvent = $scope.$onScroll;
                    $scope.$onScroll = function() {
                        $rootScope.$broadcast('lazyScrollEvent');
                        if (typeof origEvent === 'function') {
                            origEvent();
                        }
                    };
                }
            };
        }
    ])

.directive('lazySrc', ['$document', '$timeout', '$ionicScrollDelegate', '$compile',
        function($document, $timeout, $ionicScrollDelegate, $compile) {
            return {
                restrict: 'A',
                scope: {
                    lazyScrollResize: "@lazyScrollResize",
                    imageLazyBackgroundImage: "@imageLazyBackgroundImage",
                    lazySrc: "@"
                },
                link: function($scope, $element, $attributes) {
                    if (!$attributes.imageLazyDistanceFromBottomToLoad) {
                        $attributes.imageLazyDistanceFromBottomToLoad = 0;
                    }
                    if (!$attributes.imageLazyDistanceFromRightToLoad) {
                        $attributes.imageLazyDistanceFromRightToLoad = 0;
                    }

                    var loader;
                    if ($attributes.imageLazyLoader) {
                        loader = $compile('<div class="image-loader-container"><ion-spinner class="image-loader" icon="' + $attributes.imageLazyLoader + '"></ion-spinner></div>')($scope);
                        $element.after(loader);
                    }

                    $scope.$watch('lazySrc', function(oldV, newV) {
                        if (loader)
                            loader.remove();
                        if ($attributes.imageLazyLoader) {
                            loader = $compile('<div class="image-loader-container"><ion-spinner class="image-loader" icon="' + $attributes.imageLazyLoader + '"></ion-spinner></div>')($scope);
                            $element.after(loader);
                        }
                        var deregistration = $scope.$on('lazyScrollEvent', function() {
                            if (isInView()) {
                                loadImage();
                                deregistration();
                            }
                        });
                        $timeout(function() {
                            if (isInView()) {
                                loadImage();
                                deregistration();
                            }
                        }, 500);
                    });
                    var deregistration = $scope.$on('lazyScrollEvent', function() {
                        if (isInView()) {
                            loadImage();
                            deregistration();
                        }
                    });

                    function loadImage() {
                        $element.bind("load", function(e) {
                            if ($attributes.imageLazyLoader) {
                                loader.remove();
                            }
                            if ($scope.lazyScrollResize == "true") {
                                $ionicScrollDelegate.resize();
                            }
                            $element.unbind("load");
                        });
                        if ($scope.imageLazyBackgroundImage == "true") {
                            var bgImg = new Image();
                            bgImg.onload = function() {
                                if ($attributes.imageLazyLoader) {
                                    loader.remove();
                                }
                                $element[0].style.backgroundImage = 'url(' + $attributes.lazySrc + ')'; // set style attribute on element (it will load image)
                                if ($scope.lazyScrollResize == "true") {
                                    //Call the resize to recalculate the size of the screen
                                    $ionicScrollDelegate.resize();
                                }
                            };
                            bgImg.src = $attributes.lazySrc;
                        } else {
                            $element[0].src = $attributes.lazySrc; // set src attribute on element (it will load image)
                        }
                    }

                    function isInView() {
                        var clientHeight = $document[0].documentElement.clientHeight;
                        var clientWidth = $document[0].documentElement.clientWidth;
                        var imageRect = $element[0].getBoundingClientRect();
                        return (imageRect.top >= 0 && imageRect.top <= clientHeight + parseInt($attributes.imageLazyDistanceFromBottomToLoad)) && (imageRect.left >= 0 && imageRect.left <= clientWidth + parseInt($attributes.imageLazyDistanceFromRightToLoad));
                    }
                    $element.on('$destroy', function() {
                        deregistration();
                    });
                    $timeout(function() {
                        if (isInView()) {
                            loadImage();
                            deregistration();
                        }
                    }, 500);
                }
            };
        }
    ])
    .directive("glHeader", function($ionicHistory,$state) {
        return {
            restrict: "E",
            replace: true,
            template: '<header id="gl_header"> <div class="tc df"><div class="w124 lh88" ng-click="gotoBack()">  <a class="button-retrun header-back colorff"></a></div>    <div class="df1 f34 colorff lh88">{{title}}</div>  <div class="w124 lh88 colorff header_rgiht {{rightClass}}" ng-click="rightClick()">{{right}}</div> </div> </header>',
            scope: {
                title: "@",
                back: "@",
                onBack: "&",
                right:"@",
                rightClass:"@",
                onClick:'&'
            },
            link: function($scope, element, attrs) {
                $scope.gotoBack = function(){
                    $scope.back != undefined ? $scope.back == 'function' ? $scope.onBack instanceof Function && $scope.onBack() : $state.go($scope.back): window.history.back();
                }
                $scope.rightClick = function(){
                    if($scope.onClick != undefined) $scope.onClick instanceof Function && $scope.onClick();
                }
            }
        };
    })
    .directive("appMap", function() {
            return {
                restrict: "E",
                replace: true,
                template: "<div id='allMap'></div>",
                scope: {
                    address: "@",
                    search: "@"
                },
                link: function($scope, element, attrs) {
                    var map, local;
                    // 百度地图API功能  
                    try {
                        map = new BMap.Map("allMap");
                        map.centerAndZoom($scope.address, 11);
                        var options = {
                            onSearchComplete: function(results) {
                                // 判断状态是否正确
                                var s = [];
                                if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                                    for (var i = 0; i < results.getCurrentNumPois(); i++) {
                                        s.push(results.getPoi(i));
                                    }
                                }
                                $scope.$emit("addressList", s);
                            }
                        };
                        local = new BMap.LocalSearch(map, options);
                    } catch (err) {

                    }
                    $scope.$parent.$watch('inputAdd', function() {
                        try {
                            local.search($scope.search);
                        } catch (e) {

                        }
                    });
                }
            };
        })
    .directive("wxPay", function($ionicModal,$timeout,$sce) {
            return {
                restrict: "E",
                replace: true,
                template: '<script id="my-modal.html" type="text/ng-template">        <ion-modal-view id="modal_header">            <gl-header title="微信支付" back="function" on-back="closeModal()"></gl-header>    <section class="scrolltop128">        <ion-content  scroll="true" overflow-scroll="true" id="modal_content">                <iframe ng-src={{wxUrl}} width="100%"  style="height:100%;width:100%;min-height: 100%" seamless frameborder="0"></iframe>            </ion-content>   </section>     </ion-modal-view>    </script>',
                scope: {
                    show: "=",
                    wxurl:"@",
                    cancelpay:'@'
                },
                link: function($scope, element, attrs) {
                    $ionicModal.fromTemplateUrl('my-modal.html', {
                        scope: $scope,
                        animation: 'slide-in-up'
                    }).then(function (modal) {
                        $scope.modal = modal;
                    });
                    $scope.openModal = function () {
                        var myNewUrl = decodeURIComponent($scope.wxurl)
                        alert(myNewUrl)
                        $scope.wxUrl = $sce.trustAsResourceUrl(myNewUrl);
                        $scope.modal.show();
                    }
                    $scope.closeModal = function () {
                        $scope.show = null;
                        $scope.modal.hide();
                    }
                    $scope.$watch('show', function() {
                        if($scope.show){
                            $timeout(function(){
                                 $scope.openModal();
                             },0)
                        }
                    });
                    $scope.$watch('wxurl', function() {
                        console.log($scope.wxurl.split('#')[1])
                        if($scope.wxurl.indexOf('wxpay.com') != -1){
                            if($scope.wxurl.indexOf('status=2') != -1){
                                if ($scope.cancelpay) {
                                    $scope.cancelpay();
                                }
                                $scope.closeModal();
                                return;
                            }
                            $scope.closeModal();
                            window.location.href='#'+$scope.wxurl.split('#')[1];
                        }
                    });
                    
                }
            };
        })
    .directive('attached', ['$document', '$timeout', '$ionicScrollDelegate','$compile','$timeout',
        function($document, $timeout, $ionicScrollDelegate, $compile,$timeout) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attributes) {
                    if (!$attributes.imageLazyDistanceFromBottomToLoad) {
                        $attributes.imageLazyDistanceFromBottomToLoad = 0;
                    }
                    var deregistration = $scope.$on('lazyScrollEvent', function() {
                        changeScroll();
                    });
                    function changeScroll(){
                        if($ionicScrollDelegate.getScrollPosition().top<10){
                            $element.removeClass('transition_8')
                        }else {
                            $element.removeClass('transition_0')
                            $element.addClass('transition_8')
                        }
                        if (isInView())  $element.removeClass('attached-in');
                        else  $element.addClass('attached-in');
                    }
                    function isInView() {
                        var clientHeight = $document[0].documentElement.clientHeight;
                        var clientWidth = $document[0].documentElement.clientWidth;
                        var imageRect = $element[0].getBoundingClientRect();
                        return (imageRect.top <= clientHeight + parseInt($attributes.imageLazyDistanceFromBottomToLoad)+60);
                    }
                }
            };
        }
    ])
    .directive('hideTabs', function($rootScope, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                scope.$on('$ionicView.beforeEnter', function() {
                    $timeout(function() {
                        scope.$watch(attributes.hideTabs, function(value) {
                            $rootScope.hideTabs = 'tabs-item-hide';
                        });
                    }, 0);
                });
                scope.$on('$ionicView.beforeLeave', function() {
                    scope.$watch(attributes.hideTabs, function(value) {
                        $rootScope.hideTabs = 'tabs-item-hide';
                    });
                    scope.$watch('$destroy', function() {
                        $rootScope.hideTabs = false;
                    });
                });
            }
        };
    })
    .directive('hoverDct', function() {
        return {
            restrict: 'AE',
            scope: {
                hoverDct: '@'
            },
            link: function(scope, element, attrs, accordionController) {
                var s_y, m_y, e_m_y, loop;
                element[0].addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    element[0].classList.add(scope.hoverDct);
                });
                element[0].addEventListener('touchend', function(e) {
                    e.preventDefault();
                    element[0].classList.remove(scope.hoverDct);
                });
            }
        };
    });
myapp.run(myRun).config(myConfig);

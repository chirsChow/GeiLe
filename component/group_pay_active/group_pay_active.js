var group_pay_active_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.group_pay_active', {
            url: '/group_pay_active/:type/:hash',
            params:{goBackNum:null},
            views: {
                'tab-mine': {
                    templateUrl: 'component/group_pay_active/group_pay_active.html',
                    controller: 'group_pay_activeCtrl'
                }
            }
        });
};
myapp.config(group_pay_active_myConfig);

angular.module('starter.group_pay_active', [])
    .controller('group_pay_activeCtrl', function ($scope, Common, setIntervalGetData, $stateParams, $rootScope, $state, Common,$ionicPlatform,$timeout,
                                                  cordovaPlug) {
        $scope.item=[]
        $scope.itemInfo = {
            mine: {},  //我的信息
            isCash: false,
            // merchantNo: paramInfo.merchantNo,
            paramInfo: Common.getCache($stateParams.type),
            // paramInfo: {rlAmount:0,url:'sdfsdf',userId:''},
            merchantNo:1,
            init: function () {},
            orderSn: 1,
            showMax: false,
            showMin: false,
            showMaxMin: false,
            pay_need: 0,  //需要支付
            ps_need: 0,  //未支付人数
            total: 100,  //一共支付
            mineIndex: 0, // 指针位置
            sortIndex: 0,  //名次
            groupId: $stateParams.type, //订单号
            count: 10,  //一共人数
            itemReceive: [],  //接受后的人数
            maxs: 0,    //最大值
            endReceive: false,  //是否全部抽完
            isShowList: false,  //是否显示列表
            isShow: false,
            isPalyed: false,
            canPay:false,
            rollTime:0
        }
        $scope.itemCashInfo = {
            total: 372,
            mainOrderNo: 1,
            item: [
                {
                    "userId": "1", "money": 4.02, "receive": false, "payStatus": "INIT", "userName": "1号",
                    "imgUrl": "img/group_pay/avatarDefault.png",
                    "isCreate": true
                },
                // {"userId": "2", "money": 45.79, "receive": false, "payStatus": "INIT", "userName": "1号", "imgUrl": "img/group_pay/avatarDefault.png", "isCreate": true},
                // {"userId": "3", "money": 0.42, "receive": false, "payStatus": "INIT", "userName": "1号", "imgUrl": "img/group_pay/avatarDefault.png", "isCreate": true},
                {
                    "userId": "8f785076394246698999ff4c1dea1848", "money": 80, "receive": false, "payStatus": "INIT",
                    "userName": "1号", "imgUrl": "img/group_pay/avatarDefault.png", "isCreate": true
                },
                // {"userId": "5", "money": 49.42, "receive": false, "payStatus": "INIT", "userName": "1号", "imgUrl": "img/group_pay/avatarDefault.png", "isCreate": true},
                // {"userId": "6", "money": 150.6, "receive": false, "payStatus": "INIT", "userName": "1号", "imgUrl": "img/group_pay/avatarDefault.png", "isCreate": true},
                // {"userId": "7", "money": 120.5, "receive": false, "payStatus": "INIT", "userName": "1号", "imgUrl": "img/group_pay/avatarDefault.png", "isCreate": true},
            ]
        }
        // Common.showAlert('乐抢单','乐抢单已经完成！',function () {
        //     $state.go('tab.index')
        // },'返回首页')
        $scope.closeGroupPlay=function () {
            Common.showConfirm('退出乐抢单', '您确定要撤销乐抢单？', function () {
                Common.post('lifeAPI/groupManagement/cancelGroup', {
                    groupId: $scope.itemInfo.groupId,
                    mainOrderNo: $scope.itemInfo.paramInfo.mainOrderNo,
                }, function (rst) {
                    setIntervalGetData.end()
                    if($stateParams.goBackNum){
                        history.go(parseInt($stateParams.goBackNum))
                        return
                    }
                    $state.go('tab.index')
                })
            }, function () {
            }, '确认', '取消')
        }
        $scope.closePlay = function () {
            if (!$scope.itemInfo.isPalyed) return;
            Common.showConfirm('退出乐抢单', '您确定要退出当前页面？', function () {
                $state.go("tab.index");
            }, function () {
            }, '确认', '取消')
        }

        Common.post('lifeAPI/turnTable/getTurnTableData', {
            groupId: $scope.itemInfo.groupId,
        }, function (rst) {
            $scope.item = rst.data.turnTableData
            initInfo()
        })

        $scope.humanType = Common.getCache($stateParams.type).userType;
        $scope.itemActived = []
        $scope.itemReceive = []
        $scope.itemPay = []

        // $scope.item=$scope.itemCashInfo.item
        // $scope.itemInfo.merchantNo=1
        // userInfo={userId:1}
        // initInfo()

        function initInfo() {
            var totals = 0
            $scope.item.forEach(function (v, i) {
                totals += v.money
                v.intMoney = v.money > 1 ? Math.round(v.money) : v.money //处理金额
                v.actived = v.isCreate  //是否是发起者
                v.h_img = v.imgUrl?v.imgUrl:'./img/group_pay/avatarDefault.png'  //头像
                if (v.userId == Common.getCache("Token").userId) {  //当前用户位置和信息
                    $scope.itemInfo.mineIndex = i;
                    $scope.itemInfo.mine = v
                }
            })
            $scope.itemInfo.count = $scope.item.length
            $scope.itemInfo.total = totals.toFixed(2)
            $scope.itemInfo.ps_need = totals.toFixed(2)
            setInfo()
            function setInfo() {
                var max = 0, maxList = [], min, minList = []
                $scope.item.forEach(function (v, i) {
                    if (!min || min > v.money) {
                        min = v.money
                        minList = []
                        minList.push(v.userId)
                    }
                    if (min == v.money && min != 0) minList.push(v.userId)
                    if (v.money > max) {
                        max = v.money
                        maxList = []
                        maxList.push(v.userId)
                    }
                    if (max == v.money && max != 0) maxList.push(v.userId)
                })
                //设置最大值
                maxList.forEach(function (v, i) {
                    if (Common.getCache("Token").userId == v) {
                        $scope.itemInfo.showMax = true
                    }
                    $scope.item.forEach(function (s, i) {
                        if (s.userId == v) {
                            s.isMax = true
                        }
                    })
                })
                //设置最小值
                minList.forEach(function (v, i) {
                    if (Common.getCache("Token").userId == v) {
                        $scope.itemInfo.showMin = true
                    }
                    $scope.item.forEach(function (s, i) {
                        if (s.userId == v) {
                            s.isMin = true
                        }
                    })
                })
                $scope.itemInfo.maxs = max
                $scope.itemInfo.isShow = true
                if ($scope.itemInfo.mine.receive||($scope.itemInfo.paramInfo.rlAmount>0&&
                    $scope.itemInfo.mine.actived)) {//首页直接进入
                    if(($scope.itemInfo.paramInfo.rlAmount>0&&
                        $scope.itemInfo.mine.actived)&& !$scope.itemInfo.mine.receive){
                        Common.get('lifeAPI/turnTable/getMyPayMoney', {
                            merchantNo: $scope.itemInfo.merchantNo,
                            groupId: $scope.itemInfo.groupId,
                        }, function (rst) {
                            $scope.itemInfo.orderSn = rst.data.orderSn
                            if (!$scope.itemInfo.orderSn && $scope.itemInfo.paramInfo.userType == 0) {
                                $scope.itemInfo.orderSn = $scope.itemInfo.paramInfo.mainOrderNo
                            }
                            Common.setCache('orderSn_' + Common.getCache("Token").userId + $scope.itemInfo.groupId, $scope.itemInfo.orderSn)

                            if ($scope.itemInfo.showMin || $scope.itemInfo.showMax) {
                                $scope.itemInfo.showMaxMin = true;
                            }

                        })
                    }
                    setTimeout(function () {
                        $scope.itemInfo.isPalyed = true
                        $scope.itemInfo.orderSn = Common.getCache('orderSn_' + Common.getCache("Token").userId + $scope.itemInfo.groupId)
                        $scope.$emit('startCreatePay', true)
                    }, 100)
                    return
                }
                setTimeout(function () {
                    $scope.$emit('startCreatePay', false)
                }, 100)
            }
        }

        function refreshData(rst) {
            if (rst.data.groupStatus=='CANCEL') {  //乐抢单撤销
                Common.showAlert('乐抢单',  rst.data.groupStatusName, function () {
                    $state.go('tab.index')
                }, '返回首页')
                isEnd = true
                setIntervalGetData.end()
                return
            }
            rst = rst.data;
            var data = rst.turnTableData ? rst.turnTableData : rst
            if (data) {
                var itemReceive = [], itemActived = [], moneyList = [], payMoney = 0, payPc = 0, itemPay = [], isEnd = false
                $scope.itemInfo.canPay =true
                data.forEach(function (v, i) {
                    if(!v.isCreate && v.payStatus != 'SUCCESS')  $scope.itemInfo.canPay =false;
                    v.pay = false, v.actived = v.isCreate  //是否是发起者
                    if (v.isCreate && v.payStatus == 'SUCCESS') {
                        Common.showAlert('乐抢单', '乐抢单已经完成！', function () {
                            $state.go('tab.index')
                        }, '返回首页')
                        isEnd = true
                        setIntervalGetData.end()
                        return
                    }
                    if (v.payStatus == 'SUCCESS') v.pay = true
                    if (v.pay) {
                        payMoney += parseFloat(v.money);
                        payPc++
                    }
                    if(v.payStatus == 'SUCCESS' && v.userId == Common.getCache("Token").userId){
                        $scope.itemInfo.mine.pay = true
                    }
                    moneyList.push(parseFloat(v.money))
                    $scope.item.forEach(function (it, j) {
                        if (it.userId == v.userId) {
                            itemActived.push(j)
                            if (v.pay) {
                                itemPay.push(j)
                            }
                            itemReceive.push(angular.extend({}, it, v));
                        }
                    })
                })
                if (isEnd) return
                moneyList = moneyList.sort(function sortNumber(a, b) {
                    return a - b
                }).reverse();
                $scope.itemInfo.itemReceive = itemReceive
                $scope.itemActived = itemActived
                $scope.itemPay = itemPay
                $scope.itemInfo.pay_need = parseFloat($scope.itemInfo.total - payMoney).toFixed(2)
                $scope.itemInfo.ps_need = $scope.item.length - payPc
                $scope.itemInfo.mine.number = moneyList.indexOf($scope.itemInfo.mine.money) + 1
                if ($scope.item.length == data.length) {
                    $scope.itemInfo.endReceive = true
                    var isMax = document.querySelectorAll('.ismax-lass')
                    for (var i = 0; i < isMax.length; i++) {
                        isMax[i].className = ''
                    }
                }
                if (itemPay.length == $scope.item.length && $scope.item.length!=0) {
                    setIntervalGetData.end()
                }
            }
        }
        $scope.setshowGuiZes=false
        $scope.setshowGuiZe=function(){
            $scope.setshowGuiZes=!$scope.setshowGuiZes
        }
        $scope.setshowqrcode=function () {
            $scope.showqrcode=!$scope.showqrcode
        }
        setIntervalGetData.init('lifeAPI/turnTable/getOtherPayMoney', refreshData)
        $scope.$on('$ionicView.beforeLeave', function () {
            $scope.debindBackButtonAction();
            console.log('beforeLeave')
            $scope.showqrcode=false
            $scope.setshowGuiZes=false
            setIntervalGetData.end()
            $scope.itemInfo.isCash = true
            $scope.destoryed()
        });
        $timeout(function() {
            // $scope.QRCodeImage='asdfasd'
            cordovaPlug.CommonPL(function(data){
                if(data.status == 1){
                    $scope.QRCodeImage = data.data.QRCodeImage;
                    $scope.$apply();
                }else{
                    toast.show("插件调用失败！");
                }
            }, "generateCode", [$scope.itemInfo.paramInfo.url+"&type=1"])
        }, 50)
        $scope.$on('$ionicView.beforeEnter', function () {
            Common.get('lifeAPI/wxGroupPay/payBack', {
                groupId: $stateParams.type
            }, function () {
            }, {});
            $scope.destoryed = $scope.$on('lightUp',function (e,data) {
                setIntervalGetData.end()
                setIntervalGetData.init('lifeAPI/turnTable/getOtherPayMoney', refreshData)
                setIntervalGetData.start({groupId: $scope.itemInfo.groupId}, 2)
            })
            setIntervalGetData.end()
            setIntervalGetData.init('lifeAPI/turnTable/getOtherPayMoney', refreshData)
            setIntervalGetData.start({groupId: $scope.itemInfo.groupId}, 2)
            //物理返回键
            $scope.debindBackButtonAction =  $ionicPlatform.registerBackButtonAction(function (e) {
                e.preventDefault();
                $scope.closePlay();
                return false;
            }, 302);
        });

        //微信支付
        $scope.goWxPay = function () {
            if(!$scope.itemInfo.isPalyed) return
            // if($scope.itemInfo.ps_need != 0 && $scope.humanType==0){
            if((!$scope.itemInfo.canPay ||  !$scope.itemInfo.endReceive) && $scope.humanType==0 ){
                Common.showConfirm('支付', '还有参与者未支付，是否确认买单？', function () {
                    goNext()
                }, function () {
                }, '确认', '取消')
                return
            }
            goNext();
            function goNext() {
                var money, orderNo;
                Common.get('lifeAPI/wxGroupPay/beforePay', {
                    groupId: $stateParams.type,
                    role: Common.getCache($stateParams.type).userType === 0 ? 'GROUPOWNER' : 'GROUPMEMBER'
                }, function (res) {
                    if ($scope.itemInfo.mine.isCreate) {
                        money = (Common.getCache($stateParams.type).totalAmount * 100 - res.data * 100) / 100;
                        orderNo = Common.getCache($stateParams.type).mainOrderNo;
                    } else {
                        money = $scope.itemInfo.mine.money;
                        orderNo = $scope.itemInfo.orderSn;
                    }
                    if (!Common.getCache($stateParams.type).orderNo) {
                        var cache = Common.getCache($stateParams.type);
                        cache.orderNo = orderNo;
                        Common.setCache($stateParams.type,cache);
                    }
                    $state.go('tab.group_pay', {
                        groupId: $stateParams.type,
                        personalPay: money,
                        participantPay: res.data
                    })
                }, null)
            }

        };

    })
    .directive('luckyTurntable', function (Common, setIntervalGetData, $timeout, $rootScope,$state) {
        return {
            restrict: 'E',
            scope: true,
            template: '<div id="lucky-turntable" ng-class="turntableClass">' +
            '<div class="bg"></div>' +
            '<div class="dots"></div>' +
            '<div class="item-s"><div class="play-box">' +
            '<div class="play-item wan"></div><div class="play-item qian"></div><div class="play-item bai"></div><div class="play-item shi"></div>' +
            '<div class="play-item ge"></div></div></div>' +
            '<div class="item-t">'+'<div class="item-t-o" style="margin-top: -1.75rem">' +
            '<img src="{{itemInfo.mine.imgUrl}}" alt="">' +
            '<span class="ismax-lass" ng-if="itemInfo.showMax" style="background-image: url(./img/group_pay/tuhao.png) "></span>' +
            '<span class="ismax-lass" ng-if="itemInfo.showMin" style="background-image: url(./img/group_pay/xingyun.png) "></span></div></div>'+
            '<div class="zoom-itm"><p><i></i></p></div>' +
            '</div>',
            link: function ($scope, el) {
                var ele = el[0].querySelector('#lucky-turntable'),
                    e_height = parseFloat(ele.offsetWidth),
                    r = e_height / 2,
                    num = $scope.item.length,
                    p_b_w = r * Math.tan(Math.PI / num),
                    p_b_h = r,
                    item_du = 360 / num
                var items = ele.querySelector('.item-s')
                var itemt = ele.querySelector('.item-t')
                var dotsBox = ele.querySelector('.dots')
                var zoomItm = ele.querySelector('.zoom-itm')
                var playBox = ele.querySelector('.play-box')
                $scope.turntableClass = 'init';
                var loop, actived = false, isInit = false,rollTime
                $rootScope.$on('startCreatePay', function (e, state) {
                    if (isInit) return;
                    isInit = true;
                    init()

                    if (state) {
                        $scope.itemInfo.isPalyed = true
                        zoomItm.className = 'zoom-itm end';
                        $scope.turntableClass = 'active';
                        $scope.itemInfo.isShowList = true
                        $scope.itemActived.forEach(function (v, i) {
                            if(!itemt.querySelectorAll('.item-t-o')[v]) return
                            itemt.querySelectorAll('.item-t-o')[v].style.display = 'block'
                        })
                        active(true)
                        return
                    }

                    $scope.itemInfo.rollTime = 59
                    rollTime = setInterval(function () {
                        $scope.itemInfo.rollTime--
                        var rollDom = document.querySelector('#roll-time span')
                        rollDom.innerHTML=( $scope.itemInfo.rollTime>9? $scope.itemInfo.rollTime:'0'+ $scope.itemInfo.rollTime)+'s';
                    },1000)

                    loop = setTimeout(function () {
                        clearInterval(loop);
                        clearInterval(rollTime);
                        $scope.itemInfo.rollTime = 0
                        if (actived) return;
                        actived = true
                        zoomItm.className = 'zoom-itm end';
                        if($scope.itemInfo.mine.receive) return
                        Common.get('lifeAPI/turnTable/getMyPayMoney', {
                            merchantNo: $scope.itemInfo.merchantNo,
                            groupId: $scope.itemInfo.groupId,
                        }, function (rst) {
                            if(rst.data=='GROUP_STATUS_ERROR'){
                                Common.showAlert('乐抢单',rst.description, function () {
                                    $state.go('tab.index')
                                }, '返回首页')
                                return;
                            }
                            $scope.itemInfo.orderSn = rst.data.orderSn
                            if (!$scope.itemInfo.orderSn && $scope.itemInfo.paramInfo.userType == 0) {
                                $scope.itemInfo.orderSn = $scope.itemInfo.paramInfo.mainOrderNo
                            }
                            Common.setCache('orderSn_' + Common.getCache("Token").userId + $scope.itemInfo.groupId, $scope.itemInfo.orderSn)
                            active()
                        })
                    }, $scope.itemInfo.paramInfo.countDownSec)
                })
                zoomItm.onclick = function () {
                    clearInterval(loop);
                    clearInterval(rollTime);
                    $scope.itemInfo.rollTime = 0
                    if (actived) return;
                    actived = true
                    zoomItm.className = 'zoom-itm end';
                    if($scope.itemInfo.mine.receive) return
                    Common.get('lifeAPI/turnTable/getMyPayMoney', {
                        merchantNo: $scope.itemInfo.merchantNo,
                        groupId: $scope.itemInfo.groupId,
                    }, function (rst) {
                        if(rst.data=='GROUP_STATUS_ERROR'){
                            Common.showAlert('乐抢单', rst.description, function () {
                                $state.go('tab.index')
                            }, '返回首页')
                            return;
                        }
                        $scope.itemInfo.orderSn = rst.data.orderSn
                        if (!$scope.itemInfo.orderSn && $scope.itemInfo.paramInfo.userType == 0) {
                            $scope.itemInfo.orderSn = $scope.itemInfo.paramInfo.mainOrderNo
                        }
                        Common.setCache('orderSn_' + Common.getCache("Token").userId + $scope.itemInfo.groupId, $scope.itemInfo.orderSn)
                        active()
                    })
                }
                zoomItm.querySelector('p').addEventListener('touchstart', function () {
                    if (actived) return;
                    zoomItm.querySelector('p').className = 'active'
                })
                zoomItm.querySelector('p').addEventListener('touchend', function () {
                    zoomItm.querySelector('p').className = ''
                })
                function init() {
                    setDot()
                    dotActive()
                    var list = '';
                    for (var i = 0;i<4;i++){
                        for (var j=0;j<10;j++){
                            list+='<span>'+j+'</span>'
                        }
                    }
                    angular.element(ele.querySelectorAll('.play-item')).append('<div ng-if="itemInfo.isPalyed" class="list1 list-run">'+list+'</div>' +
                        '<div class="show-box"><div class="list2 list-run">'+list+'</div></div>')
                }
                $scope.$watch('itemActived', function () {
                    end()
                })
                var activeDo = false
                function active(type) {
                    var i = 0, time = type ? 5 : 2500,listRun,pos
                    $scope.turntableClass = 'active';
                    type ? zoomItm.querySelector('p').className = 'end' : '';
                    var money = parseInt($scope.itemInfo.mine.money)+100000+''
                    for(var i=1;i<6;i++){
                        pos=13.8+(money.substr(i,1)-1)*0.46
                        listRun =playBox.querySelectorAll('.play-item')[i-1].querySelectorAll('.list-run')
                        angular.element(listRun).css('transform','translateY(-'+pos+'rem)')
                        angular.element(listRun).css('webkitTransform','translateY(-'+pos+'rem)')
                    }
                    $timeout(function () {
                        clearInterval(loop);
                        type ? '': activeDo = true
                        $scope.itemInfo.isPalyed = true
                        $scope.itemInfo.isShowList = true
                    }, 1)



                }
                $scope.$watch('itemPay', function () {
                    $scope.itemPay.forEach(function (v, i) {
                        itemt.querySelectorAll('.item-t-o')[v].querySelector('i').className = 'active'
                    })
                })
                function end() {
                    if($scope.itemActived.length>0){
                        $scope.turntableClass = 'active';
                    }
                    $timeout(function () {
                        if (($scope.itemInfo.showMin || $scope.itemInfo.showMax)&& activeDo &&　$scope.itemInfo.endReceive　) {
                            $scope.itemInfo.showMaxMin = true
                            activeDo = false
                        }
                    }, 1)
                    $scope.itemActived.forEach(function (v, i) {
                        if(!itemt.querySelectorAll('.item-t-o')[v]) return
                        itemt.querySelectorAll('.item-t-o')[v].style.display = 'block'
                    })
                }

                function setDot() {
                    for (var i = 0; i < 18; i++) {
                        var top = -2.59 * Math.cos(Math.PI * i * 2 / 18), left = 2.59 * Math.sin(Math.PI * i * 2 / 18)
                        angular.element(dotsBox).append('<span style="margin-left:' + left + 'rem;margin-top: ' + top + 'rem; "></span>')
                    }
                }

                function dotActive() {
                    var i = 0
                    loop = setInterval(function () {
                        i++
                        if (i == 18) i = 0
                        if (dotsBox.querySelector('.action')) dotsBox.querySelector('.action').className = '';
                        dotsBox.querySelectorAll('span')[i].className = 'action';
                    }, 50)
                }
            }
        }
    })
    .service('setIntervalGetData', function (Common, $interval) {
        /*
         * state  1:初始化，2:循环请求中，3：结束
         * */
        var url, loop, time, loopNum, back, state
        return {
            init: function (urls, bak) {
                $interval.cancel(loop);
                url = urls, state = 1, loopNum = 0, time = 4000, back = bak
            },
            start: function (data, type) {
                var d = data ? data : {}
                state = 1
                loopFun()
                var itest = 0

                function loopFun() {
                    itest++
                    if (state == 3) {
                        $interval.cancel(loop);
                        return
                    }
                    loopNum++
                    var num = loopNum
                    Common.post(url, d, function (data) {
                        if (num == loopNum && state != 3) {
                            if (data) back(data)
                        }
                    }, function () {
                    })
                }
                loop = $interval(loopFun, time)
            },
            start2: function (data, type) {
                var d = data ? data : {}
                state = 1
                loopFun()
                var itest = 0
                function loopFun() {
                    itest++
                    if (state == 3) {
                        $interval.cancel(loop);
                        return
                    }
                    loopNum++
                    var num = loopNum
                    Common.get(url, d, function (data) {
                        if (num == loopNum && state != 3) {
                            if (data) back(data)
                        }
                    }, function () {
                    })
                }

                loop = $interval(loopFun, time)
            },
            end: function () {
                $interval.cancel(loop);
                state = 3
            },
            getLoop: function() {
                if (loop) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    })

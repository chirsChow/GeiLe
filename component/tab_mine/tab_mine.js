var tab_mine_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.tab_mine', {
            url: '/tab_mine?{time}',
            views: {
                'tab-mine': {
                    templateUrl: 'component/tab_mine/tab_mine.html',
                    controller: 'tab_mineCtrl'
                }
            }
        });
};
myapp.config(tab_mine_myConfig);

angular.module('starter.tab_mine', [])
    .controller('tab_mineCtrl', function ($scope, $ionicModal, $ionicSlideBoxDelegate, actionSheetItem, Common, $http, $state, $timeout, cordovaPlug, $ionicHistory, bindCardService, $ionicScrollDelegate) {
        $scope.balanceNum = '****';
        $scope.information = Common.getCache('information');
        $scope.showTel = function () {
            actionSheetItem.showTel("4000200365");
        }

        // var top = 289;
        // var contentTop = 641;
        // var p_u = 0;
        $scope.reset = function() {
            // console.log(123)
            var scrollTop = $ionicScrollDelegate.$getByHandle('tab_mine').getScrollPosition();
            if (!scrollTop) return;

            if (scrollTop.top <= 0) {
                $scope.isUp = false;
            } else {
                return false;
            }
        }

        $scope.setup = function() {
            $scope.isUp = true;
        }
        // $scope.contentScroll = function () {  // 滚动改变头部高度(先保留，说不行优化效果还会用到）
        //     var scrollTop = $ionicScrollDelegate.$getByHandle('tab_mine').getScrollPosition();
        //     if (!scrollTop) return;
        //
        //     if (scrollTop.top > p_u) {
        //         top -= scrollTop.top;
        //         contentTop -= scrollTop.top;
        //     } else if (scrollTop.top < p_u && scrollTop.top > 0 && scrollTop.top < 160) {
        //         top += scrollTop.top;
        //         contentTop += scrollTop.top;
        //     }
        //     p_u = scrollTop.top;
        //     if (top < 160) {
        //         top = 160;
        //         contentTop = 512;
        //     } else if (top > 289) {
        //         top = 289;
        //         contentTop = 641;
        //     }
        //     angular.element(document.querySelectorAll('#tab_mine .mine-header')).css({
        //         height: top / 100 + 'rem'
        //     })
        //     angular.element(document.querySelectorAll('#tab_mine .scroll-content')).css({
        //         top: contentTop / 100 + 'rem'
        //     })
        //     $ionicScrollDelegate.$getByHandle('tab_mine').resize();
        // }

        // 跳转打赏
        $scope.linkDaShang = function ($event, list) {
            $event.stopPropagation();
            $state.go("tab.payment_exceptional", {
                merchantNo: list.merchantNo,
                paymentNo: list.orderNo,
                money: list.money,
                isScore: 'N',
                backRate: list.returnHappyCoin
            });
        };

        // 跳转账单详情
        $scope.linkDetails = function (cache) {
            Common.setCache('billDetails', cache);
            if (cache.orderType == 7) {
                $state.go('tab.mine_bill_groupPay_detail', {orderNo: cache.orderNo});
            } else {
                $state.go('tab.mine_bill_details');
            }
        };
        // //获取银行卡
        var myData = Common.getCache('banklistColor').data;
        $scope.gotoBankList = function() {
            if (Common.getCache('information').authStatus == 0) $state.go("tab.my_certification", { "nextStep": 2 })
            else if ($scope.bankNum == 0 || $scope.bankNum == undefined) {
                $state.go("tab.mine_addNewBankCard");
            } else {
                $state.go("tab.mine_banklist");
            }
        }

        $scope.linkMsg = function () {
            if (Common.isLogin()) $state.go("tab.index_msg", {enter: 1});
        }
        $scope.$on('$ionicView.afterEnter', function () {
            // $timeout(function() {
            //     if ($scope.information.authStatus == 0 || $scope.information.authStatus == null) actionSheetItem.showAuthentication($scope.gotoCard);
            //     //actionSheetItem.showAuthentication($scope.gotoCard);
            // }, 0)
        })
        //实名认证功能
        $scope.data = {
            userName: '',
            idCard: ''
        };
        $scope.gotoCard = function () {
            if($scope.clickDoubel) return;
            $scope.clickDoubel = true;
            $timeout(function(){
                 $scope.clickDoubel = false;
            },1000)
            console.log("调用摄像头")
            cordovaPlug.CommonPL(function (data) {
                if (data.status == 1) {
                    $scope.openModal();
                    $scope.data.userName = data.data.name;
                    $scope.data.idCard = data.data.code;
                    $scope.data.gender = data.data.gender;
                    $scope.data.birth = data.data.birth;
                    $scope.data.address = data.data.address;
                    $scope.$apply();
                } else if (data.status == 2) {
                    $scope.openModal();
                    $scope.data.userName = '';
                    $scope.data.idCard = '';

                } else {
                    toast.show("插件调用失败！");
                }
            }, "scanIdCard", [])
        }
        //完成跳转
        var isCardID = function (sId) {
            var regIdCard = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
            if (!regIdCard.test(sId)) return "请输入正确的身份证号";
            return true;
        }
        $scope.subimit = function () {
            if ($scope.data.userName.length < 1) toast.show("请输入姓名");
            else if ($scope.data.userName.idCard < 1) toast.show("请输入身份证号");
            else if (isCardID($scope.data.idCard) != true) toast.show(isCardID($scope.data.idCard));
            else {
                Common.post('lifeAPI/user/password', {
                    "name": $scope.data.userName,
                    "idCard": $scope.data.idCard,
                    "sex": $scope.data.gender,
                    "birth": $scope.data.birth,
                    "address": $scope.data.address
                }, function (data) {
                    var myData = Common.getCache("information");
                    myData.realName = $scope.data.userName;
                    if (data.data != null) myData.authStatus = data.data.authStatus;
                    myData.idCard = $scope.data.idCard;
                    Common.setCache("information", myData);
                    Common.showAlert('温馨提醒', '恭喜您，已经认证成功！', function () {
                        $scope.modal.hide();
                    });
                }, {}, 1);
            }
        }
        $ionicModal.fromTemplateUrl('my-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.openModal = function () {
            $scope.modal.show();
        }
        $scope.closeModal = function () {
            $scope.gotoCard();
            $scope.modal.hide();
        }
        $scope.$on('$ionicView.beforeEnter', function() {
            Common.get('lifeAPI/payment/fft/card/', { 'type': 0 ,'isNeedPos':true,"apiVersion":"V1.1.0"}, function(data) {
                var oldData = data.data;
                for (var i = 0; i < oldData.length; i++) {
                    if (myData[oldData[i].bankIndex] == null) continue;
                    oldData[i].bankImg = 'img/bank/' + myData[oldData[i].bankIndex].icon;
                    oldData[i].color = myData[oldData[i].bankIndex].color;
                }
                $scope.bankNum = oldData.length;
                Common.setCache("bankList", oldData);
            }, {}, 1);
            if (Common.getCache('Token') == null) {
                $state.go("tab.index");
            }
            $scope.information = Common.getCache('information');
            //设置红点

            $scope.nativeBroadcastMsg = {unRead: 0};


            window.broadcastMsgNum = function(obj) { //obj参数为APP返回的字符串，{"num":1,"type":0||1},num为未读消息条数，type是消息类型

                if (typeof(obj) == "object") {
                    $scope.nativeBroadcastMsg = obj.data;
                } else {
                    $scope.nativeBroadcastMsg = angular.fromJson(obj).data;
                }
                $scope.$apply();
            };

            $timeout(function () {
                if (Common.getCache('Token') != null) {
                    cordovaPlug.CommonPL(function (data) {
                        $scope.nativeBroadcastMsg.unRead = data.data.count;
                        $scope.$apply();
                    }, 'getUnreadMessageCount', []);
                }
            });
            //获取余额
            Common.get('lifeAPI/payment/user/happycoin/', {}, function (data) {
                $scope.balanceNum = data.data.amount;
                Common.setCache("balanceNum", data.data.amount);
            }, {});


        });

        //禁止手动滑动slideBox，并初始化最开始slide位置为最后;
        $scope.slideIndex = 5;
        var p_index = 5;
        //获取本地时间
        $scope.year = new Date().getFullYear();
        $scope.month = new Date().getMonth() + 1 > 9 ? (new Date().getMonth() + 1) : ("0" + (new Date().getMonth() + 1));

        //初始化list
        $scope.lists = [null, null, null, null, null, null];
        $scope.noMoreMonth = [false, false, false, false, false, false];
        $scope.monthIndex = 0;

        var monthPage = [1, 1, 1, 1, 1, 1];
        $scope.changeBill = function() {
            $ionicScrollDelegate.scrollTop();
            $scope.slideIndex = $ionicSlideBoxDelegate.currentIndex();
            if ($scope.lists[$ionicSlideBoxDelegate.currentIndex()]) {
                checkMonth();
                return false;
            }
            checkMonth();

            getBillInfo($scope.monthIndex, $ionicSlideBoxDelegate.currentIndex());
        };

        function checkMonth () {
            if ($ionicSlideBoxDelegate.currentIndex() < p_index) {
                $scope.month = parseInt($scope.month);
                if ($scope.month === 1) {
                    $scope.month = 12;
                    $scope.year--;
                } else {
                    $scope.month = $scope.month > 10 ? $scope.month - 1 : ('0' + ($scope.month - 1));
                }

                p_index = $ionicSlideBoxDelegate.currentIndex();
                $scope.monthIndex++;
            } else {
                $scope.month = parseInt($scope.month);

                if ($scope.month === 12) {
                    $scope.month = '01';
                    $scope.year++;
                } else {
                    $scope.month = $scope.month >= 9 ? $scope.month + 1 : ('0' + ($scope.month + 1));
                }
                p_index = $ionicSlideBoxDelegate.currentIndex();
                $scope.monthIndex--;
            }
        }
        //统一获取账单方法
        function getBillInfo(monthIndex, index) {
            Common.get('/lifeAPI/payment/bill', {
                month: monthIndex,
                curPage: monthPage[index],
                pageSize: 30
            }, function (res) {

                res.data.list = res.data.list || [];
                // res.data.list[0].operationName = '乐抢单';
                if (!$scope.lists[index]) {
                    $scope.lists[index] = res.data;

                    var activeList = res.data.list;
                    // $scope.lists[index].list = [];

                    if (activeList.length > 0) {
                        var commentArr = [];

                        activeList.forEach(function (item) {
                            if (item.orderNo && item.orderNo[0] != 6) {
                                commentArr.push(item.orderNo);
                            }
                        });

                        if (commentArr.length > 0) {
                            Common.post('/lifeAPI/payment/commentPersonal/status', {
                                paymentNo: commentArr.join(',')
                            }, function (response) {
                                response.data = response.data || [];
                                if (response.data.length > 0) {
                                    activeList.forEach(function (item) {
                                        response.data.forEach(function (i) {
                                            if (i.paymentNo) {
                                                if (item.orderNo == i.paymentNo) {
                                                    item.commentStauts = i.status;
                                                    return;
                                                }
                                            }
                                        });
                                    });
                                }


                                $scope.lists[index].list = activeList;

                            }, function () {
                            }, 1);
                        } else {
                            $scope.lists[index].list = activeList;
                        }
                    }
                } else {
                    if (res.data.list.length > 0) {
                        $scope.lists[index].list = $scope.lists[index].list.concat(res.data.list);

                        var commentArr = [];

                        res.data.list.forEach(function (item) {
                            if (item.orderNo) {
                                commentArr.push(item.orderNo);
                            }
                        });

                        if (commentArr.length > 0) {
                            Common.post('/lifeAPI/payment/commentPersonal/status', {
                                paymentNo: commentArr.join(',')
                            }, function (response) {
                                response.data = response.data || [];
                                if (response.data.length > 0) {
                                    res.data.list.forEach(function (item) {
                                        response.data.forEach(function (i) {
                                            if (i.paymentNo) {
                                                if (item.orderNo == i.paymentNo) {
                                                    item.commentStauts = i.status;
                                                    return;
                                                }
                                            }
                                        });
                                    });
                                }
                            }, function () {
                            }, 1);
                        }
                    }
                }

                if (res.data.totalPage == res.data.curPage || $scope.lists[index].list == null || res.data.totalPage == 0) {
                    $scope.noMoreMonth[index] = false;
                } else {
                    $timeout(function () {
                        $scope.noMoreMonth[index] = true;
                    }, 300);
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
                monthPage[index]++;
                $ionicSlideBoxDelegate.$getByHandle('bill-handle').update();
            },{},1);
        }

        //进页面初始化首月账单
        getBillInfo($scope.monthIndex, 5);

        $scope.loadMoreBills = function (index) {
            getBillInfo($scope.monthIndex, index);
        };
    })
    .filter('refundCashFilter', function() {
        return function(type) {
            if (type === '退款') {
                return '退回现金（元）'
            } else {
                return '现金支付（元）'
            }
        };
    })
    .filter('refundBeanFilter', function() {
        return function(type) {
            if (type === '退款') {
                return '退回乐豆（豆）'
            } else {
                return '乐豆支付（豆）'
            }
        };
    })
    .filter('refundGiftFilter', function() {
        return function(type) {
            if (type === '退款') {
                return '收回乐豆（豆）'
            } else {
                return '赠送乐豆（豆）'
            }
        };
    });

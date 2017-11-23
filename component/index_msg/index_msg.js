var index_msg_myConfig = function ($stateProvider, $ionicHistoryProvider) {

    $stateProvider
        .state('tab.index_msg', {
            url: '/index_msg?{enter}',
            views: {
                'tab-index': {
                    templateUrl: 'component/index_msg/index_msg.html',
                    controller: 'index_msgCtrl'
                }
            }
        });
};
myapp.config(index_msg_myConfig);

angular.module('starter.index_msg', [])
    .controller('index_msgCtrl', function ($scope, $ionicHistory, $stateParams, toast, $state, $location, cordovaPlug, Common, $rootScope, $timeout, $ionicListDelegate) {
        $scope.$on('$ionicView.beforeEnter', function () {
            //返回上一页
            var enter = $stateParams.enter;
            $scope.goBack = function () {
                if (enter == 1) {
                    $state.go('tab.tab_mine');
                } else if (enter == 2) {
                    window.history.back()
                } else {
                    $state.go('tab.index');
                }
            };

            //初始化ion-item是否可移动；
            $scope.canSwipe = true;

            $scope.closeOption = function () {
                $ionicListDelegate.closeOptionButtons();
                $scope.canSwipe = !$scope.canSwipe;
            };
            //初始化tab按钮
            $scope.press = function (num) {
                $scope.navNum = num;
                $scope.canSwipe = true;
                $scope.edit = false;
            };
            $scope.press(0);

            //初始化数据
            $scope.sysLists = [];
            $scope.actLists = [];
            $scope.noMoreSysMsg = false;
            $scope.noMoreActMsg = false;
            $scope.sysFirstLoad = false;
            $scope.master1 = {all: false};
            $scope.master2 = {all: false};
            var sysPage = 1,
                actPage = 1;


            $scope.nativeBroadcastMsg = {type: null};

            $scope.linkComment = function ($event, list) {
                $event.stopPropagation();
                list.status = 1;
                cordovaPlug.CommonPL(function () {

                }, 'setMessageHasRead', [list.systemType, list.id]);
                if (list.commentStauts == 2) {
                    toast.show('已经打赏过了。');
                    return;
                }
                $state.go("tab.payment_exceptional", {
                    merchantNo: list.merchantNo,
                    paymentNo: list.orderNo,
                    money: list.totalAmt,
                    isScore: 'N',
                    backRate: list.giftAmt
                });
            };

            window.broadcastMsgNum = function (obj) { //obj参数为APP返回的字符串，{"num":1,"type":0||1},num为未读消息条数，type是消息类型
                if (typeof(obj) == "object") {
                    $scope.nativeBroadcastMsg = obj.data;
                } else {
                    $scope.nativeBroadcastMsg = angular.fromJson(obj).data;
                }
                cordovaPlug.CommonPL(function (res) {
                    $scope.sysFirstLoad = true;
                    if ($scope.nativeBroadcastMsg.type == "system" || $scope.nativeBroadcastMsg.type == "payment_app" || $scope.nativeBroadcastMsg.type == "monthly_bills") {
                        $scope.sysLists.unshift(res.data.list[0]);

                        if ($scope.nativeBroadcastMsg.type == 'payment_app') {  // 如果是支付消息类型，需要去查询打赏入口
                            if (res.data.list[0].tranType == 1100 && res.data.list[0].orderNo[0] != 6) {
                                //查新插入信息的打赏状态
                                Common.post('/lifeAPI/payment/commentPersonal/status', {
                                    paymentNo: res.data.list[0].orderNo
                                }, function (response) {
                                    response.data = response.data || [];
                                    if (response.data.length > 0) {
                                        if (response.data[0].paymentNo) {
                                            $scope.sysLists[0].commentStauts = response.data[0].status;
                                        }
                                    }
                                }, function () {
                                    Common.hideLoading();
                                }, 1);
                            }
                        }

                        if ($scope.sysLists.length > 10) {
                            $scope.sysLists.splice($scope.sysLists.length - 1, 1);
                        }
                        $scope.$apply();
                    } else {
                        $scope.actLists.unshift(res.data.list[0]);
                        if ($scope.actLists.length > 10) {
                            $scope.actLists.splice($scope.actLists.length - 1, 1);
                        }
                        $scope.$apply();
                    }
                    $scope.nativeBroadcastMsg.type = null;
                }, 'getMessageList', [$scope.nativeBroadcastMsg.type, 1, 10]);

            };


            $scope.loadMoreSys = function () {
                cordovaPlug.CommonPL(function (res) {
                    res.data.list = res.data.list || [];

                    if (res.data.list.length > 0) {
                        $scope.sysLists = $scope.sysLists.concat(res.data.list);

                        var commentArr = [];

                        res.data.list.forEach(function (item) {
                            if (item.tranType == 1100 && (item.orderNo && item.orderNo != '' && item.orderNo[0] != 6)) {
                                commentArr.push(item.orderNo);
                            }
                        });

                        if (commentArr.length > 0) {
                            Common.post('/lifeAPI/payment/commentPersonal/status', {
                                paymentNo: commentArr.join(',')
                            }, function (response) {
                                response.data = response.data || [];
                                if (response.data.length > 0) {
                                    $scope.sysLists.forEach(function (item) {
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
                                Common.hideLoading();
                            }, 1);
                        }
                    }

                    if (res.data.list.length < 10) {
                        $scope.noMoreSysMsg = false;
                    } else {
                        $scope.noMoreSysMsg = true;
                    }
                    $scope.sysFirstLoad = true;

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    sysPage++;
                }, 'getMessageList', ["notification", sysPage, 10]);

            };

            $scope.loadMoreSys();

            $scope.loadMoreAct = function () {
                cordovaPlug.CommonPL(function (res) {
                    res.data.list = res.data.list || [];
                    if (res.data.list.length > 0) {
                        $scope.actLists = $scope.actLists.concat(res.data.list);
                    }

                    if (res.data.list.length < 10) {
                        $scope.noMoreActMsg = false;
                    } else {
                        $scope.noMoreActMsg = true;
                    }

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    actPage++;
                }, 'getMessageList', ["1", actPage, 10]);

            };
            $scope.loadMoreAct();
            //全选方法
            $scope.checkAll = function (bool, arr) {
                if (bool) {
                    for (var i in arr) {
                        arr[i].checked = true;
                    }
                } else {
                    for (var j in arr) {
                        arr[j].checked = false;
                    }
                }
            };

            /*监听checkbox全选状态
             @param "sysLists"  监听系统消息列表checkbox
             @param "actLists"  监听推荐消息列表checkbox
             ***************************************************************/
            $scope.$watch('sysLists', function (newValue) {
                var count = 0;
                for (var i in newValue) {
                    if (!newValue[i].checked) {
                        $scope.master1.all = false;
                        break;
                    } else {
                        count++;
                    }
                }
                for (var j in newValue) {
                    if (newValue[j].checked) {
                        $scope.deleteblock1 = true;
                        break;
                    } else {
                        $scope.deleteblock1 = false;
                    }
                }
                if (newValue.length === count) {
                    $scope.master1.all = true;
                }
                if (newValue.length === 0) {
                    $scope.master1.all = false;
                }
            }, true);

            $scope.$watch('actLists', function (newValue) {
                var count = 0;
                for (var i in newValue) {
                    if (!newValue[i].checked) {
                        $scope.master2.all = false;
                        break;
                    } else {
                        count++;
                    }
                }
                for (var j in newValue) {
                    if (newValue[j].checked) {
                        $scope.deleteblock2 = true;
                        break;
                    } else {
                        $scope.deleteblock2 = false;
                    }
                }
                if (newValue.length === count) {
                    $scope.master2.all = true;
                }
                if (newValue.length === 0) {
                    $scope.master2.all = false;
                }
            }, true);


            /*批量删除方法 & 单个删除方法 & 设置已读方法
             @ deleteSysLists  批量删除系统消息
             @ deleteActLists  批量删除推荐消息
             @ singleDel 单个删除方法
             @ setMessageHasRead 设置已读
             ***************************************************************/
            $scope.deleteSysLists = function () {
                if ($scope.sysLists.length == 0) {
                    toast.show('暂无消息');
                    return;
                }
                var newArr = [];
                var nativeArr = [];
                for (var i in $scope.sysLists) {
                    if ($scope.sysLists[i].checked) {
                        nativeArr.push($scope.sysLists[i].systemType + '#' + $scope.sysLists[i].id);
                    } else {
                        newArr.push($scope.sysLists[i]);
                    }
                }
                if (nativeArr.length === 0) {
                    return;
                }
                $scope.sysLists = newArr;
                cordovaPlug.CommonPL(function () {
                    toast.show('删除成功');
                }, 'deleteMessageByBatch', ['notification', nativeArr.join(',')]);
                if (newArr.length === 0) {
                    $scope.edit = false;
                    $scope.canSwipe = true;
                }
            };

            $scope.deleteActLists = function () {
                if ($scope.actLists.length === 0) {
                    toast.show('暂无消息');
                    return;
                }
                var newArr = [];
                var nativeArr = [];
                for (var i in $scope.actLists) {
                    if ($scope.actLists[i].checked) {
                        nativeArr.push($scope.actLists[i].id);
                    } else {
                        newArr.push($scope.actLists[i]);
                    }
                }

                if (nativeArr.length === 0) {
                    return;
                }
                cordovaPlug.CommonPL(function () {
                    toast.show('删除成功');
                }, 'deleteMessageByBatch', ['1', nativeArr.join(',')]);
                $scope.actLists = newArr;
                if (newArr.length === 0) {
                    $scope.edit = false;
                    $scope.canSwipe = true;
                }
            };

            $scope.singleDel = function (idx, arr, ID, type) { //idx为数组下标， arr是目标数组， ID是消息对象的id值
                arr.splice(idx, 1);
                cordovaPlug.CommonPL(function () {
                    toast.show('删除成功');
                }, 'deleteMessageByBatch', [type, ID.toString()]);
            };

            $scope.setMessageHasRead = function (list) {

                list.status = 1;
                Common.setCache('msg_sys', list);
                cordovaPlug.CommonPL(function () {

                }, 'setMessageHasRead', [list.systemType, list.id]);

                if (list.systemType === 'system') {
                    $state.go('tab.msg_system');
                } else if (list.systemType === 'monthly_bills') {
                    $state.go('tab.tab_mine',{time:new Date().getTime()});
                } else if (list.orderType == 7 && list.tranType == 2100) {
                    $state.go('tab.msg_sys')  // 暂时先用之前的消息模板，现在这位置先判断一下调转，等后面要统一模板再说。
                } else if ((list.orderType == 7 && list.tranType == 1000) || (list.orderType == 7 && list.tranType == 1100)) {
                    $state.go('tab.msg_group_pay', {orderNo: list.orderNo})
                } else {
                    $state.go('tab.msg_sys');
                }
            };
        });

    })
    .filter('msgBtnFilter1', function () {
        return function (input, list) { // 要过滤的对象
            if (list.systemType === 'payment_app') {
                if (list.tranType == 1000 || list.tranType == 1100) {
                    if (list.commentStauts == 0 || list.commentStauts == 1) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        };
    })
    .filter('msgBtnFilter2', function () {
        return function (input, list) { // 要过滤的对象
            if (list.systemType === 'payment_app') {
                if (list.tranType == 1000 || list.tranType == 1100) {
                    if (list.commentStauts == 0 || list.commentStauts == 1) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                return true;
            }
        };
    })
    .filter('msgDateFilter', function () {
        return function (input, list) { // 要过滤的对象
            if (list.systemType === 'payment_app') {
                return list.tranTime
            } else if (list.systemType === 'system') {
                return list.time;
            } else if (list.systemType === 'monthly_bills') {
                return list.sendTime;
            } else {
                return '';
            }
        };
    })
;

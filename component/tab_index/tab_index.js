var tab_index_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.index', {
            url: '/index',
            views: {
                'tab-index': {
                    templateUrl: 'component/tab_index/tab_index.html',
                    controller: 'IndexCtrl'
                }
            }
        });
};
myapp.config(tab_index_myConfig);
angular.module('starter.tab_index', [])
    .controller('IndexCtrl', function ($rootScope, $state, $scope, $ionicHistory, $ionicSlideBoxDelegate, $http, Common, $ionicScrollDelegate, $timeout, toast, cordovaPlug, actionSheetItem, bindCardService, $ionicModal, $sce) {
        $rootScope.myCity1 = '未定位';
        $timeout(function () {
            //定位
            Common.checkLocation(function (data) {
                $rootScope.myCity1 = data.city;
                $rootScope.setBanner(data.cityId);
                $scope.$apply();
            });
        }, 2000);
        //调用扫一扫
        $scope.gotoscan = function () {
            if (!$scope.isLogin) {
                $state.go("tab.tab_login", {'nextStep': 1});
            } else if (Common.getCache('information').authStatus == 0) {
                $state.go("tab.my_certification", {"nextStep": 1});
            } else {
                Common.checkscan();
            }
        };
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.balanceNum = Common.getCache("balanceNum");
            $scope.isLogin = Common.getCache('Token') != null;
            if($rootScope.myCity1 == '未定位'){
                Common.checkLocation(function (data) {
                    $rootScope.myCity1 = data.city;
                    $rootScope.setBanner(data.cityId);
                    $scope.$apply();
                });
            }
            //查看消息
            $scope.linkMsg = function () {
                if(!Common.isLogin()) return;
                $state.go("tab.index_msg");
            };
            //调用城市选择
            $scope.showCityList = function () {
                cordovaPlug.CommonPL(function (data) {
                    if (data.status == 1) {
                        $rootScope.myCity1 = data.data.cityName;
                        $rootScope.chooseCity = data.data.cityName;
                        $rootScope.setBanner(data.data.cityId);
                        $scope.address = data.data.cityName;
                        $scope.inputAdd = data.data.cityName;
                        $scope.mycityId = data.data.cityId;
                        $timeout(function () {
                            $ionicSlideBoxDelegate.$getByHandle('my-handle').update();
                            $ionicSlideBoxDelegate.$getByHandle('my-handle').slide(0)
                        }, 2000);
                    } else toast.show("插件调用失败！");
                }, "cityList", []);
            };
            $scope.$on("addressList", function (e, data) {
                if (data.length > 0) {
                    $rootScope.myCity = {
                        "cityId": $scope.mycityId,
                        "city": data[0].title,
                        "address": data[0].address,
                        "latitude": data[0].point ? data[0].point.lat : data[0].latitude,
                        "longitude": data[0].point ? data[0].point.lng : data[0].longitude,
                        "streetName": data[0].title ? data[0].title : data[0].streetName
                    }
                }
            });
            //获取乐豆余额
            $scope.getBeanBalance = function () {
                if (!$scope.isLogin) {
                    $state.go('tab.tab_login');
                    return;
                }
                Common.get('lifeAPI/payment/user/happycoin/', {}, function (data) {
                    $scope.showBalance = true;
                    $scope.balanceNum = data.data.amount;
                    Common.setCache("balanceNum", data.data.amount);
                }, {});
                Common.setCache("hasClickBalance", $scope.showBalance);
            };
            //左滑
            $scope.onSwipeLeft = function () {
                if($scope.showBalance){
                    $scope.showBalance = false;
                }else{
                    $scope.getBeanBalance();
                }
            };
            //右滑
            $scope.onSwipeRight = function () {
                $scope.onSwipeLeft();
            };
            $scope.viewBeanEvent = "左右滑动";
            //android系统4.4版本以下，点击查看乐豆余额
            if (ionic.Platform.isAndroid() && Common.getCache("getDeviceIdAndClientId").deviceVersion <= "4.4") {
                $scope.viewBeanEvent = "点击";
                $scope.switchShowBalance = function () {
                    $scope.onSwipeLeft();
                };
            }

            //点击banner广告
            $scope.gotoDetail = function (_item) {
                cordovaPlug.CommonPL(function (data) {
                    if (typeof data != "object") data = JSON.parse(data);
                    if (data.status == 1) {
                        if (data.data.isConnected == "true" || data.data.isConnected == true) {
                            if (_item.adUrl) {
                                var myIndexNum = _item.adUrl.indexOf('merchant');
                                if (myIndexNum != -1) {
                                    $state.go("tab.tab_store", {
                                        id: _item.adUrl.substr(myIndexNum + 9)
                                    })
                                } else if(_item.adUrl.indexOf('http') != -1) {
                                    var myClientId = Common.getCache('getDeviceIdAndClientId').ClientId;
                                    $scope.myUrl = $sce.trustAsResourceUrl(_item.adUrl);
                                    $scope.openModal();
                                }else{
                                    $state.go(_item.adUrl)
                                }
                            }
                        } else {
                            Common.showAlert('温馨提示', "网络连接错误，请检查网络连接");
                        }
                    } else {
                        toast.show("插件调用失败！");
                    }
                }, "isNetworkConnected", [])
            };

            $ionicModal.fromTemplateUrl('my-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.openModal = function () {
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
            //获取分类配置表
            $scope.subUrl = Common.config_url;
            if (!Common.getCache('indexType')) {
                $http.get(Common.config_url + 'index_type.json', {}).then(function successCallback(data) {
                    $scope.indexSubArr = data.data;
                    Common.setCache('indexType', data.data, 86400000);
                    $ionicSlideBoxDelegate.$getByHandle('subType').update();
                    if ($scope.indexSubArr.length > 1) $scope.showPager = true;
                }, function errorCallback(response) {
                });
            } else {
                $scope.indexSubArr = Common.getCache('indexType');
                $ionicSlideBoxDelegate.$getByHandle('subType').update();
            }
            //先定位，在进入乐抢单
            $scope.gotoShop = function () {
                if (Common.isDebug) {
                    $state.go('tab.index_selectShop');
                    return;
                }
                Common.showLoading();
                Common.checkLocation(function (data) {
                    Common.hideLoading();
                    $state.go('tab.index_selectShop')
                });
            };
            //首页banner广告位
            $scope.bannerImg = [{adImg:'./img/index/group_buy.gif'}];
            $rootScope.setBanner = function (_cityId) {
                if (Common.getCache('bannerImg' + _cityId) == null) {
                    Common.get("lifeAPI/adDetail/" + _cityId + "/0", {}, function (data) {
                        if (data.data != null && data.data.length != 0) {
                            $scope.bannerImg = data.data;
                        }
                        Common.setCache("bannerImg" + _cityId, $scope.bannerImg, 86400000);
                        $ionicSlideBoxDelegate.$getByHandle('my-handle').update();
                        $ionicSlideBoxDelegate.$getByHandle('my-handle').slide(0);
                    }, function () {
                    })
                } else {
                    $scope.bannerImg = Common.getCache('bannerImg' + _cityId);
                    $ionicSlideBoxDelegate.$getByHandle('my-handle').update();
                    $ionicSlideBoxDelegate.$getByHandle('my-handle').slide(0);
                }
            };
            $rootScope.setBanner(1)
            //缓存银行卡信息
            if (!Common.getCache('banklistColor')) {
                $http.get('data/bank.json', {}).then(function successCallback(data) {
                    Common.setCache('banklistColor', data);
                }, function errorCallback(response) {
                });
            }
            if (Common.getCache("hasClickBalance") == null) $scope.showBalance = false;
            else $scope.showBalance = Common.getCache("hasClickBalance");

            $scope.nativeBroadcastMsg = {
                unRead: 0
            };
            window.broadcastMsgNum = function (obj) { //obj参数为APP返回的字符串，{"num":1,"type":0||1},num为未读消息条数，type是消息类型
                if (typeof(obj) == "object") {
                    $scope.nativeBroadcastMsg = obj.data;
                } else {
                    $scope.nativeBroadcastMsg = angular.fromJson(obj).data;
                }
                $scope.getSystemMsg();
                $scope.$apply();
            };

            $timeout(function () {
                cordovaPlug.CommonPL(function (data) {
                    $scope.nativeBroadcastMsg.unRead = data.data.count;
                    $scope.$apply();
                }, 'getUnreadMessageCount', []);
            }, 1000);

            //首页提示跳转获取群号
            $scope.getGroupOrder = function () {
                Common.post('lifeAPI/turnTable/getOrderByUserId', {}, function (data) {
                    if (data.data == null) {
                        $scope.completedShow = false;
                        return;
                    }
                    if (data.data.groupId != null && data.data.groupId != '' && Common.getCache(data.data.groupId)) {
                        $scope.completedShow = true;
                        $scope.gotoPolling = function () {
                            if (Common.getCache(data.data.groupId) == null) return;
                            Common.get('lifeAPI/groupManagement/queryGroupMember', {
                                groupId: data.data.groupId
                            }, function (_data) {
                                if (_data.data.status == "INIT") {
                                    $state.go('tab.group_pay_start', {
                                        groupId: data.data.groupId
                                    })
                                } else if (_data.data.status == "DISMISS") {
                                    Common.showAlert('乐抢单提醒', '乐抢单已经解散，点击确定返回首页', function () {
                                    })
                                } else if (_data.data.status == "BUILD_COMPLETE" || _data.data.status == "MAINGROUPER_PAYING") {
                                    $state.go('tab.group_pay_active', {
                                        type: data.data.groupId,
                                        hash: new Date().getTime(),
                                        goBackNum: '-1'
                                    })
                                }
                            }, function () {
                            })
                        }
                    } else {
                        $scope.completedShow = false;
                    }
                }, {});
            };
            $scope.closeCompletedShow = function () {
                $scope.completedShow = false;
            };

            //消息列表
            $scope.msgLists = Common.getCache("indexMsgList") || [];
            //系统消息
            $scope.systemMsgList = [];
            //从App取系统消息
            $scope.getSystemMsg = function () {
                cordovaPlug.CommonPL(function (data) {
                    for (var j = 0; j < data.data.list.length; j++) {
                        //格式化系统消息
                        $scope.systemMsgList.push({
                            "updateTime": data.data.list[j].time,
                            "messageType": "02",
                            "msgTempleateUrl": './component/tab_index/msg02.html',
                            "systemType": data.data.list[j].systemType,
                            "title": data.data.list[j].title,
                            "content": data.data.list[j].content
                        });
                    }
                    if ($scope.systemMsgList.length > 0) {
                        $scope.msgLists = $scope.systemMsgList;
                    } else {
                        if (!$scope.isLogin) {
                            $scope.msgLists = [];
                        }
                    }
                    $scope.getPayAndBillMsg();
                    $scope.$apply();
                }, "getMessageList", ['system', 1, 10]);
            };
            $timeout(function () {
                $scope.getSystemMsg();
                $scope.getGroupOrder();
            }, 1000);
            //获取(支付、账单)消息列表
            //messageTypeList (Array[string], optional): 不接受消息分类列表(过滤条件) messageType (string, optional): 消息分类 00:支付,01账单,02:系统公告
            $scope.getPayAndBillMsg = function () {
                if (!$scope.isLogin) {
                    return;
                }
                var userId = Common.getCache("Token").userId;

                var messageTypeList = [];
                //不接收支付消息
                if (Common.getCache("payMsgStatus" + userId) === false) {
                    messageTypeList.push("00");
                }
                //不接收账单消息
                if (Common.getCache("billMsgStatus" + userId) === false) {
                    messageTypeList.push("01");
                }
                //查询消息
                Common.post("lifeAPI/msg/getMsg", {messageTypeList: messageTypeList}, function (data) {
                    if ($scope.systemMsgList.length === 0) {
                        $scope.msgLists = [];
                    }
                    for (var i = 0; i < data.data.length; i++) {
                        var item = {};
                        var messageObj = JSON.parse(data.data[i].message);
                        if (data.data[i].messageType === '00') {//支付消息
                            item = messageObj.systemBody.tranBody;
                            item.systemType = messageObj.systemType;
                            item.tranType = messageObj.systemBody.tranType;
                            item.tranTypeStr = $scope.getTranType(messageObj.systemBody.tranType);
                        }
                        if (data.data[i].messageType === '01') {//账单消息
                            item = messageObj;
                        }
                        for (var o in data.data[i]) {
                            if(data.data[i].hasOwnProperty(o)){
                                item[o] = data.data[i][o];
                            }
                        }
                        data.data[i] = item;
                        data.data[i].msgTempleateUrl = './component/tab_index/msg' + data.data[i].messageType + '.html';
                        $scope.msgLists.push(data.data[i]);
                    }
                    //按时间排序
                    $scope.msgLists.sort(function (a, b) {
                        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime();
                    });
                    Common.setCache("indexMsgList", $scope.msgLists);
                }, function () {
                });
            };

            var msgType = '';//pay支付消息，bill账单消息

            $scope.showDialog = false;
            $rootScope.hideTabsBg = false;
            $scope.showAtLocationPopup = function (type, index, $event) {
                $rootScope.hideTabsBg = true;
                $scope.showDialog = true;
                msgType = type;
                $scope.curIndex = index;
                $scope.popupTop = {
                    "top": $event.clientY + "px"
                };
                $event.stopPropagation();
            };

            $scope.closeDialog = function () {
                $scope.showDialog = false;
                $rootScope.hideTabsBg = false;
            };

            //忽略此动态
            $scope.ignoreMsg = function () {
                $scope.showDialog = false;
                $rootScope.hideTabsBg = false;
                $scope.removeItem();
            };
            //不再接受此类消息
            $scope.neverMsg = function () {
                Common.showConfirm("", "<div><p>重新开启可以在“我的-设置-消息</p><p>通知提醒”中恢复该内容的推送</p></div>", function () {
                    $state.go("tab.my_message");
                }, function () {
                    $scope.showDialog = false;
                    $rootScope.hideTabsBg = false;
                    var userId = Common.getCache("Token").userId;
                    if (msgType === 'pay') {
                        Common.setCache("payMsgStatus" + userId, false);
                    } else if (msgType === 'bill') {
                        Common.setCache("billMsgStatus" + userId, false);
                    }
                    $scope.getPayAndBillMsg();
                }, "去设置", "我知道了");
            };
            //从列表移除一项
            $scope.removeItem = function () {
                var _id = $scope.msgLists[$scope.curIndex].id;
                Common.post("lifeAPI/msg/delete", {id: _id}, function (data) {
                    //已忽略此消息
                    $scope.msgLists.splice($scope.curIndex, 1);
                }, function () {
                });
            };
        });
        //读消息
        $scope.setMessageHasRead = function (type, item) {
            Common.setCache('msg_sys', item);
            switch (type) {
                case 'pay':
                    if (item.orderType == 7) {//乐抢单
                        if (item.tranTypeStr === '退款') {
                            $state.go('tab.msg_sys');
                        } else {//消费
                            $state.go('tab.msg_group_pay', {orderNo: item.orderNo});
                        }
                    } else {
                        $state.go('tab.msg_sys');
                    }
                    break;
                case 'bill':
                    $state.go('tab.tab_mine', {time: new Date().getTime()});
                    break;
                case 'system':
                    $state.go('tab.msg_system');
                    break;
            }
        };
        //日期和星期转为英文
        var dt = new Date();
        var m = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        var w = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
        var mn = dt.getMonth();
        var wn = dt.getDay();
        $scope.month = m[mn];
        $scope.day = dt.getDate();
        $scope.week = w[wn - 1];

        $scope.getTranType = function (type) {
            switch (type) {
                case '1000':
                    return '消费';
                case '1001':
                    return '退款';
                case '1100':
                    return '消费';
                case '1101':
                    return '退款';
                case '2000':
                    return '退款';
                case '2001':
                    return '退款';
                case '2100':
                    return '退款';
                case '2101':
                    return '退款';
                case '3000':
                    return '退款';
                case '3100':
                    return '退款';
                case '3200':
                    return '退款';
                case '3300':
                    return '退款';
                case '4100':
                    return '退款';
                default:
                    return '消费';
            }
        }
    });
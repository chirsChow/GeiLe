var payment_exceptional_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.payment_exceptional', {
            url: '/payment_exceptional?{:merchantNo,:paymentNo,:money,:backRate}',
            hideTabs: true,
            views: {
                'tab-index': {
                    templateUrl: 'component/payment_exceptional/payment_exceptional.html',
                    controller: 'payment_exceptionalCtrl'
                }
            }
        });
};
myapp.config(payment_exceptional_myConfig);

angular.module('starter.payment_exceptional', [])

.controller('payment_exceptionalCtrl', function($scope, $timeout,toast, $state, $stateParams, $ionicModal, $ionicHistory, $ionicScrollDelegate, $window, Common, cordovaPlug) {
    $scope.myArr = [{}, {}, {}, {}, {}];
    $scope.myScore = 5; //评分
    $scope.money; //打赏金额
    $scope.obj = {
        otherMoney: '',
        operatorNo: ''
    };
    var merchantNo = $stateParams.merchantNo;
    var paymentNo = $scope.paymentNo = $stateParams.paymentNo;
    $scope.payMoney = $stateParams.money; //支付金额
    $scope.backRateArr = []; // 赠送乐豆的数据
    $scope.backRate = 0;
    for (var i = 0; i < 3; i++) {
        $scope.backRateArr[i] = (($stateParams.backRate * (i + 1) * 10) | 0) /100;
    }
    // if ($scope.payMoney < 10) {
    //     $scope.money = -1;
    //     $scope.showMoneyBoo = true;
    // }
    if (ionic.Platform.isAndroid()) {
        $scope.obj.inputType = "tel";
    } else if (ionic.Platform.isIOS()) {
        $scope.obj.inputType = "number";
    } else {
        $scope.obj.inputType = "text";
    }
    //设置评分
    $scope.setScore = function(_num) {
        $scope.myScore = _num + 1;
        if($scope.myScore > 5) $scope.myScore = 5;
        $scope.backRate = $scope.myScore == 3 && $scope.backRateArr[0] !='0.00' && $scope.backRateArr[0] || $scope.myScore == 4 && $scope.backRateArr[1] !='0.00' && $scope.backRateArr[1] || $scope.myScore == 5 && $scope.backRateArr[2] !='0.00' && $scope.backRateArr[2] || 0;
        //if($scope.backRate > 0) $scope.money = 0;
        $scope.backRateChage = $scope.myScore == 3 && '0' || $scope.myScore == 4 && '1' || $scope.myScore == 5 && '2' || "-1";
    };
    $scope.setScore($scope.myScore);
    //选择打赏金额
    $scope.moneyClick = function(_num) {
        if (_num > $scope.payMoney) {
            Common.showAlert('温馨提示', "客官，您打赏的金额已大于支付金额，请重新输入");
            return;
        }
        //if($scope.backRate > 0) return;
        $scope.money = $scope.money == _num ? 0 : _num;
        if ($scope.money == -1) $scope.showMoneyBoo = true;
        else $scope.showMoneyBoo = false;
        //清空输入打赏金额
        $scope.obj.otherMoney = '';
    };
    var myOldSelectedMoney = $scope.money; //缓存选择的打赏金额
    $scope.$watch('obj.otherMoney', function(newVal, oldVal) {
        var reg = /^\d+(\.\d{0,2})?$/;
        if (!reg.test(newVal)) $scope.obj.otherMoney = $scope.obj.otherMoney.substr(0, $scope.obj.otherMoney.length - 1);
        $scope.money = 0; //置灰选择打赏金额按钮
        if (!newVal || newVal == '') {
            $scope.money = myOldSelectedMoney;
        } else {
            if (parseFloat(newVal) > $scope.payMoney) {
                Common.showAlert('温馨提示', "客官，您打赏的金额已大于支付金额，请重新输入", function() {
                    $scope.obj.otherMoney = '';
                    var element = $window.document.getElementById("inputMoney");
                    if (element) element.focus();
                });
            }
        }
    });
    $scope.changeBoo = function(){
        $scope.scanClickBoo = false;
    }
    //输入工号模糊检索
    $scope.$watch('obj.operatorNo', function(newVal, oldVal) {
        if($scope.scanClickBoo) return;
        if (newVal != '') {
            $scope.search();
            $scope.showList = true;
        } else {
            $scope.staff = {
                selectedoperatorId: null,
                selected: null
            };
            $scope.merchantImg = null;
            $scope.showList = false;
        }
    });

    //选中的员工数据
    $scope.staff = {
        selectedoperatorId: null,
        selected: null
    };
    //确认选择员工
    $scope.sure = function(item) {
        $scope.staff.selected = item;
        $scope.staff.selectedoperatorId = item.operatorId;
        $scope.merchantImg = item.photo;
        $scope.obj.operatorNo = item.operatorNo;
        $timeout(function(){
            $scope.showList = false;
        },30)
        
    };
    //按员工名称或编号查找
    $scope.search = function() {
        if (!$scope.obj.operatorNo || $scope.obj.operatorNo == '') {
            $scope.items = $scope.employees;
            return;
        }
        if ($scope.employees.length > 0) { //有员工才执行搜索
            $scope.searchArr = [];
            for (var i = 0; i < $scope.employees.length; i++) {
                if ($scope.employees[i].name && $scope.employees[i].name.indexOf($scope.obj.operatorNo) > -1 ||
                    $scope.employees[i].operatorNo && $scope.employees[i].operatorNo.indexOf($scope.obj.operatorNo) > -1) {
                    $scope.searchArr.push($scope.employees[i]);
                }
            }
            $scope.items = $scope.searchArr;
        }
        if($scope.items.length == 0){
            $scope.staff.selected = null;
            $scope.staff.selectedoperatorId = null;
            $scope.merchantImg = null;
            return;
        }
        $scope.staff.selected = $scope.items[0];
        $scope.staff.selectedoperatorId = $scope.items[0].operatorId;
        $scope.merchantImg = $scope.items[0].photo;
    };
    //打赏
    $scope.reward = function() {
        if (parseFloat($scope.obj.otherMoney)==0) {
            toast.show('您的打赏是对服务员最美的赞赏，请输入打赏金额');
            return;
        } else if ($scope.showMoneyBoo && ($scope.obj.otherMoney == "" || $scope.obj.otherMoney == undefined)) {
            toast.show('您的打赏是对服务员最美的赞赏，请输入打赏金额');
            return;
        }
        Common.showLoading();
        if (!$scope.staff.selected) {
            Common.showAlert('温馨提示', "请选择要打赏的员工!");
            return;
        }
        var tip = $scope.money || $scope.obj.otherMoney;
        tip = parseFloat(tip).toFixed(2);
        if (tip === 'NaN' || tip == -1) tip = '0';
        else if (parseInt(tip) > $scope.payMoney) {
            Common.showAlert('温馨提示', "客官，您打赏的金额已大于支付金额，请重新输入");
            return;
        }
        Common.put('lifeAPI/merchant/commentPersonal', {
            "paymentNo": paymentNo, //支付订单号
            "merchantNo": merchantNo, //商家编号
            "operatorId": $scope.staff.selected.operatorId, //用户ID
            "tip": tip,
            "grade": $scope.myScore,
            "beanTip" : $scope.backRate
        }, function(data) {
            if (tip === '0' && $scope.backRate == 0) { //评分，不打赏
                $state.go('tab.payment_reward_finish', {
                    "type": 1
                })
            }else if(tip === '0' && $scope.backRate != 0){
                //乐豆打赏
                $scope.gotoPayledou();
            } else { //去打赏确认页面
                Common.hideLoading();
                $state.go("tab.payment_comfirmReward", {
                    "merchantNo": merchantNo,
                    "paymentNo": paymentNo,
                    "staff": $scope.staff.selected,
                    "tip": tip,
                    "beanTip" : $scope.backRate
                });
            }
        }, function(msg) {

        })
    };
    //打赏乐豆
    $scope.gotoPayledou = function(){
        Common.post('lifeAPI/wxPay/beanTipPay', {      
                "payLdMoney": $scope.backRate, 
                "orderTitle": '乐豆打赏', 
                "rewardUserId": $scope.staff.selected.userId,
                "perOrderNo": paymentNo,
                "totalAmount":0
            }, function(data) {
                Common.hideLoading();
                $state.go('tab.payment_reward_finish', {
                    "type": 1
                })
            }, function(msg) {
                Common.hideLoading();
            },1)
        // Common.post('lifeAPI/payment/orderno', { merchantNo: merchantNo, scene: '0' }, function(data) {
            
        //     $scope.orderNo = data.data || '';
        //     //付费通乐豆打赏
        //     Common.post('lifeAPI/payment/beanTipPay', {      
        //         "orderNo": $scope.orderNo, 
        //         "beanTip": $scope.backRate, 
        //         "title": '乐豆打赏', 
        //         "description":'员工乐豆打赏',
        //         "toUserId": $scope.staff.selected.userId,
        //         "rewardOrderNo": paymentNo,
        //     }, function(data) {
        //         Common.hideLoading();
        //         $state.go('tab.payment_reward_finish', {
        //             "type": 1
        //         })
        //     }, function(msg) {
        //         Common.hideLoading();
        //     },1)

        // }, function() {
        // }, 1);
    }
    //打赏界面返回
    $scope.goBack = function() {
        $state.go('tab.index')
    };
    $scope.gotoScan = function() {
        //var scanDate = 'http://testlife.365gl.com/register/index.html?recommendAgentId=1000001000464&userId=dc5dbdf74bb7425f95088a976e9a1cb9&recommendShopManager=a9dabd0e9aac431ab3d5acb6ef3e1936&recommendAgentT=5';
        cordovaPlug.CommonPL(function(data) {
            $scope.scanClickBoo = true;
            if (data.status == 1) {
                Common.setCache('scanDate',data.data.url);
                var scanDateArr = data.data.url.match(/userId=\w+/g);
                if (scanDateArr == null) return;
                for (var i = 0; i < $scope.employees.length; i++) {
                    if ($scope.employees[i].userId == scanDateArr[0].substr(7)) {
                        $scope.sure($scope.employees[i]);
                    }
                }
            } else {
                toast.show("插件调用失败！");
            }
        }, "scan", ["0"])
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        //查询商家员工列表
        $scope.employees = [];
        function getList() {
            Common.get('lifeAPI/merchant/employees', {
                merchantNo: merchantNo
            }, function(data) {
                var list = data.data ? data.data : [];
                $scope.employees = $scope.employees.concat(list);
                $scope.items = $scope.employees;
                if(Common.getCache('scanDate')){
                    var scanDate = Common.getCache('scanDate').match(/userId=\w+/g);
                    if (scanDate == null) return;
                    for (var i = 0; i < $scope.employees.length; i++) {
                        if ($scope.employees[i].userId == scanDate[0].substr(7)) {
                            $scope.sure($scope.employees[i]);
                            $scope.$apply();
                        }
                    }
                }
            }, function(msg) {
                console.log(msg);
            })
        }
        getList();
    });
});
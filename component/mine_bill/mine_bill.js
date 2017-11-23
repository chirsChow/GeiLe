var mine_bill_myConfig = function ($stateProvider) {
    $stateProvider
        .state('tab.mine_bill', {
            url: '/mine_bill',
            hideTab: true,
            views: {
                'tab-mine': {
                    templateUrl: 'component/mine_bill/mine_bill.html',
                    controller: 'mine_billCtrl'
                }
            }
        });
};
myapp.config(mine_bill_myConfig);

angular.module('starter.mine_bill', [])
    .controller('mine_billCtrl', function ($scope, toast, $ionicSlideBoxDelegate, Common, $state, $http, $timeout, $ionicScrollDelegate, $ionicHistory) {

        $scope.goBack = function () {
            $state.go('tab.tab_mine');
        };

        $scope.linkDetails = function (cache) {
            Common.setCache('billDetails', cache);
            if (cache.operationName === '乐抢单') {
                $state.go('tab.mine_bill_groupPay_detail', {orderNo: cache.orderNo});
            } else {
                $state.go('tab.mine_bill_details');
            }
        };

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


        $scope.$on('$ionicView.beforeEnter', function () {
            $ionicScrollDelegate.scrollTop();
            //禁止手动滑动slideBox，并初始化最开始slide位置为最后;
            console.log($ionicSlideBoxDelegate.$getByHandle('bill-handle'))
            $ionicSlideBoxDelegate.$getByHandle('bill-handle').enableSlide(false);
            $scope.slideIndex = 5;

            //获取本地时间
            $scope.year = new Date().getFullYear();
            $scope.month = new Date().getMonth() + 1 > 9 ? (new Date().getMonth() + 1) : ("0" + (new Date().getMonth() + 1));

            //初始化list 
            $scope.lists = [null, null, null, null, null, null];
            $scope.noMoreMonth = [false, false, false, false, false, false];
            $scope.monthIndex = 0;

            var monthPage = [1, 1, 1, 1, 1, 1];
            //点击查询上个月
            $scope.preMonth = function (index) {
                angular.element(document.querySelectorAll('.bill-box')).addClass('transition_0')
                $ionicScrollDelegate.scrollTop();

                if (index === 0) {
                    toast.show('只能查最近6个月的账单');
                    return;
                }

                if ($scope.lists[index - 1]) {
                    $scope.month = parseInt($scope.month);
                    if ($scope.month === 1) {
                        $scope.month = 12;
                        $scope.year--;
                    } else {
                        $scope.month = $scope.month > 10 ? $scope.month - 1 : ('0' + ($scope.month - 1));
                    }


                    $scope.slideIndex = index - 1;

                    $ionicSlideBoxDelegate.slide(index - 1);

                    return;
                }

                $scope.month = parseInt($scope.month);

                if ($scope.month === 1) {
                    $scope.month = 12;
                    $scope.year--;
                } else {
                    $scope.month = $scope.month > 10 ? $scope.month - 1 : ('0' + ($scope.month - 1));
                }


                $scope.slideIndex = index - 1;

                $ionicSlideBoxDelegate.slide(index - 1);

                $scope.monthIndex++;

                getBillInfo($scope.monthIndex, index - 1);

            };

            //点击下月

            $scope.nextMonth = function (index) {
                angular.element(document.querySelectorAll('.bill-box')).addClass('transition_0')
                if (index === 5) {
                    toast.show('只能查最近6个月的账单');
                    return;
                }
                $scope.month = parseInt($scope.month);

                if ($scope.month === 12) {
                    $scope.month = '01';
                    $scope.year++;
                } else {
                    $scope.month = $scope.month > 10 ? $scope.month + 1 : ('0' + ($scope.month + 1));
                }
                $scope.slideIndex = index + 1;

                $scope.monthIndex--;
            };


            //统一获取账单方法
            function getBillInfo(monthIndex, index) {
                Common.get('/lifeAPI/payment/bill', {
                    month: monthIndex,
                    curPage: monthPage[index],
                    pageSize: 10
                }, function (res) {

                    res.data.list = res.data.list || [];
                    // res.data.list[0].operationName = '乐抢单';
                    if (!$scope.lists[index]) {
                        $scope.lists[index] = res.data;

                        var activeList = res.data.list;
                        $scope.lists[index].list = [];

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
                });
            }

            //进页面初始化首月账单
            getBillInfo($scope.monthIndex, 5);

            $scope.loadMoreBills = function (index) {
                getBillInfo($scope.monthIndex, index);
            };
        });
    });

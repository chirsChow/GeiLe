var group_sponsor_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.group_sponsor', {
        url: '/group_sponsor',
        views: {
            'tab-mine': {
                templateUrl: 'component/group_sponsor/group_sponsor.html',
                controller: 'group_sponsorCtrl'
            }
        }
    });
};
myapp.config(group_sponsor_myConfig);

angular.module('starter.group_sponsor',[])
.controller('group_sponsorCtrl', function($scope,Common,$timeout,$state) {
    //初始化数据
        $scope.isHasMore = false;
        $scope.pageNo = 1; //当前页数
        $scope.pageNo1 = 1; //当前页数
        $scope.pageSize = 20;//条数
        $scope.numPageList = [];
        $scope.numPageitem = [];


        //初始化tab
        $scope.initiator = function (num) {
            //当按钮等于时
            $scope.whiteColor = num;
            $scope.pageNo = 1; //当前页数
            $scope.pageNo1 = 1; //当前页数
            if ($scope.whiteColor === 2) {
                $scope.numPageitem = [];
                $scope.loadMax();
            }else{
                $scope.numPageList = [];
                $scope.loadMore();
            } 
        }
        
        // $scope.initiator(2);

        $scope.groupActive = true;
        //发起者下拉刷新
        $scope.loadMore = function () {
            $scope.ishasMore = false;
            Common.get("/lifeAPI/turnTable/getTurnTableData", {
                isSource: $scope.groupActive,
                pageNo: $scope.pageNo,
                pageSize: $scope.pageSize
            }, function (data) {
                //console.log(data);
                if(data.data.list == null) return;
                $scope.numPageList = $scope.numPageList.concat(data.data.list);
                if ($scope.pageNo < data.data.totalPage){
                    $timeout(function(){
                        $scope.ishasMore = true;
                    },500)
                }
                else $scope.ishasMore = false;
                $scope.$broadcast("scroll.infiniteScrollComplete");
                $scope.pageNo++;
            })
        };

        // 参与者下拉刷新
        $scope.loadMax = function () {
            $scope.hasMore = false;
            Common.get("/lifeAPI/turnTable/getTurnTableData", {
                isSource: !$scope.groupActive,
                pageNo: $scope.pageNo1,
                pageSize: $scope.pageSize
            }, function (data) {
               if(data.data.list == null) return;
                $scope.numPageitem = $scope.numPageitem.concat(data.data.list);
                if ($scope.pageNo1 < data.data.totalPage){
                    $timeout(function(){
                        $scope.hasMore = true;
                    },500)
                } 
                else $scope.hasMore = false;
                $scope.$broadcast("scroll.infiniteScrollComplete");
                $scope.pageNo1++;
            })
        };
        //执行一，所以每次进来都是第一个
        $scope.initiator(1);
        $scope.gotoPay = function(item){
            console.log(Common.getCache(item.groupId))
            
            if(item.orderStatus == 0){
                if(Common.getCache(item.groupId) == null) return;
                Common.get('lifeAPI/groupManagement/queryGroupMember', {
                    groupId: item.groupId
                }, function(_data) {
                    if (_data.data.status == "INIT") {
                        $state.go('tab.group_pay_start',{groupId:item.groupId})
                    }else if(_data.data.status == "DISMISS"){
                        Common.showAlert('乐抢单提醒','乐抢单已经解散，点击确定返回首页',function(){
                        })
                    } else if (_data.data.status == "BUILD_COMPLETE" || _data.data.status == "MAINGROUPER_PAYING"){
                            $state.go('tab.group_pay_active', {
                                type: item.groupId,
                                hash: new Date().getTime()
                            })
                    }
                }, function() {})
            }else if(item.orderStatus == 1){
                if($scope.whiteColor == 1 || item.mainOrderStatus == 1){
                    $state.go('tab.group_pay_detail',{
                        groupId : item.groupId,
                        orderNo : item.orderSn,
                        personalPay : item.totalAmount
                    })
                }else if(item.mainOrderStatus == 0 || item.mainOrderStatus == 2){
                    if(Common.getCache(item.groupId) == null) return;
                    $state.go('tab.group_pay_active', {
                        type: item.groupId,
                        hash: new Date().getTime(),
                        goBackNum : '-1'
                    })
                }
                
            }
        }
        $scope.$on('$ionicView.beforeEnter', function ($scope) {
            $scope.isHasMore = false;
            $scope.HasMore = false;
            $scope.pageNo = 1; //当前页数
            $scope.pageNo1 = 1; //当前页数
        });
});

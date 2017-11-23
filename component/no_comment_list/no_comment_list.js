var no_comment_list_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.no_comment_list', {
        url: '/no_comment_list/:merchantNo?{:payTime}',
        hideTab:true,
        views: {
            'tab-merchants': {
                templateUrl: 'component/no_comment_list/no_comment_list.html',
                controller: 'no_comment_listCtrl'
            }
        }
    });
};
myapp.config(no_comment_list_myConfig);

angular.module('starter.no_comment_list',[])
.controller('no_comment_listCtrl', function($scope,$stateParams,Common,$ionicHistory) {
    $scope.merchantNo = $stateParams.merchantNo,
    $scope.industry = $stateParams.industry,
    $scope.payTime = $stateParams.payTime, //用于勾选当前评价订单订单
        index=1
    $scope.isHasMore=false
    var doRefreshing = false

    $scope.doRefresh=function () {
        if(doRefreshing) return
        doRefreshing=true
        $scope.chooseItems = []
        $scope.isHasMore=true;
        index=1
        getDate(index,function () {
            $scope.$broadcast('scroll.refreshComplete');
        })
    }
    $scope.loadMore=function () {
        index++
        getDate(index,function () {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
    }
    $scope.createComment=function (item,index) {
        $scope.$emit('setCreateCommentItem',$scope.chooseItems[index])
        history.go(-1);
    }
    function getDate(index,bak) {
        Common.post('lifeAPI/merchant/comment/bills',{
            "curPage": index,
            "merchantNo":+$scope.merchantNo ,
            "pageSize": 15
        },function (data) {
            setTimeout(function () {
                doRefreshing = false
            },1000)
            var list = data.data.list ? data.data.list :[]
            $scope.chooseItems = $scope.chooseItems.concat(list)
            $scope.isHasMore=true
            if(list.length<15) $scope.isHasMore=false;
            if(bak) bak()
        },function (msg) {
            doRefreshing = false
            if(bak) bak()
            $scope.isHasMore=false;
        })
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.chooseItems = []
        $scope.merchantNo = $stateParams.merchantNo
        $scope.industry = $stateParams.industry
        getDate(1);
    });
});

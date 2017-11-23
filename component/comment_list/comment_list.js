var comment_list_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.comment_list', {
        url: '/comment_list/:id',
        hideTab:true,
        views: {
            'tab-mine': {
                templateUrl: 'component/comment_list/comment_list.html',
                controller: 'comment_listCtrl'
            }
        }
    });
};
myapp.config(comment_list_myConfig);

angular.module('starter.comment_list',[])
.controller('comment_listCtrl', function($scope,Common,$stateParams,commonConfigsJson,$timeout,$rootScope,$state,$timeout) {

    $scope.commentsItems=[]
    $scope.totalCount=0
    $scope.commonConfigsJson = commonConfigsJson.commentList
    $scope.index=0
    $scope.isHasMore=false
    $scope.firstLoad = true;
    var doRefreshing = false
    $scope.doRefresh=function () {
        if(doRefreshing) return
        doRefreshing=true
        $scope.index=1
        getDate(1,function () {
            $scope.$broadcast('scroll.refreshComplete');
        })
    }
    $scope.loadMore=function () {
        $scope.index++
        getDate($scope.index,function () {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
    }
    function getDate(index,bak) {
        var data={pageSize:15,curPage:index}
        if($scope.storeId != 0){
            var url = 'lifeAPI/merchant/myComments'
            data.merchantNo=$stateParams.id
        }else {
            var url = 'lifeAPI/user/comments'
        }
        Common.post(url,data,function (data) {
            var list = data.data.list?data.data.list:[]
            $scope.totalCount = data.data.totalCount
            if(index==1){
                $scope.commentsItems = list;
                console.log($scope.commentsItems)
                // Common.showEffect(list,150,function(_data){
                //     $scope.commentsItems.push(_data);
                // },4)
            }
            else  $scope.commentsItems = $scope.commentsItems.concat(list)

            $timeout(function(){
                $scope.isHasMore=true
                $scope.firstLoad = false;
                if(list.length<15) $scope.isHasMore=false;
                if(bak) bak();
                doRefreshing = false
            },2000)
            
        },function (msg) {
            if(bak) bak()
            doRefreshing = false
            $scope.isHasMore=false;
        },1)
    }
    $scope.title='我的评论'
    $scope.goStoreInfo=function (merchantNo) {
        if($stateParams.id){
            return false;
        }
        // $rootScope.hideTabs = 'tabs-item-hide';
        $state.go('tab.tab_store',{id:merchantNo})
    }
    $scope.goBack = function () {
        if(!$stateParams.id){
            // $rootScope.hideTabs = false;
        }
        history.go(-1)
    }
    $scope.goNearby=function () {
        Common.setCache('store_nearby_no_cache',true)
        $state.go('tab.store_nearby')
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.storeId = $stateParams.id
        if($scope.storeId){
            $scope.title='评论列表'
        }
        $scope.index=0
        $scope.loadMore()
    });
});

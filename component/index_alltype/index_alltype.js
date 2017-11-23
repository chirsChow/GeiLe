var index_alltype_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.index_alltype', {
        url: '/index_alltype',
        views: {
            'tab-index': {
                templateUrl: 'component/index_alltype/index_alltype.html',
                controller: 'index_alltypeCtrl'
            }
        }
    });
};
myapp.config(index_alltype_myConfig);

angular.module('starter.index_alltype',[])
.controller('index_alltypeCtrl', function($scope,$http,Common,$state) {
    //获取分类配置表
    $scope.subUrl = Common.config_url;
    $scope.changeShow = function(_num){
        if($scope.classificationlist[_num].show ==undefined || $scope.classificationlist[_num].show ==false){
            $scope.classificationlist[_num].show = true;
        }else{
            $scope.classificationlist[_num].show = false;
        }
    }
    $scope.gotoStore = function(_tag,_sub){
        
        $state.go("tab.store_list",{"tag":_tag,"sub":_sub});
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        if(!Common.getCache('classificationlist')){
            Common.get('lifeAPI/industry',{},function(data){
                 Common.setCache('classificationlist',data.data.sub,86400000);
                 $scope.classificationlist = data.data.sub;
            },{},1)
        }else{
            $scope.classificationlist = Common.getCache('classificationlist');
            console.log($scope.classificationlist)
        }
    });
});

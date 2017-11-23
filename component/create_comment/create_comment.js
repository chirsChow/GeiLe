var create_comment_myConfig = function($stateProvider){
    $stateProvider
    .state('tab.create_comment', {
        url: '/create_comment/:merchantNo/:industry/:hash',
        hideTab:true,
        views: {
            'tab-merchants': {
                templateUrl: 'component/create_comment/create_comment.html',
                controller: 'create_commentCtrl'
            }
        }
    });
};
myapp.config(create_comment_myConfig);

angular.module('starter.create_comment',[])
.controller('create_commentCtrl', function($scope,$state,$document,Common,$http,$stateParams,toast,$q,$rootScope,$document,$timeout) {
    $scope.merchantNo = $stateParams.merchantNo;
    $scope.industry = $stateParams.industry;

    $scope.moreOrders = function(orderTime){
        console.log('orderTime:'+orderTime)
        $state.go('tab.no_comment_list',{merchantNo:$scope.merchantNo,payTime : orderTime})
    }

    $rootScope.$on('setCreateCommentItem',function (e,paymentNoItem) {
        $scope.chooseItems.list[0] = paymentNoItem
        console.log('emit',paymentNoItem)
    })
    $scope.isChecked=false;
    function check() {
        if($scope.comment.score==0 || !$scope.comment.lists.zh) {
            $scope.isChecked=false;
        }else {
            $scope.isChecked=true;
        }
    }
    //选择评分
    $scope.selectItem=function (name,i,e) {
        if($scope.comment.lists[name] == i){
            $scope.comment.lists[name] = ''
            check()
            // setFen()
            return false;
        }
        $scope.comment.lists[name]=i
        check()
        // setFen()
    }
    function setFen() {
        if($scope.comment.lists["zh"]==104){
            $scope.comment.score = 2;
        }else if( $scope.comment.lists["zh"]==103){
            $scope.comment.score = 3;
        }else if( $scope.comment.lists["zh"]==102){
            $scope.comment.score = 4;
        }else if(   $scope.comment.lists["zh"]==101){
            $scope.comment.score = 5;
        }
    }
    //综合评分
    $scope.commentOption=function (i) {
        $scope.comment.score = i;
        if(i==1 || i==2){
            $scope.comment.lists["zh"]=104
        }else if(i==3){
            $scope.comment.lists["zh"]=103
        }else if(i==4) {
            $scope.comment.lists["zh"]=102
        }else if(i==5){
            $scope.comment.lists["zh"]=101
        }
        check()
    }
    $scope.createComment=function () {
        var data = {labels:[]}
        data.paymentNo=$scope.chooseItems.list[0].paymentNo
        data.merchantNo=$scope.merchantNo
        data.grade=$scope.comment.score
        for(var item in $scope.comment.lists){
            if($scope.comment.lists[item]){
                data.labels.push($scope.comment.lists[item])
            }
        }
        if(!$scope.isChecked) return;
        // if($scope.comment.score==0) {toast.show('请选择商铺星评！'); return false}
        // if(!$scope.comment.lists.zh) {toast.show('请选择综合评分！'); return false}
        Common.post('lifeAPI/merchant/comment',data,function (data) {
            toast.show('评论成功！')
            setTimeout(function () {
                history.go(-1);
            },1000)
        },function (msg) {
            console.log(msg)
        },true)

    }
    $scope.tpl = {all:[], price:[], vir:[], traffic:[], service:[]}
    $scope.merchantNo = $stateParams.merchantNo, //商铺ID
    $scope.industry = $stateParams.industry;
    var deferA = $q.defer();
    var deferB = $q.defer();
    //获取评论选项
    Common.get('lifeAPI/comment/label/template/'+0,{},function (data) {
        if(data.result == 0){
            for(var i = 0,rst = data.data ;i<rst.length;i++){
                if(rst[i].category == 1){
                    $scope.tpl.all.push(rst[i])
                }else if(rst[i].category == 2){
                    $scope.tpl.price.push(rst[i])
                }else if(rst[i].category == 3){
                    $scope.tpl.vir.push(rst[i])
                }else if(rst[i].category == 4){
                    $scope.tpl.traffic.push(rst[i])
                }else if(rst[i].category == 5){
                    $scope.tpl.service.push(rst[i])
                }
            }
            deferA.resolve()
        }
    },function (msg) {
        Common.hideLoading()
    })
    //获取可评论列表
    Common.post('lifeAPI/merchant/comment/bills',{
        "curPage": 1,
        "merchantNo":+$scope.merchantNo ,
        "pageSize": 1
    },function (data) {
        $scope.chooseItems = data.data
        deferB.resolve()
    },function (msg) {
        Common.hideLoading()
    })
    Common.showLoading()
    var p=$q.all({
        dataA:deferA.promise,
        dataB:deferB.promise
    }).then(function(result){
        Common.hideLoading()
    })
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.isChecked=false;
        $scope.comment={score:0, items:[], lists:{}}
        setTimeout(function () {
            $document.find('.choose-box').find('span').removeClass('selected')
        },500)

    });
})

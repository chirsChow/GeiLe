var my_certification_myConfig = function($stateProvider) {
    $stateProvider
        .state('tab.my_certification', {
            url: '/my_certification?{:nextStep}',
            hideTab:true,
            views: {
                'tab-mine': {
                    templateUrl: 'component/my_certification/my_certification.html',
                    controller: 'my_certificationCtrl'
                }
            }
        });
};
myapp.config(my_certification_myConfig);

angular.module('starter.my_certification', [])
    .controller('my_certificationCtrl', function($scope, $stateParams, cordovaPlug, Common, toast, $state,bindCardService,$timeout) {
        $scope.data = {
            userName: '',
            idCard: ''
        };

        var isCardID = function(sId) {
            var regIdCard = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
            if (!regIdCard.test(sId)) return "请输入正确的身份证号";
            return true;
        }
        $scope.subimit = function() {
            if ($scope.data.userName.length < 1) toast.show("请输入姓名");
            else if ($scope.data.idCard.length < 1) toast.show("请输入身份证号");
            else if (isCardID($scope.data.idCard) != true) toast.show(isCardID($scope.data.idCard));
            else {
                Common.post('lifeAPI/user/password', {
                    "name": $scope.data.userName,
                    "idCard": $scope.data.idCard,
                    "sex":$scope.data.gender,
                    "birth":$scope.data.birth,
                    "address":$scope.data.address
                }, function(data) {
                    var myData = Common.getCache("information");
                    myData.realName = $scope.data.userName;
                    if(data.data != null) myData.authStatus = data.data.authStatus;
                    myData.idCard = $scope.data.idCard;
                    Common.setCache("information", myData);
                    Common.showAlert('温馨提醒','恭喜您，已经认证成功！',function(){
                        $state.go('tab.tab_mine');
                    });
                }, {},1);
            }
        }
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.gotoCard = function() {
                if($scope.clickDoubel) return;
                $scope.clickDoubel = true;
                $timeout(function(){
                     $scope.clickDoubel = false;
                },2000)
                console.log("调用摄像头")
                cordovaPlug.CommonPL(function(data) {
                    if (data.status == 1) {
                        $scope.data.userName = data.data.name;
                        $scope.data.idCard = data.data.code;
                        $scope.data.gender = data.data.gender;
                        $scope.data.birth = data.data.birth;
                        $scope.data.address = data.data.address;
                        $scope.$apply();
                    }
                }, "scanIdCard", [])
            }
            // $scope.gotoCard();
        });
    });
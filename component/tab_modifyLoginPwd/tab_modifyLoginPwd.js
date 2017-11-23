var tab_modifyLoginPwd_myConfig = function($stateProvider) {
  $stateProvider
    .state('tab.tab_modifyLoginPwd', {
      url: '/tab_modifyLoginPwd',
      views: {
        'tab-mine': {
          templateUrl: 'component/tab_modifyLoginPwd/tab_modifyLoginPwd.html',
          controller: 'tab_modifyLoginPwdCtrl'
        }
      }
    });
};
myapp.config(tab_modifyLoginPwd_myConfig);

angular.module('starter.tab_modifyLoginPwd', [])
  .controller('tab_modifyLoginPwdCtrl', function($scope, $ionicModal, $state, toast, Common) {
    $scope.inputData = {
      prevPwd: '',
      pwd: '',
      pwdConfirm: ''
    }

    $ionicModal.fromTemplateUrl('my-modal.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // $scope.openModal = function () {
    //   $scope.modal.show();
    // };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    //下一步
    $scope.next = function() {
      console.log('next')
      var reg = /[^/\\\s|\u4e00-\u9fa5]{8,16}$/;
      var pwd = $scope.inputData.prevPwd;
      if (pwd) {
        Common.checkMd5("GL_SALT_MD5_KEY" + $scope.inputData.prevPwd.toString(), function(data) {
          console.log('md5:'+data.MD5)
            Common.post('lifeAPI/user/updatePwd', {
              "password": data.MD5
            }, function() {
              console.log('成功回调')
              $scope.modal.show();
            }, {}, 1);
          })
          // if (reg.test(pwd)) {
          //   $scope.modal.show();
          // } else {
          //   $scope.tips1 = true;
          //   $scope.tipsContent1 = '密码格式不正确';
          // }
      } else {
        $scope.tips1 = true;
        $scope.tipsContent1 = '请输入原登录密码';
      }
    }

    //完成修改
    $scope.modifyComplete = function() {
      var p1 = $scope.inputData.pwd;
      var p2 = $scope.inputData.pwdConfirm;
      var reg = /^[^/|\\|\s|\u4e00-\u9fa5]{8,16}$/;
      var regAllNum = /^\d{8,16}$/;
      var regAllAlphabet = /^[a-zA-Z]{8,16}$/;
      var regAllSymbol = /^^[!@`~#\*^+-.%&<>()',;_"'=?\$\x22]{8,16}$/;
      if (p1 && p2) {
        if (p1 === p2) {
          if (reg.test(p1)) {
            if (!regAllNum.test(p2) && !regAllAlphabet.test(p2) && !regAllSymbol.test(p2)) {
              $scope.tips = false;
              Common.checkMd5("GL_SALT_MD5_KEY" + $scope.inputData.prevPwd.toString(), function(data) {
                Common.checkMd5("GL_SALT_MD5_KEY" + $scope.inputData.pwdConfirm.toString(), function(_data) {
                  Common.put('lifeAPI/user/password', {
                    "oldPassword": data.MD5,
                    "newPassword": _data.MD5
                  }, {}, {}, 1, function(data) {
                    $scope.tips1 = false;
                    $scope.tipsContent1 = '';
                    $scope.tips = false;
                    $scope.tipsContent = ''
                    if (data.result == "000000") {
                      Common.delete('lifeAPI/logout/', {}, function(data) {
                        console.log(data);
                        Common.clearCache('Token');
                        Common.clearCache('information');
                        Common.clearCache('balanceNum');
                        Common.clearCache('hasClickBalance');
                        //隐藏modal才能跳转
                        $scope.modal.hide();
                        toast.show('新密码修改成功')
                        $state.go("tab.tab_login");
                      }, {})
                    } else {
                      $scope.modal.hide();
                      toast.show(data.description);
                      $scope.inputData = {
                        prevPwd: '',
                        pwd: '',
                        pwdConfirm: ''
                      }
                    }
                  });
                })
              })
            } else {
              $scope.tips = true;
              $scope.tipsContent = "您的密码过于简单,不能为纯数字、纯字母、纯字符,请重新设置";
            }
          } else {
            $scope.tips = true;
            $scope.tipsContent = "密码格式不正确，请重新输入";
          }
        } else {
          $scope.tips = true;
          $scope.tipsContent = "两次密码输入不一致";
        }
      } else {
        $scope.tips = true;
        $scope.tipsContent = "请输入新密码";
      }
    }
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.inputData = {
        prevPwd: '',
        pwd: '',
        pwdConfirm: ''
      }
      $scope.tipsContent = '';
      $scope.tips = false;
      $scope.tipsContent1 = '';
      $scope.tips1 = false;
    });
  });
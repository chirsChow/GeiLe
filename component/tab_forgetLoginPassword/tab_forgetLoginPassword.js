var tab_forgetLoginPassword_myConfig = function($stateProvider) {
  $stateProvider
    .state('tab.tab_forgetLoginPassword', {
      url: '/tab_forgetLoginPassword?{:getPhone}',
      views: {
        'tab-mine': {
          templateUrl: 'component/tab_forgetLoginPassword/tab_forgetLoginPassword.html',
          controller: 'tab_forgetLoginPasswordCtrl'
        }
      }
    });
};
myapp.config(tab_forgetLoginPassword_myConfig);

angular.module('starter.tab_forgetLoginPassword', [])
  .controller('tab_forgetLoginPasswordCtrl', function($scope, $ionicModal, $state, toast, $stateParams, Common, $interval, cordovaPlug) {
    var timer;
    $scope.phoneCodeFilled = false;
    $scope.verifyIdOK = false;
    $scope.setPasswordOK = false;

    var regPhone = /^1(3|4|5|7|8)\d{9}$/;
    $scope.seconds = 59;
    $scope.btnText = "获取验证码";
    var regIdCard = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;


    $scope.submit = false;
    $scope.isCounting = false;

    $ionicModal.fromTemplateUrl('verifyId.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $ionicModal.fromTemplateUrl('setPassword.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $scope.modalSetPassword = modal;
    });

    //获取手机验证码
    $scope.getCode = function() {
      if (!$scope.isCounting) {
        if (regPhone.test($scope.inputData.phone)) {
          $scope.light = false;
          $scope.isCounting = true;
          $scope.count();
          //向后台发送请求
          Common.post("lifeAPI/sms/sendSms", {
            //发短信两个参数就好了
            "businessType": "3",
            "phoneNo": $scope.inputData.phone
          }, function(data) {
          }, {})
        } else {
          toast.show("请输入正确的手机号")
        }
      }
    }

    //短信倒计时
    $scope.count = function() {
      $scope.btnText = "59s后重发";
      timer = $interval(function() {
        $scope.seconds--;
        if ($scope.seconds != 0) {
          $scope.seconds = $scope.seconds >= 10 ? $scope.seconds : "0" + $scope.seconds;
          $scope.btnText = $scope.seconds + "s后重发";
        } else {
          $interval.cancel(timer);
          $scope.seconds = 59;
          $scope.isCounting = false;
          $scope.btnText = "重新发送";
        }
      }, 1000)
    }



    //返回，隐藏身份证模态框
    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    //返回，隐藏密码设置模态框
    $scope.closePasswordModal = function() {
      $scope.modalSetPassword.hide();
      $scope.modal.show();
    };

    $scope.$watch('inputData.phone', function() {
      $scope.$watch('inputData.vCode', function() {
        // if (/^\d{6}$/.test($scope.inputData.vCode) && /^1(3|4|5|7|8)\d{9}$/.test($scope.inputData.phone)) {
        if ($scope.inputData.vCode || $scope.inputData.phone) {
          $scope.phoneCodeFilled = true;
        } else {
          $scope.phoneCodeFilled = false;
        }
      })
    })


    //IOS计时缓慢问题
    var hiddenTime, visibleTime;
    document.addEventListener("pause", function() {
      if (!$scope.isCounting) return;
      hiddenTime = new Date().getTime();
      visibleTime = $scope.seconds;
    }, false);
    document.addEventListener("resume", function() {
      if (!$scope.isCounting) return;
      var timemax = visibleTime - ((new Date().getTime() - hiddenTime) / 1000 | 0)
      if (timemax > 0) {
        $scope.seconds = timemax;
      } else {
        $interval.cancel(timer);
        $scope.seconds = 59;
        $scope.isCounting = false;
        $scope.btnText = "重新发送";
      }
    }, false);


    $scope.$watch('inputData.pwd', function() {
      $scope.$watch('inputData.pwdConfirm', function() {
        var pwd = $scope.inputData.pwd;
        var pwdConfirm = $scope.inputData.pwdConfirm;
        // if (pwd.length >= 8 && (pwd == pwdConfirm)) {
        if ($scope.inputData.pwd || $scope.inputData.pwdConfirm) {
          $scope.setPasswordOK = true;
        } else {
          $scope.setPasswordOK = false;
        }
      })
    })


    //完成手机验证，下一步
    $scope.verifyPhoneComplete = function() {
      if (regPhone.test($scope.inputData.phone)) {
        if (/^\d{6}$/.test($scope.inputData.vCode)) {
          Common.post("lifeAPI/sms/verifySms", {
            "businessType": "3",
            "phoneNo": $scope.inputData.phone,
            "verifyCode": $scope.inputData.vCode
          }, function(data) {
            $scope.modal.show();
            //token
            token = data.data.token;
          }, {})
        } else {
          toast.show("请输入正确格式的验证码")
        }
      } else {
        toast.show("请输入正确格式的手机号")
      }
    }

    //验证身份证是否输入正确
    var isCardID = function(sId) {
      if (!regIdCard.test(sId)) return "您输入的身份证格式错误";
      return true;
    }

    //下一步，显示设置密码模态框
    $scope.verifyIdComplete = function() {
      var result = isCardID($scope.inputData.idNo);
      if (result === true) {
        Common.post('lifeAPI/user/forgotPassword', {
          "idCard": $scope.inputData.idNo,
          "mobilePhone": $scope.inputData.phone,
          "token": token
        }, {}, {}, 1, function(data) {
          if (data.result === "000000") {
            $scope.modal.hide();
            $scope.modalSetPassword.show();
          } else if (data.result === "000009") {
            Common.showAlert('温馨提示', data.description, function() {
              $scope.modal.hide();
              $scope.inputData.vCode = "";
            })
          } else if (data.result === "100020") {
            Common.showAlert('温馨提示', data.description, function() {
              $scope.modal.hide();
              $state.go('tab.tab_loginByCode', {
                id: $scope.inputData.phone
              });
            })
          } else {
            Common.showAlert('温馨提示', data.description);
          }
        });
      } else {
        toast.show(result);
      }
    }

    $scope.$watch('inputData.idNo', function() {
        // if (regIdCard.test($scope.inputData.idNo)) {
        if ($scope.inputData.idNo) {
          $scope.verifyIdOK = true;
        } else {
          $scope.verifyIdOK = false;
        }
      })
      //完成密码修改
    $scope.modifyPasswordComplete = function() {
      console.log('点击了确认密码设置按钮')
      var p1 = $scope.inputData.pwd;
      var p2 = $scope.inputData.pwdConfirm;
      var reg = /^[^/|\\|\s|\u4e00-\u9fa5]{8,16}$/;
      var regAllNum = /^\d{8,16}$/;
      var regAllAlphabet = /^[a-zA-Z]{8,16}$/;
      var regAllSymbol = /^^[!@`~#\*^+-.%&<>()',;_"'=?\$\x22]{8,16}$/;
      if (p1 && p2) {
        if (p1 === p2) {
          if (reg.test(p2)) {
            if (!regAllNum.test(p2) && !regAllAlphabet.test(p2) && !regAllSymbol.test(p2)) {
              $scope.tips = false;

              Common.checkMd5("GL_SALT_MD5_KEY" + $scope.inputData.pwd.toString(), function(data) {
                console.log("加密成功")
                Common.post('lifeAPI/user/forgotPassword', {
                  "mobilePhone": $scope.inputData.phone,
                  "password": data.MD5,
                  "token": token
                }, {}, {}, 1, function(data) {
                  if (data.result == "000000") {
                    console.log("密码修改成功")
                      //隐藏modal才能跳转
                    $scope.modal.hide();
                    $scope.modalSetPassword.hide();
                    toast.show("新密码设置成功")
                    var myDevice = Common.getCache('getDeviceIdAndClientId') || {};
                    Common.setCache('lastUser', $scope.inputData.phone);
                    Common.post_login('lifeAPI/login', {
                      deviceName: myDevice.deviceName || "",
                      deviceVersion: myDevice.deviceVersion || "",
                      username: $scope.inputData.phone,
                      password: $scope.inputData.pwd
                    }, function(data) {
                      Common.setCache('LoggedOn', true);
                      //向原生外放极光推送广播
                      Common.setCache('Token', data.data);
                      Common.setCache('lastUser', $scope.inputData.phone);
                      cordovaPlug.CommonPL(function(data) {}, "login", [data.data.userId])
                      Common.get('lifeAPI/user/info', {}, function(_data) {
                        Common.setCache('information', _data.data);
                        Common.hideLoading();
                        $state.go('tab.index');
                      }, {})
                    }, {}, 1)
                  } else {
                    Common.showAlert('温馨提示', data.description, function() {
                      //请求不成功，清空用户输入，跳转到手机验证码界面
                      $scope.inputData = {
                        phone: $stateParams.getPhone ? $stateParams.getPhone : '',
                        vCode: '',
                        idNo: '',
                        pwd: '',
                        pwdConfirm: ''
                      }
                      token = '';
                      $scope.tipsContent = '';
                      $scope.tips = false;
                      $scope.modal.hide();
                      $scope.modalSetPassword.hide();
                    })
                  }
                });
              })
            } else {
              $scope.tips = true;
              $scope.tipsContent = "您的密码过于简单,不能为纯数字、纯字母、纯字符,请重新设置";
            }
          } else {
            $scope.tips = true;
            $scope.tipsContent = "密码为8-16位数字与字符组合,不能含有/,\\等敏感字符";
          }
        } else {
          $scope.tips = true;
          $scope.tipsContent = "两次密码输入不一致";
        }
      } else {
        $scope.tips = true;
        $scope.tipsContent = "请输入密码";
      }
    }
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.tipsContent = '';
      $scope.tips = false;
      var token = '';
      $scope.inputData = {
        phone: $stateParams.getPhone ? $stateParams.getPhone : '',
        vCode: '',
        idNo: '',
        pwd: '',
        pwdConfirm: ''
      }
    });
  });
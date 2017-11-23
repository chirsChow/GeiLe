#!/bin/sh
name=$1

if [ -d "component/${name}" ]; then
  echo "********Module already exists. Please rename!"
fi

if [ ! -d "component/${name}" ]; then
  cd component
  mkdir ${name}
  echo "create The module ${name}"
  cd ${name}
  touch ${name}.html ${name}.scss ${name}.js
  echo "<ion-view hide-tabs='true' id='${name}'></ion-view>" > ${name}.html
  echo "#${name}{}" > ${name}.scss
  echo "var ${name}_myConfig = function(\$stateProvider){
    \$stateProvider
    .state('tab.${name}', {
        url: '/${name}',
        views: {
            'tab-index': {
                templateUrl: 'component/${name}/${name}.html',
                controller: '${name}Ctrl'
            }
        }
    });
};
myapp.config(${name}_myConfig);

angular.module('starter.${name}',[])
.controller('${name}Ctrl', function(\$scope) {
    \$scope.\$on('\$ionicView.beforeEnter', function() {

    });
});" > ${name}.js
cd ../..
sed -i "s/ionic/ionic','starter.${name}/g" config.js

fi

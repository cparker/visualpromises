var ang = angular.module('visualPromiseApp', []);


ang.controller('visualPromiseController', ['$scope', '$location', function ($scope, $location) {

    $scope.barTotal = 5;
    $scope.finished = false;

    var maxBarWidth = 500;
    var minBarWidth = 50;
    var updateIntervalMS = 50;
    var pixelIncrement = 2;
    var barRange = _.range(0, $scope.barTotal);
    var colors = _.shuffle(["green", "red", "purple", "orange", "darkgray", "pink", "yellow", "brown", "violet", "blue"]);

    $scope.bars = _.map(barRange, function (b) {
        var width = Math.ceil(Math.random() * maxBarWidth + minBarWidth);
        return {
            bId: b,
            width: width,
            startingWidth: width,
            color: colors[b]
        }

    });

    var shrinkBar = function (bId) {
        var def = Q.defer();

        var doShrink = function () {
            if ($scope.bars[bId].width >= pixelIncrement) {
                $scope.bars[bId].width -= pixelIncrement;
                $scope.$apply();
                setTimeout(doShrink, updateIntervalMS);
            } else {
                $scope.bars[bId].width = 0;
                $scope.$apply();
                def.resolve();
            }
        };

        doShrink();

        return def.promise;
    };

    var growBar = function (bId) {
        var def = Q.defer();

        var doGrow = function () {
            if ($scope.bars[bId].width < $scope.bars[bId].startingWidth) {
                $scope.bars[bId].width += pixelIncrement;
                $scope.$apply();
                setTimeout(doGrow, updateIntervalMS);
            } else {
                def.resolve();
            }
        };

        doGrow();

        return def.promise;
    };

    // a collection of functions that return promises (NOT promises)
    var shrinkers = _.map($scope.bars, function (bar) {
        return function () {
            return shrinkBar(bar.bId);
        }
    });

    // a collection of functions that return promises (NOT promises)
    var growers = _.map($scope.bars, function (bar) {
        return function () {
            return growBar(bar.bId);
        }
    });

    var startPromiseFunctions = function (promiseFunctions) {
        return _.map(promiseFunctions, function (f) {
            return f();
        })
    };

    Q.all(startPromiseFunctions(shrinkers))
        .then(function () {
            console.log('done shrinking');
            pixelIncrement = 10;
            //return growers.reduce(Q.when, Q('init'));
            return Q.all(startPromiseFunctions(growers));
        })
        .then(function () {
            $scope.finished=true;
            $scope.$apply();
        })


}]);

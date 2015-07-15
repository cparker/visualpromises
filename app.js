var ang = angular.module('visualPromiseApp', []);


ang.controller('visualPromiseController', ['$scope', '$location', function ($scope, $location) {

    $scope.barTotal = 5;
    $scope.finished = false;

    var updateIntervalMS = 50;
    var pixelIncrement = 2;
    var barRange = _.range(0, $scope.barTotal);
    var colors = _.shuffle(["green", "red", "purple", "orange", "darkgray", "pink", "yellow", "brown", "violet", "blue"]);

    $scope.bars = _.map(barRange, function (b) {
        var width = Math.ceil(Math.random() * 500 + 50);
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

    var shrinkers = _.map([0, 1, 2, 3, 4], function (bId) {
        return function () {
            return shrinkBar(bId);
        }
    });

    var growers = _.map([0, 1, 2, 3, 4], function (bId) {
        return function () {
            return growBar(bId);
        }
    });

    var kickOff = function (promiseFunctions) {
        return _.map(promiseFunctions, function (f) {
            return f();
        })
    };

    Q.all(kickOff(shrinkers))
        .then(function () {
            console.log('done shrinking');
            return Q.all(kickOff(growers));
        })
        .then(function () {
            return Q.all(kickOff(growers));
        })
        .then(function() {
            $scope.finished=true;
            $scope.$apply();
        })


}]);

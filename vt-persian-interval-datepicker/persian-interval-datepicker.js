angular.module('ui.bootstrap.persian.interval.datepicker'
    , ['ui.bootstrap.persian.datepicker'
        , 'template/persianIntervalDatePicker.html'
        , 'template/inlineIntervalDatePicker.html'
        , 'template/multiLineIntervalDatePicker.html'])
    .constant('persianIntervalDatepickerOptions', {
        format: 'yyyy/MM/dd',
        startDateModel: 'startDate',
        endDateModel: 'endDate'
    })
    .factory('persianIntervalService', function () {
        return {
            diffDates: function (startDate, endDate) {
                var startDate = moment(startDate), endDate = moment(endDate);
                return moment.duration(endDate.diff(startDate)).asDays();
            }
        }

    })
    .controller('persianIntervalDatepickerCtrl', function ($scope, $element, $attrs, persianIntervalService, persianIntervalDatepickerOptions) {

        this.init = function (ngModel) {
            var rangeMin = angular.isDefined($attrs['rangeMin']) ? $attrs['rangeMin'] : 1
                , rangeMax = angular.isDefined($attrs['rangeMax']) ? $attrs['rangeMax'] : angular.noop()
                , startDateModel = angular.isDefined($attrs['startDateModel']) ? $attrs['startDateModel'] : persianIntervalDatepickerOptions.startDateModel
                , endDateModel = angular.isDefined($attrs['endDateModel']) ? $attrs['endDateModel'] : persianIntervalDatepickerOptions.endDateModel;

            angular.forEach(['startDate', 'endDate'], function (value) {
                $scope.$watch(value, function () {

                    ngModel.$setValidity('startDateGreater', ($scope.startDate < $scope.endDate));

                    var diff = persianIntervalService.diffDates($scope.startDate, $scope.endDate);
                    ngModel.$setValidity('rangeDatesFailed', !(diff > rangeMax || diff < rangeMin));

                    if (angular.equals({}, ngModel.$error)) {
                        $element.removeClass('has-error');
                        var interval = {};
                        interval[startDateModel] = $scope.startDate;
                        interval[endDateModel] = $scope.endDate;
                        ngModel.$setViewValue(interval);
                    } else {
                        $element.addClass('has-error');
                        ngModel.$setViewValue(undefined);
                    }
                });
            })
        }

    })
    .directive('persianIntervalDatepicker', function () {
        return {
            restrict: 'AE',
            templateUrl: 'template/persianIntervalDatePicker.html',
            replace: true,
            scope: {
                display: '@',
                format: '@',
                startDateLabel: '@',
                endDateLabel: '@',
                startDatePlaceholder: '@',
                endDatePlaceholder: '@'
            },
            link: function (scope) {
                console.log("persianIntervalDatepicker");
                console.log(scope);
            }
        }
    })
    .directive('persianInlineIntervalDatepicker', function () {
        return {
            restrict: 'AE',
            replace: true,
            controller: 'persianIntervalDatepickerCtrl',
            templateUrl: 'template/inlineIntervalDatePicker.html',
            scope: false,
            require: ['persianInlineIntervalDatepicker', '^ngModel'],
            link: function (scope, element, attr, ctrls) {
                console.log("persianInlineIntervalDatepicker");
                console.log(scope);
                var ctrl = ctrls[0], ngModel = ctrls[1];
                ctrl.init(ngModel);
            }
        }
    })
    .directive('persianMultilineIntervalDatepicker', function () {
        return {
            replace: true,
            templateUrl: 'template/multiLineIntervalDatePicker.html'
        }
    });
angular.module('template/persianIntervalDatePicker.html', []).run(["$templateCache", function ($templateCache) {
    $templateCache.put('template/persianIntervalDatePicker.html',
        "<div ng-switch=\"display\">" +
        "<persian-inline-interval-datepicker ng-switch-when=\"inline\"/>" +
        "<persian-multiline-interval-datepicker ng-switch-when=\"multiline\"/>" +
        "</div>"
    )
}]);
angular.module('template/multiLineIntervalDatePicker.html', []).run(["$templateCache", function ($templateCache) {
    $templateCache.put('template/multiLineIntervalDatePicker.html', "<p>multiline</p>");
}]);
angular.module('template/inlineIntervalDatePicker.html', [])
    .run(["$templateCache", function ($templateCache) {
        $templateCache.put('template/inlineIntervalDatePicker.html',
            "<div class=\"form-inline\">" +

            "<label ng-if=\"startDateLabel\">{{startDateLabel}}</label>" +
            "<p class=\"input-group\"> " +
            "<input name=\"startDate\" " +
            "placeholder=\"{{startDatePlaceholder}}\" " +
            "class=\"form-control\" " +
            "type=\"text\" " +
            "datepicker-popup-persian=\"{{format}}\" " +
            "ng-model=\"startDate\" " +
            "show-button-bar=\"false\" " +
            "is-open=\"startDateOpen\" " +
            "ng-click=\"startDateOpen = true\"/>" +

            "<span class=\"input-group-btn\">" +
            "<button type=\"button\" class=\"btn btn-default\"" +
            "ng-click=\"startDateOpen = true\">" +
            "<i class=\"glyphicon glyphicon-calendar\"></i>" +
            "</button></span></p>" +
            "<label ng-if=\"endDateLabel\">{{endDateLabel}}</label>" +
            "<p class=\"input-group\"> " +
            "<input name=\"EndDate\" " +
            "placeholder=\"{{endDatePlaceholder}}\" " +
            "class=\"form-control\" " +
            "type=\"text\" " +
            "datepicker-popup-persian=\"{{format}}\" " +
            "ng-model=\"endDate\" " +
            "show-button-bar=\"false\" " +
            "is-open=\"endDateOpen\" " +
            "ng-click=\"endDateOpen = true\"/>" +
            "<span class=\"input-group-btn\">" +
            "<button type=\"button\" class=\"btn btn-default\"" +
            "ng-click=\"endDate = true\">" +
            "<i class=\"glyphicon glyphicon-calendar\"></i>" +
            "</button></span></p>" +
            "</div>"
        )
    }]);
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
    .controller('persianIntervalDatepickerCtrl', function ($scope, $element, $attrs, $interpolate, persianIntervalService, persianIntervalDatepickerOptions) {
        var rangeMin = angular.isDefined($attrs['rangeMin']) ? $attrs['rangeMin'] : 1
            , rangeMax = angular.isDefined($attrs['rangeMax']) ? $attrs['rangeMax'] : angular.noop()
            , startDateModel = angular.isDefined($attrs['startDateModel']) ? $attrs['startDateModel'] : persianIntervalDatepickerOptions.startDateModel
            , endDateModel = angular.isDefined($attrs['endDateModel']) ? $attrs['endDateModel'] : persianIntervalDatepickerOptions.endDateModel;
        this.init = function (ngModel) {
            console.log($scope);
            angular.forEach(['startDate', 'endDate'], function (value) {
                $scope.$watch(value, function () {
                    if (angular.isDefined($scope.startDate) && angular.isDefined($scope.endDate)) {
                        ngModel.$setValidity('startDateGreaterThanEnd', ($scope.startDate < $scope.endDate));

                        var diff = persianIntervalService.diffDates($scope.startDate, $scope.endDate);
                        ngModel.$setValidity('rangeDatesInvalid', !(diff > rangeMax || diff < rangeMin));

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
                    }
                });
            })
        }
    })
    .directive('persianIntervalDatepicker', function () {
        return {
            restrict: 'AE',
            replace: true,
            controller: 'persianIntervalDatepickerCtrl',
            templateUrl: 'template/persianIntervalDatePicker.html',
            scope: {
                display: '@',
                format: '@',
                startDateLabel: '@',
                endDateLabel: '@',
                startDatePlaceholder: '@',
                endDatePlaceholder: '@'
            }
        }
    })
    .directive('persianInlineIntervalDatepicker', function () {
        return {
            restrict: 'AE',
            replace: true,
            scope: false,
            templateUrl: 'template/inlineIntervalDatePicker.html',
            require: ['^persianIntervalDatepicker', '^ngModel'],
            link: function (scope, element, attr, ctrls) {
                var ctrl = ctrls[0], ngModel = ctrls[1];
                ctrl.init(ngModel);
            }
        }
    })
    .directive('persianMultilineIntervalDatepicker', function () {
        return {
            restrict: 'AE',
            controller: 'persianIntervalDatepickerCtrl',
            templateUrl: 'template/multiLineIntervalDatePicker.html',
            require: ['persianMultilineIntervalDatepicker', '^ngModel'],
            link: function (scope, element, attr, ctrls) {
                var ctrl = ctrls[0], ngModel = ctrls[1];
                ctrl.init(ngModel);
            }
        }
    });
angular.module('template/persianIntervalDatePicker.html', []).run(["$templateCache", function ($templateCache) {
    $templateCache.put('template/persianIntervalDatePicker.html',
        "<div ng-switch=\"display\"> <persian-inline-interval-datepicker ng-switch-when=\"inline\"/> " +
        "<persian-multiline-interval-datepicker ng-switch-when=\"multiline\"/></div>"
    )
}]);
angular.module('template/multiLineIntervalDatePicker.html', []).run(["$templateCache", function ($templateCache) {
    $templateCache.put('template/multiLineIntervalDatePicker.html',
        "<div><label for=\"startDate\" ng-if=\"startDateLabel\">{{startDateLabel}}</label><p class=\"input-group\">" +
        "<input name=\"startDate\" placeholder=\"{{startDatePlaceholder}}\" class=\"form-control\" " +
        "type=\"text\" datepicker-popup-persian=\"{{format}}\" ng-model=\"startDate\" show-button-bar=\"false\" " +
        "is-open=\"startDateOpen\" ng-click=\"startDateOpen = true\"/><span class=\"input-group-btn\">" +
        "<button type=\"button\" class=\"btn btn-default\" ng-click=\"startDateOpen = true\">" +
        "<i class=\"glyphicon glyphicon-calendar\"></i></button></span></p>" +
        "<label for=\"endDate\" ng-if=\"endDateLabel\">{{endDateLabel}}</label><p class=\"input-group\"><input name=\"endDate\" " +
        "placeholder=\"{{endDatePlaceholder}}\" class=\"form-control\" type=\"text\" " +
        "datepicker-popup-persian=\"{{format}}\" required ng-model=\"endDate\" show-button-bar=\"false\" " +
        "is-open=\"endDateOpen\" ng-click=\"endDateOpen = true\"/> <span class=\"input-group-btn\">" +
        "<button type=\"button\" class=\"btn btn-default\"" +
        "ng-click=\"endDate = true\"> <i class=\"glyphicon glyphicon-calendar\"></i>" +
        "</button></span></p></div>");
}]);
angular.module('template/inlineIntervalDatePicker.html', [])
    .run(["$templateCache", function ($templateCache) {
        $templateCache.put('template/inlineIntervalDatePicker.html',
            "<div class=\"form-inline\"><label style=\"padding:0 5px\" ng-if=\"startDateLabel\">{{startDateLabel}}</label>" +
            "<p class=\"input-group\"><input name=\"startDate\" placeholder=\"{{startDatePlaceholder}}\" " +
            "class=\"form-control\" type=\"text\" datepicker-popup-persian=\"{{format}}\" " +
            "ng-model=\"startDate\" show-button-bar=\"false\" is-open=\"startDateOpen\" ng-click=\"startDateOpen = true\"/>" +
            "<span class=\"input-group-btn\"> <button type=\"button\" class=\"btn btn-default\"" +
            "ng-click=\"startDateOpen = true\"> <i class=\"glyphicon glyphicon-calendar\"></i>" +
            "</button></span></p> <label style=\"padding:0 5px\" ng-if=\"endDateLabel\">{{endDateLabel}}</label>" +
            "<p class=\"input-group\"><input name=\"EndDate\" placeholder=\"{{endDatePlaceholder}}\" " +
            "class=\"form-control\" type=\"text\" " +
            "datepicker-popup-persian=\"{{format}}\" ng-model=\"endDate\" show-button-bar=\"false\" is-open=\"endDateOpen\" " +
            "ng-click=\"endDateOpen = true\"/> <span class=\"input-group-btn\">" +
            "<button type=\"button\" class=\"btn btn-default\" ng-click=\"endDate = true\">" +
            "<i class=\"glyphicon glyphicon-calendar\"></i> </button></span></p></div>"
        )
    }]);
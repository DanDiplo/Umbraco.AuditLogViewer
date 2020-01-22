(function () {
    'use strict';

    angular.module("umbraco").controller("DiploAuditLogDetailController", function ($scope, diploAuditLogResources, notificationsService, userService, dateHelper) {

        $scope.logDetail = null;
        var id = $scope.dialogData.entry.Id;

        $("#audit-logdetail").parent("div").addClass('diplo-modal');

        var findInArray = function (array, value, offset) {
            for (var i = 0; i < array.length; i++) {
                if (array[i]["Id"] == value) {
                    return array[i + offset];
                }
            }
            return null;
        };

        $scope.hasPrevious = function () {
            return $scope.dialogData.items[0].Id !== id;
        };

        $scope.hasNext = function () {
            return $scope.dialogData.items[$scope.dialogData.items.length - 1].Id !== id;
        };

        $scope.nextItem = function () {
            var next = findInArray($scope.dialogData.items, id, 1);
            if (next) {
                getLogDetail(next.Id);
                id = next.Id;
            }
        };

        $scope.previousItem = function () {
            var prev = findInArray($scope.dialogData.items, id, -1);
            if (prev) {
                getLogDetail(prev.Id);
                id = prev.Id;
            }
        };

        $scope.getEditUrl = function () {

            console.log($scope.dialogData.entry);

            return diploAuditLogResources.getEditUrl($scope.dialogData.entry);
        };

        function getLogDetail(id) {
            diploAuditLogResources.getLogDetail(id).then(function (data) {

                userService.getCurrentUser().then(function (currentUser) {
                    data.DateStampFormatted = dateHelper.getLocalDate(data.DateStamp, currentUser.locale, 'LLL');
                });

                $scope.logDetail = data;

            }, function (data) {
                notificationsService.error("Error", "Could not load log data: " + data);
            });
        }

        getLogDetail(id);
    });
})();
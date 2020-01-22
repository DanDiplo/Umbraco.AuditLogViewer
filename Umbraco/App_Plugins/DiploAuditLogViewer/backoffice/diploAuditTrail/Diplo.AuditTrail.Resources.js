(function () {
    'use strict';
    angular.module('umbraco.resources').factory('diploAuditTrailResources', function ($q, $http, umbRequestHelper) {

        var basePath = "Backoffice/AuditLogViewer/AuditTrail/";

        return {
            getLogData: function (criteria) {
                return umbRequestHelper.resourcePromise(
                    $http.get(basePath + "GetLogData", {
                        params: {
                            itemsPerPage: criteria.itemsPerPage,
                            pageNumber: criteria.currentPage,
                            sortColumn: criteria.sort,
                            sortOrder: criteria.reverse ? "desc" : "asc",
                            searchTerm: criteria.searchTerm,
                            eventType: criteria.eventType,
                            performingUserId: criteria.performingUser !== null ? criteria.performingUser.Id : null,
                            affectedUserId: criteria.affectedUser !== null ? criteria.affectedUser.Id : null,
                            dateFrom: criteria.dateFrom,
                            dateTo: criteria.dateTo
                        }
                    })
                );
            },
            getEventTypes: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(basePath + "GetEventTypes")
                );
            },
            getUserNames: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(basePath + "GetAllUserNames")
                );
            }
        };
    });
})();
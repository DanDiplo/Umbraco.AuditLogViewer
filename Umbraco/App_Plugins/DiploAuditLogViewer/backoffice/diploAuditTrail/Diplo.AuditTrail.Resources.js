(function () {
    'use strict';

    // Resources for the Audit Log

    angular.module('umbraco.resources').factory('diploAuditTrailResources', function ($http, umbRequestHelper) {
        var basePath = "Backoffice/DiploAuditLogViewer/AuditTrail/"; // base path for API calls to controller

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
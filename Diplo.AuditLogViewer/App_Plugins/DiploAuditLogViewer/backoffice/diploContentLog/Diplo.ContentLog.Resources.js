(function () {
    'use strict';

    // Resources for the Content Log

    angular.module('umbraco.resources').factory('diploContentLogResources', function ($http, umbRequestHelper) {
        var basePath = "Backoffice/DiploAuditLogViewer/ContentLog/"; // base path for API calls to controller

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
                            logType: criteria.logTypeName,
                            userName: criteria.logUserName,
                            dateFrom: criteria.dateFrom,
                            dateTo: criteria.dateTo,
                            nodeId: criteria.nodeId
                        }
                    })
                );
            },
            getLogTypes: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(basePath + "GetLogTypes")
                );
            },
            getUserNames: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(basePath + "GetAllUserNames")
                );
            },
            getEditUrl: function (entry) {
                if (entry === null || entry.NodeId === 0)
                    return null;

                var type = entry.TypeDesc;

                switch (type) {
                    case "Document":
                        return "#/content/content/edit/" + entry.NodeId;
                    case "Template":
                        return "#/settings/templates/edit/" + entry.NodeId;
                    case "Document Type":
                        return "#/settings/documentTypes/edit/" + entry.NodeId;
                    case "Media":
                        return "#/media/media/edit/" + entry.NodeId;
                    case "Data Type":
                        return "#/settings/dataTypes/edit/" + entry.NodeId;
                    case "Media Type":
                        return "#/settings/mediaTypes/edit/" + entry.NodeId;
                    case "Member":
                        return "#/member/member/edit/" + entry.NodeId;
                }

                return null;
            }
        };
    });
})();
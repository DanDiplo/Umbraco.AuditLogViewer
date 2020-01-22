(function () {
    'use strict';
    angular.module('umbraco.resources').factory('diploAuditLogResources', function ($q, $http, umbRequestHelper) {

        var basePath = "Backoffice/AuditLogViewer/AuditLog/";

        return {
            getLogData: function (itemsPerPage, pageNumber, sortColumn, sortOrder, searchTerm, logType, logUserName, dateFrom, dateTo, nodeId) {
                return umbRequestHelper.resourcePromise(
                    $http.get(basePath + "GetLogData", { params: { itemsPerPage: itemsPerPage, pageNumber: pageNumber, sortColumn: sortColumn, sortOrder: sortOrder, searchTerm: searchTerm, logType: logType, userName: logUserName, dateFrom: dateFrom, dateTo: dateTo, nodeId: nodeId } })
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
            getLogDetail: function (id) {
                return umbRequestHelper.resourcePromise(
                    $http.get(basePath + "GetLogDetail", { params: { id: id } })
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
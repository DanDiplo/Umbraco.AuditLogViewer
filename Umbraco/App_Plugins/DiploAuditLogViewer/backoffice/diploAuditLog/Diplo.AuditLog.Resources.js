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
            if (entry == null || entry.NodeId === 0)
                return null;

            if (entry.Comment.includes(" Template "))
                return "#/settings/framed/settings%252FViews%252FEditView.aspx%253FtreeType%253Dtemplates%2526templateID%253D" + entry.NodeId;
            else if (entry.Comment.includes("Save ContentType "))
                return "#/settings/documentTypes/edit/" + entry.NodeId;
            else if (entry.Comment.includes("Save MediaType "))
                return "#/settings/mediaTypes/edit/" + entry.NodeId;
            else if (entry.Comment.includes("Save Language"))
                return "#/settings/framed/settings%252FeditLanguage.aspx%253Fid%253D" + entry.NodeId;
            else if (entry.Comment.includes("Save Media"))
                return "#/media/media/edit/" + entry.NodeId;
            else if (entry.Comment.includes("Save DataTypeDefinition"))
                return "#/developer/dataTypes/edit/" + entry.NodeId;

            return "#/content/content/edit/" + entry.NodeId;
        }
    }
});
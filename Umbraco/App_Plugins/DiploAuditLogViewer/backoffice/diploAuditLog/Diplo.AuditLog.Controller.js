'use strict';
// Thanks to  David Brendel for custom paging info - http://24days.in/umbraco/2015/custom-listview/

angular.module("umbraco").controller("DiploAuditLogEditController",
    function ($scope, $routeParams, dialogService, notificationsService, eventsService, diploAuditLogResources) {

        $scope.isLoading = true;
        $scope.reverse = true;
        $scope.searchTerm = "";
        $scope.predicate = 'L.Datestamp';
        $scope.nodeId = null;
        $scope.page = null;
        $scope.logUserName = null;
        $scope.logTypeName = null;
        $scope.pageSizeList = [10, 20, 50, 100, 200, 500];
        $scope.itemsPerPage = $scope.pageSizeList[2];

        var id = $routeParams.id;
        $scope.logname = id;

        if (id.startsWith("date:")) {
            var parts = id.split(":");
            $scope.dateFrom = parts[1];
            $scope.dateTo = parts[2];
        }
        else if (id.startsWith("node:")) {
            var parts = id.split(":");
            $scope.nodeId = parseInt(parts[1]);
        }

        function fetchData() {
            diploAuditLogResources.getLogData($scope.itemsPerPage, $scope.currentPage, $scope.predicate, $scope.reverse ? "desc" : "asc", $scope.searchTerm, $scope.logTypeName, $scope.logUserName, $scope.dateFrom, $scope.dateTo, $scope.nodeId).then(function (response) {

                $scope.logData = response.LogEntries;
                $scope.totalPages = response.TotalPages;
                $scope.currentPage = response.CurrentPage;
                $scope.itemCount = $scope.logData.length;
                $scope.totalItems = response.TotalItems;
                $scope.rangeTo = ($scope.itemsPerPage * ($scope.currentPage - 1)) + $scope.itemCount;
                $scope.rangeFrom = ($scope.rangeTo - $scope.itemCount) + 1;

                //console.log("ItemsPerPage: " + $scope.itemsPerPage + ", Total Pages: " + $scope.totalPages + ", CurrentPage: " + $scope.currentPage + ", Predicate: " + $scope.predicate + ", Order: " + $scope.reverse + ", Search: " + $scope.searchTerm + ", LogType: " + $scope.logTypeName);

                $scope.isLoading = false;

            }, function (response) {
                notificationsService.error("Error", "Could not load log data.");
            });
        };

        function getLogTypes() {
            diploAuditLogResources.getLogTypes().then(function (data) {
                $scope.logTypes = data;
            }, function (data) {
                notificationsService.error("Error", "Could not load log types.");
            });
        };

        function getUserNames(callback) {
            diploAuditLogResources.getUserNames().then(function (data) {
                $scope.userNames = data;

                if ($routeParams.id.startsWith("user:")) {
                    var parts = $routeParams.id.split(":");
                    $scope.logUserName = parts[1];
                }

                if (callback) callback();

            }, function (data) {
                notificationsService.error("Error", "Could not load log usernames.");
            });
        };

        $scope.order = function (predicate) {
            $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
            $scope.predicate = predicate;
            $scope.logTypeChange();
        };

        $scope.prevPage = function () {
            if ($scope.currentPage > 1) {
                $scope.currentPage--;
                fetchData();
            }
        };

        $scope.nextPage = function () {
            if ($scope.currentPage < $scope.totalPages) {
                $scope.currentPage++;
                fetchData();
            }
        };

        $scope.setPage = function (pageNumber) {
            $scope.currentPage = pageNumber;
            fetchData();
        };

        $scope.search = function (searchFilter) {
            $scope.searchTerm = searchFilter;
            $scope.logTypeChange();
        };

        $scope.logTypeChange = function () {
            $scope.currentPage = 1;
            fetchData();
        }

        $scope.openContentPicker = function () {
            dialogService.contentPicker({
                multiPicker: false,
                callback: function (data) {
                    $scope.nodeId = data.id;
                    $scope.nodeName = data.name;
                    $scope.logTypeChange();
                }
            });
        }

        $scope.openDetail = function (entry, data) {
            var dialog = dialogService.open({
                template: '/App_Plugins/DiploAuditLogViewer/backoffice/diploAuditLog/detail.html',
                dialogData: { entry: entry, items: data }, show: true, width: 800
            });
        }

        $scope.getEditUrl = function (entry) {
            return diploAuditLogResources.getEditUrl(entry);
        }

        getLogTypes();

        getUserNames(fetchData);

        // Thanks to Daniel Bardi - https://our.umbraco.org/forum/umbraco-7/developing-umbraco-7-packages/48870-Make-selected-node-in-custom-tree-appear-selected#comment-221866
        eventsService.on('appState.treeState.changed', function (event, args) {
            if (args.key === 'selectedNode') {

                function buildPath(node, path) {
                    path.push(node.id);
                    if (node.id === '-1') return path.reverse();
                    var parent = node.parent();
                    if (parent === undefined) return path;
                    return buildPath(parent, path);
                }

                event.currentScope.nav.syncTree({
                    tree: $routeParams.tree,
                    path: buildPath(args.value, []),
                    forceReload: false
                });
            }
        });

    });
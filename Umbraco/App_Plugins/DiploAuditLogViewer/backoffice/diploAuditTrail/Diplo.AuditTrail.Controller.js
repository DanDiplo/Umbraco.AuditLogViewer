﻿(function () {
    'use strict';
    // Thanks to  David Brendel for custom paging info - http://24days.in/umbraco/2015/custom-listview/

    angular.module("umbraco").controller("DiploAuditTrailEditController",
        function ($scope, $routeParams, $route, notificationsService, navigationService, diploAuditTrailResources) {
            var vm = this;

            // Default values

            vm.isLoading = true;
            vm.pageSizeList = [10, 20, 50, 100, 200, 500];
            vm.totalPages = 0;
            vm.logData = null;

            vm.criteria = {
                currentPage: 1,
                itemsPerPage: vm.pageSizeList[2],
                sort: 'eventDateUtc',
                reverse: true,
                eventType: null,
                searchTerm: null,
                performingUser: null,
                affectedUser: null,
                dateFrom: null,
                dateTo: null
            };

            // Parse route for any values passed from tree

            var id = $routeParams.id;
            var path = [id];
            var parts;

            if (id.startsWith("date:")) {
                parts = id.split(":");
                vm.criteria.dateFrom = parts[1];
                vm.criteria.dateTo = parts[2];
                path.unshift("TimePeriod");
            }

            navigationService.syncTree({ tree: $routeParams.tree, path: path, forceReload: false });

            // Fetch the log data from the API endpoint
            function fetchData() {
                diploAuditTrailResources.getLogData(vm.criteria)
                    .then(function (response) {
                        vm.logData = response.LogEntries;
                        vm.totalPages = response.TotalPages;
                        vm.criteria.currentPage = response.CurrentPage;
                        vm.itemCount = vm.logData.length;
                        vm.totalItems = response.TotalItems;
                        vm.rangeTo = (vm.criteria.itemsPerPage * (vm.criteria.currentPage - 1)) + vm.itemCount;
                        vm.rangeFrom = (vm.rangeTo - vm.itemCount) + 1;
                        vm.isLoading = false;
                    }, function (response) {
                        notificationsService.error("Error", "Could not load audit log data.");
                    });
            }

            // Get the event types list for the dropdown list filter
            function getEventTypes() {
                diploAuditTrailResources.getEventTypes().then(function (data) {
                    vm.eventTypes = data;
                }, function (data) {
                    notificationsService.error("Error", "Could not load audit log types.");
                });
            }

            // Get the user names for the dropdown list filter
            function getUserNames(callback) {
                diploAuditTrailResources.getUserNames().then(function (data) {
                    vm.userNames = data;
                    if (callback) callback();
                }, function (data) {
                    notificationsService.error("Error", "Could not load log usernames.");
                });
            }

            // Used to order
            vm.order = function (sort) {
                vm.criteria.reverse = (vm.criteria.sort === sort) ? !vm.criteria.reverse : false;
                vm.criteria.sort = sort;
                vm.logTypeChange();
            };

            // Pagination functions
            vm.prevPage = function () {
                if (vm.criteria.currentPage > 1) {
                    vm.criteria.currentPage--;
                    fetchData();
                }
            };

            vm.nextPage = function () {
                if (vm.criteria.currentPage < vm.totalPages) {
                    vm.criteria.currentPage++;
                    fetchData();
                }
            };

            vm.setPage = function (pageNumber) {
                vm.criteria.currentPage = pageNumber;
                fetchData();
            };

            // Log search
            vm.search = function (searchFilter) {
                vm.criteria.searchTerm = searchFilter;
                vm.logTypeChange();
            };

            // Trigger change
            vm.logTypeChange = function () {
                vm.criteria.currentPage = 1;
                fetchData();
            };

            // Run
            getEventTypes();

            getUserNames(fetchData);

            /*
    
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
    
            */

        });
})();
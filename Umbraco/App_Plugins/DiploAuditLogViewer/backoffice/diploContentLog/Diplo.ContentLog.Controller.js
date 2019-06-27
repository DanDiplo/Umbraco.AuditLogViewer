﻿(function () {
    'use strict';

    angular.module("umbraco").controller("DiploContentLogEditController",
        function ($routeParams, $route, $location, notificationsService, navigationService, diploContentLogResources, editorService) {
            var vm = this;

            // Default values

            vm.isLoading = true;
            vm.pageSizeList = [10, 20, 50, 100, 200, 500];
            vm.totalPages = 0;
            vm.logData = null;

            vm.criteria = {
                currentPage: 1,
                itemsPerPage: vm.pageSizeList[2],
                sort: 'L.Datestamp',
                reverse: true,
                searchTerm: null,
                logTypeName: null,
                logUserName: null,
                dateFrom: null,
                dateTo: null,
                nodeId: null
            };

            // Parse route for any values passed from tree

            var id = $routeParams.id;
            var path = [id];
            var parts;

            if (id.startsWith("date:")) {
                parts = id.split(":");
                vm.criteria.dateFrom = new Date(parts[1]);
                vm.criteria.dateTo = new Date(parts[2]);
                path.unshift("TimePeriod");
            }
            else if (id.startsWith("node:")) {
                parts = id.split(":");
                vm.criteria.nodeId = parseInt(parts[1]);
                path.unshift("LatestPages");
            }
            else if (id.startsWith("user:")) {
                path.unshift("ActiveUsers");
            }

            navigationService.syncTree({ tree: $routeParams.tree, path: path, forceReload: false });

            // Fetch the log data from the API endpoint
            function fetchData() {
                diploContentLogResources.getLogData(vm.criteria)
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
                        notificationsService.error("Error", "Could not load log data.");
                    });
            }

            // Get the log types list for the dropdown list filter
            function getLogTypes() {
                diploContentLogResources.getLogTypes().then(function (data) {
                    vm.logTypes = data;
                }, function (data) {
                    notificationsService.error("Error", "Could not load log types.");
                });
            }

            // Get the user names for the dropdown list filter
            function getUserNames(callback) {
                diploContentLogResources.getUserNames().then(function (data) {
                    vm.userNames = data;

                    if ($routeParams.id.startsWith("user:")) {
                        var parts = $routeParams.id.split(":");
                        vm.logUserName = parts[1];
                    }

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

            // Opens content picker dialogue
            vm.openContentPicker = function () {
                editorService.contentPicker({
                    multiPicker: false,
                    submit: function (data) {
                        var selected = data.selection[0];

                        if (selected) {
                            vm.criteria.nodeId = selected.id;
                            vm.criteria.nodeName = selected.name;
                            vm.logTypeChange();
                        }

                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                });
            };

            // Gets the edit URL for Node Id
            vm.getEditUrl = function (entry) {
                return diploContentLogResources.getEditUrl(entry);
            };

            // Reloads
            vm.reload = function () {

                $route.updateParams(
                    {
                        id: "AuditLog"
                    }
                );

                $route.reload();
            };

            // Run
            getLogTypes();

            getUserNames(fetchData);
        });
})();
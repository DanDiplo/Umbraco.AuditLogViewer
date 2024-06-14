(function () {
    'use strict';

    angular.module("umbraco").controller("DiploAuditLogEditController",
        function ($routeParams, $route, notificationsService, $timeout, navigationService, diploAuditTrailResources) {
            var vm = this;

            // Default values

            vm.isLoading = true;
            vm.pageSizeList = [10, 20, 50, 100, 200, 500];
            vm.totalPages = 0;
            vm.logData = null;
            vm.buttonState = 'init';

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
                vm.criteria.dateFrom = new Date(parts[1]);
                vm.criteria.dateTo = new Date(parts[2]);
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

                        if (!isButtonStateInitial()) {
                            vm.buttonState = 'success';
                            resetButtonState();
                        }
                    }, function (response) {
                        notificationsService.error("Error", "Could not load audit log data.");

                        if (!isButtonStateInitial()) {
                            vm.buttonState ='error';
                            resetButtonState();
                        }
                    });
            }

            function isButtonStateInitial() {
                return vm.buttonState === 'init';
            }

            function resetButtonState() {
                $timeout(function () {
                    vm.buttonState = 'init';
                }, 250);
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
            vm.search = function () {
                if (isButtonStateInitial()) {
                    vm.buttonState = 'busy';
                    vm.logTypeChange();
                }
            };

            vm.searchOnEnter = function ($event) {
                $event.preventDefault();
                vm.search();
            }

            // Trigger change
            vm.logTypeChange = function () {
                vm.criteria.currentPage = 1;
                fetchData();
            };

            // Reloads
            vm.reload = function () {
                $route.updateParams(
                    {
                        id: "AuditTrail"
                    }
                );

                $route.reload();
            };

            // Export
            // Helper function to replace commas with dashes
            function replaceCommaWithDash(value) {
                if (typeof value === 'string') {
                    return value.replace(/,/g, '-');
                }
                return value;
            }            
            vm.exportToCSV = function () {
                // Prepare CSV data
                let csvContent = "data:text/csv;charset=utf-8,";
                let header = ["Date", "Performer", "IP", "Affected", "Event", "Details"];
                csvContent += header.join(",") + "\n";

                vm.logData.forEach(function (row) {
                    let rowArray = [
                        new Date(row.EventDateUtc).toLocaleString(),
                        row.PerformingDetails,
                        row.PerformingIP,
                        row.AffectedDetails,
                        row.EventType,
                        row.EventDetails
                    ];

                    // Replace commas with dashes in each field
                    rowArray = rowArray.map(replaceCommaWithDash);
                    csvContent += rowArray.join(",") + "\n";
                });

                // Create a download link and trigger a download
                var encodedUri = encodeURI(csvContent);
                var timestamp = getFormattedTimestamp();
                var filename = `audit_log.csv`;
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            // Run
            getEventTypes();

            getUserNames(fetchData);
        });
})();
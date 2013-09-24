'use strict';

angular.module('opd.consultation.controllers')
    .controller('TreatmentController', ['$scope', 'treatmentService', function ($scope, treatmentService) {
        $scope.placeholder = "Add Treatment Advice";
        var drug = function () {
            return {
                uuid: "",
                name: "",
                strength: '',
                numberPerDosage: "",
                dosageFrequency: "",
                dosageInstruction: "",
                numberOfDosageDays: "",
                notes: "",
                notesVisible:false
            }
        };

        $scope.searchResults = [];

        $scope.selectedDrugs = [
            new drug()
        ];

        $scope.addNewRowIfNotExists = function () {
            var length = $scope.selectedDrugs.length;
            if ($scope.selectedDrugs[length - 1]) {
                var lastItem = $scope.selectedDrugs[length - 1];
                if (lastItem.name) {
                    $scope.selectedDrugs.push(new drug());
                }
                else if ($scope.selectedDrugs[length - 2] && !$scope.selectedDrugs[length - 2].name) {
                    $scope.selectedDrugs.pop();
                }
            }
        };

        var formattedString = function(formatStr, args) {
            return formatStr.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
                if (m == "{{") { return "{"; }
                if (m == "}}") { return "}"; }
                return args[n];
            });
        }


        $scope.getDataResults = function (data) {
            var labels = [];
            $scope.searchResults = data.results;

            data.results.forEach(
                function (record) {
                    labels.push(
                        {
                            label: formattedString("{0} {1} {2} {3} ({4})", [record.name, record.doseStrength, record.units, record.dosageForm.name.name, record.concept.name.name]),
                            value: record.name,
                            lookup: record.uuid
                        }
                    );
                }
            );
            return labels;
        };

        $scope.getDrugList = function (query) {
            return treatmentService.search(query);
        };

        $scope.onDrugSelected = function(index, uuid) {
            if ($scope.searchResults) {
               var drugs = $scope.searchResults.filter(
                   function (record) {
                       return record.uuid === uuid;
                   }
               );
               if (drugs.length > 0) {
                   var selectedDrug = $scope.selectedDrugs[index];
                   var chosenDrug = drugs[0];
                   selectedDrug.name = chosenDrug.name;
                   selectedDrug.uuid = chosenDrug.uuid;
                   selectedDrug.strength = chosenDrug.doseStrength + " " + chosenDrug.units;
               }
            }

        }

        $scope.dosageFrequencyAnswers = $scope.dosageFrequencyConfig.results[0].answers;
        $scope.dosageInstructionAnswers = $scope.dosageInstructionConfig.results[0].answers;


    }])

    .directive('myAutocomplete', function ($parse) {
        return function (scope, element, attrs) {
            var ngModel = $parse(attrs.ngModel);
            element.autocomplete({
                autofocus: true,
                minLength: 2,
                source: function (request, response) {
                    var args = angular.fromJson(attrs.myAutocomplete);
                    scope[args.src](request.term).success(function (data) {
                        var results = scope[args.responseHandler](data);
                        response(results);
                    });
                },
                select: function (event, ui) {
                    var args = angular.fromJson(attrs.myAutocomplete);
                    scope.$apply(function () {
                        ngModel.assign(scope, ui.item.value);
                        scope.$eval(attrs.ngChange);
                        if (args.onSelect != null && scope[args.onSelect] != null) {
                            scope[args.onSelect](args.index, ui.item.lookup);
                        }
                    });
                    return true;
                },
                search: function (event) {
                    var searchTerm = $.trim(element.val());
                    if (searchTerm.length < 2) {
                        event.preventDefault();
                    }
                }
            });
        }
    });

'use strict';

angular.module('bahmni.registration.emergency')
    .controller('CreateEmergencyPatientController', [ '$rootScope', '$scope', '$location', 'patient', 'patientService', 'encounterService', 'Preferences', 'spinner', 'appService', 'sessionService',
    function ($rootScope, $scope, $location, patientModel, patientService, encounterService, preferences, spinner, appService, sessionService) {

        var init = function(){
            $scope.patient = patientModel.create();
            $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
            var identifierPrefix = $scope.identifierSources.filter(function (identifierSource) {
                return identifierSource.prefix === preferences.identifierPrefix;
            });

            $scope.patient.identifierPrefix = identifierPrefix[0] || $scope.identifierSources[0];
            $scope.showMiddleName = appService.getAppDescriptor().getConfigValue("showMiddleName");
            var constants = Bahmni.Registration.Constants;
            var visitTypeUuid = $scope.regEncounterConfiguration.visitTypes[constants.visitType.emergency];
            $scope.encounter = {visitTypeUuid: visitTypeUuid, observations: []};
            $scope.addressLevels = [{name: "Village", addressField: "cityVillage", required: false}];
        };
        init();

        var createPatient = function() {
            return patientService.generateIdentifier($scope.patient)
                .then(function (data) {
                    var patient = $scope.patient;
                    patient.identifier = data.data;
                    patient.givenName = patient.givenName || "Unknown";
                    patient.middleName = patient.middleName;
                    patient.familyName = patient.familyName || "Unknown";
                    patient.address.cityVillage = patient.address.cityVillage || "Unknown";
                    return patientService.create(patient);
                }).then(successCallback);
        };

        var setPreferences = function() {
            preferences.identifierPrefix = $scope.patient.identifierPrefix.prefix;
        };

        var successCallback = function(response) {
            var patient = response.data.patient;
            $scope.patient.uuid = patient.uuid;
            $scope.patient.identifier = patient.identifiers[0].identifier;
            $scope.patient.name = patient.person.names[0].display;
            setPreferences();
            patientService.rememberPatient($scope.patient);
        };

        var createVisit = function() {
            $scope.encounter.patientUuid = $scope.patient.uuid;
            $scope.encounter.locationUuid = sessionService.getLoginLocationUuid();
            return encounterService.create($scope.encounter).success(function() {
                $location.path("/summary");
            });
        };

        $scope.create = function(){
            spinner.forPromise(createPatient().then(createVisit));
        };
    }]);

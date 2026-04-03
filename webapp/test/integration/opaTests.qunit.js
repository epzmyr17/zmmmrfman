/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/globe/MRF_Manage/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
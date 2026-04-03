sap.ui.define([
	"com/globe/MRF_Manage/model/constant"
], function (Constant) {
	"use strict";

	return {

		/**
		 * Build a URL for fiori access.
		 * @param {string} sSemObjName Contains the semantic object name.
		 * @param {string} sNavName Contains the route name.
		 * @return {date} Returns date in UTC format.
		 * @public
		 */
		fnBuildFioriAccessURL: function (sSemObjName, sRouteName) {
			var sOriginURL = document.location.origin;
			var sPathName = document.location.pathname;
			var sHash = sSemObjName + "&/" + sRouteName;

			return sOriginURL + sPathName + "/" + sHash;
		}
	};
});
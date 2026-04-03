sap.ui.define([
	"com/globe/MRF_Manage/controller/BaseController",
	"com/globe/MRF_Manage/model/constant"
], function (BaseController, Constant) {
	"use strict";

	/**
	 * Controller for unknown pages.
	 * @class
	 * @extends com.globe.MRF_Manage.controller.BaseController
	 * @constructor
	 * @public
	 * @author Takao Baltazar (VE210015)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.MRF_Manage.controller.NotFound
	 */
	return BaseController.extend("com.globe.MRF_Manage.controller.NotFound", /** @lends com.globe.MRF_Manage.controller.NotFound */ {

		/** 
		 * Initializes the display.
		 * @public
		 */
		onInit: function () {
			// var oTarget = this.getRouter().getTarget("NotFound");

			// oTarget.attachDisplay(function (oEvent) {
			// 	this._oData = oEvent.getParameter("data"); // store the data
			// }, this);
		},

		/** 
		 * Override the parent's onNavBack (inherited from BaseController).
		 * @returns {void} Returns void to shortcircuit flow.
		 * @public
		 */
		onPressLink: function () {
			this.fnNavigateToReport(Constant.ROUTE_REPORT);
		}
	});
});
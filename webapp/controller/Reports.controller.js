sap.ui.define([
	"com/globe/MRF_Manage/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/globe/MRF_Manage/model/formatter",
	"sap/ui/model/Sorter",
	"com/globe/MRF_Manage/model/constant",
	"com/globe/MRF_Manage/model/models",
	"sap/ui/export/Spreadsheet"
], function (BaseController, JSONModel, Filter, FilterOperator, Formatter, Sorter, Constant, Model, Spreadsheet) {
	"use strict";

	/**
	 * Report controller for the object header, and table layout.
	 * @class
	 * @extends com.globe.MRF_Manage.controller.BaseController
	 * @constructor
	 * @public
	 * @author Takao Baltazar (VE210015)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.MRF_Manage.controller.Reports
	 */
	return BaseController.extend("com.globe.MRF_Manage.controller.Reports", /** @lends com.globe.MRF_Manage.controller.Reports */ {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the detail controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit: function () {
			this._fnLoadInitModel();
			this.getRouter().getRoute("Reports").attachPatternMatched(this.onRouteMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @public
		 */
		onRouteMatched: function (oEvent) {
			this.fnInitConfigModel();
			this._fnSetDefaultTab();
			this._fnRebindTable();
			this._refreshBinding();

			this.setBusyDialogOn();
			// Get Reference List (province, city, barangay) for exporting file
			var that = this;
			var aReferenceList = this.getView().getModel("StaticModel").getProperty("/ReferenceList");
			if (aReferenceList.length > 0) {
				this.setBusyDialogOff();
			} else {
				this.getView().getModel("StaticModel").setData(Model.createStaticModel());
				this.fnGetReferenceList().then(function (oResult) {
					that.getOwnerComponent().getModel("StaticModel").setProperty("/ReferenceList", oResult.results);
					that.setBusyDialogOff();
				});
			}
		},

		/**
		 * Event handler when Add MRF button is pressed.
		 * @param {object} oEvent Contains the event object of the button.
		 */
		onPressAddMRF: function (oEvent) {
			this.setBusyDialogOn();
			this.getRouter().navTo("CreateMRF", false);
		},

		/**
		 * Clears the data in Filter Bar fields.
		 */
		onClearFilter: function () {
			var oModel = this.getView().getModel("ReportFilter");
			var oProp = oModel.getProperty("/");
			for (var oItem in oProp) {
				if (oItem !== "sortType") {
					oProp[oItem] = null;
				}
			}
			oModel.setProperty("/", oProp);

			// Rebind table
			this._fnRebindTable();
		},

		/**
		 * Toggle the sorting of record in table for CreateOn field.
		 */
		onClickSort: function () {
			var oModelProp = this.getView().getModel("ReportFilter");
			var bSortType = oModelProp.getProperty("/sortType") ? false : true;

			oModelProp.setProperty("/sortType", bSortType);

			// Rebind table
			this._fnRebindTable();
		},

		/**
		 * Export data of smart table to excel format.
		 * @param {object} oEvent Contains the button event object.
		 */
		onPressExport: function (oEvent) {
			var oContext = this;
			var oSettings = null;
			var aMatrItem = this.getModel("reportMRF").getProperty("/");
			var aReportItem = [];

			// Flat table - Merge of Header and Line Items for export
			aMatrItem.forEach(function (oHeaderItem) {
				oHeaderItem.NavTo_MRFHeader_Items.results.forEach(function (oLineItem) {
					oLineItem.Status = oHeaderItem.Status;
					oLineItem.Atwrt = oHeaderItem.Atwrt;
					oLineItem.DelivModeDesc = oHeaderItem.DelivModeDesc;
					oLineItem.Instructions = oHeaderItem.Instructions;
					oLineItem.Justification = oHeaderItem.Justification;
					oLineItem.PurposeDesc = oHeaderItem.PurposeDesc;
					oLineItem.ChargeToDesc = oHeaderItem.ChargeToDesc;
					oLineItem.OpexDesc = oHeaderItem.OpexDesc;
					oLineItem.Wbs = oHeaderItem.Wbs;
					oLineItem.Kostl = oHeaderItem.Kostl;
					oLineItem.Aufnr = oHeaderItem.Aufnr;
					oLineItem.Saknr = oHeaderItem.SaknrDesc;
					oLineItem.Subsidy = oHeaderItem.Subsidy;
					oLineItem.Werks = oHeaderItem.Werks;
					oLineItem.ReceiveSLoc = oHeaderItem.ReceiveSLoc;
					oLineItem.HeaderDelivaddress = oHeaderItem.Delivaddress;
					oLineItem.HeaderContactperson = oHeaderItem.Contactperson;
					// Start of insert by MS223343 - PAL-2024-005
					oLineItem.HeaderEmployeeIdNum = oHeaderItem.EmployeeIdNum;
					// End of insert by MS223343 - PAL-2024-005
					oLineItem.HeaderContactnumber = oHeaderItem.Contactnumber;
					oLineItem.HeaderProvinceDesc = oHeaderItem.ProvinceDesc;
					oLineItem.HeaderCityDesc = oHeaderItem.CityDesc;
					oLineItem.HeaderBarangayText = oHeaderItem.BarangayText;
					oLineItem.HeaderEmail = oHeaderItem.Email;
					oLineItem.OthContName = oHeaderItem.OthContName;
					oLineItem.OthContNumber = oHeaderItem.OthContNumber;
					oLineItem.OthEmail = oHeaderItem.OthEmail;
					oLineItem.IsMultiple = oHeaderItem.IsMultiple;
					oLineItem.Requestor = oHeaderItem.Requestor;
					oLineItem.CreatedBy = oHeaderItem.CreatedBy;
					oLineItem.ChangedOn = oHeaderItem.ChangedOn;
					oLineItem.TimeChanged = oContext.formatter.formatMStoTime(oHeaderItem.TimeChanged.ms);
					aReportItem.push(oLineItem);
				});
				// If no material item, push directly the header.
				if (oHeaderItem.NavTo_MRFHeader_Items.results.length <= 0) {
					aReportItem.push(oHeaderItem);
				}
			});

			oSettings = {
				workbook: {
					columns: Model.createReportExportColumnModel.call(this)
				},
				dataSource: aReportItem,
				fileName: this.getResourceBundle().getText("mrfExort")
			};

			new Spreadsheet(oSettings)
				.build()
				.then(function () {
					// Insert post work here if applicable
				});
		},

		/**
		 * Event handler when MRF ID link is pressed.
		 * @param {object} oEvent Contains the event object of the link.
		 */
		onPressMRFRequest: function (oEvent) {
			var oSource = oEvent.getSource();
			var oParams = oSource.getBindingContext().getObject();

			this.setBusyDialogOn();
			this.getRouter().navTo("EditMRF", {
				MRFId: oParams.Recnum
			}, false);
		},

		/**
		 * Trigger a rebind of smart table after a selection of icon tab bar.
		 * @param {object} oEvent Contains the event object of icon tab bar.
		 */
		onSelectTabStatus: function (oEvent) {
			var sKey = oEvent.getParameter("selectedKey");
			var oModel = this.getView().getModel("ReportFilter");

			// Clear status model
			oModel.setProperty("/status", null);

			// Rebind table
			this._fnRebindTable();
		},

		/**
		 * Trigger a rebind of smart table after an event click in filter bar area.
		 * @param {object} oEvent Contains the event object of control.
		 */
		onChangeFilterBar: function (oEvent) {
			var oModelProp = this.getView().getModel("ReportFilter").getProperty("/");
			if (oEvent.getSource().getMetadata() === "sap.m.DateRangeSelection" && !oModelProp.date) {
				return;
			}

			// Rebind table
			this._fnRebindTable();
		},

		/**
		 * Event handler when data is received after binding of table control.
		 * @param {object} oEvent Contains the object and received data of table control.
		 */
		onDataReceivedTable: function (oEvent) {
			var oParams = oEvent.getParameter("data");
			var aItem = jQuery.isEmptyObject(oParams) ? 0 : oParams.results;
			var oModelConfig = this.getView().getModel("viewConfig");
			oModelConfig.setProperty("/editable", aItem.length > 0 ? true : false);

			// Create local model for the received data
			this._createLocalModel(aItem);
		},

		/**
		 * Event handler for standard event of table when data is recevied after binding of table control.
		 * @param {object} oEvent Contains the object and received data of table control.
		 */
		onUpdateFinished: function (oEvent) {
			var iTotal = oEvent.getParameter("total");

			// Update view config model
			this.getModel("viewConfig").setProperty("/lineItemCount", iTotal);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Load local json model
		 * @private
		 */
		_fnLoadInitModel: function () {
			var oModel = Model.createReportFilterModel();

			this.getView().setModel(oModel, "ReportFilter");
			this.getView().bindElement("ReportFilter>/");
		},

		/**
		 * Create a local json model to handle line items data
		 * @param {object} aItem Contains the received data from Smart table.
		 * @private
		 */
		_createLocalModel: function (aItem) {
			var aItemPayload = aItem === 0 ? [] : aItem;
			var oModel = new JSONModel(aItemPayload);
			this.getView().setModel(oModel, "reportMRF");
			this.getView().bindElement("reportMRF>/");
		},

		/**
		 * Rebind Table for filter and sorting.
		 * @private
		 */
		_fnRebindTable: function () {
			var oTable = this.byId("idSmartTableReport");
			var aFilters = this._fnCreateFilter();
			var sTabName = this._fnGetCurrentTab();
			var sSortType = this._fnGetSelectedSort();

			// Filter the search help status
			this._fnFilterStatusSearchHelp(sTabName);

			// Filter smart table
			this._fnFilterSmartTable(aFilters, oTable);
			// Sort smart table
			this._fnSortSmartTable(sSortType, oTable);
		},

		/**
		 * Create a filter according to the define parameters in filter bar area and selected icon tab bar.
		 * @private
		 */
		_fnCreateFilter: function () {
			var oModelProp = this.getView().getModel("ReportFilter").getProperty("/");
			var aFilters = [];

			// Reference no. value
			if (oModelProp.refNo) {
				aFilters.push(new Filter("Recnum", FilterOperator.Contains, oModelProp.refNo));
			}

			// Date value
			if (oModelProp.fromDate && oModelProp.toDate) {
				aFilters.push(new Filter("CreatedOn", FilterOperator.GE, Formatter.formatUTC(oModelProp.fromDate)));
				aFilters.push(new Filter("CreatedOn", FilterOperator.LE, Formatter.formatUTC(oModelProp.toDate)));
			}

			// Commodity value
			if (oModelProp.commodity) {
				aFilters.push(new Filter("Atwrt", FilterOperator.Contains, oModelProp.commodity));
			}

			// Status
			if (oModelProp.status) {
				aFilters.push(new Filter("Status", FilterOperator.Contains, oModelProp.status));
			} else {
				var sTabName = this._fnGetCurrentTab();
				if (sTabName !== "History") {
					aFilters.push(new Filter("Status", FilterOperator.EQ, sTabName));
				}
			}

			return aFilters;
		},

		/**
		 * Method for creating a filter to smart table.
		 * @param {array} aFilters Contains array of sap.ui.model.Filter
		 * @param {object} oSmartTableFilter Contains the instance of Smart Table.
		 * @private
		 */
		_fnFilterSmartTable: function (aFilters, oSmartTableFilter) {
			if (aFilters.length > 0) {
				oSmartTableFilter.getBinding("items").filter(
					new Filter({
						filters: aFilters,
						and: true
					})
				);
			} else {
				oSmartTableFilter.getBinding("items").filter([]);
			}
		},

		/**
		 * Method for creating a sorter to smart table.
		 * @param {string} sSortType Contains the sort type in boolean value.
		 * @param {object} oSmartTableFilter Contains the instance of Smart Table.
		 * @private
		 */
		_fnSortSmartTable: function (sSortType, oSmartTableFilter) {
			oSmartTableFilter.getBinding("items").sort(
				new Sorter("CreatedOn", JSON.parse(sSortType), false)
			);
		},

		/**
		 * Filter the 'Status' search help in filter bar area, according to the selected icon tab bar.
		 * @param {string} sKey Contains the key of selected icon tab bar.
		 * @private
		 */
		_fnFilterStatusSearchHelp: function (sKey) {
			this.byId("idSelectStatus").getBinding("items").filter(
				new Filter("RecordStatus", FilterOperator.EQ, sKey)
			);
		},

		/**
		 * Get the current selected key of icon tab bar.
		 * @private
		 */
		_fnGetCurrentTab: function () {
			var sIconTabKey = this.byId("idIconTabFilter").getSelectedKey();
			// If icon tab key is empty, we add a default.
			var sTabName = sIconTabKey ? sIconTabKey : Constant.REPORT_DEFAULT_TAB;

			return sTabName;
		},

		/**
		 * Get the current sort type in model.
		 * @private
		 */
		_fnGetSelectedSort: function () {
			var oModelProp = this.getView().getModel("ReportFilter").getProperty("/");

			return oModelProp.sortType;
		},

		/**
		 * Set selected key of Icon tab bar if value exist in component model.
		 * @private
		 */
		_fnSetDefaultTab: function () {
			var oComponentModel = this.getOwnerComponent().getModel("navTabUpdate");
			if (oComponentModel.getProperty("/currentTab")) {
				this.byId("idIconTabFilter").setSelectedKey(oComponentModel.getProperty("/currentTab"));

				// Reset the component model - currentTab property.
				oComponentModel.setProperty("/currentTab", null);
			}
		},

		/**
		 * Refresh the binding of tables and tabs.
		 * @private
		 */
		_refreshBinding: function () {
			// Refresh smart table of current tab.
			this.byId("idSmartTableReport").getBinding("items").refresh(true);

			// Refresh tab
			this.byId("idIconTabFilter").getBinding("items").refresh(true);
		}
	});
});
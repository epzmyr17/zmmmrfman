sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Group Id for OData model deffred mode
		 */
		ODATA_GROUP_ID: "REQUESTOR_GRP_ID",

		/**
		 * Requestor's semantic object name
		 */
		REQUESTOR_SEMOBJ: "#MRFManage-manage",

		/**
		 * Approver's semantic object name
		 */
		APPROVER_SEMOBJ: "#MRFApprove-manage",

		/**
		 * Report's semantic object name
		 */
		REPORT_SEMOBJ: "#MRFReport-manage",

		/**
		 * Requestor's semantic object name
		 */
		NAV_EDIT_MRF: "EditMRF",

		/**
		 * Requestor's semantic object name
		 */
		NAV_APPROVE_MRF: "Approve",

		/**
		 * Requestor's semantic object name
		 */
		NAV_REPORT_MRF: "ProcessMRF",

		/**
		 * Approver type for IS
		 */
		APPROVER_IS: "IS_APPROVER",

		/**
		 * Approver type for Division Head
		 */
		APPROVER_DIVISION_HEAD: "DIVISION_HEAD",

		/**
		 * Approver type for Group Head
		 */
		APPRVER_GROUP_HEAD: "GROUP_HEAD",

		/**
		 * Approver type for FBA
		 */
		APPROVER_FBA: "FBA",

		/**
		 * Approver type for Additional approver
		 */
		APPROVER_ADDITIONAL: "ADDITIONAL_APPROVER",

		/**
		 * Approver type for Allocator
		 */
		APPROVER_ALLOCATOR: "ALLOCATOR",

		/**
		 * Approver type for Processor
		 */
		APPROVER_PROCESSOR: "PROCESSOR",

		/**
		 * Approver sort order for commodity: Wireline, Office Supplies, and Packaging.
		 */
		APPROVER_SORT_ORDER_WOP: ["IS_APPROVER", "ADDITIONAL_APPROVER", "DIVISION_HEAD", "GROUP_HEAD", "FBA", "PROCESSOR"],

		/**
		 * Approver sort order for commodity: Lifestyle, Cards and Devices.
		 */
		APPROVER_SORT_ORDER_LCD: ["IS_APPROVER", "ADDITIONAL_APPROVER", "DIVISION_HEAD", "GROUP_HEAD", "ALLOCATOR", "FBA", "PROCESSOR"],
		
		/**
		 * Use for commodity comparison on which approver sort order to use.
		 */
		COMMODITY_LCD: ["LIFESTYLE", "CARDS", "DEVICES"],

		/**
		 * Max no. of additional approver
		 */
		MAX_ADDITIONAL_APPROVER: 10,
		
		/**
		 * Max no. of FBA approver
		 */
		MAX_ADDITIONAL_FBA: 5,

		/**
		 * Router name for Report
		 */
		ROUTE_REPORT: "Reports",

		/**
		 * Router name for Not Found
		 */
		ROUTE_NOT_FOUND: "NotFound",

		/**
		 * Smart table button ID.
		 */
		SMART_TABLE_BTN_EXPORT_ID: "-btnExcelExport",

		/**
		 * Defaul tab name of report.
		 */
		REPORT_DEFAULT_TAB: "For Actions",
		
		/**
		 * Tab name for report.
		 */
		REPORT_FOR_APPROVAL_TAB: "For Approval",
		
		/**
		 * Charging details field.
		 */
		CHARGING_DETAILS_FIELD: ["Chargeto", "Wbs", "Opex", "Aufnr", "Saknr", "Kostl", "Subsidy"],
		
		/**
		 * Limit of material item: 300
		 */
		 MAX_MATERIAL_ITEM: 300,
		 
		/**
			 * Value State: Error
			 */
			VALUE_STATE_WARNING: "Warning",

			/**
			 * Value State: None
			 */
			VALUE_STATE_NONE: "None"


	};
});
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		/**
		 * Initial local model for the create MRF controller.
		 * @return {sap.ui.model.json.JSONModel} Returns local JSON Model for Create MRF.
		 * @public
		 */
		createMRFModel: function () {
			var oPayload = {
				Werks: "",
				PlantDesc: "",
				Atwrt: "",
				Delivaddress: "",
				Delivmode: "",
				DelivModeDesc: "",
				Contactperson: "",
				Contactnumber: "",
				Email: "",
				OthContPerson: false,
				OthContNumber: "",
				OthContName: "",
				OthEmail: "",
				IsMultiple: false,
				Purpose: "",
				PurposeDesc: "",
				Justification: "",
				Instructions: "",
				Chargeto: "",
				ChargeToDesc: "",
				Opex: "",
				OpexDesc: "",
				Wbs: "",
				WbsDesc: "",
				Kostl: "",
				KostlDesc: "",
				Aufnr: "",
				OrderDesc: "",
				Saknr: "",
				SaknrDesc: "",
				Subsidy: "",
				SubsidyDesc: "",
				Status: "",
				NavTo_MRFHeader_Items: [],
				NavTo_MRFHeader_Attachment: [],
				NavTo_MRFHeader_Approver: []
			};
			return new JSONModel(oPayload);
		},

		/**
		 * Initial data model for reference list so that it will be accessible to reports and process mrf
		 */
		createStaticModel: function () {
			var staticModel = {
				ReferenceList: []
			};
			return staticModel;
		},

		/**
		 * Initial local model for the config.
		 * @return {sap.ui.model.json.JSONModel} Returns local JSON Model for Create MRF.
		 * @public
		 */
		createViewConfigModel: function () {
			var oPayload = {
				materialToolbarDelete: false,
				totalQtyAmount: 0,
				activeMultipleDeliveryAdd: true,
				editable: false,
				busy: false,
				busyDelay: 0,
				templateUrl: "/sap/public/bc/MRF/MRF_Material_Template.xlsx",
				lineItemCount: 0
			};
			return new JSONModel(oPayload);
		},

		/**
		 * Initial local model for the report filter.
		 * @return  {sap.ui.model.json.JSONModel} Returns local JSON Model for Report filter.
		 * @public
		 */
		createReportFilterModel: function () {
			var oPayload = {
				fromDate: null,
				toDate: null,
				commodity: null,
				status: null,
				sortType: true, // If false, sort is desc, else sort is asc.
				refNo: null
			};
			return new JSONModel(oPayload);
		},

		/**
		 * Initial local model use for component
		 * @return  {sap.ui.model.json.JSONModel} Returns local JSON Model for Updating the selected navigation tab.
		 * @public
		 */
		createNavTabUpdateModel: function () {
			var oPayload = {
				currentTab: null
			};
			return new JSONModel(oPayload);
		},

		/**
		 * Initial data model for the headings of reports which contains a combination of Header and Line Items.
		 * @return  {array} Returns array of data for the headings of report (Header & Line Item)
		 * @public
		 */
		createReportExportColumnModel: function () {
			var aHeadings = [{
				label: this.getResourceBundle().getText("referenceNo"),
				property: "Recnum"
			}, {
				label: this.getResourceBundle().getText("lineNumber"),
				property: "Linenum"
			}, {
				label: this.getResourceBundle().getText("storeLoc"),
				property: "Lgort"
			}, {
				label: this.getResourceBundle().getText("remarks"),
				property: "Remarks"
			}, {
				label: this.getResourceBundle().getText("materialNo"),
				property: "Matnr"
			}, {
				label: this.getResourceBundle().getText("materialDesc"),
				property: "Matnrdesc"
			}, {
				label: this.getResourceBundle().getText("qty"),
				property: "Quantity"
			}, {
				label: this.getResourceBundle().getText("amount"),
				property: "Map"
			}, {
				label: this.getResourceBundle().getText("materialAddress"),
				property: "Delivaddress"
			}, {
				label: this.getResourceBundle().getText("materialProvince"),
				property: "ProvinceDesc"
			}, {
				label: this.getResourceBundle().getText("materialCity"),
				property: "CityDesc"
			}, {
				label: this.getResourceBundle().getText("materialBarangay"),
				property: "BarangayText"
			}, {
				label: this.getResourceBundle().getText("materialContactPerson"),
				property: "Contactperson"
					// Start of insert by MS223343 - PAL-2024-005
			}, {
				label: this.getResourceBundle().getText("materialEmployeeID"),
				property: "EmployeeIdNum"
					// End of insert by MS223343 - PAL-2024-005
			}, {
				label: this.getResourceBundle().getText("materialContactNumber"),
				property: "Contactnumber"
			}, {
				label: this.getResourceBundle().getText("inStock"),
				property: "InStock"
			}, {
				label: this.getResourceBundle().getText("docLineNo"),
				property: "Doclineno"
			}, {
				label: this.getResourceBundle().getText("docoument"),
				property: "Document"
			}, {
				label: this.getResourceBundle().getText("deliveryNo"),
				property: "Vbeln"
			}, {
				label: this.getResourceBundle().getText("deliveryOrder"),
				property: "Posnr"
			}, {
				label: this.getResourceBundle().getText("docType"),
				property: "Doctype"
			}, {
				label: this.getResourceBundle().getText("materialDoc"),
				property: "Matnrdoc"
			}, {
				label: this.getResourceBundle().getText("status"),
				property: "Status"
			}, {
				label: this.getResourceBundle().getText("commodity"),
				property: "Atwrt"
			}, {
				label: this.getResourceBundle().getText("modeOfDelivery"),
				property: "DelivModeDesc"
			}, {
				label: this.getResourceBundle().getText("specialInst"),
				property: "Instructions"
			}, {
				label: this.getResourceBundle().getText("justificationOfReq"),
				property: "Justification"
			}, {
				label: this.getResourceBundle().getText("purposeOfReq"),
				property: "PurposeDesc"
			}, {
				label: this.getResourceBundle().getText("chargeTo"),
				property: "ChargeToDesc"
			}, {
				label: this.getResourceBundle().getText("opexType"),
				property: "OpexDesc"
			}, {
				label: this.getResourceBundle().getText("wbsElemCode"),
				property: "Wbs"
			}, {
				label: this.getResourceBundle().getText("costCenterCode"),
				property: "Kostl"
			}, {
				label: this.getResourceBundle().getText("ioNumberCode"),
				property: "Aufnr"
			}, {
				label: this.getResourceBundle().getText("glAccount"),
				property: "Saknr"
			}, {
				label: this.getResourceBundle().getText("subsidyCode"),
				property: "Subsidy"
			}, {
				label: this.getResourceBundle().getText("businessEntity"),
				property: "Werks"
			}, {
				label: this.getResourceBundle().getText("receivingSloc"),
				property: "ReceiveSLoc"
			}, {
				label: this.getResourceBundle().getText("createdBy"),
				property: "CreatedBy"
			}, {
				label: this.getResourceBundle().getText("requestor"),
				property: "Requestor"
			}, {
				label: this.getResourceBundle().getText("deliveryAdd"),
				property: "HeaderDelivaddress"
			}, {
				label: this.getResourceBundle().getText("provinceDesc"),
				property: "HeaderProvinceDesc"
			}, {
				label: this.getResourceBundle().getText("cityDesc"),
				property: "HeaderCityDesc"
			}, {
				label: this.getResourceBundle().getText("barangayDesc"),
				property: "HeaderBarangayText"
			}, {
				label: this.getResourceBundle().getText("contactPerson"),
				property: "HeaderContactperson"
					// Start of insert by MS223343 - PAL-2024-005
			}, {
				label: this.getResourceBundle().getText("employeeID"),
				property: "HeaderEmployeeIdNum"
					// End of insert by MS223343 - PAL-2024-005
			}, {
				label: this.getResourceBundle().getText("contactNumber"),
				property: "HeaderContactnumber"
			}, {
				label: this.getResourceBundle().getText("emailAddress"),
				property: "HeaderEmail"
			}, {
				label: this.getResourceBundle().getText("alternateContactName"),
				property: "OthContName"
			}, {
				label: this.getResourceBundle().getText("alternateContactNumber"),
				property: "OthContNumber"
			}, {
				label: this.getResourceBundle().getText("alternateContactEmail"),
				property: "OthEmail"
			}, {
				label: this.getResourceBundle().getText("multipleAdd"),
				property: "IsMultiple"
			}, {
				label: this.getResourceBundle().getText("changedOn"),
				property: "ChangedOn",
				type: "Date"
			}, {
				label: this.getResourceBundle().getText("timeChanged"),
				property: "TimeChanged"
			}];

			return aHeadings;
		}
	};
});
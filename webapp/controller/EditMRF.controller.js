sap.ui.define([
	"com/globe/MRF_Manage/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/globe/MRF_Manage/model/formatter",
	"com/globe/MRF_Manage/model/validator",
	"com/globe/MRF_Manage/model/constant",
	"com/globe/MRF_Manage/model/models",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, Formatter, Validator, Constant, Model, Filter, FilterOperator) {
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
	 * @name com.globe.MRF_Manage.controller.EditMRF
	 */
	return BaseController.extend("com.globe.MRF_Manage.controller.EditMRF", /** @lends com.globe.MRF_Manage.controller.EditMRF */ {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit: function () {
			this.getRouter().getRoute("EditMRF").attachPatternMatched(this.onRouteMatched, this);
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
			this._sMrfId = oEvent.getParameter("arguments").MRFId;

			// Init config model.
			this.fnInitConfigModel();
			this.fnAttachedDefferedModel();

			// Check first if metadata has been loaded before executing bind element.
			this.getModel().metadataLoaded().then(function () {
				this._sPath = this._fnCreateMRFHeaderKey();
				// Add forward slash to the path
				this._sPath = "/" + this._sPath;
				this._bindView(this._sPath);
				this._createMaintenanceEnties();
				this._fnNavigateToSection("idGeneralInfoSection");
				this.fnRemoveMsgManager();
				this.fnInitMsgManager();
			}.bind(this));

			// Open busy dialog.
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
		 * Event handler when home link is click on breadcrumbs
		 */
		onPressHome: function () {
			this.fnNavigateToReport(Constant.ROUTE_REPORT);
		},

		/**
		 * Execute a Promise chain to read the file and trigger an OData service to validate the material no.
		 * @private
		 */
		onUploadMaterial: function () {
			this.setBusyDialogOn();
			this.fnReadFile()
				.then(this.fnReadBinaryXLSX.bind(this))
				.then(this.fnValidateHeaderMatrImport.bind(this))
				.then(this.fnRequestValidateMatr.bind(this))
				.then(this.fnRequestSubmitChanges.bind(this))
				.then(this.fnSuccessSubmit.bind(this))
				.then(this.fnProcessData.bind(this))
				.then(this._fnCheckMatrData.bind(this))
				.then(this.setBusyDialogOff.bind(this))
				.catch(this.fnCatchRequestError.bind(this));
		},

		/**
		 * Event handler to delete single material in table.
		 * @param {object} Contains the event object of button.
		 */
		onDeleteMatr: function (oEvent) {
			var oSelecteItem = oEvent.getParameter("listItem");
			var oContextModel = this.fnGetBindingContext(oSelecteItem);
			var oContextPayload = oContextModel.getObject();

			// Trigger delete material
			this.onDeletetMaterial(oEvent);

			// Add to delete maintenance queue
			if (this._fnCheckItemExistInServer(oContextPayload)) {
				this.aDeleteMatrMaint.push(oContextPayload);
			}
		},

		onDelete: function () {

			var oModel = this.getView().byId("idSelectedMaterialTable").getModel("editMRF");
			var oTable = this.getView().byId("idSelectedMaterialTable");

			// delete multi selected items
			var aSelectedItems = oTable.getSelectedIndices();
			aSelectedItems.sort(function (a, b) {
				return b - a;
			});
			var oPayload = oModel.getProperty("/");
			// Start of insert - MS223343 - INC0976359
			var that = this;
			// End of insert - MS223343 - INC0976359
			aSelectedItems.filter(function (iIdx) {
				// Start of insert - MS223343 - INC0976359
				var oSelected = oPayload.NavTo_MRFHeader_Items[iIdx];
				if (that._fnCheckItemExistInServer(oSelected)) {
					that.aDeleteMatrMaint.push(oSelected);
				}
				// End of insert - MS223343 - INC0976359
				oPayload.NavTo_MRFHeader_Items.splice(iIdx, 1);
			});
			oTable.clearSelection();

			// delete single selection
			// var iIdx = oTable.getSelectedIndex();
			// var oPayload = oModel.getProperty("/");
			// var oSelected = oPayload.NavTo_MRFHeader_Items[iIdx];
			// oPayload.NavTo_MRFHeader_Items.splice(iIdx, 1);
			//var aItems = oModel.getProperty("/NavTo_MRFHeader_Items");
			//aItems.splice(iIdx, 1);
			//oModel.setProperty("/NavTo_MRFHeader_Items", aItems);
			oModel.setProperty("/", oPayload);

			// Update total amount
			this.fnTotalMatrQty();

			oTable.getModel("editMRF").refresh();
			oModel.refresh(true);

			// Start of delete - MS223343 - INC0976359
			// if (this._fnCheckItemExistInServer(oSelected)) {
			// 	this.aDeleteMatrMaint.push(oSelected);
			// }
			// End of delete - MS223343 - INC0976359
		},

		/**
		 * Event handler to delete single approver in table.
		 * @param {object} Contains the event object of button.
		 */
		onDeleteApv: function (oEvent) {
			var oSource = oEvent.getSource();
			var oContextModel = this.fnGetBindingContext(oSource);
			var oContexPayload = oContextModel.getObject();

			// Trigger delete approver
			this.onDeletetApproval(oEvent);

			// Add to delete maintenance queue
			if (this._fnCheckItemExistInServer(oContexPayload)) {
				this.aDeleteApvrMaint.push(oContexPayload);
			}
		},

		/**
		 * Event handler when field value is changed for 'input' or 'select' element.
		 * @param {object} oEvent Contains event object of control.
		 */
		onChangeFieldValue: function () {
			this.fnRemoveMsgManager();
			var aValidateGeneralInfo = Validator.fnValidateForm(this.byId("idSimpleFormGeneralInfo"), this);
			var aValidateDeliveryInfo = Validator.fnValidateForm(this.byId("idSimpleFormDeliveryInfo"), this);
			var bIsValidateApprover = this.fnValidateApprovers();
			var bIsValidateMaterial = this._fnValidateMaterials();
			var bIsValidatedMsgManager = this.fnCheckMsManager();

			if (aValidateGeneralInfo.length > 0 || aValidateDeliveryInfo.length > 0 || !bIsValidateApprover || !bIsValidateMaterial || !
				bIsValidatedMsgManager) {
				this.byId("idSubmitBtn").setEnabled(false);
			} else {
				this.byId("idSubmitBtn").setEnabled(true);
			}
		},

		/**
		 * Event handler after selecting a file in file uploader control
		 * @param {object} oEvent Contains event object of file uploader.
		 */
		onFileSelect: function (oEvent) {
			var oModel = this.fnGetContextModel();
			var oPayload = oModel.getProperty("/");
			var oFile = oEvent.getParameter("files")[0];
			var iIndexFound = -1;
			if (oFile) {
				var oParam = {
					FileName: oFile.name,
					file: oFile,
					FileSize: Formatter.fnFormatBytes(oFile.size),
					Icon: Formatter.fnFormatFileIcon(oFile.type),
					MimeType: oFile.type
				};
				// Check if file is existing in local model.
				oPayload.NavTo_MRFHeader_Attachment.forEach(function (oItem, iIdx) {
					if (oItem.FileName === oParam.FileName) {
						iIndexFound = iIdx;
						return;
					}
				});
				// If file is existing, replace the file. Otherwise, push to array.
				if (iIndexFound > -1) {
					this.showMsgBoxConfirm(this.getResourceBundle().getText("confirmReplaceFile", [oParam.FileName]))
						.then(function () {
							var aDeletedItem = oPayload.NavTo_MRFHeader_Attachment.splice(iIndexFound, 1, oParam);
							oModel.setProperty("/", oPayload);
							oModel.refresh(true);

							// Add to delete maintenance queue
							if (this._fnCheckItemExistInServer(aDeletedItem[0])) {
								this.aDeleteFileMaint.push(aDeletedItem[0]);
							}
						}.bind(this));
				} else {
					oPayload.NavTo_MRFHeader_Attachment.push(oParam);
					oModel.setProperty("/", oPayload);
					oModel.refresh(true);
				}
			}
		},

		/**
		 * Event handler when delete item is clicked in attachment section.
		 * @param {object} oEvent Contains event object of Custom List Item delete button.
		 */
		onFileDeleted: function (oEvent) {
			var oListItem = oEvent.getParameter("listItem");
			var iIndexOfItem = this.byId("idAttachmentList").indexOfItem(oListItem);
			var sPath = oListItem.getBindingContextPath();
			var oContextModel = this.fnGetBindingContext(oListItem);
			var oContextParam = oContextModel.getObject();
			var oModel = this.fnGetContextModel();
			var oProp = oModel.getProperty("/");

			this.showMsgBoxConfirm(this.getResourceBundle().getText("confirmDeleteFile", [oContextParam.FileName]))
				.then(function () {
					var aDeletedItem = oProp.NavTo_MRFHeader_Attachment.splice(iIndexOfItem, 1);
					oModel.setProperty("/", oProp);
					oModel.refresh(true);

					// Add to delete maintenance queue
					if (this._fnCheckItemExistInServer(aDeletedItem[0])) {
						this.aDeleteFileMaint.push(aDeletedItem[0]);
					}
				}.bind(this));
		},

		/**
		 * Opens a url to download the attachment.
		 * @param {object} oEvent Contains the event object of Link.
		 */
		onOpenAttachment: function (oEvent) {
			var oSource = oEvent.getSource();
			var oContextModel = this.fnGetBindingContext(oSource);
			var oContextProp = oContextModel.getObject();
			var sServiceURL = this.getView().getModel().sServiceUrl;
			var sKey = this.getModel().createKey("AttachmentSet", {
				Recnum: oContextProp.Recnum,
				Linenum: oContextProp.Linenum,
				AttachType: oContextProp.AttachType
			});
			var sServiceFile = sServiceURL.concat("/", sKey, "/$value");

			sap.m.URLHelper.redirect(sServiceFile, false);
		},

		/**
		 * Event handler when switch of alternate contact person is clicked.
		 * @param {object} oEvent Contains the switch event handler.
		 */
		onPressAlternateContact: function (oEvent) {
			var oSource = oEvent.getSource();
			var oModel = oSource.getModel();
			var sPath = oSource.getBindingContext().getPath();

			oModel.setProperty(sPath + "/OthContName", "");
			oModel.setProperty(sPath + "/OthContNumber", "");
			oModel.setProperty(sPath + "/OthEmail", "");

			// Special case: We need to manually remove the value of Other Email on Input control.
			this.byId("idOtherEamil").setValue("");

			// Validate fields
			this.onChangeFieldValue();
		},

		/**
		 * Event handler to update local model for any Select / Combo Box element.
		 * @param {object} oEvent Contains Combo Box / Select event object.
		 */
		onAddComboBoxDesc: function (oEvent) {
			var oSource = oEvent.getSource();
			var sSelectItem = oSource.getSelectedItem().getProperty("text");
			var sCustomDataField = oSource.data("control_field_desc");
			var oModel = oSource.getModel();

			if (sCustomDataField === "DelivModeDesc") {
				if (sSelectItem === "Rush Delivery") {
					// Start of change MS223343 - Add warning message
					oSource.setValueStateText(this.getResourceBundle().getText("warningDelivModeRush"));
					oSource.setValueState(Constant.VALUE_STATE_WARNING);
				} else if (sSelectItem === "Pickup") {
					oSource.setValueStateText(this.getResourceBundle().getText("warningDelivModePickup"));
					oSource.setValueState(Constant.VALUE_STATE_WARNING);
					// End of change MS223343 - Add warning message
				} else {
					oSource.setValueState(Constant.VALUE_STATE_NONE);
					//oControl.setValueStateText("Info info info");
				}
			}

			if (sCustomDataField === "PurposeDesc") {
				if (sSelectItem === "Warehouse to Warehouse" || sSelectItem === "Warehouse to Contractor") {
					oSource.setValueStateText(this.getResourceBundle().getText("warningPurpose"));
					oSource.setValueState(Constant.VALUE_STATE_WARNING);

				} else {
					oSource.setValueState(Constant.VALUE_STATE_NONE);
				}
			}

			oModel.setProperty(this._sPath + "/" + sCustomDataField, sSelectItem);
			this.onChangeFieldValue();
		},

		/**
		 * Event handler to reset different fields according to selected value in charging details.
		 * @param {object} oEvent Contains event object of control.
		 */
		onChangeChargeOpex: function (oEvent) {
			var sType = oEvent.getSource().data("type");
			var oModel = this.getView().getModel();

			if (sType === "charge") {
				// Reset only Open Type dropdown if source control is Charge To.
				oModel.setProperty(this._sPath + "/Opex", "");
				oModel.setProperty(this._sPath + "/OpexDesc", "");
			}
			oModel.setProperty(this._sPath + "/Wbs", "");
			oModel.setProperty(this._sPath + "/WbsDesc", "");
			oModel.setProperty(this._sPath + "/Kostl", "");
			oModel.setProperty(this._sPath + "/KostlDesc", "");
			oModel.setProperty(this._sPath + "/Aufnr", "");
			oModel.setProperty(this._sPath + "/OrderDesc", "");
			oModel.setProperty(this._sPath + "/Subsidy", "");
			oModel.setProperty(this._sPath + "/SubsidyDesc", "");
			oModel.setProperty(this._sPath + "/Saknr", "");
			oModel.setProperty(this._sPath + "/SaknrDesc", "");

			this.onAddComboBoxDesc(oEvent);
		},

		/**
		 * Event handler to reset Receiving Sloc.
		 * @param {object} oEvent Contains event object of control.
		 */
		onChangePurposeOfReq: function (oEvent) {
			var oModel = this.getView().getModel();
			var sPurposeOfReq = oModel.getProperty(this._sPath + "/Purpose");

			// Reset Receiving SLoc if != 'Warehouse to Contractor' or 'Warehouse to Warehouse'.
			if (sPurposeOfReq !== 'WC' && sPurposeOfReq !== 'WW') {
				oModel.setProperty(this._sPath + "/ReceiveSLoc", "");
			}

			this.onAddComboBoxDesc(oEvent);
		},

		/**
		 * Event handler to change value of input control and update local model payload.
		 * This method will use by wbs, cost center, io number, and subsidy.
		 * @param {object} oEvent Contains event handler of select dialog.
		 */
		onAddChargeDetails: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var oParam = oSelectedItem.getBindingContext("F4DropdownMRF").getObject();
			var oCustomData = oEvent.getSource().data();
			var oModel = this.getView().getModel();

			oModel.setProperty(this._sPath + "/" + oCustomData.control_field, oParam[oCustomData.search_field]);
			oModel.setProperty(this._sPath + "/" + oCustomData.control_field_desc, oParam[oCustomData.search_field_desc]);
			this.onChangeFieldValue();
		},

		/**
		 * Event handler for changing province
		 * @param {object} oEvent Contains button event object
		 * @public
		 */
		onAddItemDialog: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var oParam = oSelectedItem.getBindingContext("F4DropdownMRF").getObject();
			var oCustomData = oEvent.getSource().data();

			var oModel = this.getView().getModel();
			var oEditModel = this.fnGetContextModel();

			if (oModel.getProperty(this._sPath + "/IsMultiple")) {
				var oBindingContext = this.fnGetBindingContext(this._inputCtrl);
				var sPath = oBindingContext.getPath();
				var oPayload = oBindingContext.getObject();

				oPayload[oCustomData.control_field] = oParam[oCustomData.control_field];
				oPayload[oCustomData.control_field_desc] = oParam[oCustomData.control_field_desc];

				if (oCustomData.control_field === "ProvinceCode") {
					oPayload.CityCode = "";
					oPayload.CityDesc = "";
					oPayload.BarangayCode = "";
					oPayload.BarangayText = "";
				}
				if (oCustomData.control_field === "CityCode") {
					oPayload.ZipCode = "";
					oPayload.BarangayCode = "";
					oPayload.BarangayText = "";
					oPayload.ProvinceCode = oParam.ProvinceCode;
					oPayload.ProvinceDesc = oParam.ProvinceDesc;
				}
				if (oCustomData.control_field === "BarangayCode") {
					oPayload.ZipCode = oParam.ZipCode;
					oPayload.CityCode = oParam.CityCode;
					oPayload.CityDesc = oParam.CityDesc;
					oPayload.ProvinceCode = oParam.ProvinceCode;
					oPayload.ProvinceDesc = oParam.ProvinceDesc;
				}

				oEditModel.setProperty(sPath, oPayload);
				this.onChangeFieldValue();
			} else {
				if (oCustomData.control_field === "ProvinceCode") {
					oModel.setProperty(this._sPath + "/CityCode", "");
					oModel.setProperty(this._sPath + "/CityDesc", "");
					oModel.setProperty(this._sPath + "/BarangayCode", "");
					oModel.setProperty(this._sPath + "/BarangayText", "");
				}
				if (oCustomData.control_field === "BarangayCode") {
					oModel.setProperty(this._sPath + "/ZipCode", oParam.ZipCode);
					oModel.setProperty(this._sPath + "/CityCode", oParam.CityCode);
					oModel.setProperty(this._sPath + "/CityDesc", oParam.CityDesc);
					oModel.setProperty(this._sPath + "/ProvinceCode", oParam.ProvinceCode);
					oModel.setProperty(this._sPath + "/ProvinceDesc", oParam.ProvinceDesc);
					//oPayload.ZipCode = oSelectedParam.ZipCode;
					//oPayload.CityCode = oSelectedParam.CityCode;
					//oPayload.CityDesc = oSelectedParam.CityDesc;
					//oPayload.ProvinceCode = oSelectedParam.ProvinceCode;
					//oPayload.ProvinceDesc = oSelectedParam.ProvinceDesc;
				}
				if (oCustomData.control_field === "CityCode") {
					oModel.setProperty(this._sPath + "/ZipCode", "");
					oModel.setProperty(this._sPath + "/BarangayCode", "");
					oModel.setProperty(this._sPath + "/BarangayText", "");
					oModel.setProperty(this._sPath + "/ProvinceCode", oParam.ProvinceCode);
					oModel.setProperty(this._sPath + "/ProvinceDesc", oParam.ProvinceDesc);
					//oPayload.ZipCode = "";
					//oPayload.BarangayCode = "";
					//oPayload.BarangayText = "";
					//oPayload.ProvinceCode = oSelectedParam.ProvinceCode;
					//oPayload.ProvinceDesc = oSelectedParam.ProvinceDesc;
				}
				oModel.setProperty(this._sPath + "/" + oCustomData.control_field, oParam[oCustomData.control_field]);
				oModel.setProperty(this._sPath + "/" + oCustomData.control_field_desc, oParam[oCustomData.control_field_desc]);
			}

			this.onChangeFieldValue();
		},

		/**
		 * Event handler to open any select dialog with filter.
		 * @param {object} oEvent Contains button value help event object.
		 * @public
		 * Use for dialog of province, city and barangay
		 */
		onOpenDialogFilter: function (oEvent) {
			var oCustomData = oEvent.getSource().data();
			if (!this[oCustomData.variable_name]) {
				// We use the id of a view, to get an instance of control inside a framgnet.
				this[oCustomData.variable_name] = sap.ui.xmlfragment(this.getView().getId(),
					"com.globe.MRF_Manage.fragment.Dialogs." + oCustomData.fragment_name, this);
				this.getView().addDependent(this[oCustomData.variable_name]);
				// Add max length to select dialog
				this.fnSetSelectDialogMaxLength(this[oCustomData.variable_name], oCustomData.searchfield_maxlength);
			}
			// Save Instance
			this._inputCtrl = oEvent.getSource();

			// Filter of province and city base selected values
			var oFilter = [];

			var oContextModel = this.getView().getModel();
			var oPayload = oContextModel.getProperty(this._sPath);
			if (oPayload.IsMultiple) {
				var oContextModel2 = this.fnGetBindingContext(this._inputCtrl);
				var oContextParam = oContextModel2.getObject();
				oFilter = [];
				if (oCustomData.fragment_name === "ListOfCity") {
					if (oContextParam.ProvinceDesc) {
						oFilter.push(new Filter("ProvinceCode", FilterOperator.EQ, oContextParam.ProvinceCode));
					}
				} else if (oCustomData.fragment_name === "ListOfBarangay") {
					if (oContextParam.CityDesc) {
						oFilter.push(new Filter("CityCode", FilterOperator.EQ, oContextParam.CityCode));
					}
					if (oContextParam.ProvinceDesc) {
						oFilter.push(new Filter("ProvinceCode", FilterOperator.EQ, oContextParam.ProvinceCode));
					}
				}
			} else {
				if (oCustomData.fragment_name === "ListOfCity") {
					if (oPayload.ProvinceDesc) {
						oFilter.push(new Filter("ProvinceCode", FilterOperator.EQ, oPayload.ProvinceCode));
					}
				} else if (oCustomData.fragment_name === "ListOfBarangay") {
					if (oPayload.CityDesc) {
						oFilter.push(new Filter("CityCode", FilterOperator.EQ, oPayload.CityCode));
					}
					if (oPayload.ProvinceDesc) {
						oFilter.push(new Filter("ProvinceCode", FilterOperator.EQ, oPayload.ProvinceCode));
					}
				}
			}

			this[oCustomData.variable_name].getBinding("items").filter(oFilter);

			this[oCustomData.variable_name].open();
		},

		/**
		 * Event handler for Multiple select of material table to toggle toolbar buttons.
		 * @param {object} oEvent Contains checkbox of table object event.
		 */
		onSelectTableItem: function (oEvent) {
			// var aSelectedItems = oEvent.getSource().getSelectedItems(); // sap.m.Table
			var aSelectedItems = oEvent.getSource().getSelectedIndices(); // sap.ui.table.Table
			var oModelConfig = this.getView().getModel("viewConfig");
			var bIsMatrDelete = aSelectedItems.length >= 1 ? true : false;

			oModelConfig.setProperty("/materialToolbarDelete", bIsMatrDelete);
		},

		/**
		 * Event handler when switch of Multiple Delivery address is clicked.
		 * @param {object} oEvent Contains the switch event handler.
		 */
		onPressMultipleDelAdd: function (oEvent) {
			var bSelected = oEvent.getParameter("state");
			var oModel = this.getView().getModel();
			var oContextModel = this.fnGetContextModel();

			oModel.setProperty(this._sPath + "/IsMultiple", bSelected);

			// Update payload model.
			if (bSelected) {
				oModel.setProperty(this._sPath + "/Delivaddress", "");
				// { Start of change MS212205 PAL-2022-001
				oModel.setProperty(this._sPath + "/ProvinceCode", "");
				oModel.setProperty(this._sPath + "/ProvinceDesc", "");
				oModel.setProperty(this._sPath + "/CityCode", "");
				oModel.setProperty(this._sPath + "/CityDesc", "");
				oModel.setProperty(this._sPath + "/BarangayCode", "");
				oModel.setProperty(this._sPath + "/BarangayText", "");
				oModel.setProperty(this._sPath + "/ZipCode", "");
				// } End of change MS212205 PAL-2022-001
				oModel.setProperty(this._sPath + "/Contactperson", "");
				oModel.setProperty(this._sPath + "/Contactnumber", "");
				oModel.setProperty(this._sPath + "/Email", "");
				oModel.setProperty(this._sPath + "/OthContPerson", false);
				oModel.setProperty(this._sPath + "/OthContName", "");
				oModel.setProperty(this._sPath + "/OthContNumber", "");
				oModel.setProperty(this._sPath + "/OthEmail", "");
			} else {
				var oContextProp = oContextModel.getProperty("/");
				oContextProp.NavTo_MRFHeader_Items.forEach(function (oItem) {
					oItem.Delivaddress = "";
					oItem.Contactperson = "";
					oItem.Contactnumber = "";
				});
				oContextModel.setProperty("/", oContextProp);
			}

			// Validate fields
			this.onChangeFieldValue();
		},

		/**
		 * Event handler when edit button is click
		 * @param {object} oEvent Contains toggle button event object.
		 */
		onPressEditMRF: function (oEvent) {
			var bIsPressed = oEvent.getParameter("pressed");
			// For Mobile - Since Toggle button press is undefined, We need to negate boolean value from view config model.
			if (typeof (bIsPressed) === "undefined" && this.getModel("device").getProperty("/system/phone")) {
				bIsPressed = !this.getModel("viewConfig").getProperty("/editable");
			}
			this._fnToggleEditMode(bIsPressed);

			// Reset control, models, maintenance.
			this._fnResetModel();
			this._createMaintenanceEnties();
			this.fnTotalMatrQty();
			this._bindView(this._sPath);
		},

		/**
		 * Event handler to trigger OData SubmitChangs method when Complete request button is clicked.
		 * @param {object} oEvent Contains button event object.
		 */
		onPressCompleteMRF: function (oEvent) {
			var sType = oEvent.getSource().data("action");
			this.showDialogMessageConfirm({
					titleMsg: this.getResourceBundle().getText("cofirmCompleteReqTitle"),
					contentMsg: this.getResourceBundle().getText("cofirmCompleteReqContent")
				})
				.then(this.setBusyDialogOn.bind(this))
				.then(this._fnSetUserDecision.bind(this, sType))
				.then(this.fnRequestSubmitChanges.bind(this))
				.then(this.fnSuccessSubmit.bind(this))
				.then(this._fnProcessSuccess.bind(this))
				.then(this.showDialogMessage.bind(this, {
					titleMsg: this.getResourceBundle().getText("successRequestCompleteTitle"),
					contentMsg: this.getResourceBundle().getText("successRequestCompleteText")
				}))
				.then(this.fnNavigateToReport.bind(this, this._sRouteReport))
				.catch(this.fnCatchRequestError.bind(this));
		},

		/**
		 * Event handler to trigger OData SubmitChangs method when Cancel request button is clicked.
		 * @param {object} oEvent Contains button event object.
		 */
		onPressCancelMRF: function (oEvent) {
			var sType = oEvent.getSource().data("action");
			this._fnshowDialogMsgConfirmTextArea({
					titleMsg: this.getResourceBundle().getText("confirmCancelReqTitle"),
					contentMsg: this.getResourceBundle().getText("confirmCancelReqText")
				})
				.then(this.setBusyDialogOn.bind(this))
				.then(this._fnSetUserDecision.bind(this, sType))
				.then(this.fnRequestSubmitChanges.bind(this))
				.then(this.fnSuccessSubmit.bind(this))
				.then(this._fnProcessSuccess.bind(this))
				.then(this.showDialogMessage.bind(this, {
					titleMsg: this.getResourceBundle().getText("successRequestCancelTitle"),
					contentMsg: this.getResourceBundle().getText("successRequestCancelText")
				}))
				.then(this.fnNavigateToReport.bind(this, this._sRouteReport))
				.catch(this.fnCatchRequestError.bind(this));
		},

		/**
		 * Event handler to trigger OData SubmitChanges method when Delete draft button is clicked.
		 */
		onPressDeleteMRF: function () {
			var oContextModel = this.fnGetContextModel();
			var oContextProp = oContextModel.getProperty("/");

			this.showDialogMessageConfirm({
					titleMsg: this.getResourceBundle().getText("cofirmDeleteDraftTitle"),
					contentMsg: this.getResourceBundle().getText("confirmDeleteDraftContent")
				})
				.then(this.setBusyDialogOn.bind(this))
				.then(this.fnRequestDeleteMRF.bind(this, oContextProp))
				.then(this.fnRequestSubmitChanges.bind(this))
				.then(this.fnSuccessSubmit.bind(this))
				.then(this.setBusyDialogOff.bind(this))
				.then(this.showDialogMessage.bind(this, {
					titleMsg: this.getResourceBundle().getText("successDraftDeleteTitle"),
					contentMsg: this.getResourceBundle().getText("successDraftDeleteText")
				}))
				.then(this.fnNavigateToReport.bind(this, this._sRouteReport))
				.catch(this.fnCatchRequestError.bind(this));
		},

		/**
		 * Event handler to trigger OData SubmitChanges method when Save Draft or Submit button is clicked.
		 * @param {object} oEvent Contains the button event handler.
		 */
		onPressSave: function (oEvent) {
			var oSource = oEvent.getSource();
			var sType = oSource.data("action_type");
			var oModel = this.getView().getModel();
			var sMsgTitle = sType === "Draft" ? "successSaveDraftTitle" : "successSaveSubmitTitle";
			var sMsgText = sType === "Draft" ? "successSaveDraftContextTextV2" : "successSaveSubmitContextTextV2";
			oModel.setProperty(this._sPath + "/UserDecision", sType);

			this._fnCheckPendingRequest(sType)
				.then(this.setBusyDialogOn.bind(this))
				.then(this._fnRequestMatrLineItem.bind(this))
				.then(this._fnRequestApvrLintItem.bind(this))
				.then(this._fnRequestFileLineItem.bind(this))
				.then(this.fnRequestSubmitChanges.bind(this))
				.then(this.fnSuccessSubmit.bind(this))
				.then(this._fnProcessSuccess.bind(this))
				.then(this.showDialogMessage.bind(this, {
					titleMsg: this.getResourceBundle().getText(sMsgTitle),
					contentMsg: this.getResourceBundle().getText(sMsgText)
				}))
				.catch(this.fnCatchRequestError.bind(this));
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Get the context model object
		 * @public
		 */
		fnGetContextModel: function () {
			return this.getView().getModel("editMRF");
		},

		/**
		 * Get the binding context
		 * @param {object} oSource Contains the source control.
		 * @public
		 */
		fnGetBindingContext: function (oSource) {
			return oSource.getBindingContext("editMRF");
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oContext = this;

			this.getView().getModel().invalidate();
			this.getView().bindElement({
				path: sObjectPath,
				parameters: {
					"expand": "NavTo_MRFHeader_Items,NavTo_MRFHeader_Attachment,NavTo_MRFHeader_Approver"
				},
				events: {
					dataRequested: function () {
						oContext.setBusyDialogOn();
					},
					dataReceived: function (oEvent) {
						oContext.setBusyDialogOff();
						oContext._fnProcessDataReceived(oEvent);
					}
				}
			});
		},

		/**
		 * Process the received data after bind element.
		 * @param {object} oEvent Contains the event object of Binding.
		 * @private
		 */
		_fnProcessDataReceived: function (oEvent) {
			var oDataParam = oEvent.getParameter("data");
			if (!oDataParam) {
				this.getRouter().getTargets().display(Constant.ROUTE_NOT_FOUND);
				return;
			}
			// Create local model which will be use for line items.
			this._createLocalModel(oDataParam);

			// Compute total qty of materials.
			this.fnTotalMatrQty();
		},

		/**
		 * Create a local json model to handle line items data
		 * @param {object} oPayload Contains the received data from bind element.
		 * @private
		 */
		_createLocalModel: function (oPayload) {
			var oModel = new JSONModel(oPayload);
			oModel.setSizeLimit(300);
			this.getView().setModel(oModel, "editMRF");
			this.getView().bindElement("editMRF>/");
		},

		/**
		 * Create a global array variable to maintain all deleted entries in a line item.
		 * @private
		 */
		_createMaintenanceEnties: function () {
			// Material Maintenance
			this.aDeleteMatrMaint = [];
			// Attachment Maintenance
			this.aDeleteFileMaint = [];
			// Approver Maintenance
			this.aDeleteApvrMaint = [];
		},

		/**
		 * Display a warning msg if charging details or material item has been modified before submission.
		 * Only applicable for 'Returned' status of MRF Request.
		 * @param {string} sType Contains type of submission: 'Save' or 'Submit'.
		 * @return {Promise.resolve} Returns a promise resolve.
		 * @private
		 */
		_fnCheckPendingRequest: function (sType) {
			return new Promise(function (fnResolve, fnReject) {
				var oModel = this.getView().getModel();
				var oPendingRequest = oModel.getPendingChanges();
				var oContextModelProp = this.fnGetContextModel().getProperty("/");
				var isChargeDetails = false,
					isMaterial = false;

				// For 'Returned' status only. Otherwise, resolve promise immediately.
				if (oContextModelProp.StatusId === "09" && sType === "Submit") {
					// 1. Check if there are changes in charging details.
					var aChargeDetails = Constant.CHARGING_DETAILS_FIELD;
					var oParam = oPendingRequest[this._sPath.substring(1)];
					aChargeDetails.some(function (oItem) {
						if (oParam.hasOwnProperty(oItem)) {
							isChargeDetails = true;
							return true;
						}
					});

					// 2. Check if there are changes in material items.
					var aMaterial = oModel.getData(this._sPath).NavTo_MRFHeader_Items.__list;
					if (aMaterial.length > 0) {
						// 2.1 Loop OData material to check if material no. or quantity are modified.
						aMaterial.some(function (oDataItem) {
							var oMatrItem = oModel.getData("/" + oDataItem);
							var oResult = oContextModelProp.NavTo_MRFHeader_Items.filter(function (oItem) {
								return oMatrItem.Matnr === oItem.Matnr && Formatter.formatToInt(oMatrItem.Quantity) === Formatter.formatToInt(oItem.Quantity);
							});
							if (oResult.length <= 0) {
								isMaterial = true;
								return true;
							}
						});
						// 2.2 Check if there is new material
						var oResultNewMatr = oContextModelProp.NavTo_MRFHeader_Items.filter(function (oItem) {
							return !this._fnCheckItemExistInServer(oItem);
						}.bind(this));
						if (oResultNewMatr.length > 0) {
							isMaterial = true;
						}
					}

					// 3. Display a warning message if there are changes in charging details or material.
					if (isChargeDetails || isMaterial) {
						this.showMsgBoxWarning(this.getResourceBundle().getText("warningMsgChargeDetMaterial"))
							.then(function () {
								fnResolve();
							});
					} else {
						// Resolve if no changes in Charging details or Material.
						fnResolve();
					}
				} else {
					// Resolve if status is != 'Returned' or submit type != 'Submit'.
					fnResolve();
				}
			}.bind(this));
		},

		/**
		 * Queue a batch request for MRF Material line item (Deffered Mode).
		 * Mode: Create, Update or Delete.
		 * Material Line Item
		 * @private
		 */
		_fnRequestMatrLineItem: function () {
			var oModel = this.fnGetContextModel();
			var oProp = oModel.getProperty("/");

			// Create record if not existing. Otherwise, update record.
			oProp.NavTo_MRFHeader_Items.forEach(function (oItem) {
				oItem.Quantity = oItem.Quantity.toString();
				if (!this._fnCheckItemExistInServer(oItem)) {
					oItem.Recnum = this._sMrfId;
					this.getView().getModel().create("/MRFItemSet", oItem, {
						groupId: Constant.ODATA_GROUP_ID
					});
				} else {
					this.getView().getModel().update("/" + this._fnCreateMRFItemKey(oItem, "MRFItemSet"), oItem, {
						groupId: Constant.ODATA_GROUP_ID
					});
				}
			}.bind(this));

			// Delete record if existing in maintenance queue.
			if (this.aDeleteMatrMaint.length > 0) {
				this.aDeleteMatrMaint.forEach(function (oItem) {
					this.getView().getModel().remove("/" + this._fnCreateMRFItemKey(oItem, "MRFItemSet"), {
						groupId: Constant.ODATA_GROUP_ID
					});
				}.bind(this));
			}
		},

		/**
		 * Queue a batch request for MRF Approver line item (Deffered Mode).
		 * Mode: Create, Update or Delete.
		 * Approver Line Item
		 * @private
		 */
		_fnRequestApvrLintItem: function () {
			var oModel = this.fnGetContextModel();
			var oProp = oModel.getProperty("/");

			// Create record if not existing. Otherwise, update record.
			oProp.NavTo_MRFHeader_Approver.forEach(function (oItem) {
				if (!this._fnCheckItemExistInServer(oItem)) {
					oItem.Recnum = this._sMrfId;
					this.getView().getModel().create("/ApproversSet", oItem, {
						groupId: Constant.ODATA_GROUP_ID
					});
				} else {
					this.getView().getModel().update("/" + this._fnCreateMRFItemKey(oItem, "ApproversSet"), oItem, {
						groupId: Constant.ODATA_GROUP_ID
					});
				}
			}.bind(this));

			// Delete record if existing in maintenance queue.
			if (this.aDeleteApvrMaint.length > 0) {
				this.aDeleteApvrMaint.forEach(function (oItem) {
					this.getView().getModel().remove("/" + this._fnCreateMRFItemKey(oItem, "ApproversSet"), {
						groupId: Constant.ODATA_GROUP_ID
					});
				}.bind(this));
			}
		},

		/**
		 * Queue a batch request for MRF Attachment (Deffered Mode).
		 * Mode: Create, Delete.
		 * Attachment Line Item
		 * @private
		 */
		_fnRequestFileLineItem: function () {
			return new Promise(function (fnResolve, fnReject) {
				var aPromises = [];
				var oContextModel = this.fnGetContextModel();
				var aAttachments = oContextModel.getProperty("/NavTo_MRFHeader_Attachment");
				aAttachments.forEach(function (oItem) {
					aPromises.push(new Promise(function (resolve, reject) {
						// Create record if not existing
						if (!this._fnCheckItemExistInServer(oItem)) {
							oItem.Recnum = this._sMrfId;
							this.fnReadAttachment(oItem)
								.then(this.fnBuildBase64Attchment.bind(this, oItem))
								.then(this.fnRequestAttachment.bind(this, oItem))
								.then(function () {
									resolve();
								});
						} else {
							resolve();
						}
					}.bind(this)));
				}.bind(this));

				Promise.all(aPromises).then(function () {
					// Delete record if existing in maintenance queue.
					if (this.aDeleteFileMaint.length > 0) {
						this.aDeleteFileMaint.forEach(function (oItem) {
							this.getView().getModel().remove("/" + this._fnCreateMRFFileKey(oItem), {
								groupId: Constant.ODATA_GROUP_ID
							});
						}.bind(this));
					}
					// Resolve Outer Promise
					fnResolve(aAttachments);
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Close busy dialog, reset control and models after a success request.
		 * @private
		 */
		_fnProcessSuccess: function () {
			this.setBusyDialogOff();

			// Reset controls, models.
			this._fnToggleEditMode(false);
			this._fnResetModel();
			this._createMaintenanceEnties();
			this._bindView(this._sPath);
		},

		/**
		 * Display a dialog confirmation for cancellation of request.
		 * @param {object} oTextParam Contains the title and text of message.
		 * @private
		 */
		_fnshowDialogMsgConfirmTextArea: function (oTextParam) {
			return new Promise(function (fnResolve, fnReject) {
				var oModel = this.getView().getModel();
				var oDialog = new sap.m.Dialog({
					title: oTextParam.titleMsg,
					type: 'Message',
					contentWidth: "500px",
					content: new sap.m.VBox({
						items: [
							new sap.m.Text({
								text: oTextParam.contentMsg
							}).addStyleClass("sapUiSmallMarginBottom"),
							new sap.m.Label({
								text: this.getResourceBundle().getText("reasonCancel"),
								required: true
							}),
							new sap.m.TextArea({
								placeholder: this.getResourceBundle().getText("enterReason"),
								width: "100%",
								value: "{Notes}",
								maxLength: {
									path: '/#MRFHeader/Notes/@maxLength',
									formatter: Formatter.fnGetMaxLength
								}
							})
						]
					}),
					beginButton: new sap.m.Button({
						text: this.getResourceBundle().getText("yesProceed"),
						type: "Emphasized",
						press: function (oEvent) {
							// Validate reason field.
							var sNotes = oModel.getProperty(this._sPath + "/Notes");
							if (sNotes.trim()) {
								oDialog.close();
								fnResolve();
							} else {
								// Display error msg instead of Reject.
								this.showMsgBoxError(this.getResourceBundle().getText("errorReasonReqField"));
							}
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: this.getResourceBundle().getText("noGoBack"),
						press: function () {
							oModel.setProperty(this._sPath + "/Notes", "");
							oDialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						oDialog.destroy();
					}
				});
				this.getView().addDependent(oDialog);
				oDialog.open();
			}.bind(this));
		},

		/**
		 * Validate required fields for Material Step.
		 * @private
		 */
		_fnValidateMaterials: function () {
			var oModel = this.getView().getModel();
			var oContextModel = this.fnGetContextModel();
			var oContextProp = oContextModel.getProperty("/");
			var bValidate = true;

			// Check line items
			if (oContextProp.NavTo_MRFHeader_Items.length > 0) {
				if (oModel.getProperty(this._sPath + "/IsMultiple")) {
					oContextProp.NavTo_MRFHeader_Items.forEach(function (oItem, iIdx) {
						// Start of change MS223343 - FD2K900081
						if (!oItem.Delivaddress || !oItem.Contactperson || !oItem.Contactnumber || !oItem.ProvinceDesc || !oItem.CityDesc || !oItem.BarangayText) {
							bValidate = false;
							return;
						}
						// End of change MS223343 - FD2K900081
					});
				} else {
					bValidate = true;
				}
			} else {
				bValidate = false;
			}

			return bValidate;
		},

		/**
		 * Check if there are valid entry for uploaded materials and asks for confirmation.
		 * @param {object} oResult Contains list of materials and error message.
		 * @private
		 */
		_fnCheckMatrData: function (oResult) {
			var oModel = this.fnGetContextModel();
			var oPayload = oModel.getProperty("/");

			if (oResult.materials.length > 0) {
				if (oPayload.NavTo_MRFHeader_Items.length > 0) {
					this.showMsgBoxWarning(this.getResourceBundle().getText("warningMsgMatSelect"))
						.then(this._fnStoreMatrData.bind(this, oResult))
						.catch(function () {});
				} else {
					this._fnStoreMatrData(oResult);
				}

			} else {
				this.showMsgBoxError(oResult.error);
			}
		},

		/**
		 * Update the material line item based from the valid entry of uploaded materials.
		 * @param {object} oResult Contains list of materials and error message.
		 * @private
		 */
		_fnStoreMatrData: function (oResult) {
			var oModel = this.fnGetContextModel();
			var oPayload = oModel.getProperty("/");

			// 1. Loop material item to queue for delete request if existing in back-end.
			oPayload.NavTo_MRFHeader_Items.forEach(function (oItem) {
				// Add to delete maintenance queue
				if (this._fnCheckItemExistInServer(oItem)) {
					this.aDeleteMatrMaint.push(oItem);
				}
			}.bind(this));

			// 2. Clear the materials in local model.
			this._fnClearMaterial();

			// 3. Assign new entry
			oPayload.NavTo_MRFHeader_Items = oResult.materials;

			// 4. Validate fields, update qty and model.
			this.onChangeFieldValue();
			this.fnTotalMatrQty();
			oModel.setProperty("/", oPayload);
			oModel.refresh(true);

			// 5. Display error for invalid material.
			if (oResult.error) {
				this.showMsgBoxError(oResult.error);
			}
		},

		/**
		 * Modify the user decision field of OData Model.
		 * This is used by Cancel, Submit or Complete event.
		 * @param {string} sType Contains the user decision action.
		 * @private
		 */
		_fnSetUserDecision: function (sType) {
			var oModel = this.getView().getModel();
			oModel.setProperty(this._sPath + "/UserDecision", sType);
		},

		/**
		 * Check the payload field if request is create or edit.
		 * @param {object} oPayload Contains the payload of edit mode.
		 * @private
		 */
		_fnCheckItemExistInServer: function (oPayload) {
			return oPayload.hasOwnProperty("Recnum") && oPayload.hasOwnProperty("Linenum");
		},

		/**
		 * Create OData key for MRFHeaderSet
		 * @param {object} oParam Contains payload.
		 * @private
		 */
		_fnCreateMRFHeaderKey: function () {
			var sKey = this.getModel().createKey("MRFHeaderSet", {
				Recnum: this._sMrfId
			});

			return sKey;
		},

		/**
		 * Create OData key for MRFItemSet, ApproverSet
		 * @param {object} oParam Contains payload.
		 * @param {string} sPath Contains entity set name.
		 * @private
		 */
		_fnCreateMRFItemKey: function (oParam, sPath) {
			var sKey = this.getModel().createKey(sPath, {
				Recnum: oParam.Recnum,
				Linenum: oParam.Linenum
			});

			return sKey;
		},

		/**
		 * Create OData key for AttachmentSet
		 * @param {object} oParam Contains payload.
		 * @private
		 */
		_fnCreateMRFFileKey: function (oParam) {
			var sKey = this.getModel().createKey("AttachmentSet", {
				Recnum: oParam.Recnum,
				Linenum: oParam.Linenum,
				AttachType: oParam.AttachType
			});

			return sKey;
		},

		/**
		 * Clear selected materials in local model.
		 * @private
		 */
		_fnClearMaterial: function () {
			var oModel = this.fnGetContextModel();
			oModel.setProperty("/NavTo_MRFHeader_Items", []);
		},

		/**
		 * Modify the local view config model for the 'editable' field
		 * @param {boolean} bIsPressed Contains boolean value to set data for view config field.
		 * @private
		 */
		_fnToggleEditMode: function (bIsPressed) {
			var oModelConfig = this.getView().getModel("viewConfig");
			oModelConfig.setProperty("/editable", bIsPressed);
		},

		/**
		 * Reset the scrolling of object page layout tab.
		 * @param {string} sId Contains the id of object page layout.
		 * @private
		 */
		_fnNavigateToSection: function (sId) {
			var oObjectPageLayout = this.byId("idObjectPageLayout");
			oObjectPageLayout.invalidate();
			oObjectPageLayout.setSelectedSection(this.byId(sId).getId());
		},

		/**
		 * Reset all changes made in OData model two-way binding.
		 * @private
		 */
		_fnResetModel: function () {
			this.getView().getModel().resetChanges();

			if (this.getModel("device").getProperty("/system/phone")) {
				this.byId("idObjectPageHeader").invalidate();
			}
		}
	});
});
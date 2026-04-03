sap.ui.define([], function () {
	"use strict";
	
	return {
		fnValidateForm: function (oForm, oContext) {
			var aContentForm = oForm.getContent();
			var aValidate = [];

			aContentForm.forEach(function (oItem) {
				var oResult = this._fnValidateFields(oItem);
				if (typeof oResult === "object") {
					aValidate.push(oResult);
				}
			}.bind(this));

			return aValidate;
		},

		_fnValidateFields: function (oControl) {
			var oFieldValidation = {
				"sap.m.Input": this._fnValidateInputField,
				"sap.m.TextArea": this._fnValidateInputField,
				"sap.m.Select": this._fnValidateSelectField
			};
			var sControlType = oControl.getMetadata().getName();

			if (oFieldValidation.hasOwnProperty(sControlType)) {
				return oFieldValidation[sControlType].call(this, oControl);
			}
			
			// If control type does not require any validation, return true;
			return true;
		},

		_fnValidateInputField: function (oControl) {
			var sValue = oControl.getValue().trim();

			if (sValue === "" && oControl.getVisible() && oControl.getRequired()) {
				return this._fnGetRespose.call(this, oControl);
			}
		},

		_fnValidateSelectField: function (oControl) {
			var sSelectedKey = oControl.getSelectedKey();

			if (sSelectedKey === "" && oControl.getVisible()) {
				return this._fnGetRespose(oControl);
			}
		},

		_fnGetRespose: function (oControl) {
			return {
				type: "Error",
				control: oControl
			};
		},
		/**
		 * Returns an sap icon text based from mime type of a file.
		 * @param {string} sMimeType Contains mime type string.
		 * @return {string} Returns an sap icon text
		 * @
		 */
		fnFormatFileIcon: function (sMimeType) {
			var oMimeType = {
				"application/pdf": "sap-icon://pdf-attachment",
				"image/png": "sap-icon://attachment-photo",
				"image/jpeg": "sap-icon://attachment-photo",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "sap-icon://excel-attachment",
				"application/vnd.ms-excel": "sap-icon://excel-attachment"
			}
			return oMimeType[sMimeType];
		}
	};
});
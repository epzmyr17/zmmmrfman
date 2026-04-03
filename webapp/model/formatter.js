sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Converts date into UTC format.
		 * @param {date} dParam Contains Date
		 * @return {date} Returns date in UTC format.
		 * @public
		 */
		formatUTC: function (dParam) {
			return new Date(Date.UTC(dParam.getFullYear(), dParam.getMonth(), dParam.getDate()));
		},

		/** 
		 * Returns a formatted title based on month or day.
		 * @param {string} sMaxLength Metadata maxlength.
		 * @returns {int} Formatted maxlength.
		 * @public
		 */
		fnGetMaxLength: function (sMaxLength) {
			var sTemp = sMaxLength;
			var iParsed = parseInt(sTemp, 10);

			// failsafe
			if (isNaN(iParsed)) {
				return 40;
			}

			return iParsed;
		},

		/**
		 * Returns a formatted file size in different size: Bytes, KB, MB, GB, TB and PB
		 * @param {byte} bytes Contains integer value.
		 * @return {string} Returns a formatted file size.
		 * @public
		 */
		fnFormatBytes: function (bytes) {
			var iDecimal = 2;
			if (bytes == 0) {
				return "0 Byte";
			}
			var k = 1024; //Or 1 kilo = 1000
			var sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
			var i = Math.floor(Math.log(bytes) / Math.log(k));
			return parseFloat((bytes / Math.pow(k, i)).toFixed(iDecimal)) + " " + sizes[i];
		},

		/**
		 * Convert text number to int to remove leading zeroes.
		 * @param {string} sQty Contains text number.
		 * @return {string} Returns a formatted number.
		 * @public
		 */
		formatToInt: function (iNum) {
			return parseInt(iNum, 10);
		},

		/**
		 * Returns an sap icon text based from mime type of a file.
		 * @param {string} sMimeType Contains mime type string.
		 * @return {string} Returns an sap icon text
		 * @public
		 */
		fnFormatFileIcon: function (sMimeType) {
			var oMimeType = {
				"application/pdf": "sap-icon://pdf-attachment",
				"image/png": "sap-icon://attachment-photo",
				"image/jpeg": "sap-icon://attachment-photo",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "sap-icon://excel-attachment",
				"application/vnd.ms-excel": "sap-icon://excel-attachment",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "sap-icon://doc-attachment",
				"application/msword": "sap-icon://doc-attachment",
				"application/zip": "sap-icon://attachment-zip-file",
				"application/x-zip-compressed": "sap-icon://attachment-zip-file"
			};
			return oMimeType[sMimeType];
		},

		/**
		 * Format status to value state.
		 * @param {string} sStatus Contains the status of item.
		 * @return {string} Returns a value state.
		 * @public
		 */
		formatApproverStatus: function (sStatus) {
			switch (sStatus) {
			case "Approved":
				return this.getResourceBundle().getText("Success");
			case "Rejected":
				return this.getResourceBundle().getText("Error");
			default:
				return this.getResourceBundle().getText("None");
			}
		},

		/**
		 * Format status to value state.
		 * @param {string} sStatus Contains the status of item.
		 * @return {string} Returns a value state.
		 * @public
		 */
		formatRequestStatus: function (sStatusId) {
			switch (sStatusId) {
			case "Completed":
				return this.getResourceBundle().getText("Success");
			case "Rejected":
			case "Cancelled":
				return this.getResourceBundle().getText("Error");
			default:
				return this.getResourceBundle().getText("None");
			}
		},

		/**
		 * Format status of approver type
		 * @param {string} sApvType Contains the approver type.
		 * @return {strung} Returns a formatted approver type
		 * @public
		 */
		formatApproverType: function (sApvType) {
			switch (sApvType) {
			case "IS_APPROVER":
				return this.getResourceBundle().getText("isApprover");
			case "DIVISION_HEAD":
				return this.getResourceBundle().getText("divisioHead");
			case "GROUP_HEAD":
				return this.getResourceBundle().getText("groupHead");
			case "FBA":
				return this.getResourceBundle().getText("fba");
			case "ALLOCATOR":
				return this.getResourceBundle().getText("allocator");
			case "PROCESSOR":
				return this.getResourceBundle().getText("processor");
			default:
				return this.getResourceBundle().getText("additionalApprover");
			}
		},

		/**
		 * Format milliseconds to time with timezone offset.
		 * @param {int} iDateMS Contains date in milliseconds.
		 * @return {string} Returns a formatted time in 24 hrs format.
		 * @public
		 */
		formatMStoTime: function (iDateMS) {
			var iTimeZoneOffset = new Date(0).getTimezoneOffset() * 60 * 1000;
			var oFormatTime = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "HH:mm:ss"
			});
			var dNewDate = new Date(iDateMS + iTimeZoneOffset);

			return oFormatTime.format(dNewDate);
		}
	};
});
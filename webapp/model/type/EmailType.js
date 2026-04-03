sap.ui.define([
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function (SimpleType, ValidateException) {
	"use strict";

	/**
	 * Custom simple type: Email
	 * @class
	 * @extends sap.ui.model.SimpleType
	 * @constructor
	 * @public
	 * @author Takao Baltazar (VE210015)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.MRF_Manage.model.EmailType
	 */
	return SimpleType.extend("com.globe.MRF_Manage.model.EmailType", /** @lends com.globe.MRF_Manage.controller.EmailType */ {
		formatValue: function (oValue) {
			return oValue;
		},

		parseValue: function (oValue) {
			//parsing step takes place before validating step, value could be altered here
			return oValue;
		},

		validateValue: function (oValue) {
			// The following Regex is only used for demonstration purposes and does not cover all variations of email addresses.
			// It's always better to validate an address by simply sending an e-mail to it.
			var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			if (!oValue.match(rexMail) && oValue.length > 0) {
				throw new ValidateException("'" + oValue + "' is not a valid e-mail address");
			}
		}
	});
});
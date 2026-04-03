# MM MRF Request

This application is a custom SAPUI5 application for MRF Manage.

## Application Information

Application for requestor to view and edit requests and create new request.

## Key Features
- View MRF Request
- Edit MRF Request
- Create MRF Request

## Technical Information

### SAPUI5 Application
The ICF nodes for the following SAPUI5 application must be activated on the front-end server:

| Component | Technical Name | Path to ICF Node | SAPUI5 Component |
| --- | --- | --- | --- |
| SAPUI5 Application | zmmm_mrf_man | /sap/bc/ui5_ui5/sap/zmmm_mrf_man | com.globe.MRF_Manage |

### Git Repository
| Name | URL
| --- | --- |
| zmmmrfman | https://git.ap1.hana.ondemand.com/zz1qtpwp2i/zmmmrfman |

### OData Services
The following OData services must be activated on the front-end server
Users require PFCG authorization for the front-end and back-end systems.

| OData Service | Authorization Role (PFCG) |
| --- | --- |
| ZMMM_OP_MRF_REQUESTOR_SRV | /sap/opu/odata/sap/ZMMM_OP_MRF_REQUESTOR_SRV/ |
| ZMMM_OP_MRF_HELP_SRV | /sap/opu/odata/sap/ZMMM_OP_MRF_HELP_SRV/ |

### SAP Fiori Launchpad
You require the following data to give users access to the app in the SAP Fiori launchpad.

#### Technical Configuration
| Field | Detail |
| --- | --- |
| Technical Catalog | ZMM_MRF_CUSTOM_TC_CAT |
| Technical Catalog Description	| MRF: All apps |
| SAPUI5 Application | zmmm_mrf_man |
| Catalog Name | ZMM_MRF_REQT_BC_CAT |
| Group Name | ZMM_MRF_REQT_GRP |

#### Target Mapping(s)
| Semantic Object | Semantic Action | Parameter Key | Parameter Value |
| --- | --- | --- | --- |
| MRFManage | manage | | | |

#### Business Catalog(s)
| Catalog Name | Catalog Description | 
| --- | --- |
| ZMM_MRF_REQT_BC_CAT | Requestor (MRF) |

#### Business Group(s)
| Business Group | Group Description |
| --- | --- |
| ZMM_MRF_REQT_GRP | Requestor (MRF) |

#### Business Role(s)
| Role Name | Role Description |
| --- | --- |
|  XC_FIORI_MRF_REQT |  Composite Role |

## Deployment Setup

Deploy to SAP Fiori Launchpad using SAP Web IDE.

## Authors

* Takao Baltazar [@VE210015](mailto:takao.baltazar@globe.com.ph)

## Release History

* 2.0.0
	* Add an Optional Free Text Field “Contact Person’s Employee ID Number”

* 1.0.6
	* Include line item remarks inputted by allocator/processor on display MRF
	* Extract list of materials based on selected commodity and plant
	* Change of mandatory fields for Pick up option
	* Fix delete of material

* 1.0.5
	* Add validation on material details (Province, City, Barangay)

* 1.0.4
	* Add warning message when pickup delivery mode

* 1.0.3
	* Add Province, City and Barangay fields on item level, header level, download and upload file
	* Add Reference list for Province, City and Barangay on download file
	* Material table selection mode to multitoggle
	* Label Date submitted to Date created
	* Update Complete delivery address placeholder
	* Cancel request change control to Dialog type
	* Title change to My request
	
* 1.0.2
	* Allow blank price in file upload of material

* 1.0.1
	* Allow blank price in material selection

* 1.0.0
	* Initial Release. New application for MRF Manage - Requestor.

## License
Distributed under Globe license. See ``LICENCE`` for more information.

## Development
1. Clone from [SAP Web IDE](https://git.ap1.hana.ondemand.com/zz1qtpwp2i/zmmmrfman).
2. Create your feature branch (`git checkout -b dev`).
3. Commit your changes (`git commit -am '<Username> Added some fooBar'`).
4. Push to the branch (`git push origin dev`).
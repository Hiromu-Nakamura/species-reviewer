"use strict";

module.exports = {
  // // PROD OAUTH APP ID
  // oauthAppID: "Dks28Xk6zIbYoWbO",
  // DEV OAUTH APP ID
  oauthAppID: "zPRYFrWVWNO44xMP",
  // // PROD WEB MAP
  // webMapID: "6c4e0d073ff94d4cb979e29128a43eb7",
  // DEMO WEBMAP
  webMapID: "6ed8dcaa51b04f60b8409385694ac331",

  FIELD_NAME: {
    huc10LayerHucID: "HUC10",
    huc10LayerHucName: "NAME",
    speciesLookupHucID: "HUC10",
    statusType: "StatusType",
    speciesLookup: {
      speciesCode: "cutecode",
      speciesName: "Scientific_Name",
      taxa: "Taxonomic_Group",
      boundaryLayerLink: "BoundaryLayerLink",
      pdfLink: "PdfLink"
    },
    speciesDistribution: {
      speciesCode: "SpeciesCode",
      hucID: "HUCID"
    },
    feedbackTable: {
      hucID: "HUCID",
      userID: "UserID",
      species: "Species",
      comment: "Comment_Long",
      status: "StatusType",
      retirementDate: "RetirementDate",
      data_load_date: "DataLoadDate"
    },
    overallFeedback: {
      userID: "UserID",
      species: "Species",
      comment: "Comment_Long",
      rating: "Rating",
      retirementDate: "RetirementDate",
      data_load_date: "DataLoadDate"
    },
    speciesByUser: {
      speciesCode: "cutecode",
      email: "Reviewer_email"
    },
    pdfLookup: {
      speciesCode: "cutecode",
      url: "url"
    },
    data_load_date: {
      species_code: "cutecode",
      data_load_date: "DataLoadDate"
    }
  },

  DOM_ID: {
    mainControl: "mainControlDiv",
    mapViewContainer: "viewDiv",
    speciesSelector: "selectorsDiv",
    feedbackControl: "feedbackControlDiv",
    overallFeedbackControl: "overallFeedbackDiv",
    legend: "legendDiv",
    listViewOverallFeedback: "listViewForOverallFeedbackDiv",
    listViewDeatiledFeedback: "listViewForDetailedFeedbackDiv",
    listViewForFeedbacksByHuc: "listViewForFeedbacksByHucDiv",
    searchWidgetDiv: "searchWidgetDiv",
    layerListDiv: "layerListDiv"
  },

  URL: {
    speciesLookupTable:
      "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Species_Master_Lookup/FeatureServer/0",

    speciesDistribution:
      "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Species_Modeling_Extent/FeatureServer/0",

    speciesByUser:
      "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Species_by_Reviewers/FeatureServer/0",

    statusTable:
      "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Status_Code_Lookup/FeatureServer/0",
    feedbackTable:
      // "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Detailed_Feedback/FeatureServer/0",
    "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/DEV_DetailedFeedback/FeatureServer/0",
    overallFeedback:
      // "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Overall_Feedback/FeatureServer/0",
    "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/DEV_OverallFeedback/FeatureServer/0",

    PredictedHabitat: {
      // "137976": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Isotria_medeloides_Boundary/FeatureServer/0",
      // "941975": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Lithobates_kauffeldi_Boundary/FeatureServer/0",
      line:
        // "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Predicted_Habitat_Line/FeatureServer/0",
        "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/DEV_PredictedHabitatLine/FeatureServer/0",
      polygon:
        // "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Predicted_Habitat_Polygon/FeatureServer/0",
        "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/DEV_PredictedHabitatPolygon/FeatureServer/0",
      line2:
        // "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Predicted_Habitat_Line_Part_2/FeatureServer/0",
        "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/DEV_Predicted_Habitat_Line_Part_2/FeatureServer/0",
      polygon2:
        // "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Predicted_Habitat_Polygon_Part_2/FeatureServer/0"
        "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/DEV_Predicted_Habitat_Polygon_Part_2/FeatureServer/0"
    },
    pdfLookup:
      "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/PDF_Lookup/FeatureServer/0",
    WatershedBoundaryDataset_HUC10:
      "https://utility.arcgis.com/usrsvcs/servers/9c326d3f7db34042857789f580ade469/rest/services/WatershedBoundaryDataset_HUC10/FeatureServer/0",
    data_load_date:
      "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Data_Load_Date/FeatureServer/0"
  },

  reference_layers: {
    usa_protected_areas: {
      itemId: "dd6077b7b71c4492aceab1ae0146ad1c",
      title: "USA Protected Areas"
    },
    USA_NLCD_Land_Cover_2011: {
      itemId: "aa71e15357a14dbb93a50ef3a8e06f70",
      title: "USA NLCD Land Cover"
    },
    USA_Forest_Type: {
      itemId: "593d022dbeb24c3abbf6c509fd592dd2",
      title: "USA Forest Type"
    },
    USA_Wetlands: {
      itemId: "0cb75b1f54854ad188302cd8b260c98f",
      title: "USA Wetlands"
    },
    HUC6: {
      itemId: "651da243132d4ed78dadbf2e5a6c8e5a",
      title: "Watersheds (HUC6)"
    }
  },

  layerParameters: {
    data_load_date: {
      defaultDate: "5/9/2019  7:00:00 AM"
    }
  },

  COLOR: {
    hucBorder: [255, 255, 255, 0.3],
    hucBorderIsModeled: [255, 255, 255, 0.5],
    hucBorderCommentWithoutAction: [239, 35, 60, 1],
    hucFill: [217, 217, 217, 0.4],
    status0: [200, 200, 200, 0.5],
    status1: [166, 219, 160, 0.5],
    status2: [194, 165, 207, 0.5],
    actualModeledExtent: "#E6E600",
    modelingExtentFill: [133, 255, 102,.1],
    modelingExtentStroke1: [133, 255, 102,.3],
    modelingExtentStroke2: [255,255,255,0],
    hucsOutsideOfModelingExtentStroke: [255, 255, 255, 0.15],
  },

  fireflyStyle: {
    blue:
      'data:image/png;base64,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'
  },

  visibleRange: {
    predictedHabitat: {
      minScale: 1025000
    }
  }
};

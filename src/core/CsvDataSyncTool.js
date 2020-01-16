import axios from 'axios';
import { loadModules } from 'esri-loader';

// TODO: Save into the "DEV-Shared-CSV" folder; generate a unique name for each file
export default function CsvDataSyncTool({
    token = '',
    orgId = '',
    customHostUrl = '',
    username = ''
}={}){
    let csvData = [];

    const saveCsvData = (features=[])=>{

        csvData = features;

        // syncCsvData({
        //     serviceName: 'test-csv-sync-tool',
        //     features: csvData
        // }).then(res=>{
        //     console.log(res);
        // })
    };

    // const syncCsvData = async ()=>{
    //     console.log('calling sync csv data');
    // };

    const syncCsvData = ({
        // serviceName = '',
        // // templateItemId = '',
        // features = [],
        // mapExtent = null
    }={})=>{
    
        // const serviceName = formatServiceName(serviceName);

        const serviceName = getServiceName();

        const features = csvData;
    
        return new Promise(async(resolve, reject)=>{
    
            if(!serviceName){
                reject('Title is required to create a new feature service');
                return;
            }
    
            if(!features.length){
                reject('no features from selected layer to save');
                return;
            }
    
            try {
                // step 1: check if the service name is available or not
                const isServiceNameAvailableResponse = await isServiceNameAvailable(serviceName, token);
                console.log('isServiceNameAvailableResponse', isServiceNameAvailableResponse);
    
                if(!isServiceNameAvailableResponse.available){
                    const errMsg = `Service name not available. A published service with this name already exists within the organization. Service names must be unique across the organization. Please use a different name.`;
                    reject(errMsg);
                    return;
                }
    
                // step 2: create feature service
                // const createServiceResponse = await createService(serviceName, templateItemId);
                const createServiceResponse = await createService(serviceName);
                console.log('createServiceResponse', createServiceResponse);
    
                // step 3: update item
                if(createServiceResponse.itemId){
                    const updateItemResponse = await updateItem(serviceName, createServiceResponse.itemId);
                    console.log('updateItemResponse', updateItemResponse);
                }
    
                // step 4: get template item layerInfo
                // const templateItemLayerInfo = await getTemplateItemInfo(templateItemId);
                const templateItemLayerInfo = getLayerInfo(createServiceResponse.itemId);
                console.log('templateItemLayerInfo', templateItemLayerInfo);
    
                // step 5: add to definition
                const addToDefinitionResponse = await addToDefinition(createServiceResponse.serviceurl, createServiceResponse.name, templateItemLayerInfo)
                console.log('addToDefinitionResponse', addToDefinitionResponse);
    
                // step 6: add features to the newly created feature service
                const addFeaturesResponse = await addFeatures(createServiceResponse.serviceurl, features);
                console.log('addFeaturesResponse', addFeaturesResponse);
    
                createServiceResponse.itemUrl = getAgolUrl(createServiceResponse.itemId); 
    
                resolve(createServiceResponse);
    
            } catch(err) {
                console.error(err);
                return;
            }
        });
    
    };
    
    const getAgolUrl = (itemId='')=>{
        const agolHostUrl = customHostUrl || 'https://arcgis.com';
        return `${agolHostUrl}/home/item.html?id=${itemId}`;
    }
    
    const isServiceNameAvailable = (name='', token)=>{
    
        const requestUrl = getRequestUrl('isServiceNameAvailable');
    
        const params = {
            name,
            type: 'Feature Service',
            f:	'json',
            token
        };
    
        return new Promise((resolve, reject)=>{
    
            axios.get(requestUrl, { params })
            .then((response)=>{
                resolve(response.data);
            })
            .catch((error)=>{
                reject(error);
            });
        });
    };
    
    const createService = (serviceName='', templateItemId='')=>{
    
        const requestUrl = getRequestUrl('createService');
    
        const createParameters = {
            "name": serviceName,
            // "serviceItemId": templateItemId,
            "serviceDescription": "",
            "hasVersionedData": false,
            "supportsDisconnectedEditing": false,
            "hasStaticData": false,
            "maxRecordCount": 2000,
            "supportedQueryFormats": "JSON",
            "supportsVCSProjection": false,
            "capabilities": "Query,Editing,Create,Update,Delete",
            "description": "",
            "copyrightText": "",
            "spatialReference": {
                "wkid": 102100,
                "latestWkid": 3857
            },
            "allowGeometryUpdates": true,
            "units": "esriMeters",
            "xssPreventionInfo": {
                "xssPreventionEnabled": true,
                "xssPreventionRule": "InputOnly",
                "xssInputRule": "rejectInvalid"
            },
            
        };
    
        const bodyFormData = new FormData();
        bodyFormData.append('createParameters', JSON.stringify(createParameters));
        bodyFormData.append('targetType', 'featureService');
        bodyFormData.append('f', 'json');
        bodyFormData.append('token', token);
    
        return new Promise((resolve, reject)=>{
            axios.post(requestUrl, bodyFormData)
            .then((response)=>{
                resolve(response.data);
            })
            .catch((error)=>{
                reject(error);
            });
        });
    
    };
    
    const updateItem = (serviceName='', itemID='')=>{
    
        const requestUrl = getRequestUrl('updateItem', itemID);
    
        const bodyFormData = new FormData();
        bodyFormData.append('title', serviceName);
        bodyFormData.append('tags', 'MoBI');
        // bodyFormData.append('extent', '-128.356,28.626,-60.856,46.568');
        bodyFormData.append('thumbnailURL', 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/export?size=800,532&bboxSR=4326&format=png24&f=image&bbox=-128.356,28.626,-60.856,46.568');
        bodyFormData.append('f', 'json');
        bodyFormData.append('token', token);
    
        return new Promise((resolve, reject)=>{
    
            if(!itemID){
                reject('itemID is required to update item');
            }
    
            axios.post(requestUrl, bodyFormData)
            .then((response)=>{
                resolve(response.data);
            })
            .catch((error)=>{
                reject(error);
            });
        });
    };

    const getLayerInfo = (serviceItemId='')=>{
        
        const firstRow = csvData[0];

        const fields = Object.keys(firstRow.attributes).map(key=>{
            return {
                "name": key,
                "type": "esriFieldTypeString",
                "actualType": "nvarchar",
                "length": 5000
            };
        });

        fields.push({
            "name" : "ObjectId", 
            "type" : "esriFieldTypeOID", 
            "actualType" : "int", 
            "alias" : "ObjectId", 
            "sqlType" : "sqlTypeInteger", 
            "nullable" : false, 
            "editable" : false, 
            "domain" : null, 
            "defaultValue" : null
        });
        
        const layerInfo = {
            "id": 0,
            "type": "Feature Layer",
            "serviceItemId": serviceItemId,
            "displayField": "",
            "description": "",
            "copyrightText": "",
            "defaultVisibility": true,
            "relationships": [],
            "isDataVersioned": false,
            "supportsAppend": true,
            "supportsCalculate": true,
            "supportsASyncCalculate": true,
            "supportsTruncate": true,
            "supportsAttachmentsByUploadId": true,
            "supportsAttachmentsResizing": true,
            "supportsRollbackOnFailureParameter": true,
            "supportsStatistics": true,
            "supportsExceedsLimitStatistics": true,
            "supportsAdvancedQueries": true,
            "supportsValidateSql": true,
            "supportsCoordinatesQuantization": true,
            "supportsFieldDescriptionProperty": true,
            "supportsQuantizationEditMode": true,
            "supportsApplyEditsWithGlobalIds": false,
            "supportsReturningQueryGeometry": true,
            "advancedQueryCapabilities": {
              "supportsPagination": true,
              "supportsPaginationOnAggregatedQueries": true,
              "supportsQueryRelatedPagination": true,
              "supportsQueryWithDistance": true,
              "supportsReturningQueryExtent": true,
              "supportsStatistics": true,
              "supportsOrderBy": true,
              "supportsDistinct": true,
              "supportsQueryWithResultType": true,
              "supportsSqlExpression": true,
              "supportsAdvancedQueryRelated": true,
              "supportsCountDistinct": true,
              "supportsPercentileStatistics": true,
              "supportsLod": true,
              "supportsQueryWithLodSR": false,
              "supportedLodTypes": [
                "geohash"
              ],
              "supportsReturningGeometryCentroid": false,
              "supportsQueryWithDatumTransformation": true,
              "supportsHavingClause": true,
              "supportsOutFieldSQLExpression": true,
              "supportsMaxRecordCountFactor": true,
              "supportsTopFeaturesQuery": true,
              "supportsDisjointSpatialRel": true,
              "supportsQueryWithCacheHint": true
            },
            "useStandardizedQueries": false,
            "geometryType": "esriGeometryPoint",
            "minScale": 0,
            "maxScale": 0,
            "extent": {
                "spatialReference": {
                    "latestWkid": 3857,
                    "wkid": 102100
                },
                "xmin": -17674910.29041875,
                "ymin": 2235132.6399845793,
                "xmax": -3742580.270826809,
                "ymax": 7127102.450234558
            },
            "allowGeometryUpdates": true,
            "hasAttachments": false,
            "htmlPopupType": "esriServerHTMLPopupTypeNone",
            "hasM": false,
            "hasZ": false,
            "objectIdField": "ObjectId",
            "uniqueIdField": {
              "name": "ObjectId",
              "isSystemMaintained": true
            },
            "globalIdField": "",
            "typeIdField": "",
            "fields": fields,
            "types": [],
            "supportedQueryFormats": "JSON, geoJSON, PBF",
            "hasStaticData": false,
            "maxRecordCount": 2000,
            "standardMaxRecordCount": 32000,
            "standardMaxRecordCountNoGeometry": 32000,
            "tileMaxRecordCount": 8000,
            "maxRecordCountFactor": 1,
            "capabilities": "Create,Delete,Query,Update,Editing,Extract"
        };
        
        return layerInfo;
    };
    
    const addToDefinition = (serviceUrl='', featureServiceName='', templateItemLayerInfo=null)=>{
    
        templateItemLayerInfo.name = featureServiceName;
        // templateItemLayerInfo.extent = mapExtent;
    
        // ignore the time info from the template service item
        // if(templateItemLayerInfo.timeInfo){
        //     delete templateItemLayerInfo.timeInfo;
        // }
    
        console.log(templateItemLayerInfo);
    
        const requestUrl = `${serviceUrl}/addToDefinition`.replace('arcgis/rest/services', 'arcgis/rest/admin/services');
        // const requestUrl = `https://services6.arcgis.com/${orgId}/arcgis/rest/admin/services/${featureServiceName}/FeatureServer/addToDefinition`;
    
        const addToDefinition = {
            "layers":[templateItemLayerInfo]
        }
    
        const bodyFormData = new FormData();
        bodyFormData.append('addToDefinition', JSON.stringify(addToDefinition));
        bodyFormData.append('f', 'json');
        bodyFormData.append('token', token);
    
        return new Promise((resolve, reject)=>{
            axios.post(requestUrl, bodyFormData)
            .then((response)=>{
                resolve(response.data);
            })
            .catch((error)=>{
                reject(error);
            });
        });
    
    };
    
    const addFeatures = async(serviceUrl='', features=[])=>{

        const [webMercatorUtils] = await loadModules(["esri/geometry/support/webMercatorUtils"]);
    
        const requestUrl = serviceUrl + '/0/addFeatures';
        // console.log('addFeatures', JSON.stringify(features));

        features = features.map(feature=>{
            const webMercatorXy = webMercatorUtils.lngLatToXY(feature.geometry.x, feature.geometry.y);

            feature.geometry = {
                x: webMercatorXy[0],
                y: webMercatorXy[1]
            };

            return feature;
        });
    
        const bodyFormData = new FormData();
        bodyFormData.append('features', JSON.stringify(features));
        bodyFormData.append('f', 'json');
        bodyFormData.append('token', token);
    
        return new Promise((resolve, reject)=>{
            axios.post(requestUrl, bodyFormData)
            .then((response)=>{
                resolve(response.data);
            })
            .catch((error)=>{
                reject(error);
            });
        });
    };

    const getTemplateItemInfo = async(templateItemId='')=>{
    
        const itemInfo = await getItemInfo(templateItemId);
    
        const requestUrl = `${itemInfo.url}/0?f=json`;
    
        try {
            const res = await sendGetRequest(requestUrl);
            return res;
        } catch(err){
            console.error(err);
            return;
        }
    };
    
    const getItemInfo = async(itemId='')=>{
        
        const requestUrl = `https://www.arcgis.com/sharing/rest/content/items/${itemId}?f=json`;
    
        try {
            const res = await sendGetRequest(requestUrl);
            return res;
        } catch(err){
            console.error(err);
            return;
        }
    };
    
    const sendGetRequest = (requestUrl='', params={})=>{
        return new Promise((resolve, reject)=>{
    
            axios.get(requestUrl, { params })
            .then((response)=>{
                resolve(response.data);
            })
            .catch((error)=>{
                reject(error);
            });
        });
    }
    
    
    const formatServiceName = (name='')=>{
        name = name.replace(/\s/g, "_");
        return name;
    };

    const getServiceName = ()=>{
        const now = new Date().getTime()
        return formatServiceName(`Csv_Data_Shared_by_${username}_${now}`);
    };
    
    const getRequestUrl = (name='', itemID='')=>{
        
        const urlLookup = {
            'isServiceNameAvailable': `https://www.arcgis.com/sharing/rest/portals/${orgId}/isServiceNameAvailable`,
            'createService': `https://www.arcgis.com/sharing/rest/content/users/${username}/createService`,
            'updateItem': `https://www.arcgis.com/sharing/rest/content/users/${username}/items/${itemID}/update`
        };
    
        return urlLookup[name];
    };

    return {
        saveCsvData,
        syncCsvData
    }
};
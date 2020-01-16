import axios from 'axios';

export default function CsvDataSyncTool({
    token = '',
    orgId = '',
    customHostUrl = '',
    username = ''
}={}){
    let csvData = [];

    const saveCsvData = (features=[])=>{
        csvData = features.map(feature=>{

            feature.geometry = {
                "x": feature.geometry.x,
                "y": feature.geometry.y
            };

            return feature;
        });
        console.log('saveCsvData', csvData);

        save({
            serviceName: 'test-csv-sync-tool',
            features: csvData
        }).then(res=>{
            console.log(res);
        })
    };

    const syncCsvData = ()=>{

    };

    const save = ({
        serviceName = '',
        templateItemId = '',
        features = [],
        mapExtent = null
    }={})=>{
    
        serviceName = formatServiceName(serviceName);
    
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
                // // step 0: need to add geometry to features
                // features = await prepareFeatures(features);
                // console.log('prepareFeatures', features);
    
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
                const templateItemLayerInfo = getLayerInfo();
                console.log('templateItemLayerInfo', templateItemLayerInfo);
    
                // step 5: add to definition
                const addToDefinitionResponse = await addToDefinition(createServiceResponse.serviceurl, createServiceResponse.name, templateItemLayerInfo, mapExtent)
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

    const getLayerInfo = ()=>{
        
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
            "drawingInfo": {
              "renderer": {
                "type": "simple",
                "symbol": {
                  "angle": 0,
                  "xoffset": 0,
                  "yoffset": 0,
                  "type": "esriPMS",
                  "url": "cf5ffcfd-6f98-46a5-8d9b-ab1d16030209",
                  "imageData": "iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1 /AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDkvMjEvMTfORjJUAAAFTElEQVRogd2abXLbNhCGX4CkPli3nbg9QUYHyB38L5OcNvrrm3h8g1ppUlOiIAD9IYJeLXcBytN0xsHMDiCJIvfhu4sv0kAp3nsYY2CMQYwRAGA fTLDz2YwZOpSiZk6AkDcbiOA0YcYI6qqEk8mXjRBjAedAThE6XMJgjsufb4AAqDCTC5IIQQFrrE5INfYCCTBXFxQgNDMspq3tTCT7npgNW9fmAYzXqgAwR23xAxr55SRnAvEotCegEkwExAGwQEqUtuMzQEJGfPDMR4KUNxu4wRkBkSySqj5d9eCeFJ74TtJsQlMzS6kQXDHk9Xss6QMB5HufrLTUJuhBjtHGM4byPnOBzE1NBUk52vWloByIBLAibU9s4k6SRXjvYf9/JkqQfPBCs42BIK2JRgNhEMkc6zNIWn jEDhy5dYk4GP5wdVgzrbKMZh0jlo4WpQpx2mStIbQbvuQHyNxhiY PEjd14CaEi9GIy3uTo5EK6CA3AcjLe5UmKYpWTPqZGAqONLVlOYBMTvLg0HCpAc11RMN0Aag0ZVagYhKUNVSc5LxpXheULzgytBj XhxMcRi2l4Gdr98l5LCi8KsxqMwyxwmSsUhOZGCh plysNmBQIGC4oKcLDSlJkxYwrkwNxyCunDZgc5kIRLawoEFWDw6wHo8rMAdFUk8YZPxznmX8jjJTs14ZWAqGq0LvNQVJ 0G6aK8HHl3qoE8xkYpoUoTClbpiqwsMrwdA8kUCOyPdotDOQxibeMYiKaNMTSRkpZ5YwZglrF6iqhtzxAO8dQjgiRgkiARwhD7AayKgIBymNJzmYJapqjapq0TQtmmYNa5szRnBwbg/nOnhv4T2FSHlDO4Hc/C0bWjllSkBnM2aBqmqxXP6Otr3F7e1vWK8XAID9/oinp2/ouif0PRCCR4wp1LRpjjaj5uONmuxz1JlCWbtE0/yCtv0D79//ibu7G2w259B6eAi4v1/i8dEghBO8P8L7lAvc TkqiKHFyzVQL21jajTNGu/e/Yq7uxt8 FBhtTqf8eamAnCD3a5H3/ NvudJfI3zkyLNa YCTc3aCtZWaNsFNhs7QgDAagVsNhZtu4C1Naytrj5/ppRA3kwpgVy39xSCRwgeXXfEw0PA4fBypsPhnCdddxyPe8Xella0HMmdjE8hXtoxnuDcHrvdd9zfLwHwZP8Hu913OLdHjHxtwdcZVwElkNKd0OY/l6u8EHo494yu wuPjxFfv/Zi9 vcM0LoIS YpDV6UamaEeb2nWTn6VQixgred8M44dD335QBsUOMR/Z/DYr7ISkTc4rMAUjTiZepuPdACAHeH HcM QpSg AGl3aloBURXJKlCDo vxl7hTj2Wnvc5PGHsDhlTATZWho5UAoBAfQJoClaXwCOBDjQNkNB q7FloaRA19jU3/M2dhRUNrL8BoykjhNSpSSnBpMcSVoMfOAUnhRVWRwkxT5AJICy26pDxBn4GC/UeaBJY2H6gyHIaqwnMlG1p0k5g6p21O896N5tA120FSLyaFlrgrD0xDKx1gcLk2Lu050Z2R127QJSBa5xL wm t  UgJ0wLV 1HbpmWxhOYEAJ9pJDbePg/NrG1kT7XDYe43cY6xpi0l1QBpuEETHODjhs/6rGCqsb4fOSneNADgD5DpEnNYXJQuY0CDSQHxJ0XR/W43QbtGSKfCQfhNz54UsjcTgf9L1dGWt oAMTGMl7op3g8TUEAvO0XBmbA5MB4W rxEggHkpxVV4XFVzgyMOm4/2zrRnOyYPNfqpFgCJAElfs8B4RDSZCve82Jw7yVF8/ BQoHPohDgtP1AAAAAElFTkSuQmCC",
                  "contentType": "image/png",
                  "width": 18,
                  "height": 18
                }
              },
              "transparency": 0
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
    
    const addToDefinition = (serviceUrl='', featureServiceName='', templateItemLayerInfo=null, mapExtent=null)=>{
    
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
    
    const addFeatures = (serviceUrl='', features=[])=>{
    
        const requestUrl = serviceUrl + '/0/addFeatures';
        // console.log('addFeatures', JSON.stringify(features));
    
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
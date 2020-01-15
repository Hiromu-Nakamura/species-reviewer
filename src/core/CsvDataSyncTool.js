export default function CsvDataSyncTool({
    token = '',
    orgId = '',
    customHostUrl = '',
    username = ''
}={}){
    let csvData = [];

    const saveCsvData = (features=[])=>{
        csvData = features;
        // console.log('saveCsvData', csvData);
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
                const createServiceResponse = await createService(serviceName, templateItemId);
                console.log('createServiceResponse', createServiceResponse);
    
                // step 3: update item
                if(createServiceResponse.itemId){
                    const updateItemResponse = await updateItem(serviceName, createServiceResponse.itemId);
                    console.log('updateItemResponse', updateItemResponse);
                }
    
                // step 4: get template item layerInfo
                const templateItemLayerInfo = await getTemplateItemInfo(templateItemId);
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
            "serviceItemId": templateItemId,
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
    
    const addToDefinition = (serviceUrl='', featureServiceName='', templateItemLayerInfo=null, mapExtent=null)=>{
    
        templateItemLayerInfo.name = featureServiceName;
        templateItemLayerInfo.extent = mapExtent;
    
        // ignore the time info from the template service item
        if(templateItemLayerInfo.timeInfo){
            delete templateItemLayerInfo.timeInfo;
        }
    
        // console.log(templateItemLayerInfo);
    
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
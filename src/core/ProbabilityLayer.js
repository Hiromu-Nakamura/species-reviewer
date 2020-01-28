import { loadModules } from 'esri-loader';

const ProbabilityLayer = ()=>{

    let pLayer = null;
    let threshold = 0; 
    let mapView = null;

    const setMapView = (view)=>{
        mapView = view;
    }

    const maskPixels = (pixelData)=>{

        const currentMin = threshold;
        const currentMax = 1;

        if (
            pixelData === null ||
            pixelData.pixelBlock === null ||
            pixelData.pixelBlock.pixels === null
        ) {
            console.error('pixelData is missing')
            return;
        }

        // console.log('pixelData', pixelData)

        const pixelBlock = pixelData.pixelBlock;

        const pixels = pixelBlock.pixels;

        const band1 = pixels[0];
        // console.log('band1', band1)

        const mask = pixelBlock.mask;
        // console.log('mask', mask)

        if(!mask){
            console.error('mask is not available');
            return;
        }

        const numPixels = pixelBlock.width * pixelBlock.height;
        // console.log('numPixels', numPixels)

        for (let i = 0; i < numPixels; i++) { 
            // console.log(mask[i])
            mask[i] = (band1[i] >= currentMin && band1[i] <= currentMax) ? 1 : 0;
        }
    }

    const init = async(cutecode='')=>{

        if(pLayer){
            mapView.map.remove(pLayer);
        }

        try {
            const [ ImageryLayer ] = await loadModules(["esri/layers/ImageryLayer"]);

            // using a hard coded URL here for the demp. Need to update this part to get the layer URL by cutecode
            pLayer = new ImageryLayer({
                // url: "https://apl.esri.com/apl22/rest/services/ambycing_20191023_145321_tif/ImageServer",
                url: 'https://apl.esri.com/apl22/rest/services/graperns_combined_prbbly/ImageServer',
                // server exports in either jpg or png format,
                // format: "jpgpng", 
                pixelFilter: maskPixels,
                title: 'Probability Layer'
            });
    
            mapView.map.add(pLayer, 1);

        } catch(err){
            console.error(err);
        }
    };

    const updateThreshold = (value=0)=>{
        threshold = value || 0.01;

        if(pLayer){
            pLayer.redraw();
        }
    };

    return {
        init,
        setMapView,
        updateThreshold
    };

};

export default ProbabilityLayer;


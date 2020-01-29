import { loadModules } from 'esri-loader';

const ProbabilityLayer = ()=>{

    let pLayer = null;
    let threshold = 0; 
    let mapView = null;

    const setMapView = (view)=>{
        mapView = view;
    }

    const maskPixels = (pixelData)=>{

        // use plasma color ramp

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

        // Get the min and max values of the data in the current view
        const minValue = pixelBlock.statistics[0].minValue;
        const maxValue = pixelBlock.statistics[0].maxValue;

        // Calculate the factor by which to determine the red and blue
        // values in the colorized version of the layer
        const factor = 255.0 / (maxValue - minValue);

        // Create empty arrays for each of the RGB bands to set on the pixelBlock
        const rBand = [];
        const gBand = [];
        const bBand = [];

        // Loop through all the pixels in the view
        for (let i = 0; i < numPixels; i++) {
            // Get the pixel value (the temperature) recorded at the pixel location
            let pixelVal = band1[i];
            // Calculate the red value based on the factor
            let red = (pixelVal - minValue) * factor;

            // Sets a color between blue (coldest) and red (warmest) in each band
            rBand[i] = red;
            gBand[i] = 0;
            bBand[i] = 255 - red;
        }

        // Set the new pixel values on the pixelBlock
        pixelData.pixelBlock.pixels = [rBand, gBand, bBand];
        pixelData.pixelBlock.pixelType = "U8"; // U8 is used for color
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


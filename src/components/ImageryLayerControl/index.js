import './style.scss';
import config from './config.json';

const ImageryLayerControl = ({
    containerId = null,
    onChangeHandler = (threshold=0)=>{}
}={})=>{

    let threshold = 0;
    let cutecode = '';

    const container = document.getElementById(containerId);

    const setCutecode = (val='')=>{
        cutecode = val;
    }

    const setThreshold = (val=0)=>{
        threshold = val;

        onChangeHandler(threshold);
    }

    const reset2defaultThreshold = ()=>{
        const defualThreshold = +config["default-threshold"][cutecode] || 0.5;
        setThreshold(defualThreshold);
        setSliderPosition(defualThreshold);
        updateThresholdLableText(defualThreshold);
    }

    const initEventHandlers = ()=>{
        // event handlers for slider
        const slider = document.querySelector('.js-adjust-threshold');

        slider.onchange = function(){
            setThreshold(+this.value);
        }

        slider.oninput = function(){
            updateThresholdLableText(this.value);
        }
        
        // reset threshold
        const resetThresholdBtn = document.querySelector('.js-reset-threshold');
        resetThresholdBtn.addEventListener('click', reset2defaultThreshold);
    };

    const setSliderPosition = (value=0)=>{
        const slider = document.querySelector('.threshold-slider');

        if(slider){
            slider.value = value;
        }
    }

    const updateThresholdLableText = (val=0)=>{
        const textElem = document.getElementById('thresholdLabelText');

        if(textElem){
            textElem.innerText = val;
        }
        
    }

    const render = (cutecode='')=>{

        setCutecode(cutecode);
        
        reset2defaultThreshold();

        const componentHtml = `
            <div class='leader-1'>
                <form class="calcite-slider">
                    <label class='trailer-0'>
                        <span class='font-size--3'>Adjust Probability: <span id='thresholdLabelText'>${threshold}</span></span>
                        <input class='threshold-slider js-adjust-threshold' type="range" min="0" max="1" value=".5" step=".01" aria-valuemin="0" aria-valuemax="1" aria-valuenow=".5">
                    </label>
                </form>

                <div>
                    <label>
                        <span class="font-size--3">feedback</span>
                        <input type="textarea" rows="2">
                    </label>
                </div>

                <div class='js-reset-threshold'>back to default threshold</div>
            </div>
        `;

        container.innerHTML = componentHtml;

        initEventHandlers();
    };

    return {
        render
    };

};

export default ImageryLayerControl;
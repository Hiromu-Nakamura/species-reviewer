import './style.scss';
import config from './config.json';

import { saveFeature } from './services'

const ProbabilityLayerControl = ({
    containerId = null,
    userId = null,
    token = null,
    onChangeHandler = (threshold=0)=>{}
}={})=>{

    let threshold = 0;
    let cutecode = '';

    const container = document.getElementById(containerId);

    const saveAdjustedProbability = async()=>{
        const textarea = document.getElementById('thresholdFeedbackTextArea');
        const Comment = textarea.value;
        // console.log(feedback, threshold, cutecode, token)

        toggleSaveStatusMessage(true);

        try {
            const response = await saveFeature({
                UserID: userId,
                Cutecode: cutecode,
                Threshold: threshold.toString(),
                Comment,
                token
            });
            // console.log(response);
            toggleSaveStatusMessage(false);

        } catch(err){
            console.error('failed to save probability threshold', err);
            toggleSaveStatusMessage(false);
        }
    };

    const setCutecode = (val='')=>{
        cutecode = val;
    }

    const setThreshold = (val=0)=>{
        threshold = val;

        updateThresholdLableText(threshold);

        onChangeHandler(threshold);

        toggleSaveBtn();
    }

    const reset2defaultThreshold = ()=>{
        const defualThreshold = +config["default-threshold"][cutecode] || 0.5;
        setThreshold(defualThreshold);
        setSliderPosition(defualThreshold);
        // updateThresholdLableText(defualThreshold);
    }

    const initEventHandlers = ()=>{
        // event handlers for slider
        const slider = document.querySelector('.js-adjust-threshold');

        // slider.onchange = function(){
        //     setThreshold(+this.value);
        // }

        slider.oninput = function(){
            // updateThresholdLableText(this.value);
            setThreshold(+this.value)
        }
        
        // reset threshold
        const resetThresholdBtn = document.querySelector('.js-reset-threshold');
        resetThresholdBtn.addEventListener('click', reset2defaultThreshold);

        // save btn
        const saveBtn = document.querySelector('.js-save-threshold');
        saveBtn.addEventListener('click', saveAdjustedProbability);
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
        
    };

    const toggleSaveStatusMessage = (isSaving=false)=>{
        const saveBtn = document.querySelector('.save-threshold-btn');
        const statusMessage = document.querySelector('.save-threshold-status-message');

        if(isSaving){
            statusMessage.innerText = 'Saving adjusted threshold...';

            statusMessage.classList.remove('hide');
            saveBtn.classList.add('hide');
        } else {
            statusMessage.innerText = 'Successfully saved';

            setTimeout(()=>{
                statusMessage.classList.add('hide');
                saveBtn.classList.remove('hide');
            }, 2000);
        }
    }

    const toggleSaveBtn = ()=>{
        const saveBtn = document.querySelector('.save-threshold-btn');

        if(saveBtn){
            saveBtn.classList.remove('btn-disabled');
        }
    }

    const render = (cutecode='')=>{

        setCutecode(cutecode);
        
        reset2defaultThreshold();

        const componentHtml = `
            <div class='leader-1 probability-layer-control'>
                <div>
                    <div class='font-size--3 header-nav'>
                        <div class='is-flexy'>Adjust Prediction Threshold: <span id='thresholdLabelText'>${threshold}</span></div>
                        <a class='link-light-blue js-reset-threshold'>reset</a>
                    </div>

                    <form class="calcite-slider">
                        <label class='trailer-0'>
                            <input class='threshold-slider js-adjust-threshold' type="range" min="0" max="1" value=".5" step=".01" aria-valuemin="0" aria-valuemax="1" aria-valuenow=".5">
                        </label>
                    </form>
                </div>

                <div>
                    <label class='trailer-half'>
                        <textarea id='thresholdFeedbackTextArea' type="text" placeholder='please provide your feedback' rows="2"></textarea>
                    </label>
                </div>

                <div class='text-right'>
                    <a class='js-save-threshold save-threshold-btn btn btn-transparent btn-disabled link-light-blue font-size--2'>Save Adjusted Threshold</a>
                    <span class='save-threshold-status-message text-light-gray font-size--2'></span>
                </div>
            </div>
        `;

        container.innerHTML = componentHtml;

        initEventHandlers();
    };

    return {
        render
    };

};

export default ProbabilityLayerControl;
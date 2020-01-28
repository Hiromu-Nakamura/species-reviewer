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
        console.log(defualThreshold)
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
                        <a class='tooltip tooltip-left tooltip-multiline link-light-gray margin-right-quarter' aria-label='Use the slider to see whether adjusting the model threshold results in a better habitat map. Save the adjusted threshold to submit information back to NatureServe on your preferred value. Please use the feedback field to comment on the reasoning behind your selection, including information on your intended end use of a model with this threshold.'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" class="svg-icon"><path d="M14 9.2A1.2 1.2 0 0 1 15.2 8h1.6A1.2 1.2 0 0 1 18 9.2v7.6a1.2 1.2 0 0 1-1.2 1.2h-1.6a1.2 1.2 0 0 1-1.2-1.2V9.2zm4 11.999A1.2 1.2 0 0 0 16.801 20h-1.602A1.2 1.2 0 0 0 14 21.199v1.602A1.2 1.2 0 0 0 15.199 24h1.602A1.2 1.2 0 0 0 18 22.801v-1.602zM31.6 16c0 8.615-6.982 15.6-15.6 15.6C7.385 31.6.4 24.616.4 16S7.384.4 16 .4C24.617.4 31.6 7.384 31.6 16zm-2.401 0c0-7.279-5.92-13.201-13.199-13.201S2.801 8.721 2.801 16 8.721 29.199 16 29.199 29.199 23.279 29.199 16z"/></svg>
                        </a>
                        <div class='is-flexy'> Adjust Prediction Threshold: <span id='thresholdLabelText'>${threshold}</span></div>
                        <a class='link-light-blue js-reset-threshold'>reset</a>
                    </div>

                    <form class="calcite-slider">
                        <label class='trailer-0'>
                            <input class='threshold-slider js-adjust-threshold' type="range" min="0" max="1" value="${threshold}" step=".01" aria-valuemin="0" aria-valuemax="1" aria-valuenow=".5">
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
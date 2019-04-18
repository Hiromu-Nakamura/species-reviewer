import './style.scss';

import config from '../../config';

export default function SpeciesSelector(props={
    containerID: ''
}){

    const container = props.containerID ? document.getElementById(props.containerID) : null;

    let onChangeHandler = null;
    let data = null;
    let selectedTaxa = null;

    const init = (options={})=>{

        onChangeHandler = options.onChange || null;

        render();

        initEventHandler();
    };

    const getHtmlForTaxaSelector = ()=>{

        const distinctTaxa = [];

        data.forEach(d=>{
            const value = d[config.FIELD_NAME.speciesLookup.taxa];

            if(distinctTaxa.indexOf(value) === -1){
                distinctTaxa.push(value);
            }
        });

        distinctTaxa.sort((a,b)=>{
            if(a < b) { return -1; }
            if(a > b) { return 1; }
            return 0;
        });

        // console.log(distinctTaxa);

        const optionsHtml = distinctTaxa.map(d=>{
            return `<option class='select-option' value="${d}">${d}</option>`
        }).join('');

        const taxaSelectorHtml = `
            <label class='trailer-half'>
                <select id='taxaSelector' class="select-full">
                    <option value="" selected disabled hidden>Select Taxa</option>
                    ${optionsHtml}
                </select>
            </label>
        `;
        
        return taxaSelectorHtml;
    };

    const getHtmlForSpeciesSelector = ()=>{

        const dataForSelectedTaxa = data.filter(d=>{return d[config.FIELD_NAME.speciesLookup.taxa] === selectedTaxa});

        dataForSelectedTaxa.sort((a,b)=>{
            if(a[config.FIELD_NAME.speciesLookup.speciesName] < b[config.FIELD_NAME.speciesLookup.speciesName]) { return -1; }
            if(a[config.FIELD_NAME.speciesLookup.speciesName] > b[config.FIELD_NAME.speciesLookup.speciesName]) { return 1; }
            return 0;
        });

        const optionsHtml = dataForSelectedTaxa.map(d=>{
                const val = d[config.FIELD_NAME.speciesLookup.speciesCode];
                const label = d[config.FIELD_NAME.speciesLookup.speciesName];
                const isBold = d.hasBeenReviewed ? 'is-bold' : '';
                return `<option class='select-option ${isBold}' value="${val}">${label}</option>`
            }).join('');

        const speciesSelectorHtml = `
            <label class='trailer-half'>
                <select id='speciesSelector' class="select-full" ${ optionsHtml === '' ? 'disabled' : '' }>
                    <option value="" selected disabled hidden>Select Species</option>
                    ${optionsHtml}
                </select>
            </label>
        `;
        
        return speciesSelectorHtml;
    };

    const render = (options={
        data: []
    })=>{

        data = options.data || data;

        // console.log(data);

        // const options = data.map(d=>{
        //     const val = d.SpeciesCode;
        //     const label = d.SpeciesName;
        //     return `<option class='select-option' value="${val}">${label}</option>`
        // }).join('');

        // const taxaSelectorHtml = `
        //     <label>
        //         <select class="select-full">
        //             <option value="" selected disabled hidden>Select Taxa</option>
        //         </select>
        //     </label>
        // `;

        const compoenetHtml = `
            <div id='taxaSelectorDiv'>
                ${getHtmlForTaxaSelector()}
            </div>
            <div id='speciesSelectorDiv'>
                ${getHtmlForSpeciesSelector()}
            </div>
        `;

        container.innerHTML = compoenetHtml;

    };

    const updateSpeciesSelector = ()=>{
        // console.log(getHtmlForSpeciesSelector());
        document.getElementById('speciesSelectorDiv').innerHTML = getHtmlForSpeciesSelector();
    }

    const initEventHandler = (options={})=>{

        // const changeEventHandler = (event)=>{
        //     if(event.target.value && onChangeHandler){
        //         onChangeHandler(event.target.value);
        //     }
        // };

        // const taxaSelectorOnChange = (event)=>{
        //     console.log(event.target.value);
        // };

        // container.querySelector('#speciesSelector').onchange = changeEventHandler;

        // container.querySelector('#taxaSelector').onchange = taxaSelectorOnChange;

        container.addEventListener('change', (evt)=>{

            const actionsByElementID = {
                'taxaSelector': ()=>{
                    // console.log('taxtSelector on change', event.target.value);
                    selectedTaxa = evt.target.value;
                    updateSpeciesSelector();
                },
                'speciesSelector': ()=>{
                    // console.log('speciesSelector on change', event.target.value);
                    onChangeHandler(evt.target.value);
                }
            };

            if(actionsByElementID[evt.target.id]){
                actionsByElementID[evt.target.id]();
            }
        })
    };

    const setSpeciesSelectorOptionAsReviewed = (speciesCode='')=>{
        const selectOption = document.querySelector(`.select-option[value='${speciesCode}']`);
        selectOption.classList.add('is-bold');

        // console.log(speciesCode);

        data.forEach(d=>{
            if(d[config.FIELD_NAME.speciesLookup.speciesCode] === speciesCode){
                d.hasBeenReviewed = true;
            }
        });
    };

    return {
        init,
        render,
        setSpeciesSelectorOptionAsReviewed
    };

}
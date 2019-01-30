export default function(options={
    containerID: ''
}){
    const container = options.containerID ? document.getElementById(options.containerID) : null;
    
    const init = (options={
        onCloseHandler: null,
        onClickHandler: null
    })=>{
        if(!container){
            console.error('containerID is required to init List View for overall feedback...');
        }

        // const onClickHandler = options.onClickHandler;

        initEventHandlers(options);
    }

    const initEventHandlers = (options={})=>{

        container.addEventListener('click', (evt)=>{

            if(evt.target.classList.contains('js-close') && options.onCloseHandler){
                options.onCloseHandler();
                // console.log(evt.target.dataset.value);
            }

            if(evt.target.classList.contains('js-show-huc') && options.onClickHandler){
                options.onClickHandler(evt.target.dataset.value);
                // console.log(evt.target.dataset.value);
            }
        });
    };

    const render = (data)=>{

        const headerHtml = `
            <div class='trailer-quarter'>
                <span class='icon-ui-left cursor-pointer js-close'></span>
                <span class='font-size--1'>All feedbacks by ${data[0].userID}</span>
            </div>
        `;

        const tableRowsHtml = data.map(d=>{
            const status = d.status;
            const huc = d.hucID;
            const comment = d.comment || 'n/a';
            const statusLable = {
                '1': 'Add',
                '2': 'Remove'
            };
            return `
                <tr class='font-size--3'>
                    <td class='js-show-huc cursor-pointer' data-value='${huc}'>${huc}</td>
                    <td>${statusLable[status]}</td>
                    <td>${comment}</td>
                </tr>
            `
        }).join('');

        const tableHtml = `
            <table class="table table-striped">
                <thead>
                    <tr class='font-size--2'>
                        <th>HUC</th>
                        <th>Action</th>
                        <th>Comment</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRowsHtml}
                </tbody>
            </table>
        `;

        const componentHtml = `
            <div class='leader-1'>
                ${headerHtml}
                ${tableHtml}
            </div>
        `;

        container.innerHTML = componentHtml;
    };

    const toggleVisibility = (isVisible)=>{
        container.classList.toggle('hide', !isVisible);
    }; 

    return {
        init,
        render,
        toggleVisibility
    };
}
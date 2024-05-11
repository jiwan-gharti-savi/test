const initialState = { exportDia: false };

const flowChartRed = (state = initialState, action) => {
    if (action.type === 'ENABLEEXPORT') {
        return {
            ...state,
            exportDia: true
        };
    } else if (action.type === 'DISABLEEXPORT') {
        return {
            ...state,
            exportDia: false
        };
    } else {
        return state;
    }
};


export default flowChartRed;

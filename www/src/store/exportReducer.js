const initialState = { patentExport :false };

const exportReducer = (state = initialState, action) => {
     if (action.type === 'PATENTEXPORTING') {
        return {
            ...state,
            patentExport: true
        };
    } else if (action.type === 'PATENTEXPORTED') {
        return {
            ...state,
            patentExport: false
        };
    } else {
        return state;
    }
};


export default exportReducer;
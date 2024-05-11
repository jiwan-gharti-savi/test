const initialState = { DiaCount: 0 };

const countDiagramsRed = (state = initialState, action) => {
    if (action.type === 'INCREMENT') {
        return {
            ...state,
            DiaCount: state.DiaCount+1
        };
    } else if (action.type === 'RESET') {
        return {
            ...state,
            DiaCount: 0
        };
    } else {
        return state;
    }
};


export default countDiagramsRed;

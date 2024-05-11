const initialState = {
    isOpen: false , retryOverlay :false
  };
  
  const modalReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'TOGGLEMODAL':
        return {
          ...state,
          isOpen: !state.isOpen
        };
        case 'TOGGLERETRYOVERLAY':
          return {
            ...state,
            retryOverlay: !state.retryOverlay
          };
          case 'CLOSEOVERLAY':
            return {
              ...state,
              retryOverlay: false
            };
      default:
        return state;
    }
  };
  
  export default modalReducer;
  
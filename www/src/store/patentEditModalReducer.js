const initialState = {
    isOpen: false 
  };
  
  const patentEditModalRed = (state = initialState, action) => {
    switch (action.type) {
      case 'TOGGLEPATENTMODAL':
        return {
          ...state,
          isOpen: !state.isOpen
        };
      default:
        return state;
    }
  };
  
  export default patentEditModalRed;
  
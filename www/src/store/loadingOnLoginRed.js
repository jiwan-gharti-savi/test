const initialState = {loading : false};

const loadingOnLoginRed = (state = initialState, action) =>
{
    if(action.type == 'LOADING')
    {
        return{
            loading: true
        }
    }
    else if(action.type == 'NOTLOADING')
    {
        return{
            loading: false
        }
    }
    else{
        return state;
    }
}

export default loadingOnLoginRed;
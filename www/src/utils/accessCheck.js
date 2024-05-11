export const isAccess =(props, value)=> {
    // console.log("featureAccess==>",props)
    return props.project?.featureAccess?.includes(value) || props?.project?.config?.authenticator === 'auth0'
  }
  
import React from 'react'
import InventionClaimInput from '../InventionClaimInput'

const DraftPatent = ({searchHandler, inputClaimHandler,   charLength, invention, claims, uploadRefrenceFiles, activeTab, isDraftClaimAccess, additionalProps}) => {
  return (
    <InventionClaimInput
    charLength={charLength}
    invention={invention}
    claims={claims}
    searchHandler={searchHandler}
    inputClaimHandler={inputClaimHandler}
    additionalProps = {additionalProps}
    uploadRefrenceFiles = {uploadRefrenceFiles}
    isDraftClaimAccess = {isDraftClaimAccess}
    activeTab = { activeTab}
  />
  )
}

export default DraftPatent
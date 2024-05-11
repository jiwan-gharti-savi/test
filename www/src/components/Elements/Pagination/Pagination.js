import React from 'react'
import PaginateItems from './PaginateItems'

const Pagination = ({items,itemsPerPage, currentItemsHandler, pageCountHandler}) => {
  return (
    <PaginateItems items = {items} itemsPerPage = {itemsPerPage} currentItemsHandler ={currentItemsHandler} pageCountHandler ={pageCountHandler} />
  )
}

export default Pagination
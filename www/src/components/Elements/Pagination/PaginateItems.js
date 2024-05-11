import React,{useState, useEffect} from 'react'
import ReactPaginate from 'react-paginate';
import './Pagination.scss'


const PaginateItems = ({ items, itemsPerPage, currentItemsHandler, pageCountHandler}) => {
    const [itemOffset, setItemOffset] = useState(0);
    const [pageCount, setPageCount] = useState(0);

    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)
    let currentItems
    useEffect(()=>{
        const endOffset = itemOffset + itemsPerPage;
        console.log(`Loading items from ${itemOffset} to ${endOffset}`);
        currentItems = items.slice(itemOffset, endOffset);
        let pageCounting = Math.ceil(items.length / itemsPerPage);
        setPageCount(pageCounting);
        currentItemsHandler(currentItems);
        pageCountHandler("pageCount",endOffset);
      
    },[itemOffset])

    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % items.length;
      console.log(
        `User requested page number ${event.selected}, which is offset ${newOffset}`
      );
      setItemOffset(newOffset);
    };
  
    return (
        <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0px 20px 20px 20px',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
      }}
      >
         {/* <Items currentItems={currentItems} /> */}
         <ReactPaginate
            activeClassName={'pagination-item pagination-active '}
            breakClassName={'item-item break-me '}
            containerClassName={'pagination'}
            disabledClassName={'disabled-page'}
            nextClassName={"item-item pagination-next "}
            pageClassName={'item-item pagination-page '}
            previousClassName={"item-item pagination-previous"}

            breakLabel="..."
            nextLabel="Next"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="Previous"
            renderOnZeroPageCount={null}
        />
    </div>
       
   
    );
}

export default PaginateItems
import { useEffect, useState } from "react";
import Pagination from 'react-bootstrap/Pagination';

import Item from "./Item";

function ItemList( {tokens, totalCount, accountConnected} ) {
  const [ pagedTokens, setPagedTokens] = useState([]);
  const [ paginationItem, setPaginationItems ] = useState(null);

  useEffect(() => {
    
    setPagedTokens(tokens.slice(0, process.env.REACT_APP_PER_PAGE_COUNT));
    updatePagination(1)
  }, [tokens])

  function fetchPage(e){
    const latestPage = e.target.innerText ? parseInt(e.target.innerText): 1;
    setPagedTokens(tokens.slice((process.env.REACT_APP_PER_PAGE_COUNT*(latestPage-1)),process.env.REACT_APP_PER_PAGE_COUNT*latestPage ))

    updatePagination(latestPage)
  }

  function updatePagination(latestPage){
    let pagesCount = Math.ceil(totalCount/ process.env.REACT_APP_PER_PAGE_COUNT)
    let items = [];
    for (let number = 1; number <= pagesCount; number++) {
      items.push(
        <Pagination.Item key={number} active={number === latestPage} onClick={fetchPage}>
          {number}
        </Pagination.Item>,
      );
    }

    setPaginationItems(items);
  }

  return (
    <>
      <div className="row">
        {tokens.length > 0 ? 
          pagedTokens.map((token, index) => (
            <div className="col-md-3" key={index}>
                <Item token={token}/>
            </div>
          )) : (
            <></>
        )}
        {tokens.length > process.env.REACT_APP_PER_PAGE_COUNT ? (
          <Pagination className="justify-content-center">{paginationItem}</Pagination>
          ) : (
            <></>
        )}
        {accountConnected === null ? (
          <div>Please connect you Metamask wallet.</div>
          ) : (
            <></>
        )}
        {accountConnected != null && tokens.length === 0 ? (
          <div>You have no items in your gallery.</div>
          ) : (
            <></>
        )}
            
      </div>
    </>
  );
}

export default ItemList;
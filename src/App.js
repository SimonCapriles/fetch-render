import './App.css';
import React from "react";
import Button from "react-bootstrap/Button";
import axios from "axios";

const Pagination = ({ items, pageSize, onPageChange }) => {
    if (items.length <= 1) return null;

    let num = Math.ceil(items.length / pageSize);
    let pages = range(1, num + 1);
    const list = pages.map(page => {
        return (
            <Button key={page} onClick={onPageChange} className="page-item">
                {page}
            </Button>
        );
    });
    return (
        <nav>
            <ul className="pagination">{list}</ul>
        </nav>
    );
};

const range = (start, end) => {
    return Array(end - start + 1)
        .fill(0)
        .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
    const start = (pageNumber - 1) * pageSize;
    return items.slice(start, start + pageSize);
}

const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);

    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData
    });

    useEffect(() => {
        let didCancel = false;
        const fetchData = async () => {
            dispatch({ type: "FETCH_INIT" });
            try {
                const result = await axios(url);
                if (!didCancel) {
                    dispatch({ type: "FETCH_SUCCESS", payload: result.data });
                }
            } catch (error) {
                if (!didCancel) {
                    dispatch({ type: "FETCH_FAILURE" });
                }
            }
        };
        fetchData();
        return () => {
            didCancel = true;
        };
    }, [url]);
    console.log(`The URL is: ${url}`);
    return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
    switch (action.type) {
        case "FETCH_INIT":
            return {
                ...state,
                isLoading: true,
                isError: false
            };
        case "FETCH_SUCCESS":
            console.log(action.payload);
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload
            };
        case "FETCH_FAILURE":
            return {
                ...state,
                isLoading: false,
                isError: true
            };
        default:
            throw new Error();
    }
};

function App() {
  const { Fragment, useState } = React;
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
      "https://ghibliapi.herokuapp.com/films/",
      {
        hits: []
      }
  );
  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.hits;
  console.log(`The page is: ${data}`);
  if (data.length >= 1) {
    page = paginate(data, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
      <Fragment>
        <form
            onSubmit={event => {
              doFetch("https://ghibliapi.herokuapp.com/films");
              event.preventDefault();
            }}
        >
          <input
              type="text"
              value={query}
              onChange={event => setQuery(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {isError && <div>Something went wrong ...</div>}

        {isLoading ? (
            <div>Loading ...</div>
        ) : (
            <ul>
              {page.map(item => (
                  <li key={item.id}>
                    <a href={item.url}>{item.title}</a>
                  </li>
              ))}
            </ul>
        )}
        <Pagination
            items={data}
            pageSize={pageSize}
            onPageChange={handlePageChange}
        />
      </Fragment>
  );
}

export default App;

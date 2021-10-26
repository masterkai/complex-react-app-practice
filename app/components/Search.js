import React, {useContext, useEffect} from 'react';
import DispatchContext from '../DispatchContext'
import {useImmer} from 'use-immer'
import useDebounce from '../utils/useDebounce';
import Axios from 'axios';
import {Link} from "react-router-dom";

const Search = () => {
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    searchTerm: '',
    results: [],
    show: 'neither',
    requestCount: 0
  })

  const debouncedSearchTerm = useDebounce(state.searchTerm, 1000);

  console.log(debouncedSearchTerm);

  useEffect(() => {
    document.addEventListener('keyup', searchKeyPressHandler)
    return () => document.removeEventListener('keyup', searchKeyPressHandler)
  }, [])

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.show = 'loading';
      })
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
      }, 1150)
      return () => clearTimeout(delay)
    } else {
      setState(draft => {
        draft.show = 'neither'
      })
    }
  }, [state.searchTerm])

  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source()

      async function fetchResults() {
        try {
          const response = await Axios.post('/search', {searchTerm: debouncedSearchTerm}, {CancelToken: ourRequest.token})
          setState(draft => {
            draft.results = response.data
            draft.show = 'results'
          })
        } catch (e) {
          console.log('有問題發生or請求被取消了');
        }
      }

      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  useEffect(() => {
    document.addEventListener('keyup', searchKeyPressHandler)
    return () => document.removeEventListener('keyup', searchKeyPressHandler)
  }, [state.searchTerm])

  function searchKeyPressHandler(e) {
    if (e.keyCode === 27) {
      appDispatch({type: 'closeSearch'})
    }
  }

  function handleInput(e) {
    const value = e.target.value
    setState(draft => {
      draft.searchTerm = value
    })
  }

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field"
                 className="live-search-field"
                 placeholder="What are you interested in?"/>
          <span onClick={() => appDispatch({type: 'closeSearch'})} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={'circle-loader ' + (state.show == 'loading' ? 'circle-loader--visible' : '')}></div>
          <div className={"live-search-results " + (state.show == 'results' ? 'live-search-results--visible' : '')}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active"><strong>Search
                  Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : 'item'} found)
                </div>
                {state.results.map(post => {
                  const date = new Date(post.createdDate)
                  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
                  return (
                    <Link onClick={() => appDispatch({type: 'closeSearch'})} to={`/post/${post._id}`} key={post._id}
                          href="#" className="list-group-item list-group-item-action">
                      <img className="avatar-tiny" src={post.author.avatar}/>
                      <strong>{post.title}</strong>{' '}
                      <span className="text-muted small">{`by ${post.author.username} on ${dateFormatted}`}</span>
                    </Link>
                  )
                })}
              </div>)}
            {!Boolean(state.results.length) &&
            <p className={'alert alert-danger text-center shadow-sm'}>sorry!! we could not find any results</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
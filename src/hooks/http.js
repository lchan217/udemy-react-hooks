import { useReducer, useCallback } from 'react'

const httpReducer = (currentHttpState, action) => {
  switch(action.type){
    case 'SEND':
      return { 
        loading: true, 
        error: null, 
        data: null,
        extra: null,
        identifier: action.identifier
       }
    case 'RESPONSE':
      return { 
        ...currentHttpState, 
        loading: false, 
        data: action.responseData,
        extra: action.extra
      }
    case 'ERROR':
      return { 
        loading: false, 
        error: action.errorMessage 
      }
    case 'CLEAR_ERROR':
      return { 
        ...currentHttpState, 
        error: null
      }
    default:
      throw new Error('We should not reach this case')
  }
}

const useHttp = () => {
  const [httpState, dispatchHttp] = useReducer(httpReducer, { 
    loading: false, 
    error: null,
    data: null,
    extra: null,
    identifier: null
  })

  const sendRequest = useCallback((url, method, body, reqExtra, reqIdentifier) => {
    dispatchHttp({ type: 'SEND', identifier: reqIdentifier })
    fetch(url, {
      method: method,
      body: body,
      headers: { 
        'Content-Type': 'application/json'
      }
    }).then(response => {
      return response.json()
    }).then(responseData => {
      dispatchHttp({ type: 'RESPONSE', responseData: responseData, extra: reqExtra })     
    }).catch(err => {
      dispatchHttp({ type: 'ERROR', errorMessage: err.message })
    })
  }, [])
  return {
    isLoading: httpState.loading,
    data: httpState.data,
    error: httpState.error,
    sendRequest: sendRequest,
    reqExtra: httpState.extra,
    reqIdentifier: httpState.identifier
  }
}

export default useHttp
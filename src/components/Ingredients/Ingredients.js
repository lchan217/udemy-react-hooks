import React, { useReducer, useEffect, useCallback } from 'react';
// useReducer replaces useState

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList'
import ErrorModal from '../UI/ErrorModal'
import Search from './Search';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type){
    case 'SET':
      return action.ingredients
    case 'ADD':
      return [...currentIngredients, action.ingredient]
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id)
    default: 
      throw new Error('We should not reach this case');
  }
}

const httpReducer = (currentHttpState, action) => {
  switch(action.type){
    case 'SEND_REQUEST':
      return { loading: true, error: null }
    case 'RESPONSE':
      return { ...currentHttpState, loading: false}
    case 'ERROR':
      return { loading: false, error: action.errorMessage }
    case 'CLEAR_ERROR':
      return { ...currentHttpState, error: null}
    default:
      throw new Error('We should not reach this case')
  }
}

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, [])
  const [httpState, dispatchHttp] = useReducer(httpReducer, { loading: false, error: null })

  // const [ userIngredients, setUserIngredients] = useState([])
  // const [ isLoading, setIsLoading ] = useState(false)
  // const [ error, setError ] = useState()

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients)
  })
  
  // useCallback - caches function so it survives re-render cycles
  const filteredIngredientsHander = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients)
    dispatch({type: 'SET', ingredients: filteredIngredients})
  }, [])

  const addIngredientHandler = ingredient => {
    // setIsLoading(true)
    dispatchHttp({ type: 'SEND_REQUEST'})
    
    fetch('https://udemy-react-hooks-c62a0-default-rtdb.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      // setIsLoading(false)
      dispatchHttp({ type: 'RESPONSE'})
      return response.json()
    }).then(responseData => {
      // prevIngredients is like prevState
      // setUserIngredients(prevIngredients => [
      //   ...prevIngredients,
      //   { id: responseData.name, ...ingredient }
      // ])
      dispatch({ type: 'ADD', ingredient: ingredient})
    })
  }

  const removeIngredientHandler = id => {
    // setIsLoading(true)
    dispatchHttp({ type: 'SEND_REQUEST'})

    fetch(`https://udemy-react-hooks-c62a0-default-rtdb.firebaseio.com/ingredients/${id}.json`, {
      method: 'DELETE'
    }).then(response => {
      // setIsLoading(false)
      dispatchHttp({ type: 'RESPONSE'})
      dispatch({type: 'DELETE', id: id})
      // setUserIngredients(prevIngredients => prevIngredients.filter(ing => ing.id !== id))
    }).catch(err => {
      // setError(err.message)
      // setIsLoading(false)
      dispatchHttp({ type: 'ERROR', errorMessage: err.message })
    })
  }

  const clearError = () => {
    // setError(null)
    dispatchHttp({ type: 'CLEAR_ERROR' })
  }

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}

      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading} />

      <section>
        <Search onLoadIngredients={filteredIngredientsHander} />
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
}

export default Ingredients;

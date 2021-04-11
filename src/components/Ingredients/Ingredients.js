import React, { useReducer, useEffect, useCallback, useMemo } from 'react';
// useReducer replaces useState

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList'
import ErrorModal from '../UI/ErrorModal'
import Search from './Search';
import useHttp from '../../hooks/http'

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

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, [])
  const { isLoading, error, data, sendRequest, reqExtra } = useHttp()

  useEffect(() => {
    dispatch({type: 'DELETE', id: reqExtra })
  }, [data, reqExtra])
  
  const filteredIngredientsHander = useCallback(filteredIngredients => {
    dispatch({type: 'SET', ingredients: filteredIngredients})
  }, [])

  const addIngredientHandler = useCallback(ingredient => {

    fetch('https://udemy-react-hooks-c62a0-default-rtdb.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      return response.json()
    }).then(responseData => {
      dispatch({ type: 'ADD', ingredient: ingredient})
    })
  }, [])

  const removeIngredientHandler = useCallback(id => {
    sendRequest(
      `https://udemy-react-hooks-c62a0-default-rtdb.firebaseio.com/ingredients/${id}.json`, 
      'DELETE',
      null,
      id
    )
  }, [sendRequest])

  const clearError = useCallback(() => {
  }, [])

  const ingredientList = useMemo(() => {
    return (
      <IngredientList 
        ingredients={userIngredients} 
        onRemoveItem={removeIngredientHandler} 
      />
    )
  }, [userIngredients, removeIngredientHandler])

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}

      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={isLoading} />

      <section>
        <Search onLoadIngredients={filteredIngredientsHander} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;

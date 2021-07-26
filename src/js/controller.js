import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView  from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const controlRecipes = async function(){
  try{
    const id = window.location.hash.slice(1);

    if(!id) return;
    recipeView.renderSpinner();

    // update view
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // Loading recipe
    await model.loadRecipe(id);

    // Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err){
    recipeView.renderError();
  }
};

const controlSearchResults = async function(){
  try{
    resultsView.renderSpinner();

    // Get search query
    const query = searchView.getQuery();
    if(!query) return;

    // Load search results
    await model.loadSearchResults(query);

    // Render results
    resultsView.render(model.getSearchResultsPage());

    // Render init. pagination buttons
    paginationView.render(model.state.search);
  } catch (err){
    console.log(err);
  }
};

const controlPagination = function(goTopage){
    // Render NEW results
    resultsView.render(model.getSearchResultsPage(goTopage));

    // Render NEW pagination buttons
    paginationView.render(model.state.search);
};

const controlServings = function(newServings){
  // update recipe servings
  model.updateServings(newServings);

  // update view
  recipeView.update(model.state.recipe);
};    

const controlAddBookmark = function(){
  // add/remove 
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // update view
  recipeView.update(model.state.recipe);

  // render
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe){
  try{
    // show loading spinner
    addRecipeView.renderSpinner();

    // upload recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // render recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close form window
    setTimeout(function(){
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000);
  } catch(err){
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function(){
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
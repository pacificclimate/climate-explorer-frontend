/****************************************************************
 * test-validators.js - helper functions for running jasmine tests
 * 
 * This file contains functions to do basic validation of arrays 
 * and objects. Used by the test suite.
 ****************************************************************/

/**********************************************************************
 * 0. Helper functions for validating 2-d arrays.
 **********************************************************************/

/*
 * This function checks to make sure than a 2-d array has
 * the specified rectangular dimensions and that all sub-arrays
 * are the same length (not "jagged").
 */
var isRectangularArray = function(array, height, width) {
  if(array.length != height) {
    return false;
  }
  for(var i = 0; i < height; i++) {
    if(array[i].length != width) {
      return false;
    }
  }
  return true;
};

/*
 * This function checks to make sure every variable in a 2-dimensional 
 * array is defined. It assumes a rectangular array - that is, that each
 * sub-array has the same length.
 */
var allDefinedArray = function (array) {
  var height = array.length;
  var width = array[0].length;
  for(var i = 0; i < height; i++) {
    for(var j = 0; j < height; j++) {
      if(array[i][j] == undefined) {
        return false;
      }
    }
  }
  return true;
};

/********************************************************************
 * 1. Helper function for validating an object
 ********************************************************************/

/*
 * This function checks recursively to make sure all attributes of an 
 * object are defined.
 */
var allDefinedObject = function (obj) {
  for(let att in obj) {
    if(typeof obj[att] == "undefined") {
      return false;
    }
    else if (typeof obj[att] == "object") {
      //arrays, strings, and null also have typeof == "object" 
      //but we don't want to recurse in those cases.
      if(!Array.isArray(obj[att]) && obj[att]) {
        if(!allDefinedObject(obj[att])) {
          return false;
        }
      }
    }
  }
  return true;
};

module.exports = {isRectangularArray, allDefinedArray, allDefinedObject};
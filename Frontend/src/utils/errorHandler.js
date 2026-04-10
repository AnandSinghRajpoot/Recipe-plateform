/**
 * Extract a user-friendly error message from the backend ErrorResponse
 * @param {Object} error - The axios error object
 * @returns {String} - A readable error message
 */
export const extractErrorMessage = (error) => {
    if (!error.response) {
      return "Unable to connect to the server. Please check your connection.";
    }
  
    const { data } = error.response;
  
    // Check for validation errors map
    if (data.errors && typeof data.errors === 'object') {
      const fieldErrors = Object.values(data.errors);
      if (fieldErrors.length > 0) {
        return fieldErrors[0]; // Return the first validation error
      }
    }
  
    return data.message || "An unexpected error occurred. Please try again.";
  };
  
  /**
   * Specifically for forms, extract all field-level errors
   * @param {Object} error - The axios error object
   * @returns {Object} - A map of { fieldName: errorMessage }
   */
  export const extractFieldErrors = (error) => {
    if (error.response?.data?.errors) {
      return error.response.data.errors;
    }
    return {};
  };

export const retryAPI = async (apiFunction: Function, args: any, retries = 2) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt} for API: ${apiFunction.name}`);
        const response = await apiFunction(args);
        return response; // Success, return the result
      } catch (error) {
        console.error(`❌ Error on attempt ${attempt} for ${apiFunction.name}`, error);
  
        if (attempt === retries) {
          console.error(`🚫 API Failed after ${retries} attempts`);
          throw error; // Stop retrying and throw error
        }
  
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    }
  };
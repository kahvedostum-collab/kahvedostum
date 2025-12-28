import axios from '@/services/axiosClient';


/* REQUEST YAPISI
*************************/
/*
    {
      "firstName": "string",
      "lastName": "string",
      "userName": "string",
      "email": "string",
      "password": "string"
    }
*/

export const registerAPI = async (userData) => {
  const response = await axios.post('/Auth/Register', userData);
  return response.data;
};

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return process.env.NODE_ENV === 'production' 
    ? 'https://unstuck-4mh2.onrender.com'
    : 'http://localhost:8000';
};

export const config = {
  apiUrl: getApiUrl()
}; 
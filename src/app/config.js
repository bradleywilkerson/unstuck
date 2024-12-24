const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return process.env.NODE_ENV === 'production' 
    ? 'https://unstuck-backend.onrender.com'  // You'll replace this with your actual Render URL
    : 'http://localhost:8000';
};

export const config = {
  apiUrl: getApiUrl()
}; 
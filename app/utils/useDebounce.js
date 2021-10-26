import { useState, useEffect } from 'react';
const useDebounce = (value, delay )=> {
  const [debouncedVal, setDebouncedVal] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedVal(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debouncedVal;
};

export default useDebounce;
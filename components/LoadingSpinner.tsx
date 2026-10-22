
import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-500"></div>
      {message && <p className="mt-4 text-center text-gray-300">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
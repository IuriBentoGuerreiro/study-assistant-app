interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex justify-between items-center min-w-75 animate-in slide-in-from-right-5`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold hover:text-gray-200">
        &times;
      </button>
    </div>
  );
};
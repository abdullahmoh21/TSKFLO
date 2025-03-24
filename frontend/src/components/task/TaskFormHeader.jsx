import { FaTasks, FaArrowLeft, FaLightbulb } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * Task form header component with title, back button, and tips
 */
const TaskFormHeader = ({ 
  title = "Create New Task", 
  description = "Fill in the details below to create a new task",
  isModal = false,
  showTips = true,
  onBack
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/admindashboard");
    }
  };

  return (
    <>
      {!isModal && (
        <div className="mb-8 sticky top-0 pt-4 pb-2 bg-white dark:bg-secondary-900 z-10">
          <button 
            onClick={handleBack} 
            className="flex items-center text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white flex items-center">
            <FaTasks className="mr-3 text-primary-500" />
            {title}
          </h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            {description}
          </p>
        </div>
      )}
      
      {showTips && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
          <div className="flex items-start">
            <FaLightbulb className="text-yellow-300 text-xl mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-lg">Tips for Effective Tasks</h3>
              <ul className="mt-2 text-sm space-y-1 text-primary-100">
                <li>• Use clear, action-oriented titles</li>
                <li>• Set realistic due dates</li>
                <li>• Add sufficient details in the description</li>
                <li>• Assign to relevant team members</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskFormHeader; 
import { CircleX } from "lucide-react";

const ErrorMessage = ({ message }: { message?: string }): React.ReactNode => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CircleX color="red" className="h-5 w-5 text-red-400" size={20} />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800" id="creation-error-message">
            {message || "An error occurred"}
          </p>
        </div>
      </div>
    </div>
  );
};
export default ErrorMessage;

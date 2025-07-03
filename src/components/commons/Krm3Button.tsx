import { Tooltip } from "react-tooltip";

interface Props {
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  type?: "button" | "submit";
  style?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  disabledTooltipMessage?: string;
  label: string;
}

const Krm3Button = ({ disabled, onClick, type, style, icon, label, disabledTooltipMessage }: Props) => {
  const styles = {
    primary: {
      buttonStyle:
        "text-white border-transparent bg-krm3-primary hover:bg-krm3-primary focus:outline-none focus:ring-yellow-500",
      disabledStyle:
        "text-white border-transparent bg-gray-300 cursor-not-allowed",
    },
    secondary: {
      buttonStyle:
        "border-gray-300 font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-blue-500 transition-colors duration-200",
      disabledStyle:
        "text-white border-transparent bg-gray-300 cursor-not-allowed",
    },
    danger: {
      buttonStyle:
        "text-white border-transparent bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-red-500",
      disabledStyle:
        "text-white border-transparent bg-gray-300 cursor-not-allowed",
    },
    default: {
      buttonStyle:
        "text-white border-transparent bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-yellow-500",
      disabledStyle:
        "text-white border-transparent bg-gray-300 cursor-not-allowed",
    },
  };

  const { buttonStyle, disabledStyle } = styles[style || "default"];

  return (
    <>
      <button
        data-tooltip-id={`tooltip-${label}`}
        className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md  transition-colors duration-200 focus:ring-2 focus:ring-offset-2 ${
          disabled ? disabledStyle : buttonStyle
        }`}
        id="delete-button"
        type={type}
        onClick={onClick}
        disabled={disabled}
      >
        {icon && <span className="mr-2">{icon}</span>}
        <span>{label}</span>
      </button>
      {disabled && (
        <Tooltip id={`tooltip-${label}`} content={disabledTooltipMessage} />
      )}
    </>
  );
};
export default Krm3Button;

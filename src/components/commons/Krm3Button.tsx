import { Tooltip } from "react-tooltip";

interface Props {
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  type?: "button" | "submit";
  style?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  disabledTooltipMessage?: string;
  label: string;
  mobileLabel?: string;
  additionalStyles?: string;
}

const Krm3Button = ({ disabled, onClick, type, style, icon, label, disabledTooltipMessage, additionalStyles="", mobileLabel }: Props) => {
  const styles = {
    primary: {
      buttonStyle:
        "text-white border-transparent bg-krm3-primary hover:bg-krm3-primary-dark focus:outline-none focus:ring-krm3-primary",
      disabledStyle:
        "text-white border-transparent bg-krm3-disabled cursor-not-allowed",
    },
    secondary: {
      buttonStyle:
        "border-krm3-disabled font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-krm3-disabled transition-colors duration-200",
      disabledStyle:
        "text-white border-transparent bg-krm3-disabled cursor-not-allowed",
    },
    danger: {
      buttonStyle:
        "text-white border-transparent bg-krm3-danger hover:bg-krm3-danger-dark focus:outline-none focus:ring-krm3-danger",
      disabledStyle:
        "text-white border-transparent bg-krm3-disabled cursor-not-allowed",
    },
    default: {
      buttonStyle:
        "text-white border-transparent bg-krm3-primary hover:bg-krm3-primary-darkr focus:outline-none focus:ring-krm3-primary",
      disabledStyle:
        "text-white border-transparent bg-krm3-disabled cursor-not-allowed",
    },
  };

  const { buttonStyle, disabledStyle } = styles[style || "default"];

  return (
    <>
      <button
        data-tooltip-id={`tooltip-${label}`}
        className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md  transition-colors duration-200 focus:ring-2 focus:ring-offset-2 ${
          disabled ? disabledStyle : buttonStyle
        } ${additionalStyles}`}
        id="delete-button"
        type={type || "button"}
        onClick={onClick}
        disabled={disabled}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {mobileLabel ? (
            <>
              <span className="sm:inline hidden">{label}</span>
              <span className="sm:hidden inline">{mobileLabel}</span>
            </>
        ) : (
            label
        )}

      </button>
      {disabled && (
        <Tooltip id={`tooltip-${label}`} content={disabledTooltipMessage} />
      )}
    </>
  );
};
export default Krm3Button;

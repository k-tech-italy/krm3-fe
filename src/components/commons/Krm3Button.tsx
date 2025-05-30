interface Props {
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  type?: "button" | "submit";
  style?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  label: string;
}

const Krm3Button = ({ disabled, onClick, type, style, icon, label }: Props) => {
  let buttonStyle;
  switch (style) {
    case "primary":
      buttonStyle =
        "bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500";
      break;
    case "secondary":
      buttonStyle =
        "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      break;
    case "danger":
      buttonStyle =
        "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500";
      break;
    default:
      buttonStyle =
        "bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500";
  }

  return (
    <button
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md  transition-colors duration-200 ${
        disabled ? "bg-gray-300 cursor-not-allowed" : buttonStyle
      }`}
      id="delete-button"
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span>{icon}</span>}
      <span className="ml-2">{label}</span>
    </button>
  );
};
export default Krm3Button;
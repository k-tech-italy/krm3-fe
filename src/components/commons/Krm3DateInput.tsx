import { KeyboardEvent, useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";

const ISO = "YYYY-MM-DD";

interface Props {
  id: string;
  /** The date as YYYY-MM-DD, or "" for no date. */
  value: string;
  /** Called with the picked date as YYYY-MM-DD, or "" when it is cleared. */
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * A date field with a calendar popup: the date can be typed (YYYY-MM-DD) or picked from the calendar.
 * Escape closes the calendar only, not a popover containing the field.
 */
export default function Krm3DateInput({
  id,
  value,
  onChange,
  className,
  disabled,
  invalid,
  describedBy,
}: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const date = moment(value, ISO, true);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" && calendarOpen) e.stopPropagation();
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <DatePicker
        id={id}
        selected={date.isValid() ? date.toDate() : null}
        onChange={(picked: Date | null) => onChange(picked ? moment(picked).format(ISO) : "")}
        dateFormat="yyyy-MM-dd"
        placeholderText="yyyy-mm-dd"
        className={className}
        wrapperClassName="w-full"
        disabled={disabled}
        ariaInvalid={invalid ? "true" : undefined}
        ariaDescribedBy={describedBy}
        isClearable={!disabled}
        showPopperArrow={false}
        autoComplete="off"
        onCalendarOpen={() => setCalendarOpen(true)}
        onCalendarClose={() => setCalendarOpen(false)}
      />
    </div>
  );
}

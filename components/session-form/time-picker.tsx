import Picker from "react-mobile-picker";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type PickerValue = { minute: number; second: number };

export default function TimePicker({
  cycleIndex,
  intervalIndex,
  onChange,
  value,
}: {
  cycleIndex: number;
  intervalIndex: number;
  onChange: (value: PickerValue) => void;
  value: PickerValue;
}) {
  return (
    <Popover
      onOpenChange={(isOpen) => {
        if (isOpen) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "";
        }
      }}
    >
      <PopoverTrigger asChild>
        <Input
          id={`interval-${cycleIndex}-${intervalIndex}-duration`}
          type="text"
          value={`${value.minute}:${value.second.toLocaleString(undefined, {
            minimumIntegerDigits: 2,
          })}`}
          readOnly
        />
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="flex">
          <span className="flex-1 text-center">Minutes</span>
          <span className="flex-1 text-center">Secondes</span>
        </div>
        <Picker value={value} onChange={onChange} wheelMode="normal">
          {["minute", "second"].map((value) => (
            <Picker.Column key={value} name={value}>
              {[...Array(60).keys()].map((option) => (
                <Picker.Item key={option} value={option}>
                  {option}
                </Picker.Item>
              ))}
            </Picker.Column>
          ))}
        </Picker>
      </PopoverContent>
    </Popover>
  );
}

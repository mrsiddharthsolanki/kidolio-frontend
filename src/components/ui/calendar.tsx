import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  showYearSelector?: boolean;
  yearRange?: { from: number; to: number };
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showYearSelector = true,
  yearRange = { from: 1950, to: new Date().getFullYear() + 10 },
  ...props
}: CalendarProps) {
  const [isYearDropdownOpen, setIsYearDropdownOpen] = React.useState(false);
  const [displayMonth, setDisplayMonth] = React.useState(
    props.selected instanceof Date ? props.selected : new Date()
  );

  const years = React.useMemo(() => {
    const yearsArray = [];
    for (let year = yearRange.to; year >= yearRange.from; year--) {
      yearsArray.push(year);
    }
    return yearsArray;
  }, [yearRange]);

  const handleYearSelect = (year: number) => {
    const newDate = new Date(displayMonth);
    newDate.setFullYear(year);
    setDisplayMonth(newDate);
    setIsYearDropdownOpen(false);
    
    // If there's an onMonthChange prop, call it
    if (props.onMonthChange) {
      props.onMonthChange(newDate);
    }
  };

  const CustomCaption = ({ displayMonth: currentMonth }: { displayMonth: Date }) => {
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });
    const year = currentMonth.getFullYear();

    return (
      <div className="flex justify-center pt-1 relative items-center">
        <div className="text-sm font-medium flex items-center gap-2">
          <span>{monthName}</span>
          {showYearSelector ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-7 px-2 py-0 text-sm font-medium hover:bg-accent flex items-center gap-1"
                )}
              >
                {year}
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isYearDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsYearDropdownOpen(false)}
                  />
                  
                  {/* Year dropdown */}
                  <div className="absolute top-full left-0 z-50 mt-1 w-24 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-border rounded-md shadow-lg">
                    {years.map((yearOption) => (
                      <button
                        key={yearOption}
                        type="button"
                        onClick={() => handleYearSelect(yearOption)}
                        className={cn(
                          "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors",
                          yearOption === year && "bg-primary text-primary-foreground"
                        )}
                      >
                        {yearOption}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <span>{year}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      month={displayMonth}
      onMonthChange={setDisplayMonth}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Caption: CustomCaption,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

// Demo component to show the enhanced calendar in action
function CalendarDemo() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-2xl font-bold">Enhanced Calendar with Year Selection</h2>
      <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          showYearSelector={true}
          yearRange={{ from: 1950, to: 2050 }}
          className="rounded-md border"
        />
      </div>
      {selectedDate && (
        <p className="text-sm text-muted-foreground">
          Selected date: {selectedDate.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

export { Calendar, CalendarDemo as default };
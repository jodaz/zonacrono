"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { FieldPath, FieldValues } from "react-hook-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Button,
  Calendar,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui";
import { cn, parseEventDate } from "@/lib";
import { BaseFieldProps } from "./types";

interface FormDatePickerProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> 
  extends BaseFieldProps<TFieldValues, TName> {
  placeholder?: string;
  disabled?: boolean;
  disabledDays?: (date: Date) => boolean;
}

export function FormDatePicker<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  label,
  description,
  containerClassName,
  placeholder = "Seleccionar fecha...",
  disabled = false,
  disabledDays,
}: FormDatePickerProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Parse current value (could be YYYY-MM-DD string or Date object)
        const dateValue = React.useMemo(() => {
          if (!field.value) return undefined;
          if (field.value instanceof Date) return field.value;
          if (typeof field.value === "string") {
            return parseEventDate(field.value);
          }
          return undefined;
        }, [field.value]);

        const displayValue = React.useMemo(() => {
          if (!dateValue) return "";
          return format(dateValue, "dd-MM-yyyy");
        }, [dateValue]);

        return (
          <FormItem className={cn("flex flex-col", containerClassName)}>
            {label && (
              <FormLabel className="font-mono text-[10px] uppercase tracking-widest font-bold text-foreground">
                {label}
              </FormLabel>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      "w-full justify-start text-left rounded-none border-2 border-black h-11 font-mono text-sm font-bold",
                      !field.value && "text-muted-foreground italic font-satoshi font-medium"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-primary" />
                    {displayValue || placeholder}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-none border-2 border-black" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(date) => {
                    if (date) {
                      // Format to YYYY-MM-DD to match backend / form schemas
                      const formatted = format(date, "yyyy-MM-dd");
                      field.onChange(formatted);
                    } else {
                      field.onChange("");
                    }
                  }}
                  disabled={disabledDays}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            {description && <FormDescription className="italic text-xs">{description}</FormDescription>}
            <FormMessage className="text-[10px] font-bold uppercase" />
          </FormItem>
        );
      }}
    />
  );
}

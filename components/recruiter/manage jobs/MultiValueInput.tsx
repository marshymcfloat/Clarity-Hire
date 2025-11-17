"use client";

import { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type MultiValueInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  as?: "input" | "textarea";
  description?: string;
};

const MultiValueInput = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  as = "input",
  description,
}: MultiValueInputProps<T>) => {
  const [inputValue, setInputValue] = useState("");
  const InputComponent = as === "textarea" ? Textarea : Input;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const items: string[] = Array.isArray(field.value) ? field.value : [];

        const handleAddItem = () => {
          const trimmedValue = inputValue.trim();
          if (trimmedValue && !items.includes(trimmedValue)) {
            field.onChange([...items, trimmedValue]);
            setInputValue("");
          }
        };

        const handleRemoveItem = (itemToRemove: string) => {
          field.onChange(items.filter((item) => item !== itemToRemove));
        };

        const handleEditItem = (itemToEdit: string) => {
          handleRemoveItem(itemToEdit);
          setInputValue(itemToEdit);
        };

        const handleKeyDown = (
          e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          if (as === "input" && (e.key === "Enter" || e.key === ",")) {
            e.preventDefault();
            handleAddItem();
          }
        };

        return (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}

            {/* Render the list of items */}
            <div className="flex flex-wrap gap-2 rounded-md border p-2 min-h-[46px] bg-background">
              {items.length === 0 && (
                <span className="text-sm text-muted-foreground px-2 py-1">
                  No items added yet.
                </span>
              )}
              {items.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 px-2 py-1 text-sm bg-secondary text-secondary-foreground rounded-md"
                >
                  <span
                    className="break-all cursor-pointer hover:opacity-80"
                    onClick={() => handleEditItem(item)}
                    title="Click to edit"
                  >
                    {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item)}
                    className="rounded-full hover:bg-muted/50 p-0.5"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <FormControl>
              <div className="flex flex-col sm:flex-row gap-2">
                <InputComponent
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder || "Type a value and click Add"}
                  className="flex-1"
                  rows={as === "textarea" ? 3 : undefined}
                />
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!inputValue.trim()}
                  className="w-full sm:w-auto"
                >
                  {items.includes(inputValue.trim()) ? "Update" : "Add"}
                </Button>
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default MultiValueInput;

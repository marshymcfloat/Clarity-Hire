"use client";

import { Control, FieldValues, Path } from "react-hook-form";
import { Question, QuestionTypeEnum } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type QuestionRendererProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  type: QuestionTypeEnum;
  question: Question;
};

const QuestionRenderer = <TFieldValues extends FieldValues>({
  control,
  name,
  type,
  question,
}: QuestionRendererProps<TFieldValues>) => {
  const questionCardStyle = "space-y-3 rounded-lg border bg-card p-4 shadow-sm";

  switch (type) {
    case "TEXT":
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className={questionCardStyle}>
              <FormLabel className="text-base font-semibold">
                {question.question}
              </FormLabel>
              <FormControl>
                <Input placeholder="Your answer..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "NUMBER":
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className={questionCardStyle}>
              <FormLabel className="text-base font-semibold">
                {question.question}
              </FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter a number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "TRUE_OR_FALSE":
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className={questionCardStyle}>
              <FormLabel className="text-base font-semibold">
                {question.question}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="true" />
                    </FormControl>
                    <FormLabel className="font-normal">True</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="false" />
                    </FormControl>
                    <FormLabel className="font-normal">False</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "MULTIPLE_CHOICE":
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className={questionCardStyle}>
              <FormLabel className="text-base font-semibold">
                {question.question}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2 pt-2"
                >
                  {question.options.map((option) => (
                    <FormItem
                      key={option}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={option} />
                      </FormControl>
                      <FormLabel className="font-normal">{option}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "CHECKBOX":
      return (
        <FormField
          control={control}
          name={name}
          render={() => (
            <FormItem className={questionCardStyle}>
              <div className="mb-4">
                <FormLabel className="text-base font-semibold">
                  {question.question}
                </FormLabel>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {question.options.map((option) => (
                  <FormField
                    key={option}
                    control={control}
                    name={name}
                    render={({ field }) => {
                      const fieldValue: string[] = Array.isArray(field.value)
                        ? field.value
                        : [];
                      return (
                        <FormItem
                          key={option}
                          className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 transition-colors hover:bg-accent hover:text-accent-foreground has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
                        >
                          <FormControl>
                            <Checkbox
                              checked={fieldValue.includes(option)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...fieldValue, option])
                                  : field.onChange(
                                      fieldValue.filter(
                                        (value) => value !== option,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="w-full cursor-pointer font-normal">
                            {option}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    default:
      return null;
  }
};

export default QuestionRenderer;

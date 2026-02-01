"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { QuestionTypeEnum } from "@/lib/zod schemas/questionSchema";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import MultiValueInput from "./MultiValueInput";

import { QUESTION_TYPE_MAP } from "@/constants";
import {
  createQuestionSchema,
  CreateQuestionValues,
} from "@/lib/zod schemas/questionSchema";
import { createNewQuestionAction } from "@/lib/actions/questionActions";

const TYPES_WITH_OPTIONS: QuestionTypeEnum[] = ["MULTIPLE_CHOICE", "CHECKBOX"];

const CreateQuestionForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const form = useForm<CreateQuestionValues>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      question: "",
      type: "TEXT",
      options: [],
    },
  });

  const questionType = form.watch("type");

  const { mutate: createQuestion, isPending } = useMutation({
    mutationFn: createNewQuestionAction,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Question created successfully!");
        form.reset();
        onSuccess();
      } else {
        toast.error(data.error || "Something went wrong.");
      }
    },
    onError: (error) => {
      toast.error("Failed to create question. Please try again.");
      console.error(error);
    },
  });

  const handleSubmission = (values: CreateQuestionValues) => {
    createQuestion(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmission)}
        className="space-y-6 pt-4"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a question type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(
                    Object.entries(QUESTION_TYPE_MAP) as [
                      QuestionTypeEnum,
                      string,
                    ][]
                  ).map(([key, value]) => (
                    <SelectItem value={key} key={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Text</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., How many years of experience do you have?"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is the question the candidate will see.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {TYPES_WITH_OPTIONS.includes(questionType) && (
          <MultiValueInput
            control={form.control}
            name="options"
            label="Answer Options"
            placeholder="Add an option and press Enter"
          />
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Question"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateQuestionForm;

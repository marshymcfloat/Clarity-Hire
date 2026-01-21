"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Question, QuestionOnJob, Resume } from "@prisma/client";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { createApplicationSchema } from "@/lib/zod schemas/auth/jobApplicationSchemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import QuestionRenderer from "./QuestionRenderer";
import { SubmitApplicationAction } from "@/lib/actions/jobApplicationActionts";

type QuestionOnJobWithQuestion = QuestionOnJob & {
  Question: Question;
};

type JobFormProps = {
  questions: QuestionOnJobWithQuestion[];
  resumes: Resume[];
  jobId: string;
};

const JobForm = ({ questions, resumes, jobId }: JobFormProps) => {
  const [resumeOption, setResumeOption] = useState<"select" | "upload">(
    resumes.length > 0 ? "select" : "upload",
  );

  const formSchema = useMemo(
    () => createApplicationSchema(questions),
    [questions],
  );
  type ApplicationFormValues = z.infer<typeof formSchema>;

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeSelection: resumes.length > 0 ? "select" : "upload",
      resumeId: resumes.length > 0 ? resumes[0].id : undefined,
      newResumeFile: undefined,
      coverLetter: "",
      attachments: undefined,
      answers: questions.reduce(
        (acc, q) => {
          acc[q.Question.id] = q.Question.type === "CHECKBOX" ? [] : "";
          return acc;
        },
        {} as Record<string, string | string[]>,
      ),
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: SubmitApplicationAction,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error || "An unknown error occurred.");
      }
    },
    onError: (error) => {
      toast.error("Failed to submit application. Please try again.");
      console.error(error);
    },
  });

  const onSubmit = (values: ApplicationFormValues) => {
    const formData = new FormData();

    formData.append("jobId", jobId);

    if (values.resumeSelection === "select" && values.resumeId) {
      formData.append("resumeId", values.resumeId);
    } else if (values.resumeSelection === "upload" && values.newResumeFile) {
      formData.append("newResumeFile", values.newResumeFile);
    }

    if (values.coverLetter) {
      formData.append("coverLetter", values.coverLetter);
    }

    if (values.attachments && values.attachments.length > 0) {
      Array.from(values.attachments as unknown as FileList).forEach((file) => {
        formData.append("attachments", file);
      });
    }

    formData.append("answers", JSON.stringify(values.answers));

    mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Your Resume</h3>
          <p className="text-sm text-muted-foreground">
            First, choose a resume to submit with your application.
          </p>
          <FormField
            control={form.control}
            name="resumeSelection"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={(value: "select" | "upload") => {
                      field.onChange(value);
                      setResumeOption(value);
                    }}
                    defaultValue={field.value}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                  >
                    <FormItem>
                      <RadioGroupItem
                        value="select"
                        id="select"
                        className="peer sr-only"
                        disabled={resumes.length === 0}
                      />
                      <FormLabel
                        htmlFor="select"
                        className={`flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${
                          resumes.length === 0
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        Choose an existing resume
                        <p className="mt-1 text-xs text-muted-foreground">
                          Select from your saved resumes.
                        </p>
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <RadioGroupItem
                        value="upload"
                        id="upload"
                        className="peer sr-only"
                      />
                      <FormLabel
                        htmlFor="upload"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        Upload a new resume
                        <p className="mt-1 text-xs text-muted-foreground">
                          PDF, DOC, DOCX up to 5MB.
                        </p>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-4">
            {resumeOption === "select" && (
              <FormField
                control={form.control}
                name="resumeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Select Resume
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a saved resume..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {resume.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {resumeOption === "upload" && (
              <FormField
                control={form.control}
                name="newResumeFile"
                render={({ field: { onChange, value, ...rest } }) => {
                  const selectedFile = value as File | undefined;
                  return (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        New Resume File
                      </FormLabel>
                      <FormControl>
                        <label className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition hover:border-primary hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                          <div className="text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            {selectedFile ? (
                              <p className="mt-2 font-medium text-primary">
                                {selectedFile.name}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                PDF, DOC, DOCX (MAX. 5MB)
                              </p>
                            )}
                          </div>
                          <Input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => onChange(e.target.files?.[0])}
                            {...rest}
                          />
                        </label>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
          </div>

          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Cover Letter (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us why you're a great fit for this role..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attachments"
            render={({ field: { onChange, ...rest } }) => {
              return (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Additional Documents (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      className="cursor-pointer"
                      onChange={(e) => {
                        onChange(e.target.files);
                      }}
                      {...rest}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Upload portfolios, certifications, or references. Max 5MB
                    per file.
                  </p>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <Separator />

        <div className="space-y-6">
          {questions.map((q) => (
            <QuestionRenderer
              key={q.Question.id}
              control={form.control}
              name={`answers.${q.Question.id}`}
              question={q.Question}
              type={q.Question.type}
            />
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </Form>
  );
};

export default JobForm;

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  Question,
  QuestionOnJob,
  Resume,
} from "@/lib/generated/prisma/client";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  UploadCloud,
  FileText,
  CheckCircle2,
  Plus,
  Paperclip,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="font-space font-bold text-lg text-slate-900">
              Your Resume
            </h3>
            <p className="text-sm text-slate-500">
              Choose how you want to submit your resume.
            </p>
          </div>

          <FormField
            control={form.control}
            name="resumeSelection"
            render={({ field }) => (
              <FormItem className="space-y-4">
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
                        className={cn(
                          "relative flex flex-col items-start gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all duration-200",
                          "hover:bg-slate-50 hover:border-slate-300",
                          field.value === "select"
                            ? "border-indigo-600 bg-indigo-50/50"
                            : "border-slate-100 bg-white",
                          resumes.length === 0 &&
                            "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            field.value === "select"
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span
                            className={cn(
                              "font-bold block text-sm mb-1",
                              field.value === "select"
                                ? "text-indigo-900"
                                : "text-slate-900",
                            )}
                          >
                            Existing Resume
                          </span>
                          <span className="text-xs text-slate-500 block">
                            Use a resume from your profile
                          </span>
                        </div>
                        {field.value === "select" && (
                          <div className="absolute top-4 right-4 text-indigo-600">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
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
                        className={cn(
                          "relative flex flex-col items-start gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all duration-200",
                          "hover:bg-slate-50 hover:border-slate-300",
                          field.value === "upload"
                            ? "border-indigo-600 bg-indigo-50/50"
                            : "border-slate-100 bg-white",
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            field.value === "upload"
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          <Plus className="w-5 h-5" />
                        </div>
                        <div>
                          <span
                            className={cn(
                              "font-bold block text-sm mb-1",
                              field.value === "upload"
                                ? "text-indigo-900"
                                : "text-slate-900",
                            )}
                          >
                            Upload New
                          </span>
                          <span className="text-xs text-slate-500 block">
                            PDF, DOCX up to 5MB
                          </span>
                        </div>
                        {field.value === "upload" && (
                          <div className="absolute top-4 right-4 text-indigo-600">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
            {resumeOption === "select" && (
              <FormField
                control={form.control}
                name="resumeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-slate-700">
                      Select Resume
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white focus:ring-indigo-100 focus:border-indigo-500">
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
                      <FormLabel className="text-sm font-bold text-slate-700">
                        Upload File
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <label className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 transition-all hover:border-indigo-500 hover:bg-slate-50 active:scale-[0.99]">
                            <div className="text-center space-y-4">
                              <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                {selectedFile ? (
                                  <p className="font-bold text-indigo-600 break-all px-4">
                                    {selectedFile.name}
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-sm font-medium text-slate-900">
                                      Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      PDF, DOC, DOCX (Max 5MB)
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                            <Input
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => onChange(e.target.files?.[0])}
                              {...rest}
                            />
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Optional Info */}
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-slate-700 flex justify-between">
                  <span>Cover Letter</span>
                  <span className="text-slate-400 font-normal text-xs uppercase tracking-wider">
                    Optional
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us why you're a great fit for this role..."
                    className="min-h-[120px] rounded-xl border-slate-200 bg-white focus:ring-indigo-100 focus:border-indigo-500 resize-none p-4"
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
                  <FormLabel className="text-sm font-bold text-slate-700 flex justify-between">
                    <span>Additional Documents</span>
                    <span className="text-slate-400 font-normal text-xs uppercase tracking-wider">
                      Optional
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center justify-center gap-2 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium text-slate-700">
                        <Paperclip className="w-4 h-4 text-slate-400" />
                        Choose Files
                        <Input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                          {...rest}
                        />
                      </label>
                      <span className="text-xs text-slate-400">
                        Max 5MB per file
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Questions Section */}
        {questions.length > 0 && (
          <>
            <Separator className="bg-slate-100" />
            <div className="space-y-6">
              <h3 className="font-space font-bold text-lg text-slate-900">
                Additional Questions
              </h3>
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
            </div>
          </>
        )}

        {/* Submit Actions */}
        <div className="pt-4 pb-8">
          <Button
            type="submit"
            size="lg"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-500/10 transition-all hover:-translate-y-0.5"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Application...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default JobForm;

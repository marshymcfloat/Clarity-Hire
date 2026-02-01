"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";

import {
  Job,
  QuestionOnJob,
  JobStatus,
  JobType,
  ExperienceLevel,
  WorkArrangement,
} from "@/lib/generated/prisma/client";
import { createJobSchema, CreateJobValues } from "@/lib/zod schemas/jobSchema";
import {
  createJobAction,
  updateJobAction,
  generateJobDescriptionField,
  generateJobDescriptionList,
  GenerateListPayload,
  GenerateSummaryPayload,
} from "@/lib/actions/createJobActions";
import {
  departments,
  EXPERIENCE_LEVEL_MAP,
  JOB_STATUS_MAP,
  JOB_TYPE_MAP,
  WORK_ARRANGEMENT_MAP,
} from "@/constants";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

import MultiValueInput from "./MultiValueInput";
import SelectQuestion from "./SelectQuestion";
import FormSection from "./FormSection";
import { AiGenerateButton } from "./AiGenerateButton";

const CreateJobForm = ({
  onSuccess,
  initialData,
}: {
  onSuccess: () => void;
  initialData?: Job & { QuestionOnJob: QuestionOnJob[] };
}) => {
  const [isSubmitting, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState({
    summary: false,
    qualifications: false,
    responsibilities: false,
  });

  const isEditMode = !!initialData?.id;
  const { companySlug, memberId } = useParams();

  const form = useForm<CreateJobValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: initialData?.title || "",
      summary: initialData?.summary || "",
      department: initialData?.department || "",
      location: initialData?.location || "",
      jobType: initialData?.jobType || "FULL_TIME",
      experienceLevel: initialData?.experienceLevel || "ENTRY_LEVEL",
      workArrangement: initialData?.workArrangement || "ON_SITE",
      status: initialData?.status || "DRAFT",
      salaryMin: initialData?.salaryMin ?? undefined,
      salaryMax: initialData?.salaryMax ?? undefined,
      benefits: initialData?.benefits || [],
      qualifications: initialData?.qualifications || [],
      responsibilities: initialData?.responsibilities || [],
      skills: initialData?.skills || [],
      workSchedule: initialData?.workSchedule || "",
      questions: initialData?.QuestionOnJob || [],
    },
  });

  const handleGenerateSummary = () => {
    const { title, department, experienceLevel, jobType, location, skills } =
      form.getValues();
    if (!title) {
      form.setError("title", { message: "Please enter a job title first." });
      return;
    }
    startTransition(async () => {
      setIsGenerating((prev) => ({ ...prev, summary: true }));
      const payload: GenerateSummaryPayload = {
        jobTitle: title,
        department,
        experienceLevel,
        jobType,
        location,
        skills,
      };
      const result = await generateJobDescriptionField(payload);
      if (result.success && result.text) {
        form.setValue("summary", result.text);
      } else {
        form.setError("summary", {
          message: result.error || "An error occurred.",
        });
      }
      setIsGenerating((prev) => ({ ...prev, summary: false }));
    });
  };

  const handleGenerateList = (
    fieldName: "qualifications" | "responsibilities",
  ) => {
    const { title, summary, department, experienceLevel, jobType } =
      form.getValues();
    if (!title) {
      form.setError("title", { message: "Please enter a job title first." });
      return;
    }
    startTransition(async () => {
      setIsGenerating((prev) => ({ ...prev, [fieldName]: true }));
      const payload: GenerateListPayload = {
        fieldName,
        jobTitle: title,
        summary,
        department,
        experienceLevel,
        jobType,
      };
      const result = await generateJobDescriptionList(payload);
      if (result.success && result.list) {
        form.setValue(fieldName, result.list, { shouldValidate: true });
      } else {
        form.setError(fieldName, {
          message: result.error || "An error occurred.",
        });
      }
      setIsGenerating((prev) => ({ ...prev, [fieldName]: false }));
    });
  };

  const { mutate: createMutate, isPending: createPending } = useMutation({
    mutationFn: createJobAction,
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.error);
        return;
      }
      toast.success(data.message);
      onSuccess();
    },
    onError: (error) => {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(error);
    },
  });

  const { mutate: updateMutate, isPending: updatePending } = useMutation({
    mutationFn: updateJobAction,
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.error);
        return;
      }
      toast.success(data.message);
      onSuccess();
    },
  });
  const onSubmit = (values: CreateJobValues) => {
    if (
      !companySlug ||
      typeof companySlug !== "string" ||
      !memberId ||
      typeof memberId !== "string"
    ) {
      toast.error("An error occurred. Missing required URL parameters.");
      return;
    }
    const payload = { ...values, companySlug, memberId };

    if (initialData) {
      updateMutate({ values: payload, id: initialData.id });
    } else {
      createMutate(payload);
    }
  };

  const disabled = isSubmitting || createPending || updatePending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection
          title="Job Details"
          description="Provide the core details about the job. This information will be displayed prominently."
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Senior Frontend Developer"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dep) => (
                        <SelectItem key={dep} value={dep}>
                          {dep}
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
              name="jobType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Job Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(JOB_TYPE_MAP).map((key) => (
                        <SelectItem key={key} value={key}>
                          {JOB_TYPE_MAP[key as JobType]}
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
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Experience Level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(EXPERIENCE_LEVEL_MAP).map((key) => (
                        <SelectItem key={key} value={key as ExperienceLevel}>
                          {EXPERIENCE_LEVEL_MAP[key as ExperienceLevel]}
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
              name="workArrangement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Arrangement</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select arrangement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(WORK_ARRANGEMENT_MAP).map((key) => (
                        <SelectItem key={key} value={key}>
                          {WORK_ARRANGEMENT_MAP[key as WorkArrangement]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Makati City, Philippines"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection
          title="Compensation & Schedule"
          description="Specify salary range and work hours. This can be left blank."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="salaryMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Salary (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === "" ? undefined : Number(value),
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salaryMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Salary (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 80000"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === "" ? undefined : Number(value),
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="workSchedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Schedule (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Mon-Fri, 9am-6pm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection
          title="Description & Requirements"
          description="Flesh out the role. Use our AI assistant to generate content based on the job details."
        >
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Summary</FormLabel>
                  <AiGenerateButton
                    onClick={handleGenerateSummary}
                    isLoading={isGenerating.summary}
                    isDisabled={isSubmitting}
                  />
                </div>
                <FormControl>
                  <Textarea
                    placeholder="A brief summary of the role..."
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <MultiValueInput
              label="Skills"
              control={form.control}
              name="skills"
              placeholder="e.g., React, TypeScript"
              as="input"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <AiGenerateButton
                onClick={() => handleGenerateList("qualifications")}
                isLoading={isGenerating.qualifications}
                isDisabled={isSubmitting}
              />
            </div>
            <MultiValueInput
              label="Qualifications"
              control={form.control}
              name="qualifications"
              placeholder="e.g., Bachelor's degree in Computer Science"
              as="textarea"
            />
            {form.formState.errors.qualifications && (
              <FormMessage>
                {form.formState.errors.qualifications.message}
              </FormMessage>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <AiGenerateButton
                onClick={() => handleGenerateList("responsibilities")}
                isLoading={isGenerating.responsibilities}
                isDisabled={isSubmitting}
              />
            </div>
            <MultiValueInput
              label="Responsibilities"
              control={form.control}
              name="responsibilities"
              placeholder="e.g., Develop and maintain web applications"
              as="textarea"
            />
            {form.formState.errors.responsibilities && (
              <FormMessage>
                {form.formState.errors.responsibilities.message}
              </FormMessage>
            )}
          </div>
          <div className="space-y-2">
            <MultiValueInput
              label="Benefits"
              control={form.control}
              name="benefits"
              placeholder="e.g., Health insurance, 20 days paid leave"
              as="input"
            />
            {form.formState.errors.benefits && (
              <FormMessage>
                {form.formState.errors.benefits.message}
              </FormMessage>
            )}
          </div>
        </FormSection>

        <FormSection
          title="Application Questions"
          description="Add optional questions for applicants to answer when they apply."
        >
          <FormField
            control={form.control}
            name="questions"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectQuestion
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <Separator />

        <div className="flex items-center justify-end gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="w-40">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Set Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(JOB_STATUS_MAP).map((key) => (
                      <SelectItem key={key} value={key}>
                        {JOB_STATUS_MAP[key as JobStatus]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={disabled || Object.values(isGenerating).some(Boolean)}
            className="w-40"
          >
            {disabled ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {disabled
              ? "Saving..."
              : isEditMode
                ? "Update Job"
                : "Create Job Posting"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateJobForm;

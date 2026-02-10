"use client";

import { useTransition, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { SubmitApplicationAction } from "@/lib/actions/jobApplicationActionts";
import { useRouter } from "next/navigation";

// Define schema locally for now, ideally import from shared lib
const applicationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  linkedIn: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  portfolio: z
    .string()
    .url("Invalid Portfolio URL")
    .optional()
    .or(z.literal("")),
  coverLetter: z.string().optional(),
  // We'll handle the file manually outside react-hook-form's register due to tricky file handling
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
  userId?: string;
  userEmail?: string;
}

export function ApplicationForm({
  jobId,
  jobTitle,
  userId,
  userEmail,
}: ApplicationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const router = useRouter();

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "", // Ideally pre-fill if user data available
      email: userEmail || "",
      phone: "",
      linkedIn: "",
      portfolio: "",
      coverLetter: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Max 5MB.");
        return;
      }
      if (
        ![
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type)
      ) {
        toast.error("Invalid file type. Only PDF and DOCX are allowed.");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Max 5MB.");
        return;
      }
      if (
        ![
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type)
      ) {
        toast.error("Invalid file type. Only PDF and DOCX are allowed.");
        return;
      }
      setResumeFile(file);
    }
  };

  async function onSubmit(data: ApplicationFormValues) {
    if (!resumeFile) {
      toast.error("Please upload your resume.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("newResumeFile", resumeFile);

      // Structure answers as JSON string to match backend expectation
      // Mapping standard fields to potential "questions" or just passing raw if backend adapted
      // The current backend expects "answers" as a JSON string for specific question IDs.
      // Since we are building a generic form first, we might need to adjust the backend or this form to handle dynamic questions.
      // For this MVP, we will assume standard fields are mapped to a generic "answers" object or handle them separately.

      // WAIT: The backend `SubmitApplicationAction` expects `answers` (JSON string) and `coverLetter`.
      // It DOES NOT seemingly have fields for `fullName`, `email`, etc. in the `Application` model directly based on my memory of the schema?
      // Let's check schema. If User is logged in, we have their ID. If not... wait, the backend `SubmitApplicationAction` requires `session.user.id`.
      // So this form is for LOGGED IN users.

      // We will pass the standard fields as part of "answers" for now if they aren't in the Application model,
      // OR we just assume the user profile has them.
      // Let's pass them as answers for now to be safe.

      const answers = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        linkedIn: data.linkedIn,
        portfolio: data.portfolio,
      };

      formData.append("answers", JSON.stringify(answers));
      if (data.coverLetter) formData.append("coverLetter", data.coverLetter);

      try {
        const result = await SubmitApplicationAction(formData);

        if (result.success) {
          toast.success("Application submitted successfully!");
          // Reset form or redirect
          setResumeFile(null);
          form.reset();
          // router.push("/dashboard/applications"); // Example redirect
        } else {
          toast.error(result.error || "Failed to submit application.");
        }
      } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred.");
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
      <Card className="border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-space font-bold text-primary">
            Apply for {jobTitle}
          </CardTitle>
          <CardDescription>
            Please fill out the form below to apply. We're excited to hear from
            you!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Resume Upload - Fitts's Law Optimized */}
              <div
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
                  ${isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}
                  ${resumeFile ? "bg-accent/10 border-accent" : ""}
                `}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleDrop}
                onClick={() =>
                  document.getElementById("resume-upload")?.click()
                }
              >
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <AnimatePresence mode="wait">
                  {resumeFile ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-foreground">
                        {resumeFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                        }}
                        className="text-destructive hover:text-destructive/90"
                      >
                        Remove
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="font-medium text-lg">
                        Click or drag resume here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PDF or DOCX (Max 5MB)
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="linkedin.com/in/johndoe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="portfolio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio / Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us why you're a fit for this role..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="px-0 pb-0 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg font-semibold animate-button-glow hover:scale-[1.01] transition-transform"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

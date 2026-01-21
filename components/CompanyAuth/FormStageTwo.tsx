"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  CompanyCreationStageOneValues,
  companyCreationStageTwoSchema,
  CompanyCreationStageTwoValues,
} from "@/lib/zod schemas/auth/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import {
  checkCompanySlug,
  createCompanyAndUserAction,
} from "@/lib/actions/authActions";
import { Button } from "../ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useProgressRouter } from "@/hooks/useProgressRouter";

type SlugStatus = "idle" | "checking" | "available" | "taken";
type CombinedFormData = {
  form1Values: CompanyCreationStageOneValues;
  form2Values: CompanyCreationStageTwoValues;
};

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

const COMPANY_SIZES = [
  { value: "SIZE_1_10", label: "1-10 employees" },
  { value: "SIZE_11_50", label: "11-50 employees" },
  { value: "SIZE_51_200", label: "51-200 employees" },
  { value: "SIZE_201_1000", label: "201-1000 employees" },
  { value: "SIZE_1000_PLUS", label: "1000+ employees" },
];

const FormStageTwo = ({ prevStep }: { prevStep: () => void }) => {
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);

  const stepOneState = useSelector((state: RootState) => state.launchCompany);
  const router = useProgressRouter();
  const form = useForm<CompanyCreationStageTwoValues>({
    resolver: zodResolver(companyCreationStageTwoSchema),
    defaultValues: {
      companyName: "",
      companySlug: "",
      companySize: "",
    },
  });

  const { formState } = form;

  const companyNameInput = form.watch("companyName");
  const companySlugInput = form.watch("companySlug");

  useEffect(() => {
    if (!isSlugManuallyEdited && companyNameInput) {
      const suggestedSlug = generateSlug(companyNameInput);
      form.setValue("companySlug", suggestedSlug, {
        shouldValidate: true,
      });
    }
  }, [companyNameInput, isSlugManuallyEdited, form]);

  useEffect(() => {
    if (!companySlugInput || companySlugInput.trim() === "") {
      setSlugStatus("idle");
      setSlugSuggestions([]);
      setIsSlugManuallyEdited(false);
      return;
    }

    setSlugStatus("checking");
    setSlugSuggestions([]);

    const inputDebounce = setTimeout(async () => {
      const response = await checkCompanySlug(companySlugInput);

      if (response.success) {
        setSlugStatus("available");
      } else {
        setSlugStatus("taken");
        form.setError("companySlug", {
          type: "manual",
          message: response.error,
        });
        if (response.suggestions) {
          setSlugSuggestions(response.suggestions);
        }
      }
    }, 500);

    return () => {
      clearTimeout(inputDebounce);
    };
  }, [companySlugInput, form]);

  const handleSuggestionClick = (suggestion: string) => {
    form.setValue("companySlug", suggestion, { shouldValidate: true });
    setIsSlugManuallyEdited(true);
    setSlugSuggestions([]);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (variables: CombinedFormData) =>
      createCompanyAndUserAction(variables.form1Values, variables.form2Values),

    onSuccess: async (data, variable) => {
      if (data.success && data.company) {
        toast.success("Your company has been launched successfully!");

        const response = await signIn("credentials", {
          email: variable.form1Values.workEmail,
          password: variable.form1Values.password,
          redirect: false,
        });

        if (!response?.ok) {
          toast.error(response?.error);
          return;
        }

        toast.success("Logged in Successfully, wait for redirection");
        router.refresh();
      } else {
        toast.error(data.error || "An unknown error occurred.");
      }
    },
    onError: (error) => {
      toast.error("A network or server error occurred. Please try again.");
      console.error("Mutation Error:", error);
    },
  });

  async function handleSubmission(values: CompanyCreationStageTwoValues) {
    const combinedData: CombinedFormData = {
      form1Values: stepOneState,
      form2Values: values,
    };

    mutate(combinedData);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmission)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name={"companyName"}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  formState.errors.companyName && "text-destructive"
                )}
              >
                Company Name
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="My Awesome Company Inc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={"companySlug"}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  formState.errors.companySlug && "text-destructive"
                )}
              >
                Company Slug
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="my-awesome-company-inc"
                    onChange={(e) => {
                      if (e.target.value.trim() !== "") {
                        setIsSlugManuallyEdited(true);
                      }
                      form.clearErrors("companySlug");
                      field.onChange(e);
                    }}
                  />
                  {slugStatus === "checking" && (
                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-slate-400" />
                  )}
                </div>
              </FormControl>
              {slugStatus === "available" && (
                <div className="flex items-center text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <p>Slug is available!</p>
                </div>
              )}
              {slugStatus === "taken" && slugSuggestions.length > 0 && (
                <div className="pt-1">
                  <p className="text-sm text-slate-500 mb-2">
                    Some suggestions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slugSuggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-auto px-2.5 py-1 text-slate-700 bg-slate-50 hover:bg-slate-100"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companySize"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  formState.errors.companySize && "text-destructive"
                )}
              >
                Company Size
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center pt-4">
          <Button type="button" variant="ghost" onClick={prevStep}>
            Back
          </Button>
          <Button
            type="submit"
            disabled={
              slugStatus === "taken" || slugStatus === "checking" || isPending
            }
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Finish
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormStageTwo;

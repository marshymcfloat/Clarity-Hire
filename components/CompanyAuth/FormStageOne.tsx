"use client";

import {
  companyCreationStageOneSchema,
  CompanyCreationStageOneValues,
} from "@/lib/zod schemas/auth/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { launghCompanySliceActions } from "@/lib/redux slices/LaunchCompanySlice";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import React from "react";

const FormStageOne = ({ nextStep }: { nextStep: () => void }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CompanyCreationStageOneValues>({
    resolver: zodResolver(companyCreationStageOneSchema),
    defaultValues: {
      fullname: "",
      workEmail: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { formState } = form;

  async function handleSubmission(values: CompanyCreationStageOneValues) {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    dispatch(launghCompanySliceActions.setStepOneForm(values));
    setIsSubmitting(false);
    nextStep();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmission)}
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  "font-medium text-foreground/80",
                  formState.errors.fullname && "text-destructive",
                )}
              >
                Full Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Juan Dela Cruz"
                  className="h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all duration-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  "font-medium text-foreground/80",
                  formState.errors.workEmail && "text-destructive",
                )}
              >
                Work Email
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="juandelacruz@company.com"
                  className="h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all duration-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  "font-medium text-foreground/80",
                  formState.errors.password && "text-destructive",
                )}
              >
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all duration-200 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  "font-medium text-foreground/80",
                  formState.errors.confirmPassword && "text-destructive",
                )}
              >
                Confirm Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all duration-200"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </form>
    </Form>
  );
};

export default React.memo(FormStageOne);

"use client";

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
import {
  authRegisterSchema,
  AuthRegisterValues,
} from "@/lib/zod schemas/auth/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authRegisterAction } from "@/lib/actions/authActions";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
const AuthRegisterForm = () => {
  const form = useForm<AuthRegisterValues>({
    resolver: zodResolver(authRegisterSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const formInputs = Object.keys(
    form.getValues(),
  ) as (keyof AuthRegisterValues)[];

  const { mutate, isPending } = useMutation({
    mutationFn: authRegisterAction,
    onSuccess: (data, variables) => {
      if (data.error || !data.success) {
        toast.error(data.error || "Registration failed.");
        return;
      }

      toast.success(data.message);

      signIn("credentials", {
        email: variables.email,
        password: variables.password,
        redirect: false,
      }).then((res) => {
        if (res?.ok) {
          toast.success("Successfully signed in!");
        } else {
          toast.error(res?.error || "Sign-in failed after registration.");
        }
      });
    },
    onError: () => {
      toast.error("An unexpected error occurred. Please try again.");
    },
  });

  function onSubmit(values: AuthRegisterValues) {
    mutate(values);
  }

  return (
    <div className="w-full relative">
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>

      <Form {...form}>
        <form
          action=""
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {formInputs.map((input) => (
            <FormField
              key={input}
              control={form.control}
              name={input}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize font-medium text-foreground/80">
                    {input !== "confirmPassword" ? input : "Confirm Password"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={
                        input === "name"
                          ? "text"
                          : input === "email"
                            ? "email"
                            : "password"
                      }
                      className="h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all duration-200"
                      placeholder={
                        input === "email"
                          ? "name@example.com"
                          : input === "name"
                            ? "John Doe"
                            : "••••••••"
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            className="w-full h-11 mt-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
            disabled={isPending}
          >
            {isPending && <LoaderCircle className="animate-spin mr-2" />}
            Sign up
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AuthRegisterForm;

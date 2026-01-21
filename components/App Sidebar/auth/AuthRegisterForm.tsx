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
    <Form {...form}>
      <form
        action=""
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {formInputs.map((input) => (
          <FormField
            key={input}
            control={form.control}
            name={input}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capitalize">
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button className="mt-6" disabled={isPending}>
          {isPending && <LoaderCircle className="animate-spin" />}
          Sign up
        </Button>
      </form>
    </Form>
  );
};

export default AuthRegisterForm;

"use client";

import { useState } from "react";
import {
  authLoginSchema,
  AuthLoginValues,
} from "@/lib/zod schemas/auth/authSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useProgressRouter } from "@/hooks/useProgressRouter";

const AuthLoginForm = ({ onClose }: { onClose: () => void }) => {
  const router = useProgressRouter();

  const form = useForm<AuthLoginValues>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const formInputs = Object.keys(form.getValues()) as (keyof AuthLoginValues)[];

  async function onSubmit(values: AuthLoginValues) {
    try {
      const signInResponse = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!signInResponse?.ok) {
        toast.error(signInResponse?.error || "Invalid credentials");
      } else {
        toast.success("Logged in successfully!");
        onClose();
        router.refresh();
        return;
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
    }
  }

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form
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
                <FormLabel className="capitalize">{input}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={input === "email" ? "email" : "password"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex flex-col gap-2 mt-6">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}
            Login
          </Button>
          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <p className="font-medium">OR</p>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => signIn("google")}
            disabled={isSubmitting}
          >
            <FaGoogle />
            Login with Google
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AuthLoginForm;

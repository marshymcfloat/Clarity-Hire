"use client";

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
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useProgressRouter } from "@/hooks/useProgressRouter";

const AuthLoginForm = ({
  onClose,
  hideTitle = false,
}: {
  onClose: () => void;
  hideTitle?: boolean;
}) => {
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
        toast.success("Welcome back!", {
          description: "Logged in successfully.",
        });
        onClose();
        router.refresh();
        return;
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  const { isSubmitting } = form.formState;

  return (
    <div className="w-full relative">
      {!hideTitle && (
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
      )}

      <Form {...form}>
        <form
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
                    {input}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={input === "email" ? "email" : "password"}
                      className="h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all duration-200"
                      placeholder={
                        input === "email" ? "name@example.com" : "••••••••"
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <div className="flex flex-col gap-3 mt-4">
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="  px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-muted-foreground/20 hover:bg-muted/50 transition-all duration-200"
              onClick={() => signIn("google")}
              disabled={isSubmitting}
            >
              <FaGoogle className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AuthLoginForm;

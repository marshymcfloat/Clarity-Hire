import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import AuthLoginForm from "./AuthLoginForm";
import AuthRegisterForm from "./AuthRegisterForm";

type DialogContentType = "REGISTER" | "LOGIN";

const AuthDialog = ({
  open,
  onOpenChange,
  onClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}) => {
  const [dialogContent, setDialogContent] =
    useState<DialogContentType>("LOGIN");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center tracking-widest font-medium text-2xl">
            ClarityHire
          </DialogTitle>
        </DialogHeader>

        {dialogContent === "LOGIN" ? (
          <>
            <AuthLoginForm onClose={onClose} />
            <div className="text-sm text-center">
              <p className="">
                Still no account?{" "}
                <span
                  className="hover:underline font-medium"
                  onClick={() => setDialogContent("REGISTER")}
                >
                  Sign up
                </span>
              </p>
            </div>
          </>
        ) : (
          <>
            <AuthRegisterForm />
            <div className="text-sm text-center">
              <p>
                Already have an account?{" "}
                <span
                  className="font-medium hover:underline"
                  onClick={() => setDialogContent("LOGIN")}
                >
                  Sign in
                </span>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;

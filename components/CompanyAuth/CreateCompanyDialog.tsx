"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Rocket } from "lucide-react";
import FormStageOne from "./FormStageOne";
import { useState } from "react";
import FormStageTwo from "./FormStageTwo";
import { useDispatch } from "react-redux";
import { launghCompanySliceActions } from "@/lib/redux slices/LaunchCompanySlice";
import { Separator } from "../ui/separator";
import AuthLoginForm from "../App Sidebar/auth/AuthLoginForm";

type FormStepType = 1 | 2 | "LOGIN";

const TRIGGER_BUTTON_CLASSNAME =
  "font-bold bg-white/60 border border-slate-200/80 shadow-md shadow-black/10 text-slate-900 backdrop-blur-lg transform transition-all duration-300 hover:scale-105 hover:bg-white/80 hover:shadow-lg z-50 fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-auto md:left-auto md:translate-x-0 md:top-8 md:right-8";

const CreateCompanyDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formStep, setFormStep] = useState<FormStepType>(1);

  const dispatch = useDispatch();

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      dispatch(launghCompanySliceActions.resetForm());
      setFormStep(1);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className={TRIGGER_BUTTON_CLASSNAME}>
          <Rocket className="mr-2 h-5 w-5" />
          Launch Your Company
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="pt-4">
          <DialogTitle>Launch Your Company</DialogTitle>
          <DialogDescription>
            Let&apos;s get you started. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="">
          {formStep === 1 && <FormStageOne nextStep={() => setFormStep(2)} />}
          {formStep === 2 && <FormStageTwo prevStep={() => setFormStep(1)} />}
        </div>
        {formStep === 1 && (
          <>
            <div className="flex items-center gap-2">
              <Separator className="flex-1 " />
              <span className="font-bold">OR</span>
              <Separator className="flex-1" />
            </div>
            <Button onClick={() => setFormStep("LOGIN")}>
              Login with your company
            </Button>
          </>
        )}
        {formStep === "LOGIN" && (
          <AuthLoginForm onClose={() => setIsOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateCompanyDialog;

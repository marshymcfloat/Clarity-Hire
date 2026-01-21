"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Rocket, Building2, LogIn, ArrowLeft } from "lucide-react";
import FormStageOne from "./FormStageOne";
import { useState } from "react";
import FormStageTwo from "./FormStageTwo";
import { useDispatch } from "react-redux";
import { launghCompanySliceActions } from "@/lib/redux slices/LaunchCompanySlice";
import AuthLoginForm from "../App Sidebar/auth/AuthLoginForm";
import { cn } from "@/lib/utils";

type FormStepType = "SELECTION" | "CREATE_1" | "CREATE_2" | "LOGIN";

const TRIGGER_BUTTON_CLASSNAME =
  "font-bold bg-white/60 border border-slate-200/80 shadow-md shadow-black/10 text-slate-900 backdrop-blur-lg transform transition-all duration-300 hover:scale-105 hover:bg-white/80 hover:shadow-lg z-50 fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-auto md:left-auto md:translate-x-0 md:top-8 md:right-8";

const CreateCompanyDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formStep, setFormStep] = useState<FormStepType>("SELECTION");

  const dispatch = useDispatch();

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      dispatch(launghCompanySliceActions.resetForm());
      // Small delay to reset view after dialog close animation
      setTimeout(() => setFormStep("SELECTION"), 300);
    }
  }

  const handleBack = () => {
    if (formStep === "CREATE_2") setFormStep("CREATE_1");
    else setFormStep("SELECTION");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className={TRIGGER_BUTTON_CLASSNAME}>
          <Rocket className="mr-2 h-5 w-5" />
          Launch Your Company
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-slate-200/50 shadow-2xl duration-300">
        <div className="p-6">
          <DialogHeader className="mb-6 relative">
            {formStep !== "SELECTION" && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute -left-2 -top-2 h-8 w-8 hover:bg-slate-100/50"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle
              className={cn(
                "text-2xl font-bold text-center",
                formStep !== "SELECTION" && "ml-4",
              )}
            >
              {formStep === "LOGIN" ? "Company Login" : "Launch Your Company"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {formStep === "SELECTION" && (
              <div className="grid gap-4">
                <button
                  onClick={() => setFormStep("CREATE_1")}
                  className="flex flex-col items-center justify-center p-6 space-y-3 border border-slate-200 rounded-xl hover:border-violet-300 hover:shadow-md hover:bg-violet-50/30 transition-all duration-300 group text-center bg-white"
                >
                  <div className="p-3 bg-violet-100/50 text-violet-600 rounded-full group-hover:scale-110 group-hover:bg-violet-100 transition-all duration-300">
                    <Rocket className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-violet-700 transition-colors">
                      New Company
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Register and launch a new company profile
                    </p>
                  </div>
                </button>

                <div className="relative flex items-center py-2">
                  <span className="flex-grow border-t border-slate-200"></span>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">
                    Already have an account?
                  </span>
                  <span className="flex-grow border-t border-slate-200"></span>
                </div>

                <button
                  onClick={() => setFormStep("LOGIN")}
                  className="flex items-center justify-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 group w-full"
                >
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:text-slate-900">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-slate-900">
                    Login to Company Dashboard
                  </span>
                </button>
              </div>
            )}

            {formStep === "CREATE_1" && (
              <FormStageOne nextStep={() => setFormStep("CREATE_2")} />
            )}
            {formStep === "CREATE_2" && (
              <FormStageTwo prevStep={() => setFormStep("CREATE_1")} />
            )}

            {formStep === "LOGIN" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <AuthLoginForm
                  onClose={() => setIsOpen(false)}
                  hideTitle={true}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCompanyDialog;

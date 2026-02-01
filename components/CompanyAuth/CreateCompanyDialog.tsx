"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Rocket, LogIn, ArrowLeft } from "lucide-react";
import FormStageOne from "./FormStageOne";
import { useCallback, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { launghCompanySliceActions } from "@/lib/redux slices/LaunchCompanySlice";
import AuthLoginForm from "../App Sidebar/auth/AuthLoginForm";
import FormStageTwo from "./FormStageTwo";
import { useDispatch } from "react-redux";

type FormStepType = "SELECTION" | "CREATE_1" | "CREATE_2" | "LOGIN";

interface CreateCompanyDialogProps {
  trigger?: ReactNode;
}

const TRIGGER_BUTTON_CLASSNAME =
  "w-full sm:w-auto font-bold shadow-lg hover:shadow-xl transition-all duration-300";

const CreateCompanyDialog = ({ trigger }: CreateCompanyDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formStep, setFormStep] = useState<FormStepType>("SELECTION");

  const dispatch = useDispatch();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);

      if (!open) {
        dispatch(launghCompanySliceActions.resetForm());
        setTimeout(() => setFormStep("SELECTION"), 300);
      }
    },
    [dispatch],
  );

  const handleBack = useCallback(() => {
    setFormStep((prev) => (prev === "CREATE_2" ? "CREATE_1" : "SELECTION"));
  }, []);

  const handleNextStep = useCallback(() => setFormStep("CREATE_2"), []);
  const handlePrevStep = useCallback(() => setFormStep("CREATE_1"), []);
  const handleCreateStep = useCallback(() => setFormStep("CREATE_1"), []);
  const handleLoginStep = useCallback(() => setFormStep("LOGIN"), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button size="lg" className={TRIGGER_BUTTON_CLASSNAME}>
            <Rocket className="mr-2 h-5 w-5" />
            Launch Your Company
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
        <div className="p-8">
          <DialogHeader className="mb-8 relative items-start">
            {formStep !== "SELECTION" && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute -left-3 -top-3 h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 rounded-full"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle
              className={cn(
                "text-2xl font-space font-bold text-slate-900 tracking-tight",
                formStep !== "SELECTION" && "ml-6",
              )}
            >
              {formStep === "LOGIN" ? "Welcome Back" : "Start Your Journey"}
            </DialogTitle>
            <p className="text-sm text-slate-500 font-medium mt-1.5 ml-0.5">
              {formStep === "SELECTION"
                ? "Choose how you want to proceed"
                : formStep === "LOGIN"
                  ? "Access your dashboard"
                  : "Create your company profile"}
            </p>
          </DialogHeader>

          <div className="mt-2">
            {formStep === "SELECTION" && (
              <div className="grid gap-4">
                <button
                  onClick={handleCreateStep}
                  className="relative group flex items-start gap-5 p-5 w-full text-left border border-slate-200 rounded-2xl hover:border-indigo-600/30 hover:shadow-lg hover:shadow-indigo-500/5 bg-slate-50/50 hover:bg-white transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative p-3 bg-white border border-slate-200 rounded-xl shadow-sm group-hover:scale-105 group-hover:border-indigo-100 group-hover:shadow-md transition-all duration-300 text-indigo-600">
                    <Rocket className="w-6 h-6" />
                  </div>

                  <div className="relative flex-1">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 transition-colors">
                      Register New Company
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Create a new profile to start hiring talent and managing
                      your team.
                    </p>
                  </div>
                </button>

                <div className="relative flex items-center py-3">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Or
                  </span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <button
                  onClick={handleLoginStep}
                  className="group flex items-center gap-4 p-4 w-full text-left border border-transparent rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  <div className="p-2.5 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white group-hover:text-slate-700 group-hover:shadow-sm transition-all duration-200">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      Login to Dashboard
                    </span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-slate-500 rotate-180 transition-all transform group-hover:translate-x-1" />
                </button>
              </div>
            )}

            {formStep === "CREATE_1" && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <FormStageOne nextStep={handleNextStep} />
              </div>
            )}
            {formStep === "CREATE_2" && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <FormStageTwo prevStep={handlePrevStep} />
              </div>
            )}

            {formStep === "LOGIN" && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <AuthLoginForm onClose={handleClose} hideTitle={true} />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCompanyDialog;

"use client";

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useState } from "react";
import AuthDialog from "@/components/App Sidebar/auth/AuthDialog";

const LoginRequiredState = ({
  title = "Authentication Required",
  description = "Please log in to continue with your application.",
}: {
  title?: string;
  description?: string;
}) => {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-xl border border-slate-200 bg-slate-50/50">
      <AuthDialog
        open={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onOpenChange={setIsAuthDialogOpen}
      />
      <div className="p-3 bg-white rounded-full shadow-sm ring-1 ring-slate-200">
        <Lock className="w-6 h-6 text-slate-400" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-lg text-slate-900">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          {description}
        </p>
      </div>
      <Button
        onClick={() => setIsAuthDialogOpen(true)}
        className="w-full max-w-[200px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md transition-all duration-300"
      >
        Login to Apply
      </Button>
    </div>
  );
};

export default LoginRequiredState;

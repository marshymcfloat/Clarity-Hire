import { Button } from "@/components/ui/button";
import { RiGeminiLine } from "react-icons/ri";

type AiGenerateButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  isDisabled?: boolean;
};

export const AiGenerateButton = ({
  onClick,
  isLoading,
  isDisabled = false,
}: AiGenerateButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={isLoading || isDisabled}
    className="flex items-center gap-2 text-primary hover:text-primary h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
  >
    <RiGeminiLine className="h-4 w-4" />
    {isLoading ? "Generating..." : "Generate with AI"}
  </Button>
);

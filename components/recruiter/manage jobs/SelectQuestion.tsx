// src/components/SelectQuestion.tsx

"use client";

import { Question } from "@prisma/client";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button"; // Import Button for remove action
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface SelectedQuestion {
  questionId: string;
  required: boolean;
}

interface SelectQuestionProps {
  value: SelectedQuestion[]; // value is now an array of our new type
  onChange: (value: SelectedQuestion[]) => void; // onChange now passes the full object array
}

const SelectQuestion = ({ value, onChange }: SelectQuestionProps) => {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session.user?.activeCompanyId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/company/${session.user.activeCompanyId}/questions`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch questions.");
          }
          const data = await response.json();
          setQuestions(data);
        } catch (error) {
          console.error(error);
          setQuestions([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else if (status !== "loading") {
      setIsLoading(false);
      setQuestions([]);
    }
  }, [session, status]);

  // --- MEMOIZED VALUE (UPDATED) ---
  // This now finds the full question details for each selected question ID.
  const selectedQuestionDetails = useMemo(() => {
    if (!questions) return [];
    return value
      .map((selectedValue) => {
        const question = questions.find(
          (q) => q.id === selectedValue.questionId
        );
        if (!question) return null; // In case a question was deleted
        return {
          ...question, // full question data (id, question text)
          required: selectedValue.required, // a 'required' status from our value prop
        };
      })
      .filter((q): q is Question & { required: boolean } => q !== null); // Type guard to filter out nulls
  }, [questions, value]);

  // --- HANDLER LOGIC (UPDATED) ---

  // Toggles whether a question is in the selected list
  function handleToggleQuestion(questionId: string) {
    const isSelected = value.some((sq) => sq.questionId === questionId);
    let newValue: SelectedQuestion[];

    if (isSelected) {
      newValue = value.filter((sq) => sq.questionId !== questionId);
    } else {
      // When adding, default 'required' to false
      newValue = [...value, { questionId, required: false }];
    }
    onChange(newValue);
  }

  // Toggles the 'required' status for an already selected question
  function handleToggleRequired(questionId: string) {
    const newValue = value.map((sq) =>
      sq.questionId === questionId ? { ...sq, required: !sq.required } : sq
    );
    onChange(newValue);
  }

  if (status === "loading") {
    return <Skeleton className="h-24 w-full" />;
  }

  if (!session?.user) {
    return (
      <p className="text-sm text-muted-foreground">
        Please log in to see questions.
      </p>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div>
      {/* --- SECTION 1: SELECTED QUESTIONS (REFACTORED) --- */}
      {/* This is where the Switch now lives */}
      <div className="flex flex-col gap-2 mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Selected Questions
        </h3>
        {selectedQuestionDetails.length > 0 ? (
          selectedQuestionDetails.map((selected) => (
            <Item variant={"outline"} key={selected.id} className="p-3">
              <ItemContent>
                <ItemDescription>{selected.question}</ItemDescription>
              </ItemContent>
              <ItemActions className="flex items-center gap-4">
                {/* The Switch is now here! */}
                <div className="flex items-center gap-2">
                  <Switch
                    id={`required-${selected.id}`}
                    checked={selected.required}
                    onCheckedChange={() => handleToggleRequired(selected.id)}
                  />
                  <Label htmlFor={`required-${selected.id}`}>Required</Label>
                </div>
                {/* A button to remove the question from the list */}
                <Button
                  type="button" // Important for forms
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleToggleQuestion(selected.id)}
                >
                  <span className="text-xl font-bold">×</span>
                </Button>
              </ItemActions>
            </Item>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
            Select questions from the list below.
          </p>
        )}
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Available Questions
        </h3>
        {questions && questions.length > 0 ? (
          questions.map((question, index) => {
            const isSelected = value.some(
              (sq) => sq.questionId === question.id
            );
            return (
              <Item
                variant={"outline"}
                key={question.id}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-accent"
                }`}
                onClick={() => handleToggleQuestion(question.id)}
              >
                <ItemContent>
                  <ItemHeader className="font-medium text-xs sm:text-sm">
                    Question #{index + 1}
                  </ItemHeader>
                  <ItemDescription className="text-xs sm:text-sm">
                    {question.question}
                  </ItemDescription>
                </ItemContent>
                {/* The Switch has been removed from here */}
              </Item>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No application questions found for this company.
          </p>
        )}
      </div>
    </div>
  );
};

export default SelectQuestion;

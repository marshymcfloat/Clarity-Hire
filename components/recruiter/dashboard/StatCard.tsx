import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

const StatCard = ({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: number;
}) => {
  return (
    <Card className="max-w-[400px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-2xl font-bold">{data}</CardDescription>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default StatCard;

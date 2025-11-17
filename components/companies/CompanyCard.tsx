import React from "react";
import Link from "next/link";

import { getInitials } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import ProgressLink from "../ui/ProgressLink";

type CompanyCardProps = {
  name: string;
  slug: string;
  description: string;
  image: string | null;
  location: string;
};

const CompanyCard = ({
  name,
  description,
  slug,
  image,
  location,
}: CompanyCardProps) => {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Avatar className="h-16 w-16 rounded-lg border">
          <AvatarImage src={image || undefined} alt={`${name} logo`} />
          <AvatarFallback className="text-xl font-bold">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <ProgressLink
            href={`/${slug}/available-jobs`}
            className="hover:underline"
          >
            <CardTitle className="text-xl font-bold">{name}</CardTitle>
          </ProgressLink>
          <CardDescription className="mt-1 line-clamp-1">
            {location}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <ProgressLink href={`/${slug}/available-jobs`}>
            View Jobs
          </ProgressLink>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompanyCard;

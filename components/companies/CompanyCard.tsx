import React from "react";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ArrowRight, MapPin } from "lucide-react";
import ProgressLink from "../ui/ProgressLink";

type CompanyCardProps = {
  name: string;
  slug: string;
  description: string;
  image: string | null;
  location: string;
};

const CompanyCard = React.memo(
  ({ name, description, slug, image, location }: CompanyCardProps) => {
    return (
      <ProgressLink
        href={`/${slug}/available-jobs`}
        className="group relative flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

        <div className="p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <Avatar className="h-14 w-14 rounded-xl border border-slate-100 bg-white shadow-sm group-hover:scale-105 transition-transform duration-300">
              <AvatarImage
                src={image || undefined}
                alt={`${name} logo`}
                className="object-cover"
              />
              <AvatarFallback className="text-lg font-bold bg-slate-50 text-slate-700">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>

            <div className="p-2 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">
              <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <h3 className="font-space font-bold text-xl text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium tracking-wide uppercase">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-6 flex-grow">
            {description}
          </p>

          {/* Footer */}
          <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              View Open Roles
            </span>
          </div>
        </div>
      </ProgressLink>
    );
  },
);

CompanyCard.displayName = "CompanyCard";

export default CompanyCard;

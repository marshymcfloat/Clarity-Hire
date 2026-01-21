import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ApplicationList from "./ApplicationList";

const JobApplicationsInitialDataContainer = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const applications = await prisma.application.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      Job: {
        select: {
          id: true,
          title: true,
          location: true,
          workArrangement: true,
          Company: {
            select: {
              name: true,
              image: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="w-full h-full p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground mt-2">
          Track the status of your job applications.
        </p>
      </div>

      <ApplicationList applications={applications} />
    </div>
  );
};

export default JobApplicationsInitialDataContainer;

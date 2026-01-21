import CreateCompanyDialog from "@/components/CompanyAuth/CreateCompanyDialog";
import ProgressLink from "@/components/ui/ProgressLink";

const page = () => {
  return (
    <main className="overflow-y-auto">
      <CreateCompanyDialog />
      <div className="h-screen flex justify-center items-center text-center">
        <div className=" animate-fade-in">
          <h1
            className="
            font-extrabold text-4xl sm:text-6xl tracking-tighter 
            md:text-8xl lg:text-9xl 
            bg-gradient-to-b from-slate-900 to-slate-600 
            bg-clip-text text-transparent
            leading-normal  
          "
          >
            ClarityHire.
          </h1>
          <p className="text-lg text-slate-500 md:text-xl">
            Seek jobs from these{" "}
            <ProgressLink
              href={"/companies"}
              className="
                font-semibold text-slate-800 
                relative after:absolute after:bg-slate-800 
                after:bottom-0 after:left-0 after:h-px 
                after:w-full after:origin-bottom-right after:scale-x-0 
                hover:after:origin-bottom-left hover:after:scale-x-100 
                after:transition-transform after:ease-in-out after:duration-300
              "
            >
              companies
            </ProgressLink>
          </p>
        </div>
      </div>
    </main>
  );
};

export default page;

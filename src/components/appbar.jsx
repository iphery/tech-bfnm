import { ICON } from "@/utils/constant";
import { HiArrowLeft } from "react-icons/hi2";
import { useRouter } from "next/navigation";

export const Appbar = ({ label }) => {
  const router = useRouter();
  return (
    <header className="bg-boxdark-2 text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center justify-start text-xl font-semibold ">
          <div
            onClick={() => {
              router.back();
            }}
          >
            <HiArrowLeft />
          </div>

          <div className="ml-2">{label}</div>
        </div>
        {/*
                    <nav className="space-x-4">
                  <Link href="/about" className="hover:underline">
                    About
                  </Link>
                  <Link href="/contact" className="hover:underline">
                    Contact
                  </Link>
                </nav>
                */}
      </div>
    </header>
  );
};

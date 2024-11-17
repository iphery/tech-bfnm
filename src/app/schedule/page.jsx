import UserAuth from "@/components/auth";
import { PageCard } from "@/components/card";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function Page() {
  return (
    <UserAuth>
      <DefaultLayout>
        <div className="mb-3 flex items-center justify-start">
          <div className="text-lg text-white">Schedule</div>
        </div>
        <PageCard>
          <div className="p-5">
            <img src="https://balifoam.com/mita/form12/schedule.png" alt="" />
          </div>
        </PageCard>
      </DefaultLayout>
    </UserAuth>
  );
}

import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function Page() {
  return (
    <div className="h-screen">
      <DefaultLayout>
        <div className="flex min-h-[calc(100vh-115px)] flex-col">
          <div className="bg-red-500 w-full">a</div>
          <div className="w-full flex-1 bg-black text-white">b</div>
        </div>
      </DefaultLayout>
    </div>
  );
}

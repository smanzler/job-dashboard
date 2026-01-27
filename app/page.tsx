// app/jobs/page.tsx (server)
import Jobs from "@/components/jobs";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getJobs } from "@/lib/jobs";
import { GetJobsResponse } from "@/lib/schemas";

export default async function Page() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["jobs"],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return getJobs({ cursor: pageParam, limit: 20 });
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: GetJobsResponse) =>
      lastPage.nextCursor ?? undefined,
    pages: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Jobs />
    </HydrationBoundary>
  );
}

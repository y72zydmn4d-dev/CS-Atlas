import { LibraryDetail } from "@/components/library/library-detail";

export const metadata = { title: "Library item" };
export default async function LibraryItemPage({ params }: { params: Promise<{ item: string }> }) { const { item } = await params; return <LibraryDetail id={item} />; }

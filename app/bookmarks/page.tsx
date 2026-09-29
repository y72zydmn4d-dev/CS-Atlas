import { Breadcrumbs } from "@/components/breadcrumbs";
import { BookmarksView } from "@/components/bookmarks-view";
import { Message } from "@/components/locale-provider";
export const metadata={title:"Bookmarks"};
export default function BookmarksPage(){return <div className="page narrow"><Breadcrumbs items={[{label:"Home",href:"/"},{label:"Bookmarks"}]}/><header className="page-header"><div><p className="kicker"><Message k="bookmarks.kicker" /></p><h1><Message k="navigation.bookmarks" /></h1><p className="lede"><Message k="bookmarks.lede" /></p></div></header><BookmarksView/></div>}

import Link from "next/link";
import { Message } from "@/components/locale-provider";
export default function NotFound(){return <div className="not-found"><div><div className="not-found-code">404</div><p className="kicker"><Message k="notFound.kicker" /></p><h1><Message k="notFound.title" /></h1><p><Message k="notFound.body" /></p><Link className="button" href="/domains"><Message k="actions.returnDomains" /></Link></div></div>}

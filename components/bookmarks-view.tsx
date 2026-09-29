"use client";

import Link from "next/link";
import { Bookmark, ExternalLink, Trash2 } from "lucide-react";
import { useAtlas } from "@/components/atlas-provider";
import { useI18n } from "@/components/locale-provider";

export function BookmarksView(){const {bookmarks,toggleBookmark,ready}=useAtlas();const {t}=useI18n();if(!ready)return <div className="panel" style={{minHeight:260}}/>;if(!bookmarks.length)return <div className="panel empty-state"><Bookmark/><strong>{t("bookmarks.empty")}</strong><span>{t("bookmarks.emptyBody")}</span><Link className="button-secondary" href="/domains">{t("actions.exploreDomains")}</Link></div>;return <div className="stack">{bookmarks.map((item)=><article className="panel" key={`${item.type}-${item.id}`} style={{display:"flex",alignItems:"center",gap:15}}><span className="catalog-card-icon"><Bookmark size={17}/></span><div style={{flex:1}}><span className="chip">{item.type} · {item.context}</span><h3 style={{margin:"7px 0 0"}}>{item.title}</h3></div><Link className="icon-button" href={item.href} aria-label={t("bookmarks.open",{title:item.title})}><ExternalLink size={17}/></Link><button className="icon-button" onClick={()=>toggleBookmark({id:item.id,type:item.type,title:item.title,href:item.href,context:item.context})} aria-label={t("bookmarks.remove",{title:item.title})}><Trash2 size={17}/></button></article>)}</div>}

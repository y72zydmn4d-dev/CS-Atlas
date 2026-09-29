import Image from "next/image";
import Link from "next/link";
import { Facebook, Github, Linkedin } from "lucide-react";
import { Message } from "@/components/locale-provider";

type AuthorFooterProps = {
  imageSrc?: string;
};

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/y72zydmn4d-dev",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/tr%E1%BB%8Bnh-gia-huy-638858436/",
    icon: Linkedin,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/gia.huy.18.10.2008",
    icon: Facebook,
  },
] as const;

export function AuthorFooter({ imageSrc }: AuthorFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="author-footer" aria-labelledby="author-footer-title">
      <div className="author-footer-main">
        <div className="author-portrait" aria-hidden={!imageSrc}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt="Trịnh Gia Huy"
              fill
              sizes="(max-width: 650px) 96px, 144px"
              className="author-portrait-image"
            />
          ) : (
            <span className="author-monogram" aria-label="Trịnh Gia Huy">TGH</span>
          )}
        </div>

        <div className="author-profile">
          <p className="author-label"><Message k="workspace.authorLabel" /></p>
          <h2 id="author-footer-title">Trịnh Gia Huy</h2>
          <p className="author-program"><Message k="workspace.authorProgram" /></p>
          <p className="author-school"><Message k="workspace.authorSchool" /></p>
          <p className="author-description"><Message k="workspace.authorDescription" /></p>

          <nav className="author-socials" aria-label="Trịnh Gia Huy social profiles">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} — Trịnh Gia Huy`}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="author-footer-meta">
        <Link className="author-brand" href="/" aria-label="CS Atlas home">
          <span className="brand-mark" aria-hidden="true">CA</span>
          <span><strong>CS Atlas</strong><small>Learn · Build · Explore</small></span>
        </Link>
        <p><Message k="workspace.authorCopyright" values={{ year: currentYear }} /></p>
      </div>
    </footer>
  );
}

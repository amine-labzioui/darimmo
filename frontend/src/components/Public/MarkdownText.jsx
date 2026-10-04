/**
 * Rendu Markdown minimal pour les réponses de l'Assistant IA.
 * Le texte est converti en éléments React (jamais en HTML brut) : tout ce qui
 * n'est pas reconnu est affiché tel quel, échappé par React.
 * Syntaxe gérée : **gras**, *italique*, titres (#), listes (-, *, 1.),
 * paragraphes, retours à la ligne, liens [texte](url) et URL http(s).
 * Les URL d'annonces du site deviennent des liens internes (/annonces/<id>).
 */

import { Link } from "react-router-dom";

const INLINE_PATTERN =
  /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s)]*[^\s).,;:!?])/g;
const MARKDOWN_LINK_PATTERN = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/;
const HEADING_PATTERN = /^#{1,6}\s+(.*)$/;
const LIST_ITEM_PATTERN = /^(\s*)([-*•]|\d+[.)])\s+(.*)$/;

const ANNONCE_URL_PATTERN = /^https?:\/\/([^\s/]+)\/annonces\/(\d+)\/?$/;
// Hôtes du frontend tels que l'agent n8n les écrit dans ses liens d'annonce.
const FRONTEND_HOSTS = ["localhost:5173", "127.0.0.1:5173"];

const LINK_CLASS = "text-[#047857] underline break-words";

// Retourne le chemin interne (/annonces/<id>) si l'URL pointe vers une annonce du site.
function getAnnoncePath(url) {
  const match = url.match(ANNONCE_URL_PATTERN);
  if (!match) return null;
  const isFrontend = FRONTEND_HOSTS.includes(match[1]) || match[1] === window.location.host;
  return isFrontend ? `/annonces/${match[2]}` : null;
}

function renderLink(key, url, label) {
  const annoncePath = getAnnoncePath(url);
  if (annoncePath) {
    return (
      <Link key={key} to={annoncePath} className={LINK_CLASS}>
        {label || "Voir l'annonce"}
      </Link>
    );
  }
  return (
    <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
      {label || url}
    </a>
  );
}

function renderInline(text) {
  return text.split(INLINE_PATTERN).map((part, idx) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }

    const link = part.match(MARKDOWN_LINK_PATTERN);
    if (link) return renderLink(idx, link[2], link[1]);

    if (/^https?:\/\//.test(part)) return renderLink(idx, part);

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function parseBlocks(text) {
  const blocks = [];
  let paragraph = null;
  let list = null;

  const flush = () => {
    if (paragraph) blocks.push({ type: "paragraph", lines: paragraph });
    if (list) blocks.push({ type: "list", items: list });
    paragraph = null;
    list = null;
  };

  String(text ?? "")
    .split(/\r?\n/)
    .forEach((line) => {
      if (!line.trim()) {
        flush();
        return;
      }

      const heading = line.match(HEADING_PATTERN);
      if (heading) {
        flush();
        blocks.push({ type: "heading", text: heading[1] });
        return;
      }

      const item = line.match(LIST_ITEM_PATTERN);
      if (item) {
        if (paragraph) flush();
        const ordered = /\d/.test(item[2]);
        list = list || [];
        list.push({
          nested: item[1].length >= 2,
          marker: ordered ? item[2] : null,
          text: item[3],
        });
        return;
      }

      if (list) flush();
      paragraph = paragraph || [];
      paragraph.push(line.trim());
    });

  flush();
  return blocks;
}

export default function MarkdownText({ text }) {
  return (
    <div className="space-y-2">
      {parseBlocks(text).map((block, idx) => {
        if (block.type === "heading") {
          return (
            <p key={idx} className="font-semibold">
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={idx} className="space-y-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className={`flex gap-2 ${item.nested ? "ml-5" : ""}`}>
                  <span className="shrink-0">{item.marker || (item.nested ? "◦" : "•")}</span>
                  <span className="min-w-0">{renderInline(item.text)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx}>
            {block.lines.map((line, lineIdx) => (
              <span key={lineIdx}>
                {lineIdx > 0 && <br />}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

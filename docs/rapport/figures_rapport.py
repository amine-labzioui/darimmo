"""
Diagrammes du rapport Darimmo, dessinés avec matplotlib (aucune autre dépendance).

Les diagrammes décrivent le code du dépôt : modèles Django (`backend/apps/*/models.py`),
workflows n8n (`n8n_workflows/*.json`) et flux décrits dans `docs/PASSATION_darimmo_agent_ia.md`.
Appelé par `generer_rapport.py` ; peut aussi être lancé seul pour régénérer les PNG.
"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyBboxPatch  # noqa: E402

FIG_DIR = Path(__file__).resolve().parent / "figures"
GREEN, SAND, BLUE, GREY, INK = "#047857", "#F5F0E8", "#DCEBF7", "#EEEEEE", "#1C2520"


def _canvas(w, h):
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    return fig, ax


def _box(ax, x, y, w, h, text, fill=SAND, bold=False, size=9, edge=INK):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.3,rounding_size=1.2",
                                linewidth=1, edgecolor=edge, facecolor=fill))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=size,
            fontweight="bold" if bold else "normal", color=INK)


def _arrow(ax, x1, y1, x2, y2, label="", size=7.5, dashed=False, offset=(0, 1.5)):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=INK, lw=1, linestyle="--" if dashed else "-"))
    if label:
        ax.text((x1 + x2) / 2 + offset[0], (y1 + y2) / 2 + offset[1], label, ha="center", va="bottom",
                fontsize=size, color=INK)


def _save(fig, name):
    FIG_DIR.mkdir(parents=True, exist_ok=True)
    path = FIG_DIR / name
    fig.savefig(path, dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    return path


def architecture():
    fig, ax = _canvas(9, 5.0)
    _box(ax, 1, 60, 19, 22, "Navigateur\nReact + Vite", BLUE, True)
    _box(ax, 27, 60, 21, 22, "API Django REST\n(JWT, permissions)\n/api/ai/chat/", SAND, True)
    _box(ax, 56, 60, 43, 22, "n8n — Orchestrateur\nclassification d'intention,\nroutage vers un agent", "#E6F4EE", True)
    _box(ax, 27, 16, 21, 20, "MongoDB Atlas\n(données,\nvia Djongo)", GREY, size=8.5)
    _box(ax, 56, 16, 13, 20, "Index\nvectoriel\n(20 FAQ)", GREY, size=8.5)
    _box(ax, 71, 16, 13, 20, "Gemini\n(LLM,\nembeddings)", GREY, size=8.5)
    _box(ax, 86, 16, 13, 20, "Tavily\n(recherche\nweb)", GREY, size=8.5)
    _arrow(ax, 20, 74, 27, 74, "HTTP\n+ JWT")
    _arrow(ax, 48, 74, 56, 74, "webhook")
    _arrow(ax, 56, 66, 48, 66, "réponse", offset=(0, -6))
    _arrow(ax, 37.5, 60, 37.5, 36, "ORM", offset=(4, 0))
    _arrow(ax, 62.5, 60, 62.5, 36, "recherche\nsémantique", offset=(-7, -4))
    _arrow(ax, 77.5, 60, 77.5, 36, "prompts", offset=(-5, 0))
    _arrow(ax, 92.5, 60, 92.5, 36, "requête", offset=(-5, 0))
    ax.plot([80, 80, 37.5], [82, 92, 92], color=INK, lw=1, linestyle="--")
    ax.annotate("", xy=(37.5, 82), xytext=(37.5, 92), arrowprops=dict(arrowstyle="->", color=INK, lw=1, linestyle="--"))
    ax.text(58.5, 93.5, "appels d'outils des agents : API Django avec le JWT de l'utilisateur", ha="center", fontsize=7.8, color=INK)
    return _save(fig, "fig_architecture_globale.png")


def orchestrateur():
    fig, ax = _canvas(9, 5.4)
    _box(ax, 36, 86, 28, 10, "Message de l'utilisateur", BLUE, True)
    _box(ax, 30, 68, 40, 11, "Classification d'intention (Gemini)\n11 intentions, confiance, entités", "#E6F4EE", True)
    _box(ax, 34, 52, 32, 9, "Règles : confiance < 0,6\n→ question de clarification", SAND, size=8)
    routes = [
        ("search_property", "Agent\nRecherche"),
        ("create / update /\ndelete / my_listings", "Agent\nAnnonces"),
        ("payment_status", "Agent\nPaiement"),
        ("contact_owner", "Agent\nCommunication"),
        ("general_help", "FAQ (RAG)"),
        ("market_advice", "Agent\nMarché"),
        ("account_help /\nunknown", "Réponse\ndirecte"),
    ]
    width = 12.6
    for i, (intent, agent) in enumerate(routes):
        x = 1 + i * 14.1
        _box(ax, x, 26, width, 11, intent, "white", size=6.8)
        _box(ax, x, 6, width, 12, agent, GREY, True, size=8)
        _arrow(ax, 50, 52, x + width / 2, 37)
        _arrow(ax, x + width / 2, 26, x + width / 2, 18)
    _arrow(ax, 50, 86, 50, 79)
    _arrow(ax, 50, 68, 50, 61)
    return _save(fig, "fig_orchestrateur_routage.png")


def cas_utilisation():
    fig, ax = _canvas(9, 5.6)
    actors = [
        ("Visiteur", ["Rechercher des annonces", "Consulter une annonce", "Interroger l'assistant IA\n(recherche, FAQ, marché)", "Créer un compte"]),
        ("Client", ["Gérer ses favoris", "Demander une visite", "Contacter un propriétaire", "Publier et booster\nune annonce", "Suivre ses demandes"]),
        ("Agence", ["Gérer ses annonces", "Traiter les demandes\nde visite", "Répondre aux messages", "Consulter ses statistiques", "Payer un boost (CMI simulé)"]),
        ("Administrateur", ["Gérer les utilisateurs", "Modérer les annonces\n(archiver, republier)", "Suivre les transactions", "Suivre les demandes\nde visite"]),
    ]
    for i, (name, cases) in enumerate(actors):
        x = 2 + i * 24.5
        _box(ax, x, 86, 22, 9, name, BLUE, True, size=10)
        for j, case in enumerate(cases):
            y = 70 - j * 15
            ax.add_patch(matplotlib.patches.Ellipse((x + 11, y + 4), 22, 11, facecolor=SAND, edgecolor=INK, lw=1))
            ax.text(x + 11, y + 4, case, ha="center", va="center", fontsize=7.4, color=INK)
    ax.text(50, 1, "Un client hérite des cas du visiteur ; une agence dispose aussi des cas du client liés aux annonces.",
            ha="center", fontsize=7.5, color=INK, style="italic")
    return _save(fig, "fig_cas_utilisation.png")


def classes():
    fig, ax = _canvas(9.4, 6.6)

    def cls(x, y, w, h, name, attrs):
        ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0.2", linewidth=1, edgecolor=INK, facecolor="white"))
        ax.add_patch(FancyBboxPatch((x, y + h - 5), w, 5, boxstyle="square,pad=0.2", linewidth=1, edgecolor=INK, facecolor="#E6F4EE"))
        ax.text(x + w / 2, y + h - 2.5, name, ha="center", va="center", fontsize=8.5, fontweight="bold", color=INK)
        ax.text(x + 1, y + h - 7, "\n".join(attrs), ha="left", va="top", fontsize=6.8, color=INK)

    cls(40, 70, 20, 26, "User", ["email, username", "role (client, agence, admin)", "city, phone", "company_name", "is_verified, is_active"])
    cls(40, 30, 20, 30, "Annonce", ["title, description", "property_type", "transaction_type", "status (6 valeurs)", "city, neighborhood", "price, surface", "is_boosted, boosted_until"])
    cls(40, 4, 20, 16, "AnnonceImage", ["image", "is_primary, order"])
    cls(4, 78, 22, 16, "FavoriteProperty", ["user, annonce"])
    cls(4, 50, 22, 20, "VisitRequest", ["client, annonce", "requested_date", "status (5 valeurs)"])
    cls(4, 20, 22, 22, "Messagerie", ["Conversation : annonce,", "  client, agent", "Message : sender,", "  recipient, content", "Notification : user"])
    cls(74, 74, 22, 20, "Transaction", ["user, annonce, boost_plan", "amount, provider", "status, provider_reference"])
    cls(74, 52, 22, 14, "BoostPlan", ["name, price", "duration_days"])
    cls(74, 28, 22, 16, "AIConversation", ["session_id, user"])
    cls(74, 4, 22, 18, "AIMessage", ["sender, content, metadata", "AIRecommendation :", "  annonce recommandée"])

    def link(x1, y1, x2, y2, label=""):
        ax.plot([x1, x2], [y1, y2], color=INK, lw=0.9)
        if label:
            ax.text((x1 + x2) / 2 + 1, (y1 + y2) / 2, label, ha="left", va="center", fontsize=6.5, color=INK)

    link(50, 70, 50, 60, "1 propriétaire — * annonces")
    link(50, 30, 50, 20, "1 — * images")
    link(26, 86, 40, 86)
    link(26, 64, 40, 74)
    link(26, 56, 40, 52)
    link(26, 34, 40, 38)
    link(60, 84, 74, 84)
    link(74, 76, 60, 56)
    link(85, 66, 85, 74)
    link(85, 22, 85, 28)
    link(74, 12, 60, 32)
    return _save(fig, "fig_diagramme_classes.png")


def _sequence(name, actors, messages, height=5.6):
    fig, ax = _canvas(9.2, height)
    step = 100 / len(actors)
    xs = [step * (i + 0.5) for i in range(len(actors))]
    for x, actor in zip(xs, actors):
        _box(ax, x - step * 0.42, 90, step * 0.84, 8, actor, BLUE, True, size=8)
        ax.plot([x, x], [4, 90], color="#999999", lw=0.8, linestyle=":")
    dy = 82 / (len(messages) + 0.5)
    for k, (src, dst, label, dashed) in enumerate(messages):
        y = 86 - k * dy
        x1, x2 = xs[src], xs[dst]
        if src == dst:
            ax.text(x1 + 1.5, y, label, ha="left", va="center", fontsize=7.2, color=INK,
                    bbox=dict(boxstyle="round,pad=0.25", facecolor=SAND, edgecolor=INK, lw=0.6))
            continue
        ax.annotate("", xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="->", color=INK, lw=1, linestyle="--" if dashed else "-"))
        ax.text((x1 + x2) / 2, y + 0.8, label, ha="center", va="bottom", fontsize=7.2, color=INK)
    return _save(fig, name)


def sequence_recherche():
    actors = ["Utilisateur\n(React)", "Django\n/api/ai/chat/", "n8n\nOrchestrateur", "Agent\nRecherche", "Gemini", "API Django\n/api/annonces/"]
    messages = [
        (0, 1, "message, session_id, JWT", False),
        (1, 2, "message, historique, contexte, JWT", False),
        (2, 4, "prompt de classification", False),
        (4, 2, "intent = search_property", True),
        (2, 3, "exécution du sous-workflow", False),
        (3, 4, "message + outil de recherche", False),
        (4, 3, "functionCall (ville, type, budget)", True),
        (3, 5, "GET avec les filtres", False),
        (5, 3, "annonces publiées (JSON)", True),
        (3, 4, "résultats à formuler", False),
        (4, 3, "texte de la réponse", True),
        (3, 1, "reply, recommended_annonce_ids, metadata", True),
        (1, 0, "réponse + cartes d'annonces", True),
    ]
    return _sequence("fig_sequence_recherche.png", actors, messages, 6.2)


def sequence_marche():
    actors = ["Utilisateur\n(React)", "Django\n/api/ai/chat/", "n8n\nOrchestrateur", "Agent\nMarché", "Gemini", "Tavily"]
    messages = [
        (0, 1, "« combien le m² à Maarif ? »", False),
        (1, 2, "message, historique, contexte", False),
        (2, 4, "prompt de classification", False),
        (4, 2, "intent = market_advice", True),
        (2, 3, "exécution du sous-workflow", False),
        (3, 4, "reformulation de la requête (JSON)", False),
        (4, 3, "query, quartier, ville, type, langue", True),
        (3, 5, "recherche (5 résultats, domaines autorisés)", False),
        (5, 3, "extraits des pages", True),
        (3, 4, "sources numérotées + règles strictes", False),
        (4, 3, "synthèse avec citations [n]", True),
        (3, 3, "retrait des citations, des URL et des noms de sites", False),
        (3, 1, "reply + metadata (sources citées)", True),
        (1, 0, "réponse en texte", True),
    ]
    return _sequence("fig_sequence_marche.png", actors, messages, 6.4)


def marche_fidelite(oui, partiel, non, stable):
    """Fidélité (run 1) et stabilité (runs 1 et 2) de l'Agent Marché, à partir des fichiers de résultats."""
    fig, axes = plt.subplots(1, 2, figsize=(9, 3.6))
    ax = axes[0]
    bars = ax.bar(["oui", "partiel", "non"], [oui, partiel, non], color=[GREEN, "#E8A020", "#C2622D"])
    for b, v in zip(bars, [oui, partiel, non]):
        ax.text(b.get_x() + b.get_width() / 2, v + 0.4, str(v), ha="center", fontsize=9)
    ax.set_title("Fidélité des chiffres à l'extrait cité (passage 1)", fontsize=10)
    ax.set_ylabel("Nombre de chiffres")
    ax.set_ylim(0, max(oui, partiel, non) * 1.15 + 1)
    ax = axes[1]
    labels = list(stable)
    values = list(stable.values())
    bars = ax.barh(labels, values, color="#3b6ea5")
    for b, v in zip(bars, values):
        ax.text(v + 0.2, b.get_y() + b.get_height() / 2, f"{v}/16", va="center", fontsize=9)
    ax.set_xlim(0, 18)
    ax.invert_yaxis()
    ax.set_title("Cas stables entre les deux passages (sur 16)", fontsize=10)
    fig.tight_layout()
    return _save(fig, "fig_marche_fidelite_stabilite.png")


def tous():
    return {
        "architecture": architecture(),
        "orchestrateur": orchestrateur(),
        "cas": cas_utilisation(),
        "classes": classes(),
        "seq_recherche": sequence_recherche(),
        "seq_marche": sequence_marche(),
    }


if __name__ == "__main__":
    for key, path in tous().items():
        print(key, "->", path)

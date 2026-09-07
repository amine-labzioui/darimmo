#!/usr/bin/env python
"""
Script de sauvegarde de la base MongoDB — DarImmo
Utilise mongodump pour créer une archive horodatée.

Usage : python scripts/backup_db.py
"""

import os
import subprocess
import sys
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))


def main():
    db_name = os.environ.get("MONGO_DB_NAME", "darimmo_db")
    host = os.environ.get("MONGO_HOST", "localhost")
    port = os.environ.get("MONGO_PORT", "27017")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = os.path.join(
        os.path.dirname(__file__), "..", "backups", f"{db_name}_{timestamp}"
    )
    os.makedirs(backup_dir, exist_ok=True)

    cmd = [
        "mongodump",
        f"--db={db_name}",
        f"--host={host}",
        f"--port={port}",
        f"--out={backup_dir}",
    ]

    username = os.environ.get("MONGO_USERNAME")
    password = os.environ.get("MONGO_PASSWORD")
    if username and password:
        cmd += [f"--username={username}", f"--password={password}", "--authenticationDatabase=admin"]

    print(f"📦 Sauvegarde de la base '{db_name}' vers {backup_dir}...")
    try:
        subprocess.run(cmd, check=True)
        print(f"✅ Sauvegarde terminée : {backup_dir}")
    except subprocess.CalledProcessError as exc:
        print(f"❌ Échec de la sauvegarde : {exc}")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ 'mongodump' introuvable. Installez les outils MongoDB Database Tools.")
        sys.exit(1)


if __name__ == "__main__":
    main()

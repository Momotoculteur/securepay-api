# ==============================================================================
# SECUREPAY SOLUTIONS - DOCKERFILE LEGACY (NON OPTIMISÉ & NON CONFORME PSSI)
# ==============================================================================
# [AUDIT ANOMALIES DÉTECTÉES] :
# 1. Image de base non minimale (node:20 Debian complète > 1.1 Go avec des centaines de CVE).
# 2. Exécution sous l'utilisateur root par défaut (violation du principe de moindre privilège).
# 3. Absence de multi-stage build (outils de tests, devDependencies et code source brut embarqués).
# 4. Absence d'exploitation du cache BuildKit (--cache-from).
#
# OBJECTIF ETUDIANTS : Refactorer ce Dockerfile en version multi-stage, non-root (USER 1001),
# basée sur une image minimale (Alpine ou Distroless), produisant une image finale < 80 Mo.
# ==============================================================================

FROM node:20

WORKDIR /app

# Copie brute de tout le répertoire (incluant fichiers de test et doc)
COPY . .

# Installation complète sans distinguer production et développement
RUN npm install

EXPOSE 3000

# Exécution en tant que root
CMD ["node", "src/server.js"]

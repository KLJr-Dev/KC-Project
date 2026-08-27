# Cycle-7 Northwind Ops — compose plant contexts
#
# | Path        | Role                                      |
# |-------------|-------------------------------------------|
# | ftp/        | Anon FTP :21 — F2 + lab/labpass breadcrumb |
# | bastion/    | Real SSH :2222 — F3, sudo find → F4, jump note |
# | jump/       | Internal basic-auth HTTP — F5             |
#
# Cowrie decoy uses the public `cowrie/cowrie` image (see docker-compose.cycle7.yml).
#
# @see docs/security/Cycle-7/Dev/v1.4.0-ground-truth.md
